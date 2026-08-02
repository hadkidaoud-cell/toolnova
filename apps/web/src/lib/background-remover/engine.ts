import * as ort from "onnxruntime-web";
import { WASM_PATHS, type BgModelId } from "./config";
import { loadModelBuffer } from "./cache";

interface ActiveSession {
  modelId: BgModelId;
  session: ort.InferenceSession;
  ep: string;
}

let active: ActiveSession | null = null;

function detectEpList(): string[] {
  return ["wasm"];
}

async function createSession(
  buffer: ArrayBuffer,
  eps: string[]
): Promise<{ session: ort.InferenceSession; ep: string }> {
  for (const ep of eps) {
    try {
      const session = await ort.InferenceSession.create(buffer, {
        executionProviders: [ep],
        graphOptimizationLevel: "all",
      });
      return { session, ep };
    } catch {
      /* try next EP */
    }
  }
  const session = await ort.InferenceSession.create(buffer, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
  return { session, ep: "wasm" };
}

export async function initEngine(
  modelId: BgModelId,
  onProgress?: (progress: number) => void
): Promise<string> {
  ort.env.wasm.wasmPaths = WASM_PATHS;
  if (active && active.modelId === modelId) return active.ep;
  await disposeEngine();
  const buffer = await loadModelBuffer(modelId, onProgress);
  const { session, ep } = await createSession(buffer, detectEpList());
  active = { modelId, session, ep };
  return ep;
}

export async function runEngine(
  input: Float32Array,
  size: number
): Promise<Float32Array> {
  if (!active) throw new Error("engine-not-initialized");
  const { session } = active;
  const inputName = session.inputNames[0]!;
  const feeds: Record<string, ort.Tensor> = {
    [inputName]: new ort.Tensor("float32", input, [1, 3, size, size]),
  };
  const results = await session.run(feeds);
  const outputName = session.outputNames[0]!;
  const tensor = results[outputName]!;
  return tensor.data as Float32Array;
}

export function getActiveEp(): string | null {
  return active?.ep ?? null;
}

export async function disposeEngine(): Promise<void> {
  if (!active) return;
  try {
    await active.session.release();
  } catch {
    /* ignore release errors */
  }
  active = null;
}
