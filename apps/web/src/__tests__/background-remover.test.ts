import { describe, it, expect } from "vitest";
import {
  applyAlphaToRgba,
  colorDefringe,
  computeLetterbox,
  cropMaskBilinear,
  erodeMask,
  featherMask,
  maskToAlpha,
  minMaxNormalize,
  preparePaddedRgba,
  resizeRgbaBilinear,
  rgbaToModelInput,
} from "@/lib/background-remover/pipeline";

function solidRgba(w: number, h: number, r: number, g: number, b: number, a = 255): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = a;
  }
  return out;
}

describe("computeLetterbox", () => {
  it("fills the whole target for a square image", () => {
    const rect = computeLetterbox(320, 320, 320);
    expect(rect).toEqual({ x: 0, y: 0, w: 320, h: 320 });
  });

  it("letterboxes a 16:9 image into a square", () => {
    const rect = computeLetterbox(1600, 900, 320);
    expect(rect.w).toBe(320);
    expect(rect.h).toBe(180);
    expect(rect.y).toBe(70);
    expect(rect.x).toBe(0);
  });

  it("letterboxes a tall image into a square", () => {
    const rect = computeLetterbox(900, 1600, 320);
    expect(rect.w).toBe(180);
    expect(rect.h).toBe(320);
    expect(rect.x).toBe(70);
    expect(rect.y).toBe(0);
  });

  it("never produces zero-size regions", () => {
    const rect = computeLetterbox(1, 1, 320);
    expect(rect.w).toBeGreaterThan(0);
    expect(rect.h).toBeGreaterThan(0);
  });
});

describe("preparePaddedRgba", () => {
  it("fills padding with the pad color and places content", () => {
    const src = solidRgba(100, 100, 10, 20, 30);
    const { rgba, rect } = preparePaddedRgba(src, 100, 100, 320, [124, 116, 104]);
    expect(rgba.length).toBe(320 * 320 * 4);
    expect(rect).toEqual({ x: 0, y: 0, w: 320, h: 320 });
    expect(rgba[0]).toBe(10);
    expect(rgba[1]).toBe(20);
    expect(rgba[2]).toBe(30);
  });

  it("pads a wide image with the mean color on the sides", () => {
    const src = solidRgba(400, 100, 255, 0, 0);
    const { rgba, rect } = preparePaddedRgba(src, 400, 100, 320, [124, 116, 104]);
    expect(rect.w).toBe(320);
    expect(rect.h).toBe(80);
    expect(rect.y).toBe(120);
    const topLeft = (0 * 320 + 0) * 4;
    expect(rgba[topLeft]).toBe(124);
    expect(rgba[topLeft + 1]).toBe(116);
    const contentPixel = (rect.y * 320 + rect.x) * 4;
    expect(rgba[contentPixel]).toBe(255);
    expect(rgba[contentPixel + 1]).toBe(0);
  });
});

describe("resizeRgbaBilinear", () => {
  it("preserves a solid color through downscale", () => {
    const src = solidRgba(40, 30, 200, 100, 50);
    const dst = resizeRgbaBilinear(src, 40, 30, 10, 10);
    expect(dst.length).toBe(10 * 10 * 4);
    expect(dst[0]).toBe(200);
    expect(dst[1]).toBe(100);
    expect(dst[2]).toBe(50);
  });

  it("downscales and upscales back to approximately the same average", () => {
    const src = new Uint8ClampedArray(16 * 16 * 4);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = (y * 16 + x) * 4;
        src[i] = (x * 255) / 15;
        src[i + 1] = (y * 255) / 15;
        src[i + 2] = 128;
        src[i + 3] = 255;
      }
    }
    const small = resizeRgbaBilinear(src, 16, 16, 8, 8);
    const back = resizeRgbaBilinear(small, 8, 8, 16, 16);
    const c = (7 * 16 + 7) * 4;
    const expected = Math.round((7 * 255) / 15);
    expect(Math.abs(back[c]! - expected)).toBeLessThanOrEqual(2);
    expect(back[c + 3]).toBe(255);
  });
});

describe("rgbaToModelInput", () => {
  it("applies mean/std normalization in NCHW order", () => {
    const size = 2;
    const rgba = new Uint8ClampedArray(size * size * 4);
    rgba[0] = 128; // pixel (0,0) r
    rgba[1] = 64;
    rgba[2] = 0;
    rgba[4] = 255; // pixel (0,1) r
    rgba[5] = 255;
    rgba[6] = 255;
    const mean: [number, number, number] = [0.5, 0.5, 0.5];
    const std: [number, number, number] = [1, 1, 1];
    const out = rgbaToModelInput(rgba, size, mean, std);
    expect(out.length).toBe(3 * size * size);
    // plane 0 = red channel, pixel-major (NCHW)
    expect(out[0]).toBeCloseTo(128 / 255 - 0.5, 5);
    expect(out[1]).toBeCloseTo(1 - 0.5, 5);
    expect(out[2]).toBeCloseTo(-0.5, 5);
    // plane 1 = green channel
    expect(out[size * size]).toBeCloseTo(64 / 255 - 0.5, 5);
    expect(out[size * size + 1]).toBeCloseTo(1 - 0.5, 5);
  });
});

