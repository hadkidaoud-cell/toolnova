export type PdfVersion = "1.0" | "1.1" | "1.2" | "1.3" | "1.4" | "1.5" | "1.6" | "1.7" | "2.0";

export interface PdfInputFile {
  id: string;
  name: string;
  size: number;
  buffer: ArrayBuffer;
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}

export interface PdfPageInfo {
  index: number;
  inputFileId: string;
  inputFileName: string;
  width: number;
  height: number;
  rotation: number;
  selected: boolean;
}

export interface PdfMergeConfig {
  outputName: string;
  preserveBookmarks: boolean;
  preserveMetadata: boolean;
  flattenLayers: boolean;
  compressOutput: boolean;
}

export interface PdfMergeResult {
  blob: Blob;
  dataUrl: string;
  fileName: string;
  size: number;
  pageCount: number;
  processingTime: number;
  sourceFiles: number;
}

export interface PdfParserError {
  fileId: string;
  fileName: string;
  message: string;
}

export const DEFAULT_MERGE_CONFIG: PdfMergeConfig = {
  outputName: "merged.pdf",
  preserveBookmarks: true,
  preserveMetadata: true,
  flattenLayers: false,
  compressOutput: true,
};

export const MAX_PDF_SIZE = 100 * 1024 * 1024;
export const MAX_PDF_FILES = 20;
export const ALLOWED_PDF_TYPES = ["application/pdf"];
export const ALLOWED_PDF_EXTENSIONS = [".pdf"];
