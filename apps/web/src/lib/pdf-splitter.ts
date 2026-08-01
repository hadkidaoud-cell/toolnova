"use client";

import { PDFDocument } from "pdf-lib";

export interface SplitFile {
  label: string;
  fileName: string;
  bytes: Uint8Array;
  size: number;
}

export type SplitMode = "all" | "ranges" | "groups";

export interface SplitResult {
  files: SplitFile[];
  pageCount: number;
  inputSize: number;
}

function clonePdf(data: Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(data, { ignoreEncryption: true, updateMetadata: false });
}

/** Analyzes the PDF and returns its page count (null when unreadable). */
export async function analyzePdf(data: Uint8Array): Promise<{ pageCount: number } | null> {
  try {
    const doc = await clonePdf(data);
    return { pageCount: doc.getPageCount() };
  } catch {
    return null;
  }
}

/**
 * Parses a user-supplied page range string like "1-3, 5, 8-10" into inclusive
 * 1-based [start, end] pairs, clamped to the document page count. Throws a
 * human-readable error for empty or malformed input.
 */
export function parseRanges(input: string, maxPage: number): number[][] {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter at least one page range");
  if (maxPage < 1) throw new Error("The PDF contains no pages");

  const tokens = trimmed.split(/[,;\s]+/).filter(Boolean);
  const ranges: number[][] = [];

  for (const token of tokens) {
    const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) {
      throw new Error(`Invalid range "${token}" — use the format 1-3, 5, 8-10`);
    }
    let lo = parseInt(match[1]!, 10);
    let hi = match[2] ? parseInt(match[2], 10) : lo;
    if (hi < lo) [lo, hi] = [hi, lo];

    lo = Math.max(1, lo);
    hi = Math.min(maxPage, hi);
    if (lo <= hi) ranges.push([lo, hi]);
  }

  if (!ranges.length) throw new Error("The ranges you entered do not match any pages");
  return ranges;
}

/** Expands inclusive ranges into 0-based page indices in document order. */
export function rangesToIndices(ranges: number[][]): number[] {
  const indices: number[] = [];
  for (const range of ranges) {
    const start = range[0] ?? 0;
    const end = range[1] ?? 0;
    for (let i = start; i <= end; i++) indices.push(i - 1);
  }
  return indices;
}

async function buildFromIndices(
  source: PDFDocument,
  indices: number[],
  baseName: string,
  label: string
): Promise<SplitFile> {
  const out = await PDFDocument.create();
  const pages = await out.copyPages(source, indices);
  for (const page of pages) out.addPage(page);
  const bytes = await out.save({ useObjectStreams: true, addDefaultPage: false });
  return { label, fileName: `${baseName}-${label.toLowerCase().replace(/\s+/g, "-")}.pdf`, bytes, size: bytes.length };
}

function baseNameOf(fileName: string): string {
  return (fileName || "document").replace(/\.pdf$/i, "");
}

/** Splits every page into its own PDF. */
export async function splitAll(
  data: Uint8Array,
  fileName: string,
  onProgress?: (done: number, total: number) => void
): Promise<SplitResult> {
  const src = await clonePdf(data);
  const pageCount = src.getPageCount();
  const base = baseNameOf(fileName);
  const files: SplitFile[] = [];

  for (let i = 0; i < pageCount; i++) {
    files.push(await buildFromIndices(src, [i], base, `Page ${i + 1}`));
    onProgress?.(i + 1, pageCount);
  }

  return { files, pageCount, inputSize: data.length };
}

/** Splits into PDFs matching the supplied comma-separated ranges. */
export async function splitRanges(
  data: Uint8Array,
  fileName: string,
  rangesInput: string,
  onProgress?: (done: number, total: number) => void
): Promise<SplitResult> {
  const src = await clonePdf(data);
  const pageCount = src.getPageCount();
  const base = baseNameOf(fileName);
  const ranges = parseRanges(rangesInput, pageCount);
  const files: SplitFile[] = [];

  for (let r = 0; r < ranges.length; r++) {
    const [start, end] = [ranges[r]![0]!, ranges[r]![1]!];
    const indices: number[] = [];
    for (let i = start; i <= end; i++) indices.push(i - 1);
    files.push(await buildFromIndices(src, indices, base, start === end ? `Page ${start}` : `Pages ${start}-${end}`));
    onProgress?.(r + 1, ranges.length);
  }

  return { files, pageCount, inputSize: data.length };
}

/** Splits the document into consecutive groups of N pages. */
export async function splitGroups(
  data: Uint8Array,
  fileName: string,
  groupSize: number,
  onProgress?: (done: number, total: number) => void
): Promise<SplitResult> {
  const src = await clonePdf(data);
  const pageCount = src.getPageCount();
  const base = baseNameOf(fileName);
  const size = Math.max(1, Math.floor(groupSize));
  const totalGroups = Math.ceil(pageCount / size);
  const files: SplitFile[] = [];

  let index = 0;
  while (index < pageCount) {
    const end = Math.min(pageCount, index + size);
    const indices: number[] = [];
    for (let i = index; i < end; i++) indices.push(i);
    files.push(await buildFromIndices(src, indices, base, `Pages ${index + 1}-${end}`));
    onProgress?.(files.length, totalGroups);
    index = end;
  }

  return { files, pageCount, inputSize: data.length };
}

let zipCrcTable: Int32Array | null = null;

function zipCrc32(buf: Uint8Array): number {
  if (!zipCrcTable) {
    zipCrcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      zipCrcTable[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = zipCrcTable[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Minimal dependency-free ZIP writer using the "stored" method (no deflate).
 * PDFs are already internally compressed, so storing keeps the archive small
 * while avoiding an extra runtime dependency.
 */
export function createZip(files: { name: string; bytes: Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const central: { name: Uint8Array; crc: number; size: number; offset: number }[] = [];
  let offset = 0;

  for (const file of files) {
    const name = enc.encode(file.name);
    const crc = zipCrc32(file.bytes);
    const size = file.bytes.length;

    const header = new Uint8Array(30 + name.length);
    const dv = new DataView(header.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0x0800, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, size, true);
    dv.setUint32(22, size, true);
    dv.setUint16(26, name.length, true);
    dv.setUint16(28, 0, true);
    header.set(name, 30);

    localParts.push(header, file.bytes);
    central.push({ name, crc, size, offset });
    offset += header.length + size;
  }

  const centralSize = central.reduce((sum, c) => sum + 46 + c.name.length, 0);
  const centralOffset = offset;
  const centralBuf = new Uint8Array(centralSize);
  let cOff = 0;
  for (const c of central) {
    const dv = new DataView(centralBuf.buffer, cOff);
    dv.setUint32(0, 0x02014b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 20, true);
    dv.setUint16(8, 0x0800, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint16(14, 0, true);
    dv.setUint32(16, c.crc, true);
    dv.setUint32(20, c.size, true);
    dv.setUint32(24, c.size, true);
    dv.setUint16(28, c.name.length, true);
    dv.setUint32(42, c.offset, true);
    centralBuf.set(c.name, cOff + 46);
    cOff += 46 + c.name.length;
  }

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, centralOffset, true);

  const total = offset + centralSize + 22;
  const out = new Uint8Array(total);
  let o = 0;
  for (const part of localParts) {
    out.set(part, o);
    o += part.length;
  }
  out.set(centralBuf, o);
  o += centralSize;
  out.set(eocd, o);
  return out;
}
