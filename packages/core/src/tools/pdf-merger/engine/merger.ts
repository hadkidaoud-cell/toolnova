import type { PdfParsedDocument } from "./types";
import { parsePdf, getPageDimensions } from "./parser";

export interface MergedPdfResult {
  blob: Blob;
  dataUrl: string;
  size: number;
  pageCount: number;
}

export function mergePdfBuffers(inputs: ArrayBuffer[], _outputName: string): MergedPdfResult {
  const parsed = inputs.map((buf) => parsePdf(buf));

  let maxObjNum = 0;
  for (const doc of parsed) {
    for (const [num] of doc.xref.entries) {
      if (num > maxObjNum) maxObjNum = num;
    }
  }

  const outputBytes: number[] = [];
  const xrefEntries: { offset: number; objNum: number }[] = [];

  writeString(outputBytes, "%PDF-1.7\n");
  writeString(outputBytes, "%\xC3\xA4\xC3\xB6\xC3\xBC\xC3\x9F\n");

  const newPageNumbers: number[] = [];
  let runningObjOffset = 0;

  for (let docIdx = 0; docIdx < parsed.length; docIdx++) {
    const doc = parsed[docIdx]!;
    const objNumOffset = docIdx === 0 ? 0 : maxObjNum;

    const pageObjSet = new Set(doc.pageObjectNumbers);

    for (const [objNum, objBytes] of doc.objects) {
      if (pageObjSet.has(objNum)) continue;

      const newObjNum = objNum + objNumOffset + 1;

      xrefEntries.push({ offset: runningObjOffset, objNum: newObjNum });

      const remapped = remapObjectReferences(objBytes, objNumOffset, doc.version);
      for (let i = 0; i < remapped.length; i++) {
        const b = remapped[i];
        if (b !== undefined) {
          outputBytes.push(b);
        }
      }
      runningObjOffset += remapped.length;
    }

    for (const pageObjNum of doc.pageObjectNumbers) {
      const newObjNum = pageObjNum + objNumOffset + 1;
      newPageNumbers.push(newObjNum);

      const pageBytes = doc.objects.get(pageObjNum);
      if (pageBytes !== undefined) {
        xrefEntries.push({ offset: runningObjOffset, objNum: newObjNum });
        const remapped = remapObjectReferences(pageBytes, objNumOffset, doc.version);
        for (let i = 0; i < remapped.length; i++) {
          const b = remapped[i];
          if (b !== undefined) {
            outputBytes.push(b);
          }
        }
        runningObjOffset += remapped.length;
      }
    }
  }

  const pagesObjNum = maxObjNum * 2 + 1;
  const pagesDictObjNum = pagesObjNum;
  const kidsRefStr = newPageNumbers.map((n) => `${n} 0 R`).join(" ");
  const pagesDict = `${pagesDictObjNum} 0 obj\n<< /Type /Pages /Kids [${kidsRefStr}] /Count ${newPageNumbers.length} >>\nendobj\n`;
  xrefEntries.push({ offset: runningObjOffset, objNum: pagesDictObjNum });
  writeString(outputBytes, pagesDict);
  runningObjOffset += stringByteLength(pagesDict);

  const rootObjNum = pagesObjNum + 1;
  const rootDict = `${rootObjNum} 0 obj\n<< /Type /Catalog /Pages ${pagesDictObjNum} 0 R >>\nendobj\n`;
  xrefEntries.push({ offset: runningObjOffset, objNum: rootObjNum });
  writeString(outputBytes, rootDict);
  runningObjOffset += stringByteLength(rootDict);

  const maxObj = Math.max(maxObjNum + 1, pagesObjNum + 2);

  const xrefOffset = runningObjOffset;
  writeString(outputBytes, "xref\n");
  writeString(outputBytes, `0 ${maxObj}\n`);
  writeString(outputBytes, "0000000000 65535 f \n");

  const xrefMap = new Map<number, number>();
  for (const entry of xrefEntries) {
    xrefMap.set(entry.objNum, entry.offset);
  }

  for (let i = 1; i < maxObj; i++) {
    const offset = xrefMap.get(i);
    if (offset !== undefined) {
      const offsetStr = String(offset).padStart(10, "0");
      writeString(outputBytes, `${offsetStr} 00000 n \n`);
    } else {
      writeString(outputBytes, "0000000000 00000 f \n");
    }
  }

  writeString(outputBytes, "trailer\n");
  writeString(outputBytes, `<< /Size ${maxObj} /Root ${rootObjNum} 0 R >>\n`);
  writeString(outputBytes, "startxref\n");
  writeString(outputBytes, `${xrefOffset}\n`);
  writeString(outputBytes, "%%EOF\n");

  const uint8 = new Uint8Array(outputBytes);
  const blob = new Blob([uint8], { type: "application/pdf" });
  const dataUrl = `data:application/pdf;base64,${arrayBufferToBase64(uint8.buffer)}`;

  return {
    blob,
    dataUrl,
    size: uint8.length,
    pageCount: newPageNumbers.length,
  };
}

