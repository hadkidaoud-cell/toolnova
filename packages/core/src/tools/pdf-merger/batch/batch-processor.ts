import type { PdfInputFile, PdfPageInfo } from "../types";
import { parsePdf, getPageCount, getPageDimensions } from "../engine/parser";

export async function loadPdfFromFile(file: File): Promise<PdfInputFile> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let pageCount = 0;
  let title: string | undefined;
  let author: string | undefined;

  try {
    const parsed = parsePdf(buffer);
    pageCount = getPageCount(parsed);

    const titleMatch = uint8ToString(bytes).match(/\/Title\s*\(([^)]*)\)/);
    if (titleMatch?.[1] !== undefined) title = titleMatch[1];
    const authorMatch = uint8ToString(bytes).match(/\/Author\s*\(([^)]*)\)/);
    if (authorMatch?.[1] !== undefined) author = authorMatch[1];
  } catch {
    pageCount = 1;
  }

  return {
    id: `pdf-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
    name: file.name,
    size: file.size,
    buffer,
    pageCount,
    title,
    author,
  };
}

export function validatePdfFile(file: { name: string; size: number; type: string }): string | null {
  if (file.size > 100 * 1024 * 1024) return "File too large (max 100MB)";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "pdf") return "Only PDF files are supported";
  if (file.type !== "application/pdf" && file.type !== "") {
    return "Invalid file type";
  }
  return null;
}

export function getPageInfos(file: PdfInputFile): PdfPageInfo[] {
  const pages: PdfPageInfo[] = [];
  try {
    const parsed = parsePdf(file.buffer);
    const bytes = new Uint8Array(file.buffer);

    for (let i = 0; i < parsed.pageObjectNumbers.length; i++) {
      const objNum = parsed.pageObjectNumbers[i];
      if (objNum === undefined) continue;
      const offset = parsed.xref.entries.get(objNum)?.offset ?? 0;
      const dims = getPageDimensions(bytes, offset);
      pages.push({
        index: i,
        inputFileId: file.id,
        inputFileName: file.name,
        width: dims.width,
        height: dims.height,
        rotation: dims.rotation,
        selected: true,
      });
    }
  } catch {
    for (let i = 0; i < file.pageCount; i++) {
      pages.push({
        index: i,
        inputFileId: file.id,
        inputFileName: file.name,
        width: 612,
        height: 792,
        rotation: 0,
        selected: true,
      });
    }
  }
  return pages;
}

function uint8ToString(bytes: Uint8Array): string {
  const chars: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b !== undefined) chars.push(String.fromCharCode(b));
  }
  return chars.join("");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