describe("minMaxNormalize", () => {
  it("maps values to [0,1] using global min/max", () => {
    const out = minMaxNormalize(new Float32Array([0, 1, 2, 3, 4]));
    expect(out[0]).toBe(0);
    expect(out[2]).toBeCloseTo(0.5, 5);
    expect(out[4]).toBe(1);
  });

  it("returns a uniform mask when the range is flat", () => {
    const out = minMaxNormalize(new Float32Array([0.9, 0.9, 0.9]));
    expect(out[0]).toBe(1);
    expect(out[2]).toBe(1);
  });
});

describe("cropMaskBilinear", () => {
  it("crops and rescales a mask region", () => {
    const mask = new Float32Array(320 * 320);
    mask.fill(1);
    const rect = { x: 0, y: 0, w: 320, h: 180 };
    const out = cropMaskBilinear(mask, 320, rect, 160, 90);
    expect(out.length).toBe(160 * 90);
    expect(out[0]).toBe(1);
    expect(out[160 * 90 - 1]).toBe(1);
  });

  it("extracts only the letterboxed region", () => {
    const mask = new Float32Array(16 * 16);
    mask.fill(0);
    for (let y = 4; y < 12; y++) {
      for (let x = 4; x < 12; x++) {
        mask[y * 16 + x] = 1;
      }
    }
    const rect = { x: 4, y: 4, w: 8, h: 8 };
    const out = cropMaskBilinear(mask, 16, rect, 8, 8);
    expect(out.length).toBe(64);
    for (let i = 0; i < 64; i++) {
      expect(out[i]).toBe(1);
    }
  });

  it("uses the full mask stride when the region is offset", () => {
    const mask = new Float32Array(16 * 16);
    mask.fill(0);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        mask[y * 16 + x] = 0.5;
      }
    }
    const rect = { x: 8, y: 8, w: 4, h: 4 };
    const out = cropMaskBilinear(mask, 16, rect, 4, 4);
    for (let i = 0; i < 16; i++) {
      expect(out[i]).toBe(0.5);
    }
  });
});

describe("maskToAlpha", () => {
  it("converts [0,1] floats to byte alpha with clamping", () => {
    const out = maskToAlpha(new Float32Array([0, 0.5, 1, 2, -1]));
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(128);
    expect(out[2]).toBe(255);
    expect(out[3]).toBe(255);
    expect(out[4]).toBe(0);
  });
});

describe("featherMask", () => {
  it("softens a hard edge", () => {
    const w = 16;
    const h = 1;
    const mask = new Float32Array(w * h);
    for (let x = 0; x < w; x++) mask[x] = x < 8 ? 1 : 0;
    const feathered = featherMask(mask, w, h, 2);
    expect(feathered[4]).toBe(1);
    expect(feathered[11]).toBe(0);
    const edge = feathered[8]!;
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(1);
  });

  it("returns the same array for radius 0", () => {
    const mask = new Float32Array([0, 1, 0.5]);
    expect(featherMask(mask, 3, 1, 0)).toBe(mask);
  });
});

describe("erodeMask", () => {
  it("shrinks the foreground boundary", () => {
    const w = 10;
    const h = 1;
    const mask = new Float32Array(w * h);
    for (let x = 2; x < 8; x++) mask[x] = 1;
    const eroded = erodeMask(mask, w, h, 1);
    expect(eroded[2]).toBe(0);
    expect(eroded[3]).toBe(1);
    expect(eroded[6]).toBe(1);
    expect(eroded[7]).toBe(0);
  });

  it("returns the same array for radius 0", () => {
    const mask = new Float32Array([0, 1, 0.5]);
    expect(erodeMask(mask, 3, 1, 0)).toBe(mask);
  });
});

describe("colorDefringe", () => {
  it("pulls edge pixels toward the nearest opaque color", () => {
    // 3x3: center pixel semi-transparent, left neighbor opaque green
    const w = 3;
    const h = 3;
    const rgba = solidRgba(w, h, 255, 0, 0);
    rgba[(1 * w + 0) * 4] = 0;
    rgba[(1 * w + 0) * 4 + 1] = 255;
    rgba[(1 * w + 0) * 4 + 2] = 0;
    const alpha = new Uint8ClampedArray(w * h);
    alpha.fill(0);
    for (let y = 0; y < h; y++) alpha[y * w] = 255; // left column opaque
    alpha[1 * w + 1] = 128; // center semi-transparent
    const out = colorDefringe(rgba, alpha, w, h, 1, 1);
    // center pulled toward green of (0,1)
    expect(out[(1 * w + 1) * 4]).toBeLessThan(255);
    expect(out[(1 * w + 1) * 4 + 1]).toBeGreaterThan(0);
  });

  it("leaves fully transparent and opaque pixels untouched", () => {
    const w = 2;
    const h = 2;
    const rgba = solidRgba(w, h, 10, 20, 30);
    const alpha = new Uint8ClampedArray(w * h);
    alpha.fill(0);
    alpha[0] = 255;
    const out = colorDefringe(rgba, alpha, w, h, 1, 1);
    expect(out[0]).toBe(10);
    expect(out[(1 * w + 0) * 4]).toBe(10);
  });
});

describe("applyAlphaToRgba", () => {
  it("overwrites the alpha channel", () => {
    const rgba = solidRgba(2, 1, 1, 2, 3, 0);
    const alpha = new Uint8ClampedArray([200, 50]);
    const out = applyAlphaToRgba(rgba, alpha);
    expect(out[3]).toBe(200);
    expect(out[7]).toBe(50);
    expect(out[0]).toBe(1);
  });
});
