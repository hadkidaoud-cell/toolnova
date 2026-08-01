import { describe, it, expect } from "vitest";
import { deflateSync } from "node:zlib";
import { PDFDocument } from "pdf-lib";
import {
  buildPdf,
  computePageDimensions,
  computeImagePlacement,
  MAX_PAGE_DIMENSION,
  PAGE_SIZES,
  type EmbeddedImage,
  type PdfBuildOptions,
} from "@/lib/image-to-pdf";

/**
 * Generates a real, valid RGB PNG of the requested size using Node zlib, so the
 * pdf-lib engine can embed genuine image data of known dimensions in tests.
 */
let crcTable: Int32Array | null = null;
function crc32(buf: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) chunk[4 + i] = type.charCodeAt(i);
  chunk.set(data, 8);
  dv.setUint32(8 + data.length, crc32(chunk.slice(4, 8 + data.length)));
  return chunk;
}

function makePng(width: number, height: number): Uint8Array {
  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = new Uint8Array(13);
  const dv = new DataView(ihdrData.buffer);
  dv.setUint32(0, width);
  dv.setUint32(4, height);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  const ihdr = pngChunk("IHDR", ihdrData);

  const row = width * 3;
  const raw = new Uint8Array((row + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (row + 1)] = 0;
    raw.fill(0x99, y * (row + 1) + 1, (y + 1) * (row + 1));
  }
  const idat = pngChunk("IDAT", deflateSync(raw));
  const iend = pngChunk("IEND", new Uint8Array(0));

  const out = new Uint8Array(sig.length + ihdr.length + idat.length + iend.length);
  let o = 0;
  for (const part of [sig, ihdr, idat, iend]) {
    out.set(part, o);
    o += part.length;
  }
  return out;
}

function image(width: number, height: number, name = `img-${width}x${height}.png`): EmbeddedImage {
  return {
    id: name,
    name,
    width,
    height,
    bytes: makePng(width, height),
    format: "png",
    thumb: "",
  };
}

async function openPdf(bytes: Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

const A4_OPTIONS: PdfBuildOptions = {
  pageSize: "a4",
  orientation: "portrait",
  marginPt: 36,
  fit: "contain",
};

describe("computePageDimensions", () => {
  it("returns A4 portrait by default", () => {
    const [w, h] = computePageDimensions(A4_OPTIONS);
    expect(w).toBeCloseTo(PAGE_SIZES.a4[0], 1);
    expect(h).toBeCloseTo(PAGE_SIZES.a4[1], 1);
  });

  it("swaps dimensions for landscape", () => {
    const [w, h] = computePageDimensions({ ...A4_OPTIONS, orientation: "landscape" });
    expect(w).toBeCloseTo(PAGE_SIZES.a4[1], 1);
    expect(h).toBeCloseTo(PAGE_SIZES.a4[0], 1);
  });

  it("sizes fit-image pages to the image ratio", () => {
    const [w, h] = computePageDimensions({ ...A4_OPTIONS, pageSize: "fit-image" }, { width: 800, height: 400 });
    expect(w).toBe(800);
    expect(h).toBe(400);
  });

  it("clamps fit-image pages that exceed the maximum dimension", () => {
    const [w, h] = computePageDimensions(
      { ...A4_OPTIONS, pageSize: "fit-image" },
      { width: 20000, height: 1000 }
    );
    expect(Math.max(w, h)).toBe(MAX_PAGE_DIMENSION);
    expect(w / h).toBeCloseTo(20, 1);
  });
});

describe("computeImagePlacement", () => {
  it("fits a landscape image inside a portrait A4 page, centered within margins", () => {
    const [pw, ph] = [PAGE_SIZES.a4[0], PAGE_SIZES.a4[1]];
    const margin = 36;
    const p = computeImagePlacement(pw, ph, 800, 400, margin, "contain");
    expect(p.x).toBeCloseTo((pw - p.width) / 2, 5);
    expect(p.y).toBeCloseTo((ph - p.height) / 2, 5);
    expect(p.width).toBeLessThanOrEqual(pw - 2 * margin + 0.01);
    expect(p.height).toBeLessThanOrEqual(ph - 2 * margin + 0.01);
    expect(p.width / p.height).toBeCloseTo(2, 2);
  });

  it("covers the full content area in cover mode", () => {
    const [pw, ph] = [PAGE_SIZES.a4[0], PAGE_SIZES.a4[1]];
    const margin = 36;
    const p = computeImagePlacement(pw, ph, 100, 1000, margin, "cover");
    expect(p.width).toBeGreaterThanOrEqual(pw - 2 * margin - 0.01);
    expect(p.height).toBeGreaterThanOrEqual(ph - 2 * margin - 0.01);
    expect(p.width).toBeLessThanOrEqual(pw - 0.01);
  });
});

describe("buildPdf", () => {
  it("creates one page per image with the requested page size", async () => {
    const doc = await openPdf(await buildPdf([image(400, 300), image(600, 800)], A4_OPTIONS));
    expect(doc.getPageCount()).toBe(2);
    const { width, height } = doc.getPage(0)!.getSize();
    expect(width).toBeCloseTo(PAGE_SIZES.a4[0], 1);
    expect(height).toBeCloseTo(PAGE_SIZES.a4[1], 1);
  });

  it("honors landscape orientation on the output pages", async () => {
    const bytes = await buildPdf([image(400, 300)], { ...A4_OPTIONS, orientation: "landscape" });
    const doc = await openPdf(bytes);
    const { width, height } = doc.getPage(0)!.getSize();
    expect(width).toBeCloseTo(PAGE_SIZES.a4[1], 1);
    expect(height).toBeCloseTo(PAGE_SIZES.a4[0], 1);
  });

  it("embeds real image data on every page (XObject attached)", async () => {
    const doc = await openPdf(await buildPdf([image(1600, 400)], A4_OPTIONS));
    const page = doc.getPage(0)!;
    const xObjects = page.node.normalizedEntries().XObject;
    expect(xObjects).toBeDefined();
    expect(xObjects?.keys().length).toBeGreaterThan(0);
  });

  it("fit-image pages match each image's own dimensions", async () => {
    const doc = await openPdf(
      await buildPdf([image(1200, 600), image(300, 900)], { ...A4_OPTIONS, pageSize: "fit-image" })
    );
    const p0 = doc.getPage(0)!.getSize();
    const p1 = doc.getPage(1)!.getSize();
    expect([p0.width, p0.height]).toEqual([1200, 600]);
    expect([p1.width, p1.height]).toEqual([300, 900]);
  });

  it("reports progress for every image", async () => {
    const seen: number[] = [];
    await buildPdf([image(200, 200), image(300, 300), image(400, 400)], A4_OPTIONS, (i) => seen.push(i));
    expect(seen).toEqual([1, 2, 3]);
  });
});
