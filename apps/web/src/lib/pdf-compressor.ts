"use client";

import { PDFDocument } from "pdf-lib";
import type * as pdfjsLib from "pdfjs-dist";

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

/**
 * Lazily loads PDF.js in the browser only. This keeps the heavy module out of
 * the server bundle (it references browser globals like DOMMatrix) and avoids
 * breaking static generation of the tool page.
 */
function getPdfjs(): Promise<typeof import("pdfjs-dist")> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export type CompressionMode = "lossless" | "balanced" | "maximum" | "custom";

export interface CompressPreset {
  mode: CompressionMode;
  label: string;
  description: string;
  /** Render scale applied to every page (DPI / 72). Undefined = structural only. */
  dpi?: number;
  /** JPEG quality 0-1. Only used when dpi is set. */
  quality?: number;
}

export const PRESETS: CompressPreset[] = [
  {
    mode: "lossless",
    label: "Lossless",
    description: "Preserves text, images and quality. Best for text-heavy documents.",
  },
  {
    mode: "balanced",
    label: "Balanced",
    description: "Re-encodes page images at 150 DPI. Recommended default.",
    dpi: 150,
    quality: 0.72,
  },
  {
    mode: "maximum",
    label: "Maximum",
    description: "Strongest compression at 100 DPI. For emails and uploads.",
    dpi: 100,
    quality: 0.5,
  },
];

export interface CompressOptions {
  data: Uint8Array;
  fileName: string;
  preset: CompressPreset;
  /** dpi/quality override used when preset.mode === "custom". */
  dpi?: number;
  quality?: number;
  onProgress?: (page: number, total: number) => void;
}

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
  mode: CompressionMode;
  savingsPercent: number;
  /** True when the original file was already smaller/optimized. */
  alreadyOptimized: boolean;
  /** Human readable summary of which strategy produced the output. */
  strategy: string;
  /** Machine-readable strategy kind so the UI can render a localized summary. */
  strategyKind: "structural" | "reencode" | "optimized";
  /** DPI actually used by a re-encode strategy (undefined otherwise). */
  dpi?: number;
  /** JPEG quality actually used by a re-encode strategy (undefined otherwise). */
  quality?: number;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Lossless structural pass using pdf-lib:
 *  - repacks the document with object streams
 *  - drops document metadata (author, title, dates, producer)
 *  - never touches image pixels or text
 */
async function structuralCompress(data: Uint8Array): Promise<Uint8Array | null> {
  try {
    const doc = await PDFDocument.load(data, { ignoreEncryption: true, updateMetadata: false });
    const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
    return bytes.length < data.length ? bytes : null;
  } catch {
    return null;
  }
}

/**
 * Lossy pass: rasterizes every page through pdf.js and rebuilds the PDF
 * with pdf-lib, embedding each page as a JPEG at the requested DPI/quality.
 * Returns null when it fails or produces a larger file.
 */
async function rasterCompress(
  data: Uint8Array,
  dpi: number,
  quality: number,
  onProgress?: (page: number, total: number) => void
): Promise<Uint8Array | null> {
  let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;
  try {
    const pdfjs = await getPdfjs();
    loadingTask = pdfjs.getDocument({ data: data.slice() });
    const pdfjsDoc = await loadingTask.promise;
    const pageCount = pdfjsDoc.numPages;
    const scale = Math.max(0.25, dpi / 72);

    const output = await PDFDocument.create();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });

    if (!ctx) return null;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfjsDoc.getPage(i);
      const viewport = page.getViewport({ scale });

      const width = Math.max(1, Math.floor(viewport.width));
      const height = Math.max(1, Math.floor(viewport.height));

      // Guard against absurd canvas sizes (memory limits on mobile).
      if (width * height > 64_000_000) return null;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      await page.render({ canvas, viewport }).promise;

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const jpgBytes = dataUrlToBytes(dataUrl);

      const jpgImage = await output.embedJpg(jpgBytes);
      const outPage = output.addPage([viewport.width, viewport.height]);
      outPage.drawImage(jpgImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });

      onProgress?.(i, pageCount);
    }

    const bytes = await output.save({ useObjectStreams: true });
    return bytes.length < data.length ? bytes : null;
  } catch {
    return null;
  } finally {
    try {
      await loadingTask?.destroy();
    } catch {
      // ignore cleanup errors
    }
  }
}

export async function compressPdf(options: CompressOptions): Promise<CompressResult> {
  const { data, fileName, preset } = options;
  const originalSize = data.length;

  let strategy = "Structural optimization";
  let strategyKind: CompressResult["strategyKind"] = "structural";
  let usedDpi: number | undefined;
  let usedQuality: number | undefined;
  let mode: CompressionMode = preset.mode;

  // 1. Always try the safe structural pass first.
  const structural = await structuralCompress(data);
  let bestBytes: Uint8Array | null = structural;

  // 2. For lossy presets, rasterize and compare — keep whichever is smaller.
  const dpi = preset.mode === "custom" ? options.dpi ?? 150 : preset.dpi;
  const quality = preset.mode === "custom" ? options.quality ?? 0.7 : preset.quality;

  if (preset.mode !== "lossless" && dpi) {
    const raster = await rasterCompress(data, dpi, quality ?? 0.7, options.onProgress);
    if (raster) {
      bestBytes = raster;
      strategyKind = "reencode";
      usedDpi = dpi;
      usedQuality = quality ?? 0.7;
      strategy = `Page re-encode (${dpi} DPI, ${Math.round((quality ?? 0.7) * 100)}% JPEG)`;
      mode = preset.mode;
    }
  }

  const alreadyOptimized = !bestBytes || bestBytes.length >= originalSize;
  const finalBytes = alreadyOptimized ? data : bestBytes!;
  const savingsPercent = originalSize > 0 ? Math.round((1 - finalBytes.length / originalSize) * 100) : 0;

  let pageCount = 0;
  try {
    const probe = await PDFDocument.load(finalBytes, { ignoreEncryption: true });
    pageCount = probe.getPageCount();
  } catch {
    // page count is informational only
  }

  return {
    bytes: finalBytes,
    originalSize,
    compressedSize: finalBytes.length,
    pageCount,
    mode,
    savingsPercent,
    alreadyOptimized,
    strategy: alreadyOptimized ? "File already optimized" : `${strategy} — ${formatBytes(originalSize)} → ${formatBytes(finalBytes.length)}`,
    strategyKind: alreadyOptimized ? "optimized" : strategyKind,
    dpi: usedDpi,
    quality: usedQuality,
  };
}

/** Quick PDF metadata probe used by the UI before compressing. */
export async function analyzePdf(data: Uint8Array): Promise<{ pageCount: number } | null> {
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({ data: data.slice() });
  try {
    const doc = await loadingTask.promise;
    const info = { pageCount: doc.numPages };
    return info;
  } catch {
    return null;
  } finally {
    try {
      await loadingTask.destroy();
    } catch {
      // ignore cleanup errors
    }
  }
}
