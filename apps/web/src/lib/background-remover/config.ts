export type BgModelId = "u2netp" | "isnet";

export interface BgModelConfig {
  id: BgModelId;
  inputSize: number;
  mean: [number, number, number];
  std: [number, number, number];
  localSource?: string;
  remoteUrl?: string;
  sizeHint: number;
}

export const WASM_PATHS = "/ort/";

export const MODELS: Record<BgModelId, BgModelConfig> = {
  u2netp: {
    id: "u2netp",
    inputSize: 320,
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    localSource: "/models/u2netp.onnx",
    sizeHint: 4574861,
  },
  isnet: {
    id: "isnet",
    inputSize: 1024,
    mean: [0.5, 0.5, 0.5],
    std: [1, 1, 1],
    localSource: "/models/isnet-general-use.onnx",
    remoteUrl:
      "https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx",
    sizeHint: 178634000,
  },
};

export const DEFAULT_MODEL: BgModelId = "u2netp";

export function getModel(id: BgModelId): BgModelConfig {
  return MODELS[id];
}
