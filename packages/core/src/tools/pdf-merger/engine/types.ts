export interface PdfObjectRef {
  number: number;
  generation: number;
}

export interface PdfXrefEntry {
  offset: number;
  generation: number;
  inUse: boolean;
  object?: PdfObjectRef;
}

export interface PdfXref {
  entries: Map<number, PdfXrefEntry>;
  startIndex: number;
}

export interface PdfTrailer {
  root: PdfObjectRef;
  info?: PdfObjectRef;
  encrypt?: PdfObjectRef;
  size: number;
  id?: string[];
}

export interface PdfParsedDocument {
  version: string;
  objects: Map<number, Uint8Array>;
  xref: PdfXref;
  trailer: PdfTrailer;
  pageObjectNumbers: number[];
  rawBytes: Uint8Array;
}
