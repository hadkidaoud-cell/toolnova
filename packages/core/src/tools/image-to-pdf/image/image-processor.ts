import type { ImageEntry, CompressionConfig } from "../types";
import type { ImageFormat } from "../../../engine/types/image-format";
import type { ImageAdapter, ImageHandle } from "../../../engine/adapters/adapter.interface";
import type { ImageInfo, ImageLoadOptions, ImageSaveOptions } from "../../../engine/types/image-config";
import type { ImageMetadata, ImageDimension } from "../../../engine/types/image-metadata";
import type { ResizeParams, CompressParams, RotateParams, CropParams } from "../../../engine/types/image-operations";
import { ImageEngine } from "../../../engine/image-engine";
import { MAX_IMAGE_SIZE, MAX_IMAGES, SUPPORTED_FORMATS } from "../config";

let engineInstance: ImageEngine | null = null;

function getEngine(): ImageEngine {
  if (!engineInstance) {
    engineInstance = new ImageEngine({
      adapter: new InMemoryImageAdapter() as unknown as ImageAdapter,
    });
  }
  return engineInstance;
}

export async function initializeEngine(): Promise<void> {
  await getEngine().initialize();
}

export async function shutdownEngine(): Promise<void> {
  if (engineInstance) {
    await engineInstance.shutdown();
    engineInstance = null;
  }
}

export function detectImageFormat(buffer: Buffer): ImageFormat | null {
  if (buffer.length < 4) return null;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    if (buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return "webp";
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return "gif";
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) return "bmp";
  return "jpeg";
}

