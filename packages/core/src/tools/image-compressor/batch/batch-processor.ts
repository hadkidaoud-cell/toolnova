import type {
  CompressionConfig,
  ImageFile,
  CompressionResult,
  BatchCompressionResult,
} from "../types";
import { compressImage } from "../engine/compressor";

export async function compressBatch(
  images: ImageFile[],
  config: Partial<CompressionConfig> = {},
  onProgress?: (completed: number, total: number, current: CompressionResult) => void
): Promise<BatchCompressionResult> {
  const results: CompressionResult[] = [];
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let totalProcessingTime = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i]!;
    const result = await compressImage(image, config);

    results.push(result);
    totalOriginalSize += result.original.size;
    totalCompressedSize += result.compressed.size;
    totalProcessingTime += result.processingTime;

    onProgress?.(i + 1, images.length, result);
  }

  const totalSavings = totalOriginalSize - totalCompressedSize;
  const totalSavingsPercent = totalOriginalSize > 0
    ? Math.round((totalSavings / totalOriginalSize) * 100)
    : 0;

  return {
    results,
    totalOriginalSize,
    totalCompressedSize,
    totalSavings,
    totalSavingsPercent,
    averageProcessingTime: results.length > 0 ? Math.round(totalProcessingTime / results.length) : 0,
  };
}

export async function compressSingle(
  image: ImageFile,
  config: Partial<CompressionConfig> = {}
): Promise<CompressionResult> {
  return compressImage(image, config);
}

export function downloadCompressedImage(result: CompressionResult): void {
  const { compressed } = result;
  const link = document.createElement("a");
  link.href = compressed.dataUrl;
  link.download = compressed.name;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadAllCompressed(results: CompressionResult[]): Promise<void> {
  for (const result of results) {
    downloadCompressedImage(result);
    await new Promise((r) => setTimeout(r, 200));
  }
}

export function downloadAsZip(results: CompressionResult[]): void {
  for (const result of results) {
    downloadCompressedImage(result);
  }
}
