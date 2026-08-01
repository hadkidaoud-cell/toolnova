"use client";

import { PDFDocument } from "pdf-lib";

export type ImageFormat = "jpg" | "png";

export interface EmbeddedImage {
  id: string;
  name: string;
  width: number;
  height: number;
  bytes: Uint8Array;
  format: ImageFormat;
  /** Data URL for cheap thumbnails (never needs revocation). */
  thumb: string;
}

export type PageSizeKey = "fit-image" | "a4" | "letter" | "legal";
export type Orientation = "portrait" | "landscape";
export type FitMode = "contain" | "cover";

/** Page dimensions in PDF points (72pt = 1 inch). */
export const PAGE_SIZES: Record<Exclude<PageSizeKey, "fit-image">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
};

export const PAGE_SIZE_OPTIONS: { key: PageSizeKey; label: string }[] = [
  { key: "fit-image", label: "Fit to image" },
  { key: "a4", label: "A4" },
  { key: "letter", label: "Letter" },
  { key: "legal", label: "Legal" },
];

/** Longest side clamp (points) used by "Fit to image" so absurdly large photos stay renderable. */
export const MAX_PAGE_DIMENSION = 5760;

export interface PdfBuildOptions {
  pageSize: PageSizeKey;
  orientation: Orientation;
  marginPt: number;
  fit: FitMode;
}

export const DEFAULT_OPTIONS: PdfBuildOptions = {
  pageSize: "a4",
  orientation: "portrait",
  marginPt: 36,
  fit: "contain",
};

/**
 * Resolves the output page dimensions for a given image.
 * "fit-image" sizes the page to the image (scaled down to MAX_PAGE_DIMENSION),
 * otherwise returns the fixed page size in the requested orientation.
 */
export function computePageDimensions(
  opts: PdfBuildOptions,
  image?: { width: number; height: number }
): [number, number] {
  const key = opts.pageSize;
  if (key !== "fit-image") {
    let [w, h] = PAGE_SIZES[key];
    if (opts.orientation === "landscape") [w, h] = [h, w];
    return [w, h];
  }
  if (image) {
    const longest = Math.max(image.width, image.height);
    const scale = longest > MAX_PAGE_DIMENSION ? MAX_PAGE_DIMENSION / longest : 1;
    return [image.width * scale, image.height * scale];
  }
  return [PAGE_SIZES.a4[0], PAGE_SIZES.a4[1]];
}

/**
 * Computes where to draw an image so it fits inside the page margins,
 * centered. "contain" scales to fit entirely; "cover" scales to fill the
 * page (overflow is cropped).
 */
export function computeImagePlacement(
  pageW: number,
  pageH: number,
  imgW: number,
  imgH: number,
  marginPt: number,
  fit: FitMode
): { x: number; y: number; width: number; height: number } {
  const m = Math.max(0, marginPt);
  const availW = Math.max(1, pageW - 2 * m);
  const availH = Math.max(1, pageH - 2 * m);
  const scale = fit === "cover" ? Math.max(availW / imgW, availH / imgH) : Math.min(availW / imgW, availH / imgH);
  const width = imgW * scale;
  const height = imgH * scale;
  return {
    x: (pageW - width) / 2,
    y: (pageH - height) / 2,
    width,
    height,
  };
}

/**
 * Pure pdf-lib engine: embeds each image (JPEG/PNG) into its own page.
 * Runs on Node too, so it is unit-testable. Image bytes must already be in
 * JPEG or PNG form (browser layer converts WebP/GIF/BMP before calling).
 */
export async function buildPdf(
  images: EmbeddedImage[],
  opts: PdfBuildOptions,
  onProgress?: (index: number, total: number) => void
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const total = images.length;

  for (let i = 0; i < total; i++) {
    const img = images[i]!;
    const xObject = img.format === "jpg" ? await doc.embedJpg(img.bytes) : await doc.embedPng(img.bytes);

    const [pageW, pageH] = computePageDimensions(opts, img);
    const margin = opts.pageSize === "fit-image" ? 0 : opts.marginPt;
    const placement = computeImagePlacement(pageW, pageH, img.width, img.height, margin, opts.fit);

    const page = doc.addPage([pageW, pageH]);
    page.drawImage(xObject, {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
    });

    onProgress?.(i + 1, total);
  }

  return doc.save({ useObjectStreams: true });
}

