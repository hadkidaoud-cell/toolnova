export type {
  PdfVersion,
  PdfInputFile,
  PdfPageInfo,
  PdfMergeConfig,
  PdfMergeResult,
  PdfParserError,
} from "./types";

export {
  DEFAULT_MERGE_CONFIG,
  MAX_PDF_SIZE,
  MAX_PDF_FILES,
  ALLOWED_PDF_TYPES,
  ALLOWED_PDF_EXTENSIONS,
} from "./types";

export type { PdfObjectRef, PdfXrefEntry, PdfXref, PdfTrailer, PdfParsedDocument } from "./engine";
export { parsePdf, getPageCount, getPageDimensions, mergePdfBuffers, getPageInfoFromParsed } from "./engine";
export type { MergedPdfResult } from "./engine";

export { loadPdfFromFile, validatePdfFile, getPageInfos, formatFileSize, downloadBlob } from "./batch";
export { createPdfMergerConfig, createDefaultMergeConfig } from "./plugin-manifest";
export type { PdfMergerInput, PdfMergerOutput } from "./plugin-manifest";
