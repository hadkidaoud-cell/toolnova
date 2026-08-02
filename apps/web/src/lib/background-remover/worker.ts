import { getModel } from "./config";
import { initEngine, runEngine, getActiveEp } from "./engine";
import { rgbaToModelInput } from "./pipeline";

interface WorkerInitMessage {
  type: "init";
  modelId: "u2netp" | "isnet";
  id: number;
}

interface WorkerProcessMessage {
  type: "process";
  modelId: "u2netp" | "isnet";
  rgba: Uint8ClampedArray;
  id: number;
}

const ctx = self as unknown as Worker;

ctx.onmessage = async (event: MessageEvent<WorkerInitMessage | WorkerProcessMessage>) => {
  const msg = event.data;
  try {
    if (msg.type === "init") {
      await initEngine(msg.modelId, (progress) => {
        ctx.postMessage({ type: "progress", progress });
      });
      ctx.postMessage({ id: msg.id, type: "ready", ep: getActiveEp() });
      return;
    }
    const cfg = getModel(msg.modelId);
    const input = rgbaToModelInput(msg.rgba, cfg.inputSize, cfg.mean, cfg.std);
    const raw = await runEngine(input, cfg.inputSize);
    ctx.postMessage({ id: msg.id, type: "result", mask: raw.buffer }, [raw.buffer]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.postMessage({ id: msg.id, type: "error", message });
  }
};
