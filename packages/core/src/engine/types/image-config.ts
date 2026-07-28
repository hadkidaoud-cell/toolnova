import type { ImageFormat, ImageInterpolation } from "./image-format";
import type { ImageColor, ImageDimension } from "./image-metadata";

export interface ImageEngineConfig {
  defaultQuality: number;
  defaultFormat: ImageFormat;
  maxImageSize: number;
  maxDimension: ImageDimension;
  tempDirectory: string;
  enableEXIF: boolean;
  enableICC: boolean;
  defaultInterpolation: ImageInterpolation;
  concurrency: number;
  timeout: number;
}

export const DEFAULT_ENGINE_CONFIG: ImageEngineConfig = {
  defaultQuality: 80,
  defaultFormat: "png",
  maxImageSize: 50 * 1024 * 1024,
  maxDimension: { width: 10000, height: 10000 },
  tempDirectory: "/tmp/toolnova-images",
  enableEXIF: true,
  enableICC: false,
  defaultInterpolation: "lanczos",
  concurrency: 4,
  timeout: 30000,
};

export interface ImageEngineOptions {
  config?: Partial<ImageEngineConfig>;
  adapter?: string;
}

export interface ImageLoadOptions {
  format?: ImageFormat;
  density?: number;
  pages?: number;
  raw?: boolean;
}

export interface ImageSaveOptions {
  format?: ImageFormat;
  quality?: number;
  compression?: number;
  effort?: number;
  palette?: boolean;
  colours?: number;
  dither?: number;
  chromaSubsampling?: boolean;
  preserveExif?: boolean;
  stripMetadata?: boolean;
}

export interface ImageInfo {
  id: string;
  width: number;
  height: number;
  format: ImageFormat;
  channels: number;
  hasAlpha: boolean;
  size: number;
}

export interface ImageProcessResult {
  data: Buffer;
  info: ImageInfo;
  metadata?: Record<string, unknown>;
}

export interface ImageBatchItem {
  id: string;
  input: Buffer | string;
  operations: ImageOperationConfig[];
  output?: ImageSaveOptions;
}

export interface ImageOperationConfig {
  type: string;
  params: Record<string, unknown>;
}

export const ENGINE_CONFIG_DEFAULTS: ImageEngineConfig = {
  ...DEFAULT_ENGINE_CONFIG,
};

export function resolveColor(color: string | ImageColor | undefined, fallback: ImageColor): ImageColor {
  if (!color) return fallback;
  if (typeof color === "string") {
    const map: Record<string, ImageColor> = {
      white: { r: 255, g: 255, b: 255, a: 255 },
      black: { r: 0, g: 0, b: 0, a: 255 },
      transparent: { r: 0, g: 0, b: 0, a: 0 },
      red: { r: 255, g: 0, b: 0, a: 255 },
      green: { r: 0, g: 128, b: 0, a: 255 },
      blue: { r: 0, g: 0, b: 255, a: 255 },
    };
    return map[color.toLowerCase()] ?? fallback;
  }
  return color;
}