export interface ConvertResult {
  bytes: Uint8Array;
  pageCount: number;
  imageCount: number;
  inputSize: number;
  outputSize: number;
  options: PdfBuildOptions;
}

/** End-to-end browser conversion with progress reporting. */
export async function convertImagesToPdf(
  images: EmbeddedImage[],
  options: PdfBuildOptions,
  onProgress?: (index: number, total: number) => void
): Promise<ConvertResult> {
  const bytes = await buildPdf(images, options, onProgress);
  return {
    bytes,
    pageCount: images.length,
    imageCount: images.length,
    inputSize: images.reduce((s, i) => s + i.bytes.length, 0),
    outputSize: bytes.length,
    options,
  };
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToDataUrl(bytes: Uint8Array, mime: string): string {
  const base64 = btoa(
    bytes.reduce((acc, b) => acc + String.fromCharCode(b), "")
  );
  return `data:${mime};base64,${base64}`;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function sniffFormat(bytes: Uint8Array, mime: string): "jpg" | "png" | "other" {
  if (mime === "image/jpeg" || (bytes[0] === 0xff && bytes[1] === 0xd8)) return "jpg";
  if (mime === "image/png" || (bytes[0] === 0x89 && bytes[1] === 0x50)) return "png";
  return "other";
}

function readDimensions(bytes: Uint8Array, mime: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: mime || "image/png" });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      if (!width || !height) reject(new Error("Could not read image dimensions"));
      else resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unsupported or corrupted image"));
    };
    img.src = url;
  });
}

function drawBytesToCanvas(bytes: Uint8Array, mime: string, width: number, height: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not available"));
      return;
    }
    const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: mime });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unsupported or corrupted image"));
    };
    img.src = url;
  });
}

/**
 * Decodes an uploaded image file into an EmbeddedImage. JPEG and PNG are kept
 * as-is (lossless); WebP, GIF, BMP and other formats are re-encoded to PNG so
 * the PDF engine only ever deals with embedJpg/embedPng.
 */
export async function decodeImageFile(file: File): Promise<EmbeddedImage> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = file.type || "image/png";
  const format = sniffFormat(bytes, mime);
  const { width, height } = await readDimensions(bytes, mime);

  if (format === "jpg") {
    return { id: makeId(), name: file.name, width, height, bytes, format: "jpg", thumb: bytesToDataUrl(bytes, "image/jpeg") };
  }
  if (format === "png") {
    return { id: makeId(), name: file.name, width, height, bytes, format: "png", thumb: bytesToDataUrl(bytes, "image/png") };
  }

  const canvas = await drawBytesToCanvas(bytes, mime, width, height);
  const pngBytes = dataUrlToBytes(canvas.toDataURL("image/png"));
  return {
    id: makeId(),
    name: file.name,
    width,
    height,
    bytes: pngBytes,
    format: "png",
    thumb: bytesToDataUrl(pngBytes, "image/png"),
  };
}

/**
 * Re-encodes an image as JPEG (white background, then quality). Used by the
 * optional compression mode to shrink the output PDF. Returns the input
 * unchanged when it is already a high-quality JPEG.
 */
export async function reencodeToJpeg(image: EmbeddedImage, quality: number): Promise<EmbeddedImage> {
  if (image.format === "jpg" && quality >= 0.95) return image;
  const canvas = await drawBytesToCanvas(
    image.bytes,
    image.format === "jpg" ? "image/jpeg" : "image/png",
    image.width,
    image.height
  );
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, image.width, image.height);
  const jpgBytes = dataUrlToBytes(canvas.toDataURL("image/jpeg", Math.min(1, Math.max(0.05, quality))));
  return { ...image, bytes: jpgBytes, format: "jpg" };
}
