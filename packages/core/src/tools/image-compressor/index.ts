export type {
  CompressionFormat,
  CompressionPreset,
  CompressionQuality,
  CompressionConfig,
  ResizeConfig,
  ImageFile,
  CompressedImage,
  CompressionResult,
  BatchCompressionResult,
  ExifData,
} from "./types";

export {
  COMPRESSION_PRESETS,
  FORMAT_QUALITY_RANGES,
  DEFAULT_COMPRESSION_CONFIG,
  MAX_FILE_SIZE,
  MAX_BATCH_SIZE,
  ALLOWED_TYPES,
  ALLOWED_EXTENSIONS,
} from "./types";

export { extractExifFromJpeg, buildExifBuffer, stripExif, copyExifToOutput } from "./exif";
export { validateImageFile, getImageDimensionsFromBuffer, loadImageFromFile, compressImage, formatFileSize, getSavingsColor } from "./engine/compressor";
export { compressBatch, compressSingle, downloadCompressedImage, downloadAllCompressed, downloadAsZip } from "./batch";
export { createImageCompressorConfig, createDefaultCompressionConfig } from "./plugin-manifest";
export type { ImageCompressorInput, ImageCompressorOutput } from "./plugin-manifest";