function remapObjectReferences(objBytes: Uint8Array, objNumOffset: number, _version: string): Uint8Array {
  const result: number[] = [];
  let i = 0;

  while (i < objBytes.length) {
    const b = objBytes[i];
    if (b === undefined) { i++; continue; }

    if (b === 0x25) {
      while (i < objBytes.length && objBytes[i] !== 0x0a && objBytes[i] !== 0x0d) {
        const cb = objBytes[i];
        if (cb !== undefined) result.push(cb);
        i++;
      }
      continue;
    }

    if (b === 0x28) {
      result.push(b);
      i++;
      let depth = 1;
      while (i < objBytes.length && depth > 0) {
        const cb = objBytes[i];
        if (cb === 0x28) depth++;
        else if (cb === 0x29) depth--;
        if (cb !== undefined) result.push(cb);
        i++;
        if (cb === 0x5c) {
          const eb = objBytes[i];
          if (eb !== undefined) result.push(eb);
          i++;
        }
      }
      continue;
    }

    if (b === 0x3c && objBytes[i + 1] === 0x3c) {
      result.push(0x3c, 0x3c);
      i += 2;
      continue;
    }
    if (b === 0x3e && objBytes[i + 1] === 0x3e) {
      result.push(0x3e, 0x3e);
      i += 2;
      continue;
    }

    if (isDigit(b)) {
      let numStr = "";
      const numStart = i;
      while (i < objBytes.length && isDigitOrSpace(objBytes[i]!)) {
        const cb = objBytes[i];
        if (cb !== undefined && isDigit(cb)) numStr += String.fromCharCode(cb);
        i++;
      }

      if (i < objBytes.length && objBytes[i] === 0x20) {
        i++;
        let genStr = "";
        while (i < objBytes.length && isDigit(objBytes[i]!)) {
          const cb = objBytes[i];
          if (cb !== undefined) genStr += String.fromCharCode(cb);
          i++;
        }

        if (i < objBytes.length && objBytes[i] === 0x20) {
          i++;
          if (i < objBytes.length && objBytes[i] === 0x52) {
            const objNum = parseInt(numStr, 10);
            const remappedNum = objNum + objNumOffset + 1;
            const refStr = `${remappedNum} 0 R`;
            for (let j = 0; j < refStr.length; j++) {
              result.push(refStr.charCodeAt(j));
            }
            i++;
            continue;
          } else {
            for (let j = numStart; j < i; j++) {
              const cb = objBytes[j];
              if (cb !== undefined) result.push(cb);
            }
            continue;
          }
        }
      }

      for (let j = numStart; j < i; j++) {
        const cb = objBytes[j];
        if (cb !== undefined) result.push(cb);
      }
      continue;
    }

    result.push(b);
    i++;
  }

  return new Uint8Array(result);
}

function isDigit(b: number | undefined): boolean {
  if (b === undefined) return false;
  return b >= 0x30 && b <= 0x39;
}

function isDigitOrSpace(b: number | undefined): boolean {
  if (b === undefined) return false;
  return (b >= 0x30 && b <= 0x39) || b === 0x20;
}

function writeString(bytes: number[], str: string): void {
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
}

function stringByteLength(str: string): number {
  return str.length;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b !== undefined) {
      binary += String.fromCharCode(b);
    }
  }
  return btoa(binary);
}

export function getPageInfoFromParsed(doc: PdfParsedDocument, fileBuffer: ArrayBuffer): Array<{ width: number; height: number; rotation: number }> {
  const bytes = new Uint8Array(fileBuffer);
  return doc.pageObjectNumbers.map((objNum) => {
    const offset = doc.xref.entries.get(objNum)?.offset ?? 0;
    return getPageDimensions(bytes, offset);
  });
}
