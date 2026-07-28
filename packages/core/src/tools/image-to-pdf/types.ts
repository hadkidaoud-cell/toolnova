import type { ImageFormat } from "../../engine/types/image-format";

export type PageSize = "a4" | "letter" | "legal";
export type PageOrientation = "portrait" | "landscape";

export interface PageDimensions {
  width: number;
  height: number;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ImageEntry {
  id: string;
  buffer: Buffer;
  format: ImageFormat;
  width: number;
  height: number;
  rotation: number;
  name: string;
}

export interface ProcessedImage {
  id: string;
  buffer: Buffer;
  width: number;
  height: number;
  fittedWidth: number;
  fittedHeight: number;
  x: number;
  y: number;
  rotation: number;
  name: string;
}

export interface PdfConfig {
  pageSize: PageSize;
  orientation: PageOrientation;
  margins: Margins;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
}

export interface CompressionConfig {
  enabled: boolean;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageToPdfInput {
  images: Buffer[];
  filenames?: string[];
  pageSize?: PageSize;
  orientation?: PageOrientation;
  margins?: Partial<Margins>;
  title?: string;
  author?: string;
  subject?: string;
  compression?: Partial<CompressionConfig>;
}

export interface ImageToPdfOutput {
  pdf: Buffer;
  pageCount: number;
  fileSize: number;
  width: number;
  height: number;
}

export interface PdfHeader {
  version: string;
  pages: number;
}

export interface PdfPageObject {
  objectId: number;
  content: string;
}

export interface PdfStreamObject {
  objectId: number;
  data: Buffer;
  filters: string[];
}
