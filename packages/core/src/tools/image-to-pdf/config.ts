import type { PageDimensions, Margins, PdfConfig, CompressionConfig } from "./types";

export const PAGE_SIZES: Record<string, PageDimensions> = {
  a4: { width: 595, height: 842 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
};

export const DEFAULT_MARGINS: Margins = {
  top: 36,
  right: 36,
  bottom: 36,
  left: 36,
};

export const COMPACT_MARGINS: Margins = {
  top: 18,
  right: 18,
  bottom: 18,
  left: 18,
};

export const DEFAULT_PDF_CONFIG: PdfConfig = {
  pageSize: "a4",
  orientation: "portrait",
  margins: { ...DEFAULT_MARGINS },
  title: "Image Collection",
  author: "ToolNova",
  subject: "Generated PDF",
  creator: "ToolNova Image-to-PDF v1.0.0",
};

export const DEFAULT_COMPRESSION: CompressionConfig = {
  enabled: true,
  quality: 85,
  maxWidth: 2000,
  maxHeight: 2000,
};

export const MAX_IMAGES = 100;
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
export const SUPPORTED_FORMATS = ["png", "jpeg", "jpg", "webp", "gif", "bmp"] as const;

export function getPageDimensions(
  pageSize: string,
  orientation: string
): PageDimensions {
  const base = PAGE_SIZES[pageSize] ?? PAGE_SIZES.a4!;
  if (orientation === "landscape") {
    return { width: base.height, height: base.width };
  }
  return { ...base };
}

export function getContentArea(
  pageDimensions: PageDimensions,
  margins: Margins
): { x: number; y: number; width: number; height: number } {
  return {
    x: margins.left,
    y: margins.top,
    width: pageDimensions.width - margins.left - margins.right,
    height: pageDimensions.height - margins.top - margins.bottom,
  };
}

export function mergeMargins(overrides?: Partial<Margins>): Margins {
  return { ...DEFAULT_MARGINS, ...overrides };
}
