import type { ImageAdapter, ImageHandle } from "../adapters/adapter.interface";
import type { ImageFormat } from "../types/image-format";
import type { ImageColor, ImageDimension } from "../types/image-metadata";
import type { ImageInfo, ImageSaveOptions } from "../types/image-config";
import type {
  ResizeParams,
  CompressParams,
  RotateParams,
  CropParams,
  MergeOperation,
  ModulateParams,
} from "../types/image-operations";

export interface ImageOperation {
  type: string;
  params: Record<string, unknown>;
}

export class ImagePipeline {
  private operations: ImageOperation[] = [];
  private _handle: ImageHandle | null = null;
  private adapter: ImageAdapter;

  constructor(adapter: ImageAdapter, handle?: ImageHandle) {
    this.adapter = adapter;
    this._handle = handle ?? null;
  }

  static from(adapter: ImageAdapter, handle: ImageHandle): ImagePipeline {
    return new ImagePipeline(adapter, handle);
  }

  get handle(): ImageHandle | null {
    return this._handle;
  }

  get length(): number {
    return this.operations.length;
  }

  get hasOperations(): boolean {
    return this.operations.length > 0;
  }

  resize(params: ResizeParams): this {
    this.operations.push({ type: "resize", params: params as unknown as Record<string, unknown> });
    return this;
  }

  width(w: number): this {
    return this.resize({ width: w });
  }

  height(h: number): this {
    return this.resize({ height: h });
  }

  fit(dimension: ImageDimension, fit?: ResizeParams["fit"]): this {
    return this.resize({ width: dimension.width, height: dimension.height, fit: fit ?? "cover" });
  }

  compress(params: CompressParams): this {
    this.operations.push({ type: "compress", params: params as unknown as Record<string, unknown> });
    return this;
  }

  quality(q: number): this {
    return this.compress({ quality: q });
  }

  rotate(params: RotateParams): this {
    this.operations.push({ type: "rotate", params: params as unknown as Record<string, unknown> });
    return this;
  }

  rotateBy(angle: number): this {
    return this.rotate({ angle });
  }

  crop(params: CropParams): this {
    this.operations.push({ type: "crop", params: params as unknown as Record<string, unknown> });
    return this;
  }

  cropRegion(region: import("../types/image-metadata").ImageRegion): this {
    return this.crop({ region });
  }

  cropCenter(width: number, height: number): this {
    return this.crop({
      region: { left: 0, top: 0, width, height },
      gravity: "center",
    });
  }

  flip(direction: "horizontal" | "vertical" | "both"): this {
    this.operations.push({ type: "flip", params: { direction } });
    return this;
  }

  flipH(): this {
    return this.flip("horizontal");
  }

  flipV(): this {
    return this.flip("vertical");
  }

  trim(threshold?: number): this {
    this.operations.push({ type: "trim", params: { threshold } });
    return this;
  }

  extend(padding: { top: number; right: number; bottom: number; left: number }, background?: ImageColor): this {
    this.operations.push({ type: "extend", params: { ...padding, background } as unknown as Record<string, unknown> });
    return this;
  }

  pad(top: number, right?: number, bottom?: number, left?: number): this {
    const r = right ?? top;
    const b = bottom ?? top;
    const l = left ?? r;
    return this.extend({ top, right: r, bottom: b, left: l });
  }

  flatten(background?: ImageColor): this {
    this.operations.push({ type: "flatten", params: { background } as unknown as Record<string, unknown> });
    return this;
  }

  negate(alpha?: boolean): this {
    this.operations.push({ type: "negate", params: { alpha } });
    return this;
  }

  normalize(lower?: number, upper?: number): this {
    this.operations.push({ type: "normalize", params: { lower, upper } });
    return this;
  }

  blur(sigma: number): this {
    this.operations.push({ type: "blur", params: { sigma } });
    return this;
  }

  sharpen(sigma?: number): this {
    this.operations.push({ type: "sharpen", params: { sigma } });
    return this;
  }

  threshold(value: number): this {
    this.operations.push({ type: "threshold", params: { threshold: value } });
    return this;
  }

  modulate(params: ModulateParams): this {
    this.operations.push({ type: "modulate", params: params as unknown as Record<string, unknown> });
    return this;
  }

  brightness(factor: number): this {
    return this.modulate({ brightness: factor });
  }

  saturation(factor: number): this {
    return this.modulate({ saturation: factor });
  }

  hue(degrees: number): this {
    return this.modulate({ hue: degrees });
  }

  tint(color: ImageColor): this {
    this.operations.push({ type: "tint", params: color as unknown as Record<string, unknown> });
    return this;
  }

  gamma(g?: number): this {
    this.operations.push({ type: "gamma", params: { gamma: g } });
    return this;
  }

