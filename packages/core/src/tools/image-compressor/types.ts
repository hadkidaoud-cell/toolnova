export type CompressionFormat = "png" | "jpg" | "jpeg" | "webp";

export type CompressionPreset = "web" | "print" | "maximum" | "minimum" | "custom";

export type CompressionQuality = number;

export interface CompressionConfig {
  format: CompressionFormat;
  quality: CompressionQuality;
  preset: CompressionPreset;
  maintainExif: boolean;
  maintainMetadata: boolean;
  resize: ResizeConfig | null;
  stripChroma: boolean;
  progressive: boolean;
  optimizeScans: boolean;
}

export interface ResizeConfig {
  width?: number;
  height?: number;
  fit: "cover" | "contain" | "fill" | "inside" | "outside";
  withoutEnlargement: boolean;
}

export interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  width: number;
  height: number;
  buffer: Buffer;
  thumbnail: string;
  format: CompressionFormat;
}

export interface CompressedImage {
  id: string;
  originalId: string;
  name: string;
  format: CompressionFormat;
  buffer: Buffer;
  size: number;
  width: number;
  height: number;
  quality: number;
  savings: number;
  savingsPercent: number;
  thumbnail: string;
  dataUrl: string;
}

export interface CompressionResult {
  original: ImageFile;
  compressed: CompressedImage;
  compressionRatio: number;
  processingTime: number;
}

export interface BatchCompressionResult {
  results: CompressionResult[];
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavings: number;
  totalSavingsPercent: number;
  averageProcessingTime: number;
}

export interface ExifData {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  dateTimeOriginal?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: number;
  focalLength?: string;
  whiteBalance?: string;
  orientation?: number;
  latitude?: number;
  longitude?: number;
  copyright?: string;
  artist?: string;
  raw: Uint8Array;
}

export const COMPRESSION_PRESETS: Record<CompressionPreset, Partial<CompressionConfig>> = {
  web: { quality: 80, progressive: true, stripChroma: true, optimizeScans: true },
  print: { quality: 95, progressive: false, stripChroma: false, optimizeScans: false },
  maximum: { quality: 100, progressive: false, stripChroma: false, optimizeScans: false },
  minimum: { quality: 50, progressive: true, stripChroma: true, optimizeScans: true },
  custom: {},
};

export const FORMAT_QUALITY_RANGES: Record<CompressionFormat, { min: number; max: number; default: number }> = {
  png: { min: 0, max: 100, default: 100 },
  jpg: { min: 1, max: 100, default: 85 },
  jpeg: { min: 1, max: 100, default: 85 },
  webp: { min: 1, max: 100, default: 80 },
};

export const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  format: "jpeg",
  quality: 85,
  preset: "web",
  maintainExif: true,
  maintainMetadata: true,
  resize: null,
  stripChroma: true,
  progressive: true,
  optimizeScans: true,
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_BATCH_SIZE = 50;
export const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
