import { DEFAULT_MODEL, getModel, type BgModelId } from "./config";
import { initEngine, runEngine, disposeEngine } from "./engine";
import {
  applyAlphaToRgba,
  colorDefringe,
  cropMaskBilinear,
  erodeMask,
  featherMask,
  maskToAlpha,
  minMaxNormalize,
  preparePaddedRgba,
  rgbaToModelInput,
} from "./pipeline";

export type { BgModelId } from "./config";

export interface BgPostOptions {
  feather: number;
  halo: number;
  defringe: number;
}

export const DEFAULT_POST_OPTIONS: BgPostOptions = {
  feather: 0,
  halo: 0,
  defringe: 0,
};

export interface BgImageData {
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
}

interface WorkerResult {
  type: string;
  ep?: string;
  mask?: ArrayBuffer;
  progress?: number;
  error?: string;
  id?: number;
}

function workerSupported(): boolean {
  return typeof Worker !== "undefined";
}

class WorkerBridge {
  private worker: Worker | null = null;
  private modelId: BgModelId | null = null;
  private onModelProgress: ((p: number) => void) | null = null;
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: WorkerResult) => void; reject: (e: Error) => void }>();

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<WorkerResult>) => {
      const data = event.data;
      if (!data) return;
      if (data.type === "progress") {
        this.onModelProgress?.(data.progress ?? 0);
        return;
      }
      if (typeof data.id !== "number") return;
      const id = data.id;
      const p = this.pending.get(id);
      if (!p) return;
      this.pending.delete(id);
      if (data.type === "error") {
        p.reject(new Error(data.error ?? "worker-error"));
      } else {
        p.resolve(data);
      }
    };
    worker.onerror = (event) => {
      for (const [, p] of this.pending) {
        p.reject(new Error(event.message || "worker-crash"));
      }
      this.pending.clear();
    };
    this.worker = worker;
    return worker;
  }

  private post(message: Record<string, unknown>, transfer?: Transferable[]): Promise<WorkerResult> {
    const worker = this.ensureWorker();
    const id = this.nextId++;
    return new Promise<WorkerResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      worker.postMessage({ ...message, id }, transfer ?? []);
    });
  }

  async init(modelId: BgModelId, onProgress: (p: number) => void): Promise<string> {
    if (this.modelId === modelId) return "";
    this.onModelProgress = onProgress;
    const res = await this.post({ type: "init", modelId });
    this.onModelProgress = null;
    this.modelId = modelId;
    return res.ep ?? "";
  }

  async process(modelId: BgModelId, rgba: Uint8ClampedArray): Promise<Float32Array> {
    const res = await this.post({ type: "process", modelId, rgba }, [rgba.buffer]);
    if (!res.mask) throw new Error("empty-mask");
    return new Float32Array(res.mask);
  }

  dispose(): void {
    try {
      this.worker?.terminate();
    } catch {
      /* ignore */
    }
    this.worker = null;
    this.modelId = null;
    for (const [, p] of this.pending) {
      p.reject(new Error("disposed"));
    }
    this.pending.clear();
  }
}

let bridge: WorkerBridge | null = null;

function getBridge(): WorkerBridge {
  if (!bridge) bridge = new WorkerBridge();
  return bridge;
}

export async function removeBackground(
  image: BgImageData,
  modelId: BgModelId = DEFAULT_MODEL,
  post: Partial<BgPostOptions> = {},
  onProgress?: (progress: number) => void
): Promise<BgImageData> {
  const cfg = getModel(modelId);
  const opts: BgPostOptions = { ...DEFAULT_POST_OPTIONS, ...post };
  const { rgba, width, height } = image;
  const padRgb: [number, number, number] = [
    Math.round(cfg.mean[0] * 255),
    Math.round(cfg.mean[1] * 255),
    Math.round(cfg.mean[2] * 255),
  ];
  const { rgba: padded, rect } = preparePaddedRgba(rgba, width, height, cfg.inputSize, padRgb);

  const report = (p: number) => onProgress?.(Math.max(0, Math.min(1, p)));

  let raw: Float32Array;
  if (workerSupported()) {
    const b = getBridge();
    report(0.02);
    await b.init(modelId, (p) => report(p * 0.5));
    report(0.55);
    raw = await b.process(modelId, padded);
  } else {
    report(0.02);
    await initEngine(modelId, (p) => report(p * 0.5));
    report(0.55);
    const input = rgbaToModelInput(padded, cfg.inputSize, cfg.mean, cfg.std);
    raw = await runEngine(input, cfg.inputSize);
  }
  report(0.8);

  let mask = minMaxNormalize(raw);
  mask = cropMaskBilinear(mask, cfg.inputSize, rect, width, height);
  if (opts.halo > 0) mask = erodeMask(mask, width, height, opts.halo);
  if (opts.feather > 0) mask = featherMask(mask, width, height, opts.feather);
  const alpha = maskToAlpha(mask);

  let final = rgba;
  if (opts.defringe > 0) {
    final = colorDefringe(rgba, alpha, width, height, 2, opts.defringe);
  }
  const outRgba = applyAlphaToRgba(final, alpha);
  report(1);

  return { rgba: outRgba, width, height };
}

export function resetBackgroundEngine(): void {
  if (workerSupported()) {
    bridge?.dispose();
    bridge = null;
  } else {
    void disposeEngine();
  }
}