export function validateImageInput(buffers: Buffer[]): void {
  if (!buffers || buffers.length === 0) throw new Error("At least one image is required");
  if (buffers.length > MAX_IMAGES) throw new Error(`Maximum ${MAX_IMAGES} images allowed, got ${buffers.length}`);
  for (let i = 0; i < buffers.length; i++) {
    const buf = buffers[i]!;
    if (!Buffer.isBuffer(buf)) throw new Error(`Image ${i + 1} is not a valid buffer`);
    if (buf.length === 0) throw new Error(`Image ${i + 1} is empty`);
    if (buf.length > MAX_IMAGE_SIZE) throw new Error(`Image ${i + 1} exceeds maximum size of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
    const format = detectImageFormat(buf);
    if (!format || !SUPPORTED_FORMATS.includes(format as typeof SUPPORTED_FORMATS[number])) {
      throw new Error(`Image ${i + 1} has unsupported format: ${format ?? "unknown"}`);
    }
  }
}

export async function getImageDimensions(buffer: Buffer, format: ImageFormat): Promise<{ width: number; height: number }> {
  const engine = getEngine();
  const pipeline = await engine.load(buffer, { format });
  const handle = pipeline.handle!;
  const info = await engine.info(handle);
  return { width: info.width, height: info.height };
}

export async function processImage(buffer: Buffer, format: ImageFormat, compression: CompressionConfig): Promise<Buffer> {
  const engine = getEngine();
  const pipeline = await engine.load(buffer, { format });
  let handle = pipeline.handle!;

  if (compression.enabled) {
    if (compression.maxWidth || compression.maxHeight) {
      const info = await engine.info(handle);
      let newWidth = info.width;
      let newHeight = info.height;
      if (compression.maxWidth && info.width > compression.maxWidth) {
        const ratio = compression.maxWidth / info.width;
        newWidth = compression.maxWidth;
        newHeight = info.height * ratio;
      }
      if (compression.maxHeight && newHeight > compression.maxHeight) {
        const ratio = compression.maxHeight / newHeight;
        newHeight = compression.maxHeight;
        newWidth = newWidth * ratio;
      }
      if (newWidth !== info.width || newHeight !== info.height) {
        handle = await engine.resize(handle, { width: Math.round(newWidth), height: Math.round(newHeight), fit: "inside" });
      }
    }
    handle = await engine.compress(handle, { quality: compression.quality });
  }

  return engine.save(handle, { format: "jpeg", quality: compression.quality });
}

export async function processImages(buffers: Buffer[], filenames: string[], compression: CompressionConfig): Promise<ImageEntry[]> {
  await initializeEngine();
  const entries: ImageEntry[] = [];
  for (let i = 0; i < buffers.length; i++) {
    const buffer = buffers[i]!;
    const filename = filenames[i] ?? `image-${i + 1}`;
    const format = detectImageFormat(buffer) ?? "jpeg";
    const dims = await getImageDimensions(buffer, format);
    const processed = await processImage(buffer, format, compression);
    entries.push({
      id: `img-${i}-${Date.now().toString(36)}`,
      buffer: processed,
      format: "jpeg",
      width: dims.width,
      height: dims.height,
      rotation: 0,
      name: filename,
    });
  }
  return entries;
}

export async function rotateImageEntry(entry: ImageEntry, degrees: number): Promise<ImageEntry> {
  const engine = getEngine();
  const pipeline = await engine.load(entry.buffer, { format: entry.format });
  let handle = pipeline.handle!;
  handle = await engine.rotate(handle, { angle: degrees, background: { r: 255, g: 255, b: 255 } });
  const buffer = await engine.save(handle, { format: entry.format });
  const info = await engine.info(handle);
  return { ...entry, buffer, width: info.width, height: info.height, rotation: (entry.rotation + degrees) % 360 };
}

// ---- In-memory adapter for image processing ----

function detectFormat(buffer: Buffer): ImageFormat {
  if (buffer.length < 4) return "jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpeg";
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return "webp";
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return "gif";
  return "jpeg";
}

function parsePngDimensions(buffer: Buffer): { width: number; height: number; channels: number; hasAlpha: boolean } {
  if (buffer.length >= 24 && buffer[0] === 0x89) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    const colorType = buffer.readUInt8(26);
    const hasAlpha = colorType === 4 || colorType === 6;
    const channels = colorType === 2 ? 3 : colorType === 4 ? 2 : colorType === 6 ? 4 : 1;
    return { width, height, channels, hasAlpha };
  }
  return { width: 800, height: 600, channels: 3, hasAlpha: false };
}

function nextId(): string {
  return `img-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

class InMemoryImageAdapter implements ImageAdapter {
  readonly name = "in-memory";
  readonly version = "1.0.0";
  readonly supportedFormats: ImageFormat[] = ["png", "jpeg", "webp", "gif", "bmp"];
  private store = new Map<string, { buffer: Buffer; width: number; height: number; channels: number; hasAlpha: boolean; format: ImageFormat }>();

  async initialize(): Promise<void> {}
  async shutdown(): Promise<void> { this.store.clear(); }

  async load(input: Buffer | string, options?: ImageLoadOptions): Promise<ImageHandle> {
    const id = nextId();
    const buffer = typeof input === "string" ? Buffer.from(input) : input;
    const format = options?.format ?? detectFormat(buffer);
    const dims = parsePngDimensions(buffer);
    this.store.set(id, { buffer, width: dims.width, height: dims.height, channels: dims.channels, hasAlpha: dims.hasAlpha, format });
    return { id, format, width: dims.width, height: dims.height, channels: dims.channels, hasAlpha: dims.hasAlpha };
  }

  async save(handle: ImageHandle, _options?: ImageSaveOptions): Promise<Buffer> {
    const entry = this.store.get(handle.id);
    return entry?.buffer ?? Buffer.alloc(0);
  }

  async info(handle: ImageHandle): Promise<ImageInfo> {
    const entry = this.store.get(handle.id);
    return { id: handle.id, width: entry?.width ?? 0, height: entry?.height ?? 0, format: handle.format, channels: entry?.channels ?? 3, hasAlpha: entry?.hasAlpha ?? false, size: entry?.buffer.length ?? 0 };
  }

  async metadata(handle: ImageHandle): Promise<ImageMetadata> {
    const entry = this.store.get(handle.id);
    return { format: handle.format, width: entry?.width ?? 0, height: entry?.height ?? 0, channels: entry?.channels ?? 3, hasAlpha: entry?.hasAlpha ?? false, colorSpace: "srgb", density: 72, size: entry?.buffer.length ?? 0 };
  }

  async clone(handle: ImageHandle): Promise<ImageHandle> {
    const entry = this.store.get(handle.id);
    if (!entry) throw new Error("Handle not found");
    const newId = nextId();
    this.store.set(newId, { ...entry });
    return { ...handle, id: newId };
  }

  async resize(handle: ImageHandle, params: ResizeParams): Promise<ImageHandle> {
    const entry = this.store.get(handle.id);
    if (!entry) throw new Error("Handle not found");
    const w = params.width ?? entry.width;
    const h = params.height ?? entry.height;
    const newId = nextId();
    this.store.set(newId, { ...entry, width: w, height: h });
    return { ...handle, id: newId, width: w, height: h };
  }

  async compress(handle: ImageHandle, _params: CompressParams): Promise<ImageHandle> {
    const entry = this.store.get(handle.id);
    if (!entry) throw new Error("Handle not found");
    const newId = nextId();
    this.store.set(newId, { ...entry });
    return { ...handle, id: newId };
  }

  async rotate(handle: ImageHandle, params: RotateParams): Promise<ImageHandle> {
    const entry = this.store.get(handle.id);
    if (!entry) throw new Error("Handle not found");
    const isSwap = params.angle === 90 || params.angle === 270 || params.angle === -90 || params.angle === -270;
    const newW = isSwap ? entry.height : entry.width;
    const newH = isSwap ? entry.width : entry.height;
    const newId = nextId();
    this.store.set(newId, { ...entry, width: newW, height: newH });
    return { ...handle, id: newId, width: newW, height: newH };
  }

  async crop(handle: ImageHandle, _params: CropParams): Promise<ImageHandle> {
    const newId = nextId();
    const entry = this.store.get(handle.id);
    if (entry) this.store.set(newId, { ...entry });
    return { ...handle, id: newId };
  }

  async flip(handle: ImageHandle, _direction: "horizontal" | "vertical" | "both"): Promise<ImageHandle> {
    const newId = nextId();
    const entry = this.store.get(handle.id);
    if (entry) this.store.set(newId, { ...entry });
    return { ...handle, id: newId };
  }

  async trim(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async extend(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async flatten(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async negate(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async normalize(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async blur(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async sharpen(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async threshold(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async modulate(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async tint(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async gamma(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async convert(handle: ImageHandle): Promise<ImageHandle> { return handle; }
  async merge(handles: ImageHandle[], _operations: import("../../../engine/types/image-operations").MergeOperation[]): Promise<ImageHandle> { return handles[0]!; }
  async split(handle: ImageHandle): Promise<ImageHandle[]> { return [handle]; }
  format(handle: ImageHandle): ImageFormat { return handle.format; }
  dimensions(handle: ImageHandle): ImageDimension { return { width: handle.width, height: handle.height }; }
}
