import type { ImageAdapter, ImageHandle } from "../adapters/adapter.interface";
import type { ImageFormat } from "../types/image-format";
import type { ImageColor } from "../types/image-metadata";
import type {
  ResizeParams,
  CompressParams,
  RotateParams,
  CropParams,
  MergeOperation,
  ModulateParams,
} from "../types/image-operations";

export class ImageOperations {
  constructor(private adapter: ImageAdapter) {}

  async resize(handle: ImageHandle, params: ResizeParams): Promise<ImageHandle> {
    return this.adapter.resize(handle, params);
  }

  async compress(handle: ImageHandle, params: CompressParams): Promise<ImageHandle> {
    return this.adapter.compress(handle, params);
  }

  async rotate(handle: ImageHandle, params: RotateParams): Promise<ImageHandle> {
    return this.adapter.rotate(handle, params);
  }

  async crop(handle: ImageHandle, params: CropParams): Promise<ImageHandle> {
    return this.adapter.crop(handle, params);
  }

  async flip(handle: ImageHandle, direction: "horizontal" | "vertical" | "both"): Promise<ImageHandle> {
    return this.adapter.flip(handle, direction);
  }

  async trim(handle: ImageHandle, threshold?: number): Promise<ImageHandle> {
    return this.adapter.trim(handle, threshold);
  }

  async extend(handle: ImageHandle, padding: { top: number; right: number; bottom: number; left: number }, background?: ImageColor): Promise<ImageHandle> {
    return this.adapter.extend(handle, padding, background);
  }

  async flatten(handle: ImageHandle, background?: ImageColor): Promise<ImageHandle> {
    return this.adapter.flatten(handle, background);
  }

  async negate(handle: ImageHandle, alpha?: boolean): Promise<ImageHandle> {
    return this.adapter.negate(handle, alpha);
  }

  async normalize(handle: ImageHandle, lower?: number, upper?: number): Promise<ImageHandle> {
    return this.adapter.normalize(handle, lower, upper);
  }

  async blur(handle: ImageHandle, sigma: number): Promise<ImageHandle> {
    return this.adapter.blur(handle, sigma);
  }

  async sharpen(handle: ImageHandle, sigma?: number): Promise<ImageHandle> {
    return this.adapter.sharpen(handle, sigma);
  }

  async threshold(handle: ImageHandle, threshold: number): Promise<ImageHandle> {
    return this.adapter.threshold(handle, threshold);
  }

  async modulate(handle: ImageHandle, params: ModulateParams): Promise<ImageHandle> {
    return this.adapter.modulate(handle, params);
  }

  async tint(handle: ImageHandle, color: ImageColor): Promise<ImageHandle> {
    return this.adapter.tint(handle, color);
  }

  async gamma(handle: ImageHandle, gamma?: number): Promise<ImageHandle> {
    return this.adapter.gamma(handle, gamma);
  }

  async convert(handle: ImageHandle, format: ImageFormat, quality?: number): Promise<ImageHandle> {
    return this.adapter.convert(handle, format, quality);
  }

  async merge(handles: ImageHandle[], operations: MergeOperation[]): Promise<ImageHandle> {
    return this.adapter.merge(handles, operations);
  }

  async split(handle: ImageHandle, columns: number, rows: number): Promise<ImageHandle[]> {
    return this.adapter.split(handle, columns, rows);
  }

  async batch(handle: ImageHandle, operations: Array<{ type: string; params: Record<string, unknown> }>): Promise<ImageHandle> {
    let current = handle;

    for (const op of operations) {
      current = await this.executeOperation(current, op.type, op.params);
    }

    return current;
  }

  async executeOperation(handle: ImageHandle, type: string, params: Record<string, unknown>): Promise<ImageHandle> {
    switch (type) {
      case "resize":
        return this.resize(handle, params as unknown as ResizeParams);
      case "compress":
        return this.compress(handle, params as unknown as CompressParams);
      case "rotate":
        return this.rotate(handle, params as unknown as RotateParams);
      case "crop":
        return this.crop(handle, params as unknown as CropParams);
      case "flip":
        return this.flip(handle, (params as { direction?: string }).direction as "horizontal" | "vertical" | "both");
      case "trim":
        return this.trim(handle, (params as { threshold?: number }).threshold);
      case "extend":
        return this.extend(
          handle,
          params as unknown as { top: number; right: number; bottom: number; left: number },
          (params as { background?: ImageColor }).background
        );
      case "flatten":
        return this.flatten(handle, (params as { background?: ImageColor }).background);
      case "negate":
        return this.negate(handle, (params as { alpha?: boolean }).alpha);
      case "normalize":
        return this.normalize(handle, (params as { lower?: number }).lower, (params as { upper?: number }).upper);
      case "blur":
        return this.blur(handle, (params as { sigma: number }).sigma);
      case "sharpen":
        return this.sharpen(handle, (params as { sigma?: number }).sigma);
      case "threshold":
        return this.threshold(handle, (params as { threshold: number }).threshold);
      case "modulate":
        return this.modulate(handle, params as unknown as ModulateParams);
      case "tint":
        return this.tint(handle, (params as { r: number; g: number; b: number }) as ImageColor);
      case "gamma":
        return this.gamma(handle, (params as { gamma?: number }).gamma);
      case "convert":
        return this.convert(handle, (params as { format: ImageFormat }).format, (params as { quality?: number }).quality);
      default:
        throw new Error(`Unknown operation: ${type}`);
    }
  }
}
