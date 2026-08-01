import { describe, it, expect } from "vitest";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  parseRanges,
  rangesToIndices,
  splitAll,
  splitRanges,
  splitGroups,
  createZip,
  type SplitResult,
} from "@/lib/pdf-splitter";

async function buildPdf(pages: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([612, 792]);
    page.drawText(`ToolNova Splitter page ${i + 1}`, { x: 50, y: 700, size: 24, font, color: rgb(0.1, 0.2, 0.8) });
  }
  return doc.save();
}

async function pageCountOf(bytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}

describe("parseRanges", () => {
  it("parses single pages and ranges", () => {
    expect(parseRanges("1-3, 5, 8-10", 10)).toEqual([
      [1, 3],
      [5, 5],
      [8, 10],
    ]);
  });

  it("accepts whitespace and semicolons as separators", () => {
    expect(parseRanges("1 3;4", 10)).toEqual([
      [1, 1],
      [3, 3],
      [4, 4],
    ]);
  });

  it("clamps ranges to the document page count", () => {
    expect(parseRanges("1-99", 5)).toEqual([[1, 5]]);
    expect(parseRanges("0-2", 5)).toEqual([[1, 2]]);
  });

  it("normalizes reversed ranges", () => {
    expect(parseRanges("5-3", 10)).toEqual([[3, 5]]);
  });

  it("throws when every range falls outside the document", () => {
    expect(() => parseRanges("12-20", 5)).toThrow();
  });

  it("rejects malformed input", () => {
    expect(() => parseRanges("abc", 10)).toThrow();
    expect(() => parseRanges("", 10)).toThrow();
  });

  it("tolerates trailing separators", () => {
    expect(parseRanges("1-3,", 10)).toEqual([[1, 3]]);
  });

  it("rejects empty documents", () => {
    expect(() => parseRanges("1", 0)).toThrow();
  });
});

describe("rangesToIndices", () => {
  it("expands ranges into 0-based indices", () => {
    expect(rangesToIndices([[1, 3], [5, 5], [8, 10]])).toEqual([0, 1, 2, 4, 7, 8, 9]);
  });
});

describe("splitAll", () => {
  it("creates one file per page, each with exactly one page", async () => {
    const pdf = await buildPdf(6);
    const res: SplitResult = await splitAll(pdf, "doc.pdf");
    expect(res.files).toHaveLength(6);
    expect(res.pageCount).toBe(6);
    for (let i = 0; i < 6; i++) {
      const file = res.files[i]!;
      expect(file.label).toBe(`Page ${i + 1}`);
      expect(await pageCountOf(file.bytes)).toBe(1);
    }
  });

  it("names files from the source document", async () => {
    const res = await splitAll(await buildPdf(3), "invoice.pdf");
    expect(res.files[0]!.fileName).toBe("invoice-page-1.pdf");
  });
});

describe("splitRanges", () => {
  it("extracts the requested ranges in order", async () => {
    const res = await splitRanges(await buildPdf(10), "doc.pdf", "1-2, 5, 8-10");
    expect(res.files).toHaveLength(3);
    expect(await pageCountOf(res.files[0]!.bytes)).toBe(2);
    expect(await pageCountOf(res.files[1]!.bytes)).toBe(1);
    expect(await pageCountOf(res.files[2]!.bytes)).toBe(3);
    expect(res.files[0]!.label).toBe("Pages 1-2");
    expect(res.files[1]!.label).toBe("Page 5");
  });

  it("throws on invalid ranges", async () => {
    await expect(splitRanges(await buildPdf(5), "doc.pdf", "abc")).rejects.toThrow();
  });
});

describe("splitGroups", () => {
  it("splits into equal-sized groups of N pages", async () => {
    const res = await splitGroups(await buildPdf(10), "doc.pdf", 3);
    expect(res.files).toHaveLength(4);
    expect(await pageCountOf(res.files[0]!.bytes)).toBe(3);
    expect(await pageCountOf(res.files[1]!.bytes)).toBe(3);
    expect(await pageCountOf(res.files[2]!.bytes)).toBe(3);
    expect(await pageCountOf(res.files[3]!.bytes)).toBe(1);
    expect(res.files[3]!.label).toBe("Pages 10-10");
  });

  it("coerces invalid group sizes to at least 1", async () => {
    const res = await splitGroups(await buildPdf(4), "doc.pdf", 0);
    expect(res.files).toHaveLength(4);
  });
});

describe("createZip", () => {
  it("writes a valid stored ZIP that round-trips the files", () => {
    const a = new Uint8Array([1, 2, 3, 4, 5]);
    const b = new Uint8Array([9, 9, 9]);
    const zip = createZip([
      { name: "a.bin", bytes: a },
      { name: "b.bin", bytes: b },
    ]);

    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);

    // Parse stored entries back out of the archive.
    const enc = new TextDecoder();
    let offset = 0;
    const extracted = new Map<string, Uint8Array>();
    while (offset + 30 <= zip.length && zip[offset] === 0x50 && zip[offset + 1] === 0x4b && zip[offset + 2] === 0x03 && zip[offset + 3] === 0x04) {
      const dv = new DataView(zip.buffer, zip.byteOffset + offset);
      const nameLen = dv.getUint16(26, true);
      const extraLen = dv.getUint16(28, true);
      const size = dv.getUint32(22, true);
      const name = enc.decode(zip.slice(offset + 30, offset + 30 + nameLen));
      const data = zip.slice(offset + 30 + nameLen + extraLen, offset + 30 + nameLen + extraLen + size);
      extracted.set(name, data);
      offset += 30 + nameLen + extraLen + size;
    }

    expect(extracted.size).toBe(2);
    expect(Array.from(extracted.get("a.bin")!)).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(extracted.get("b.bin")!)).toEqual([9, 9, 9]);
    expect(zip.slice(-22, -22 + 4)).toEqual(new Uint8Array([0x50, 0x4b, 0x05, 0x06]));
  });
});
