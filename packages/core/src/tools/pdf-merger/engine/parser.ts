import type { PdfParsedDocument, PdfXref, PdfXrefEntry, PdfTrailer } from "./types";

const PDF_MAGIC = "%PDF-";

export function parsePdf(buffer: ArrayBuffer): PdfParsedDocument {
  const bytes = new Uint8Array(buffer);

  const version = readVersion(bytes);
  const xref = parseXref(bytes);
  const trailer = parseTrailer(bytes, xref);
  const objects = extractAllObjects(bytes, xref);
  const pageObjectNumbers = findPageObjects(bytes, xref, trailer);

  return {
    version,
    objects,
    xref,
    trailer,
    pageObjectNumbers,
    rawBytes: bytes,
  };
}

function readVersion(bytes: Uint8Array): string {
  const header = asciiString(bytes, 0, 8);
  if (!header.startsWith(PDF_MAGIC)) {
    throw new Error("Not a valid PDF file");
  }
  return header.slice(PDF_MAGIC.length).trim();
}

function asciiString(bytes: Uint8Array, start: number, length: number): string {
  const end = Math.min(start + length, bytes.length);
  const chars: string[] = [];
  for (let i = start; i < end; i++) {
    const b = bytes[i];
    if (b !== undefined) {
      chars.push(String.fromCharCode(b));
    }
  }
  return chars.join("");
}

function asciiChar(bytes: Uint8Array, index: number): string {
  const b = bytes[index];
  return b !== undefined ? String.fromCharCode(b) : "";
}

function parseXref(bytes: Uint8Array): PdfXref {
  const xrefPos = findXrefStart(bytes);
  if (xrefPos < 0) {
    return { entries: new Map(), startIndex: 0 };
  }

  const entries = new Map<number, PdfXrefEntry>();
  let pos = xrefPos;

  while (pos < bytes.length) {
    const line = readLine(bytes, pos);
    if (line === null) break;
    pos += line.length + 1;

    if (line.startsWith("xref")) continue;
    if (line.startsWith("trailer")) break;

    const parts = line.trim().split(/\s+/);
    if (parts.length >= 3 && parts[0] !== undefined && /^\d+$/.test(parts[0])) {
      const startIndex = parseInt(parts[0], 10);
      const count = parseInt(parts[1] ?? "0", 10);

      for (let i = 0; i < count; i++) {
        const entryLine = readLine(bytes, pos);
        if (entryLine === null) break;
        pos += entryLine.length + 1;

        const entryParts = entryLine.trim().split(/\s+/);
        if (entryParts.length >= 3) {
          const offset = parseInt(entryParts[0] ?? "0", 10);
          const gen = parseInt(entryParts[1] ?? "0", 10);
          const inUse = entryParts[2] === "n";

          entries.set(startIndex + i, {
            offset,
            generation: gen,
            inUse,
          });
        }
      }
    }
  }

  return { entries, startIndex: 0 };
}

function findXrefStart(bytes: Uint8Array): number {
  const searchStr = "startxref";
  const searchBytes = stringToBytes(searchStr);

  for (let i = bytes.length - 1024; i >= Math.max(0, bytes.length - 65536); i--) {
    if (matchBytes(bytes, i, searchBytes)) {
      const lineStart = skipWhitespaceReverse(bytes, i);
      const numStr = readNumberBefore(bytes, lineStart);
      if (numStr !== null) {
        return parseInt(numStr, 10);
      }
    }
  }

  for (let i = 0; i < Math.min(bytes.length, 65536); i++) {
    if (matchBytes(bytes, i, searchBytes)) {
      let j = i + searchStr.length;
      while (j < bytes.length && isWhitespace(bytes[j]!)) j++;
      const numStr = readNumber(bytes, j);
      if (numStr !== null) {
        return parseInt(numStr, 10);
      }
    }
  }

  return -1;
}

function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}

function matchBytes(haystack: Uint8Array, offset: number, needle: number[]): boolean {
  if (offset + needle.length > haystack.length) return false;
  for (let i = 0; i < needle.length; i++) {
    if (haystack[offset + i] !== needle[i]) return false;
  }
  return true;
}

function skipWhitespaceReverse(bytes: Uint8Array, pos: number): number {
  let i = pos - 1;
  while (i >= 0 && isWhitespace(bytes[i]!)) i--;
  return i + 1;
}

