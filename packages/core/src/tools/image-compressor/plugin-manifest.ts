import type { CompressionConfig, CompressionFormat, CompressionPreset } from "./types";
import { DEFAULT_COMPRESSION_CONFIG } from "./types";

export interface ImageCompressorInput {
  images: File[];
  format?: CompressionFormat;
  quality?: number;
  preset?: CompressionPreset;
  maintainExif?: boolean;
  maintainMetadata?: boolean;
  progressive?: boolean;
}

export interface ImageCompressorOutput {
  compressedImages: Array<{
    name: string;
    originalSize: number;
    compressedSize: number;
    savings: number;
    savingsPercent: number;
    dataUrl: string;
  }>;
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavings: number;
  totalSavingsPercent: number;
}

export function createImageCompressorConfig(): import("../../sdk/types/tool-config").ToolConfig {
  return {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Compress images with preview, batch support, and multiple format options",
    version: "1.0.0",
    category: "utilities",
    tags: ["image", "compress", "optimize", "resize", "png", "jpg", "jpeg", "webp"],
    icon: "image-compress",
    permissions: {
      access: "public",
    },
    timeout: 60000,
    retries: 0,
    retryDelay: 0,
    cacheable: false,
    cacheTtl: 0,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 30,
    },
    metadata: {
      author: "ToolNova",
      authorUrl: "https://toolnova.com",
      documentation: "https://toolnova.com/tools/image-compressor",
      license: "MIT",
    },
    inputs: [
      {
        id: "images",
        name: "Images",
        type: "file",
        label: "Upload Images",
        description: "Select PNG, JPG, JPEG, or WebP images to compress",
        required: true,
        accept: "image/png,image/jpeg,image/webp",
      },
      {
        id: "format",
        name: "Output Format",
        type: "select",
        label: "Output Format",
        description: "Convert images to a different format",
        required: false,
        defaultValue: "jpeg",
        options: [
          { label: "JPEG", value: "jpeg" },
          { label: "PNG", value: "png" },
          { label: "WebP", value: "webp" },
        ],
      },
      {
        id: "quality",
        name: "Quality",
        type: "range",
        label: "Compression Quality",
        description: "Lower values = smaller files, higher values = better quality",
        required: false,
        defaultValue: 85,
        min: 1,
        max: 100,
        step: 1,
      },
      {
        id: "preset",
        name: "Preset",
        type: "select",
        label: "Compression Preset",
        description: "Quick preset for common use cases",
        required: false,
        defaultValue: "web",
        options: [
          { label: "Web (80%)", value: "web" },
          { label: "Print (95%)", value: "print" },
          { label: "Maximum (100%)", value: "maximum" },
          { label: "Minimum (50%)", value: "minimum" },
          { label: "Custom", value: "custom" },
        ],
      },
      {
        id: "maintainExif",
        name: "Maintain EXIF",
        type: "boolean",
        label: "Maintain EXIF Data",
        description: "Preserve camera metadata in compressed images",
        required: false,
        defaultValue: true,
      },
    ],
    schema: {},
  };
}

export function createDefaultCompressionConfig(): CompressionConfig {
  return { ...DEFAULT_COMPRESSION_CONFIG };
}
