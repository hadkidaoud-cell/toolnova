import type { ImageFormat } from "../types/image-format";
import type { ImageMetadata, ImageDimension, ImageColor } from "../types/image-metadata";
import type { ImageInfo, ImageLoadOptions, ImageSaveOptions } from "../types/image-config";
import type {
  ResizeParams,
  CompressParams,
  RotateParams,
  CropParams,
  ModulateParams,
  MergeOperation,
} from "../types/image-operations";
import type { ImageAdapter, ImageHandle } from "./adapter.interface";

let handleCounter = 0;

export abstract class BaseImageAdapter implements ImageAdapter {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly supportedFormats: ImageFormat[];

  protected images: Map<string, { buffer: Buffer; width: number; height: number; channels: number; hasAlpha: boolean; format: ImageFormat }> = new Map();

  abstract initialize(): Promise<void>;
  abstract shutdown(): Promise<void>;

  abstract load(input: Buffer | string, options?: ImageLoadOptions): Promise<ImageHandle>;
  abstract save(handle: ImageHandle, options?: ImageSaveOptions): Promise<Buffer>;
  abstract metadata(handle: ImageHandle): Promise<ImageMetadata>;

  abstract resize(handle: ImageHandle, params: ResizeParams): Promise<ImageHandle>;
  abstract rotate(handle: ImageHandle, params: RotateParams): Promise<ImageHandle>;
  abstract crop(handle: ImageHandle, params: CropParams): Promise<ImageHandle>;
  abstract flip(handle: ImageHandle, direction: "horizontal" | "vertical" | "both"): Promise<ImageHandle>;
  abstract trim(handle: ImageHandle, threshold?: number): Promise<ImageHandle>;
  abstract extend(handle: ImageHandle, padding: { top: number; right: number; bottom: number; left: number }, background?: ImageColor): Promise<ImageHandle>;
  abstract flatten(handle: ImageHandle, background?: ImageColor): Promise<ImageHandle>;
  abstract negate(handle: ImageHandle, alpha?: boolean): Promise<ImageHandle>;
  abstract normalize(handle: ImageHandle, lower?: number, upper?: number): Promise<ImageHandle>;
  abstract blur(handle: ImageHandle, sigma: number): Promise<ImageHandle>;
  abstract sharpen(handle: ImageHandle, sigma?: number): Promise<ImageHandle>;
  abstract threshold(handle: ImageHandle, threshold: number): Promise<ImageHandle>;
  abstract modulate(handle: ImageHandle, params: ModulateParams): Promise<ImageHandle>;
  abstract tint(handle: ImageHandle, color: ImageColor): Promise<ImageHandle>;
  abstract gamma(handle: ImageHandle, gamma?: number): Promise<ImageHandle>;
  abstract convert(handle: ImageHandle, format: ImageFormat, quality?: number): Promise<ImageHandle>;
  abstract merge(handles: ImageHandle[], operations: MergeOperation[]): Promise<ImageHandle>;
  abstract split(handle: ImageHandle, columns: number, rows: number): Promise<ImageHandle[]>;

  async info(handle: ImageHandle): Promise<ImageInfo> {
    const img = this.images.get(handle.id);
    if (!img) throw new Error(`Image ${handle.id} not found`);
    return {
      id: handle.id,
      width: img.width,
      height: img.height,
      format: img.format,
      channels: img.channels,
      hasAlpha: img.hasAlpha,
      size: img.buffer.length,
    };
  }

  async clone(handle: ImageHandle): Promise<ImageHandle> {
    const img = this.images.get(handle.id);
    if (!img) throw new Error(`Image ${handle.id} not found`);
    const id = this.createHandleId();
    this.images.set(id, { ...img, buffer: Buffer.from(img.buffer) });
    return this.createHandle(id, img);
  }

  compress(handle: ImageHandle, params: CompressParams): Promise<ImageHandle> {
    return this.convert(handle, handle.format, params.quality);
  }

  format(handle: ImageHandle): ImageFormat {
    return handle.format;
  }

  dimensions(handle: ImageHandle): ImageDimension {
    return { width: handle.width, height: handle.height };
  }

  protected createHandleId(): string {
    handleCounter += 1;
    return `img-${Date.now().toString(36)}-${handleCounter.toString(36)}`;
  }

  protected createHandle(id: string, img: { width: number; height: number; channels: number; hasAlpha: boolean; format: ImageFormat }): ImageHandle {
    return {
      id,
      format: img.format,
      width: img.width,
      height: img.height,
      channels: img.channels,
      hasAlpha: img.hasAlpha,
    };
  }

  protected storeImage(id: string, buffer: Buffer, width: number, height: number, channels: number, hasAlpha: boolean, format: ImageFormat): void {
    this.images.set(id, { buffer, width, height, channels, hasAlpha, format });
  }

  protected getImage(id: string): { buffer: Buffer; width: number; height: number; channels: number; hasAlpha: boolean; format: ImageFormat } {
    const img = this.images.get(id);
    if (!img) throw new Error(`Image ${id} not found`);
    return img;
  }

  protected removeImage(id: string): void {
    this.images.delete(id);
  }

  protected assertFormat(format: ImageFormat): void {
    if (!this.supportedFormats.includes(format)) {
      throw new Error(`Format ${format} is not supported by ${this.name}`);
    }
  }

  protected validateRegion(region: import("../types/image-metadata").ImageRegion, width: number, height: number): void {
    if (region.left < 0 || region.top < 0) {
      throw new Error("Crop region coordinates must be non-negative");
    }
    if (region.left + region.width > width || region.top + region.height > height) {
      throw new Error("Crop region exceeds image dimensions");
    }
    if (region.width <= 0 || region.height <= 0) {
      throw new Error("Crop region dimensions must be positive");
    }
  }

  protected clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