function readNumberBefore(bytes: Uint8Array, endPos: number): string | null {
  let i = endPos - 1;
  while (i >= 0 && isDigit(bytes[i]!)) i--;
  i++;
  if (i < endPos) {
    return asciiString(bytes, i, endPos - i);
  }
  return null;
}

function readNumber(bytes: Uint8Array, pos: number): string | null {
  let i = pos;
  while (i < bytes.length && isDigit(bytes[i]!)) i++;
  if (i > pos) {
    return asciiString(bytes, pos, i - pos);
  }
  return null;
}

function readLine(bytes: Uint8Array, pos: number): string | null {
  if (pos >= bytes.length) return null;
  const start = pos;
  while (pos < bytes.length && bytes[pos] !== 0x0a && bytes[pos] !== 0x0d) {
    pos++;
  }
  return asciiString(bytes, start, pos - start);
}

function isWhitespace(b: number | undefined): boolean {
  if (b === undefined) return false;
  return b === 0x20 || b === 0x09 || b === 0x0a || b === 0x0d || b === 0x00;
}

function isDigit(b: number | undefined): boolean {
  if (b === undefined) return false;
  return b >= 0x30 && b <= 0x39;
}

function parseTrailer(bytes: Uint8Array, _xref: PdfXref): PdfTrailer {
  const trailerPos = findTrailerStart(bytes);
  if (trailerPos < 0) {
    return { root: { number: 0, generation: 0 }, size: 0 };
  }

  const trailerStr = asciiString(bytes, trailerPos, Math.min(4096, bytes.length - trailerPos));
  const rootMatch = trailerStr.match(/\/Root\s+(\d+)\s+(\d+)\s+R/);
  const infoMatch = trailerStr.match(/\/Info\s+(\d+)\s+(\d+)\s+R/);
  const sizeMatch = trailerStr.match(/\/Size\s+(\d+)/);

  return {
    root: rootMatch
      ? { number: parseInt(rootMatch[1] ?? "0", 10), generation: parseInt(rootMatch[2] ?? "0", 10) }
      : { number: 0, generation: 0 },
    info: infoMatch
      ? { number: parseInt(infoMatch[1] ?? "0", 10), generation: parseInt(infoMatch[2] ?? "0", 10) }
      : undefined,
    size: sizeMatch ? parseInt(sizeMatch[1] ?? "0", 10) : 0,
  };
}

function findTrailerStart(bytes: Uint8Array): number {
  const searchStr = "trailer";
  const searchBytes = stringToBytes(searchStr);

  for (let i = bytes.length - 1; i >= Math.max(0, bytes.length - 65536); i--) {
    if (matchBytes(bytes, i, searchBytes)) {
      if (i === 0 || isWhitespace(bytes[i - 1]!) || bytes[i - 1] === 0x0a || bytes[i - 1] === 0x0d) {
        return i;
      }
    }
  }

  return -1;
}

function extractAllObjects(bytes: Uint8Array, xref: PdfXref): Map<number, Uint8Array> {
  const objects = new Map<number, Uint8Array>();

  for (const [objNum, entry] of xref.entries) {
    if (!entry.inUse || entry.offset === 0) continue;
    const objData = extractObject(bytes, entry.offset);
    if (objData !== null) {
      objects.set(objNum, objData);
    }
  }

  return objects;
}

function extractObject(bytes: Uint8Array, offset: number): Uint8Array | null {
  if (offset >= bytes.length) return null;

  let pos = offset;
  while (pos < bytes.length && isWhitespace(bytes[pos]!)) pos++;

  const headerStr = asciiString(bytes, pos, 32);
  if (!/^\d+\s+\d+\s+obj/.test(headerStr)) return null;

  const objStart = pos;
  while (pos < bytes.length && !(asciiChar(bytes, pos) === 'o' && asciiChar(bytes, pos + 1) === 'b' && asciiChar(bytes, pos + 2) === 'j')) {
    pos++;
  }
  pos += 3;

  let depth = 0;
  let inStream = false;
  while (pos < bytes.length) {
    const ch = asciiChar(bytes, pos);

    if (!inStream) {
      if (ch === '<' && asciiChar(bytes, pos + 1) === '<') {
        depth++;
        pos += 2;
        continue;
      }
      if (ch === '>' && asciiChar(bytes, pos + 1) === '>') {
        depth--;
        pos += 2;
        if (depth <= 0) break;
        continue;
      }

      const rest = asciiString(bytes, pos, 20);
      if (rest.startsWith("stream")) {
        inStream = true;
        while (pos < bytes.length && bytes[pos] !== 0x0a) pos++;
        pos++;
        continue;
      }
    } else {
      const rest = asciiString(bytes, pos, 15);
      if (rest.startsWith("endstream")) {
        inStream = false;
        pos += 9;
        continue;
      }
    }

    const endCheck = asciiString(bytes, pos, 10);
    if (endCheck.startsWith("endobj") && !inStream) {
      pos += 6;
      break;
    }

    pos++;
  }

  const objBytes = bytes.slice(objStart, pos);
  return objBytes.length > 0 ? objBytes : null;
}

