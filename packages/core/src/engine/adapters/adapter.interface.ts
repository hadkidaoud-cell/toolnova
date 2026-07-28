import type { ImageFormat } from "../types/image-format";
import type { ImageMetadata, ImageColor, ImageDimension } from "../types/image-metadata";
import type { ImageInfo, ImageLoadOptions, ImageSaveOptions } from "../types/image-config";
import type {
  ResizeParams,
  CompressParams,
  RotateParams,
  CropParams,
  MergeOperation,
} from "../types/image-operations";

export interface ImageAdapter {
  readonly name: string;
  readonly version: string;
  readonly supportedFormats: ImageFormat[];

  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  load(input: Buffer | string, options?: ImageLoadOptions): Promise<ImageHandle>;
  save(handle: ImageHandle, options?: ImageSaveOptions): Promise<Buffer>;
  info(handle: ImageHandle): Promise<ImageInfo>;
  metadata(handle: ImageHandle): Promise<ImageMetadata>;
  clone(handle: ImageHandle): Promise<ImageHandle>;

  resize(handle: ImageHandle, params: ResizeParams): Promise<ImageHandle>;
  compress(handle: ImageHandle, params: CompressParams): Promise<ImageHandle>;
  rotate(handle: ImageHandle, params: RotateParams): Promise<ImageHandle>;
  crop(handle: ImageHandle, params: CropParams): Promise<ImageHandle>;
  flip(handle: ImageHandle, direction: "horizontal" | "vertical" | "both"): Promise<ImageHandle>;
  trim(handle: ImageHandle, threshold?: number): Promise<ImageHandle>;
  extend(handle: ImageHandle, padding: { top: number; right: number; bottom: number; left: number }, background?: ImageColor): Promise<ImageHandle>;
  flatten(handle: ImageHandle, background?: ImageColor): Promise<ImageHandle>;
  negate(handle: ImageHandle, alpha?: boolean): Promise<ImageHandle>;
  normalize(handle: ImageHandle, lower?: number, upper?: number): Promise<ImageHandle>;
  blur(handle: ImageHandle, sigma: number): Promise<ImageHandle>;
  sharpen(handle: ImageHandle, sigma?: number): Promise<ImageHandle>;
  threshold(handle: ImageHandle, threshold: number): Promise<ImageHandle>;
  modulate(handle: ImageHandle, params: import("../types/image-operations").ModulateParams): Promise<ImageHandle>;
  tint(handle: ImageHandle, color: ImageColor): Promise<ImageHandle>;
  gamma(handle: ImageHandle, gamma?: number): Promise<ImageHandle>;

  convert(handle: ImageHandle, format: ImageFormat, quality?: number): Promise<ImageHandle>;
  merge(handles: ImageHandle[], operations: MergeOperation[]): Promise<ImageHandle>;
  split(handle: ImageHandle, columns: number, rows: number): Promise<ImageHandle[]>;

  format(handle: ImageHandle): ImageFormat;
  dimensions(handle: ImageHandle): ImageDimension;
}

export interface ImageHandle {
  readonly id: string;
  readonly format: ImageFormat;
  readonly width: number;
  readonly height: number;
  readonly channels: number;
  readonly hasAlpha: boolean;
}