  convert(format: ImageFormat, quality?: number): this {
    this.operations.push({ type: "convert", params: { format, quality } });
    return this;
  }

  toPng(): this {
    return this.convert("png");
  }

  toJpeg(quality?: number): this {
    return this.convert("jpeg", quality);
  }

  toWebp(quality?: number): this {
    return this.convert("webp", quality);
  }

  merge(handles: ImageHandle[], operations: MergeOperation[]): this {
    this.operations.push({ type: "merge", params: { handles: handles.map((h) => h.id), operations } as unknown as Record<string, unknown> });
    return this;
  }

  split(columns: number, rows: number): this {
    this.operations.push({ type: "split", params: { columns, rows } });
    return this;
  }

  addOperation(type: string, params: Record<string, unknown>): this {
    this.operations.push({ type, params });
    return this;
  }

  getOperations(): readonly ImageOperation[] {
    return [...this.operations];
  }

  clear(): this {
    this.operations = [];
    return this;
  }

  clone(): ImagePipeline {
    const pipeline = new ImagePipeline(this.adapter, this._handle ?? undefined);
    pipeline.operations = [...this.operations];
    return pipeline;
  }

  async execute(handle?: ImageHandle): Promise<ImagePipelineResult> {
    const startHandle = handle ?? this._handle;
    if (!startHandle) {
      throw new Error("No input image. Load an image first or pass a handle to execute().");
    }

    let current = startHandle;
    const startTime = Date.now();
    const executedOps: string[] = [];

    for (const op of this.operations) {
      try {
        current = await this.executeOp(current, op);
        executedOps.push(op.type);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Pipeline failed at operation "${op.type}": ${message}`);
      }
    }

    this._handle = current;
    const duration = Date.now() - startTime;

    return {
      handle: current,
      operations: executedOps,
      duration,
    };
  }

  async toBuffer(options?: ImageSaveOptions): Promise<Buffer> {
    if (!this._handle) {
      throw new Error("No image to export. Execute the pipeline first.");
    }
    return this.adapter.save(this._handle, options);
  }

  async getInfo(): Promise<ImageInfo> {
    if (!this._handle) {
      throw new Error("No image loaded.");
    }
    return this.adapter.info(this._handle);
  }

  private async executeOp(handle: ImageHandle, op: ImageOperation): Promise<ImageHandle> {
    const p = op.params;
    switch (op.type) {
      case "resize": return this.adapter.resize(handle, p as unknown as ResizeParams);
      case "compress": return this.adapter.compress(handle, p as unknown as CompressParams);
      case "rotate": return this.adapter.rotate(handle, p as unknown as RotateParams);
      case "crop": return this.adapter.crop(handle, p as unknown as CropParams);
      case "flip": return this.adapter.flip(handle, (p as { direction: "horizontal" | "vertical" | "both" }).direction);
      case "trim": return this.adapter.trim(handle, (p as { threshold?: number }).threshold);
      case "extend": return this.adapter.extend(handle, p as { top: number; right: number; bottom: number; left: number }, (p as { background?: ImageColor }).background);
      case "flatten": return this.adapter.flatten(handle, (p as { background?: ImageColor }).background);
      case "negate": return this.adapter.negate(handle, (p as { alpha?: boolean }).alpha);
      case "normalize": return this.adapter.normalize(handle, (p as { lower?: number }).lower, (p as { upper?: number }).upper);
      case "blur": return this.adapter.blur(handle, (p as { sigma: number }).sigma);
      case "sharpen": return this.adapter.sharpen(handle, (p as { sigma?: number }).sigma);
      case "threshold": return this.adapter.threshold(handle, (p as { threshold: number }).threshold);
      case "modulate": return this.adapter.modulate(handle, p as unknown as ModulateParams);
      case "tint": return this.adapter.tint(handle, p as unknown as ImageColor);
      case "gamma": return this.adapter.gamma(handle, (p as { gamma?: number }).gamma);
      case "convert": return this.adapter.convert(handle, (p as { format: ImageFormat }).format, (p as { quality?: number }).quality);
      case "merge": {
        const mergeHandles = ((p as { handles: string[] }).handles)
          .map((id) => ({ id } as ImageHandle));
        return this.adapter.merge(mergeHandles, (p as { operations: MergeOperation[] }).operations);
      }
      case "split": {
        const splits = await this.adapter.split(handle, (p as { columns: number }).columns, (p as { rows: number }).rows);
        return splits[0] ?? handle;
      }
      default:
        throw new Error(`Unknown pipeline operation: ${op.type}`);
    }
  }
}

export interface ImagePipelineResult {
  handle: ImageHandle;
  operations: string[];
  duration: number;
}