function findPageObjects(bytes: Uint8Array, xref: PdfXref, trailer: PdfTrailer): number[] {
  if (trailer.root.number === 0) return [];

  const rootData = extractObject(bytes, xref.entries.get(trailer.root.number)?.offset ?? 0);
  if (rootData === null) return [];

  const rootStr = uint8ToString(rootData);
  const pagesRef = rootStr.match(/\/Pages\s+(\d+)\s+\d+\s+R/);
  if (!pagesRef) return [];

  const pagesObjNum = parseInt(pagesRef[1] ?? "0", 10);
  const pagesOffset = xref.entries.get(pagesObjNum)?.offset;
  if (pagesOffset === undefined) return [];

  const pagesData = extractObject(bytes, pagesOffset);
  if (pagesData === null) return [];

  const pageNumbers: number[] = [];
  collectPageNumbers(pagesData, xref, bytes, pageNumbers, new Set());

  return pageNumbers;
}

function collectPageNumbers(
  nodeBytes: Uint8Array,
  xref: PdfXref,
  allBytes: Uint8Array,
  result: number[],
  visited: Set<number>
): void {
  const nodeStr = uint8ToString(nodeBytes);

  const kidsMatch = nodeStr.match(/\/Kids\s*\[([^\]]*)\]/);
  if (!kidsMatch) return;

  const kidsStr = kidsMatch[1] ?? "";
  const refPattern = /(\d+)\s+\d+\s+R/g;
  let refMatch = refPattern.exec(kidsStr);

  while (refMatch !== null) {
    const childNum = parseInt(refMatch[1] ?? "0", 10);
    if (!visited.has(childNum)) {
      visited.add(childNum);
      const childOffset = xref.entries.get(childNum)?.offset;
      if (childOffset !== undefined) {
        const childBytes = extractObject(allBytes, childOffset);
        if (childBytes !== null) {
          const childStr = uint8ToString(childBytes);
          if (childStr.includes("/Type /Page") && !childStr.includes("/Type /Pages")) {
            result.push(childNum);
          } else if (childStr.includes("/Type /Pages")) {
            collectPageNumbers(childBytes, xref, allBytes, result, visited);
          }
        }
      }
    }
    refMatch = refPattern.exec(kidsStr);
  }
}

function uint8ToString(bytes: Uint8Array): string {
  const chars: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b !== undefined) {
      chars.push(String.fromCharCode(b));
    }
  }
  return chars.join("");
}

export function getPageCount(doc: PdfParsedDocument): number {
  return doc.pageObjectNumbers.length;
}

export function getPageDimensions(bytes: Uint8Array, objOffset: number): { width: number; height: number; rotation: number } {
  const objData = extractObject(bytes, objOffset);
  if (objData === null) return { width: 612, height: 792, rotation: 0 };

  const str = uint8ToString(objData);
  const widthMatch = str.match(/\/Width\s+([\d.]+)/);
  const heightMatch = str.match(/\/Height\s+([\d.]+)/);
  const rotateMatch = str.match(/\/Rotate\s+(-?\d+)/);

  return {
    width: widthMatch?.[1] !== undefined ? parseFloat(widthMatch[1]) : 612,
    height: heightMatch?.[1] !== undefined ? parseFloat(heightMatch[1]) : 792,
    rotation: rotateMatch?.[1] !== undefined ? parseInt(rotateMatch[1], 10) : 0,
  };
}
