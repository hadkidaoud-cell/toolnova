import type {
  CompressionConfig,
  CompressionFormat,
  ImageFile,
  CompressedImage,
  CompressionResult,
} from "../types";
import { DEFAULT_COMPRESSION_CONFIG, FORMAT_QUALITY_RANGES } from "../types";
import { copyExifToOutput, stripExif } from "../exif/exif-handler";

function detectFormat(buffer: Buffer, filename: string): CompressionFormat {
  if (buffer.length >= 4) {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      if (buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return "webp";
    }
  }
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "webp") return "webp";
  if (ext === "jpg" || ext === "jpeg") return "jpeg";
  return "jpeg";
}

function formatToMime(format: CompressionFormat): string {
  switch (format) {
    case "png": return "image/png";
    case "jpeg":
    case "jpg": return "image/jpeg";
    case "webp": return "image/webp";
    default: return "image/jpeg";
  }
}

function formatToQuality(config: CompressionConfig): number {
  const range = FORMAT_QUALITY_RANGES[config.format];
  const normalized = (config.quality / 100) * (range.max - range.min) + range.min;
  return Math.round(normalized);
}

export function validateImageFile(file: { name: string; size: number; type: string }): string | null {
  if (file.size > 50 * 1024 * 1024) return "File too large (max 50MB)";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !["png", "jpg", "jpeg", "webp"].includes(ext)) {
    return "Unsupported format. Use PNG, JPG, JPEG, or WEBP";
  }
  return null;
}

export function getImageDimensionsFromBuffer(buffer: Buffer): { width: number; height: number } {
  if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  return { width: 0, height: 0 };
}

export async function loadImageFromFile(file: File): Promise<ImageFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const format = detectFormat(buffer, file.name);
  const dims = getImageDimensionsFromBuffer(buffer);

  let width = dims.width;
  let height = dims.height;

  if (width === 0 || height === 0) {
    const img = await loadImageToCanvas(buffer, format);
    width = img.width;
    height = img.height;
  }

  const thumbnail = createThumbnail(buffer, format);

  return {
    id: `img-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name: file.name,
    originalName: file.name,
    type: file.type,
    size: file.size,
    width,
    height,
    buffer,
    thumbnail,
    format,
  };
}

async function loadImageToCanvas(
  buffer: Buffer,
  format: CompressionFormat
): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([new Uint8Array(buffer)], { type: formatToMime(format) });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve({ canvas, ctx, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

function createThumbnail(buffer: Buffer, format: CompressionFormat): string {
  try {
    const blob = new Blob([new Uint8Array(buffer)], { type: formatToMime(format) });
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

export async function compressImage(
  imageFile: ImageFile,
  config: Partial<CompressionConfig> = {}
): Promise<CompressionResult> {
  const startTime = Date.now();
  const fullConfig: CompressionConfig = { ...DEFAULT_COMPRESSION_CONFIG, ...config };

  const { canvas } = await loadImageToCanvas(imageFile.buffer, imageFile.format);

  let outputBuffer: Buffer;

  if (fullConfig.format === "png") {
    outputBuffer = await compressPNG(canvas, fullConfig);
  } else if (fullConfig.format === "webp") {
    outputBuffer = await compressWEBP(canvas, fullConfig);
  } else {
    outputBuffer = await compressJPEG(canvas, fullConfig);
  }

  if (fullConfig.maintainExif && imageFile.format === "jpeg") {
    outputBuffer = copyExifToOutput(imageFile.buffer, outputBuffer, true);
  } else if (!fullConfig.maintainExif && fullConfig.format === "jpeg") {
    outputBuffer = stripExif(outputBuffer);
  }

  const outputFormat = fullConfig.format === "jpg" ? "jpeg" : fullConfig.format;
  const thumbnail = createThumbnail(outputBuffer, outputFormat);
  const dataUrl = `data:${formatToMime(outputFormat)};base64,${outputBuffer.toString("base64")}`;

  const compressed: CompressedImage = {
    id: `compressed-${imageFile.id}`,
    originalId: imageFile.id,
    name: imageFile.name.replace(/\.[^.]+$/, `.${fullConfig.format === "jpg" ? "jpg" : fullConfig.format}`),
    format: outputFormat,
    buffer: outputBuffer,
    size: outputBuffer.length,
    width: canvas.width,
    height: canvas.height,
    quality: fullConfig.quality,
    savings: imageFile.size - outputBuffer.length,
    savingsPercent: imageFile.size > 0 ? Math.round(((imageFile.size - outputBuffer.length) / imageFile.size) * 100) : 0,
    thumbnail,
    dataUrl,
  };

  return {
    original: imageFile,
    compressed,
    compressionRatio: imageFile.size > 0 ? outputBuffer.length / imageFile.size : 1,
    processingTime: Date.now() - startTime,
  };
}

async function compressJPEG(canvas: HTMLCanvasElement, config: CompressionConfig): Promise<Buffer> {
  const quality = formatToQuality(config) / 100;
  const mimeType = "image/jpeg";

  if (config.progressive) {
    const dataUrl = canvas.toDataURL(mimeType, quality);
    return dataUrlToBuffer(dataUrl);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("JPEG compression failed")); return; }
        blob.arrayBuffer().then((ab) => resolve(Buffer.from(ab)));
      },
      mimeType,
      quality
    );
  });
}

async function compressPNG(canvas: HTMLCanvasElement, _config: CompressionConfig): Promise<Buffer> {
  const dataUrl = canvas.toDataURL("image/png");
  return dataUrlToBuffer(dataUrl);
}

async function compressWEBP(canvas: HTMLCanvasElement, config: CompressionConfig): Promise<Buffer> {
  const quality = formatToQuality(config) / 100;
  const mimeType = "image/webp";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("WebP compression failed")); return; }
        blob.arrayBuffer().then((ab) => resolve(Buffer.from(ab)));
      },
      mimeType,
      quality
    );
  });
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return Buffer.from(bytes);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getSavingsColor(percent: number): string {
  if (percent > 50) return "#198754";
  if (percent > 25) return "#20c997";
  if (percent > 0) return "#0d6efd";
  if (percent === 0) return "#6c757d";
  return "#dc3545";
}
