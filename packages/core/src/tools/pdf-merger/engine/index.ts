export type { PdfObjectRef, PdfXrefEntry, PdfXref, PdfTrailer, PdfParsedDocument } from "./types";
export { parsePdf, getPageCount, getPageDimensions } from "./parser";
export { mergePdfBuffers, getPageInfoFromParsed } from "./merger";
export type { MergedPdfResult } from "./merger";
