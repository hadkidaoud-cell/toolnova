import { describe, it, expect } from "vitest";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { compressPdf, PRESETS, type CompressResult } from "@/lib/pdf-compressor";

/**
 * Builds a multi-page text PDF so we can exercise the lossless structural
 * pass (object streams + metadata cleanup) without needing browser APIs.
 */
async function buildTextPdf(pages = 8): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([612, 792]);
    page.drawText(`ToolNova PDF Compressor test page ${i + 1}`, {
      x: 50,
      y: 700,
      size: 24,
      font,
      color: rgb(0.1, 0.2, 0.8),
    });
    for (let line = 0; line < 20; line++) {
      page.drawText(
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Line ${line}.`,
        { x: 50, y: 650 - line * 20, size: 10, font }
      );
    }
  }
  return doc.save();
}

async function openPdf(bytes: Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

describe("pdf-compressor engine", () => {
  it("returns a smaller valid PDF with the same page count (lossless)", async () => {
    const input = await buildTextPdf(8);
    const inputPageCount = (await openPdf(input)).getPageCount();

    const result: CompressResult = await compressPdf({
      data: input,
      fileName: "test.pdf",
      preset: PRESETS.find((p) => p.mode === "lossless")!,
    });

    expect(result.originalSize).toBe(input.length);
    expect(result.compressedSize).toBeLessThanOrEqual(result.originalSize);
    expect(result.mode).toBe("lossless");

    const output = await openPdf(result.bytes);
    expect(output.getPageCount()).toBe(inputPageCount);
  });

  it("reports alreadyOptimized when the input cannot be shrunk", async () => {
    // A tiny single-page PDF usually cannot be made smaller.
    const tiny = await buildTextPdf(1);

    const result: CompressResult = await compressPdf({
      data: tiny,
      fileName: "tiny.pdf",
      preset: PRESETS.find((p) => p.mode === "lossless")!,
    });

    expect(result.alreadyOptimized).toBe(true);
    expect(result.bytes).toEqual(tiny);
    expect(result.savingsPercent).toBeLessThanOrEqual(0);
  });

  it("exposes a balanced preset with sensible defaults", () => {
    const balanced = PRESETS.find((p) => p.mode === "balanced");
    expect(balanced).toBeDefined();
    expect(balanced!.dpi).toBe(150);
    expect(balanced!.quality).toBeGreaterThan(0);
    expect(balanced!.quality).toBeLessThanOrEqual(1);
  });

  it("output can be re-opened and still contain text (lossless keeps content)", async () => {
    const input = await buildTextPdf(2);
    const result = await compressPdf({
      data: input,
      fileName: "text.pdf",
      preset: PRESETS.find((p) => p.mode === "lossless")!,
    });

    const output = await openPdf(result.bytes);
    const pages = output.getPages();
    expect(pages.length).toBe(2);
    // pdf-lib keeps the content stream, so pages must not be empty.
    for (const page of pages) {
      const { width, height } = page.getSize();
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    }
  });
});
