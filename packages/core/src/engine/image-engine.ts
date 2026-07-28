import type { ImageFormat } from "./types/image-format";
import type { ImageMetadata, ImageColor } from "./types/image-metadata";
import type { ImageEngineConfig, ImageInfo, ImageLoadOptions, ImageSaveOptions, ImageProcessResult, ImageBatchItem } from "./types/image-config";
import type { ImageAdapter, ImageHandle } from "./adapters/adapter.interface";
import type { ResizeParams, CompressParams, RotateParams, CropParams, ModulateParams, MergeOperation } from "./types/image-operations";
import { DEFAULT_ENGINE_CONFIG } from "./types/image-config";
import { ImageOperations } from "./operations/image-operations";
import { ImageMetadataReader } from "./metadata/image-metadata";
import { ImagePipeline } from "./pipeline/image-pipeline";

export interface ImageEngineOptions {
  adapter: ImageAdapter;
  config?: Partial<ImageEngineConfig>;
}

export class ImageEngine {
  private adapter: ImageAdapter;
  private config: ImageEngineConfig;
  private ops: ImageOperations;
  private metadataReader: ImageMetadataReader;
  private initialized = false;

  constructor(options: ImageEngineOptions) {
    this.adapter = options.adapter;
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...options.config };
    this.ops = new ImageOperations(this.adapter);
    this.metadataReader = new ImageMetadataReader(this.adapter);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.adapter.initialize();
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return;
    await this.adapter.shutdown();
    this.initialized = false;
  }

  getAdapterName(): string {
    return this.adapter.name;
  }

  getAdapterVersion(): string {
    return this.adapter.version;
  }

  getSupportedFormats(): ImageFormat[] {
    return [...this.adapter.supportedFormats];
  }

  getConfig(): ImageEngineConfig {
    return { ...this.config };
  }

  async load(input: Buffer | string, options?: ImageLoadOptions): Promise<ImagePipeline> {
    this.assertInitialized();
    const handle = await this.adapter.load(input, options);
    return ImagePipeline.from(this.adapter, handle);
  }

  async loadBuffer(buffer: Buffer, format?: ImageFormat): Promise<ImagePipeline> {
    return this.load(buffer, { format });
  }

  async loadFile(path: string): Promise<ImagePipeline> {
    return this.load(path);
  }

  async save(handle: ImageHandle, options?: ImageSaveOptions): Promise<Buffer> {
    this.assertInitialized();
    return this.adapter.save(handle, options);
  }

  async info(handle: ImageHandle): Promise<ImageInfo> {
    this.assertInitialized();
    return this.adapter.info(handle);
  }

  async metadata(handle: ImageHandle): Promise<ImageMetadata> {
    this.assertInitialized();
    return this.adapter.metadata(handle);
  }

  async resize(handle: ImageHandle, params: ResizeParams): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.resize(handle, params);
  }

  async compress(handle: ImageHandle, params: CompressParams): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.compress(handle, params);
  }

  async rotate(handle: ImageHandle, params: RotateParams): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.rotate(handle, params);
  }

  async crop(handle: ImageHandle, params: CropParams): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.crop(handle, params);
  }

  async flip(handle: ImageHandle, direction: "horizontal" | "vertical" | "both"): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.flip(handle, direction);
  }

  async trim(handle: ImageHandle, threshold?: number): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.trim(handle, threshold);
  }

  async extend(handle: ImageHandle, padding: { top: number; right: number; bottom: number; left: number }, background?: ImageColor): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.extend(handle, padding, background);
  }

  async flatten(handle: ImageHandle, background?: ImageColor): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.flatten(handle, background);
  }

  async negate(handle: ImageHandle, alpha?: boolean): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.negate(handle, alpha);
  }

  async normalize(handle: ImageHandle, lower?: number, upper?: number): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.normalize(handle, lower, upper);
  }

  async blur(handle: ImageHandle, sigma: number): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.blur(handle, sigma);
  }

  async sharpen(handle: ImageHandle, sigma?: number): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.sharpen(handle, sigma);
  }

  async threshold(handle: ImageHandle, value: number): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.threshold(handle, value);
  }

  async modulate(handle: ImageHandle, params: ModulateParams): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.modulate(handle, params);
  }

  async tint(handle: ImageHandle, color: ImageColor): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.tint(handle, color);
  }

  async gamma(handle: ImageHandle, gamma?: number): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.gamma(handle, gamma);
  }

  async convert(handle: ImageHandle, format: ImageFormat, quality?: number): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.convert(handle, format, quality);
  }

  async merge(handles: ImageHandle[], operations: MergeOperation[]): Promise<ImageHandle> {
    this.assertInitialized();
    return this.ops.merge(handles, operations);
  }

  async split(handle: ImageHandle, columns: number, rows: number): Promise<ImageHandle[]> {
    this.assertInitialized();
    return this.ops.split(handle, columns, rows);
  }

  async batch(items: ImageBatchItem[]): Promise<ImageProcessResult[]> {
    this.assertInitialized();
    const results: ImageProcessResult[] = [];

    for (const item of items) {
      const input = typeof item.input === "string"
        ? await this.adapter.load(item.input)
        : await this.adapter.load(item.input);

      let handle = input;
      for (const op of item.operations) {
        handle = await this.executeOp(handle, op.type, op.params);
      }

      const buffer = await this.adapter.save(handle, item.output);
      const info = await this.adapter.info(handle);
      results.push({ data: buffer, info });
    }

    return results;
  }

  readMetadata(_handle: ImageHandle): ImageMetadataReader {
    return this.metadataReader;
  }

  createPipeline(handle?: ImageHandle): ImagePipeline {
    this.assertInitialized();
    return new ImagePipeline(this.adapter, handle);
  }

  async clone(handle: ImageHandle): Promise<ImageHandle> {
    this.assertInitialized();
    return this.adapter.clone(handle);
  }

  async process(
    input: Buffer | string,
    operations: Array<{ type: string; params: Record<string, unknown> }>,
    output?: ImageSaveOptions
  ): Promise<ImageProcessResult> {
    this.assertInitialized();

    const pipeline = await this.load(input);
    const loadedHandle = pipeline.handle!;

    let current = loadedHandle;
    for (const op of operations) {
      current = await this.executeOp(current, op.type, op.params);
    }

    const data = await this.adapter.save(current, output);
    const info = await this.adapter.info(current);

    return { data, info };
  }

  private async executeOp(handle: ImageHandle, type: string, params: Record<string, unknown>): Promise<ImageHandle> {
    switch (type) {
      case "resize": return this.ops.resize(handle, params as unknown as ResizeParams);
      case "compress": return this.ops.compress(handle, params as unknown as CompressParams);
      case "rotate": return this.ops.rotate(handle, params as unknown as RotateParams);
      case "crop": return this.ops.crop(handle, params as unknown as CropParams);
      case "flip": return this.ops.flip(handle, (params as { direction: "horizontal" | "vertical" | "both" }).direction);
      case "trim": return this.ops.trim(handle, (params as { threshold?: number }).threshold);
      case "extend": return this.ops.extend(handle, params as { top: number; right: number; bottom: number; left: number }, (params as { background?: ImageColor }).background);
      case "flatten": return this.ops.flatten(handle, (params as { background?: ImageColor }).background);
      case "negate": return this.ops.negate(handle, (params as { alpha?: boolean }).alpha);
      case "normalize": return this.ops.normalize(handle, (params as { lower?: number }).lower, (params as { upper?: number }).upper);
      case "blur": return this.ops.blur(handle, (params as { sigma: number }).sigma);
      case "sharpen": return this.ops.sharpen(handle, (params as { sigma?: number }).sigma);
      case "threshold": return this.ops.threshold(handle, (params as { threshold: number }).threshold);
      case "modulate": return this.ops.modulate(handle, params as unknown as ModulateParams);
      case "tint": return this.ops.tint(handle, params as unknown as ImageColor);
      case "gamma": return this.ops.gamma(handle, (params as { gamma?: number }).gamma);
      case "convert": return this.ops.convert(handle, (params as { format: ImageFormat }).format, (params as { quality?: number }).quality);
      default: throw new Error(`Unknown operation: ${type}`);
    }
  }

  private assertInitialized(): void {
    if (!this.initialized) {
      throw new Error("ImageEngine not initialized. Call initialize() first.");
    }
  }
}
