export interface LetterboxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function computeLetterbox(
  srcW: number,
  srcH: number,
  target: number
): LetterboxRect {
  const scale = Math.min(target / srcW, target / srcH);
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const x = Math.floor((target - w) / 2);
  const y = Math.floor((target - h) / 2);
  return { x, y, w, h };
}

export function resizeRgbaBilinear(
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): Uint8ClampedArray {
  const dst = new Uint8ClampedArray(dstW * dstH * 4);
  if (srcW === 0 || srcH === 0 || dstW === 0 || dstH === 0) return dst;
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;
  for (let y = 0; y < dstH; y++) {
    const sy = y * yRatio;
    const y0 = Math.min(Math.floor(sy), srcH - 1);
    const y1 = Math.min(y0 + 1, srcH - 1);
    const fy = sy - y0;
    for (let x = 0; x < dstW; x++) {
      const sx = x * xRatio;
      const x0 = Math.min(Math.floor(sx), srcW - 1);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const fx = sx - x0;
      const di = (y * dstW + x) * 4;
      const i00 = (y0 * srcW + x0) * 4;
      const i01 = (y0 * srcW + x1) * 4;
      const i10 = (y1 * srcW + x0) * 4;
      const i11 = (y1 * srcW + x1) * 4;
      for (let c = 0; c < 4; c++) {
        const top = src[i00 + c]! * (1 - fx) + src[i01 + c]! * fx;
        const bottom = src[i10 + c]! * (1 - fx) + src[i11 + c]! * fx;
        dst[di + c] = Math.round(top * (1 - fy) + bottom * fy);
      }
    }
  }
  return dst;
}

export function preparePaddedRgba(
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  target: number,
  padRgb: [number, number, number]
): { rgba: Uint8ClampedArray; rect: LetterboxRect } {
  const rect = computeLetterbox(srcW, srcH, target);
  const padded = new Uint8ClampedArray(target * target * 4);
  for (let i = 0; i < target * target; i++) {
    padded[i * 4] = padRgb[0];
    padded[i * 4 + 1] = padRgb[1];
    padded[i * 4 + 2] = padRgb[2];
    padded[i * 4 + 3] = 255;
  }
  const resized = resizeRgbaBilinear(src, srcW, srcH, rect.w, rect.h);
  for (let y = 0; y < rect.h; y++) {
    for (let x = 0; x < rect.w; x++) {
      const si = (y * rect.w + x) * 4;
      const di = ((rect.y + y) * target + rect.x + x) * 4;
      padded[di] = resized[si]!;
      padded[di + 1] = resized[si + 1]!;
      padded[di + 2] = resized[si + 2]!;
      padded[di + 3] = 255;
    }
  }
  return { rgba: padded, rect };
}

export function rgbaToModelInput(
  rgba: Uint8ClampedArray,
  size: number,
  mean: [number, number, number],
  std: [number, number, number]
): Float32Array {
  const out = new Float32Array(3 * size * size);
  const plane = size * size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const si = (y * size + x) * 4;
      const pi = y * size + x;
      out[pi] = (rgba[si]! / 255 - mean[0]) / std[0];
      out[plane + pi] = (rgba[si + 1]! / 255 - mean[1]) / std[1];
      out[2 * plane + pi] = (rgba[si + 2]! / 255 - mean[2]) / std[2];
    }
  }
  return out;
}

export function minMaxNormalize(src: Float32Array): Float32Array {
  const out = new Float32Array(src.length);
  let mn = Infinity;
  let mx = -Infinity;
  for (let i = 0; i < src.length; i++) {
    const v = src[i]!;
    if (v < mn) mn = v;
    if (v > mx) mx = v;
  }
  const range = mx - mn;
  if (range < 1e-7) {
    out.fill(1);
    return out;
  }
  for (let i = 0; i < src.length; i++) {
    let v = (src[i]! - mn) / range;
    if (v < 0) v = 0;
    else if (v > 1) v = 1;
    out[i] = v;
  }
  return out;
}

export function cropMaskBilinear(
  mask: Float32Array,
  maskW: number,
  rect: LetterboxRect,
  dstW: number,
  dstH: number
): Float32Array {
  const out = new Float32Array(dstW * dstH);
  if (dstW === 0 || dstH === 0 || rect.w === 0 || rect.h === 0) return out;
  const xRatio = rect.w / dstW;
  const yRatio = rect.h / dstH;
  const maxX = rect.x + rect.w - 1;
  const maxY = rect.y + rect.h - 1;
  for (let y = 0; y < dstH; y++) {
    const sy = rect.y + y * yRatio;
    const y0 = Math.min(Math.floor(sy), maxY);
    const y1 = Math.min(y0 + 1, maxY);
    const fy = sy - y0;
    for (let x = 0; x < dstW; x++) {
      const sx = rect.x + x * xRatio;
      const x0 = Math.min(Math.floor(sx), maxX);
      const x1 = Math.min(x0 + 1, maxX);
      const fx = sx - x0;
      const row0 = y0 * maskW;
      const row1 = y1 * maskW;
      const top = mask[row0 + x0]! * (1 - fx) + mask[row0 + x1]! * fx;
      const bottom = mask[row1 + x0]! * (1 - fx) + mask[row1 + x1]! * fx;
      out[y * dstW + x] = top * (1 - fy) + bottom * fy;
    }
  }
  return out;
}

export function maskToAlpha(mask: Float32Array): Uint8ClampedArray {
  const out = new Uint8ClampedArray(mask.length);
  for (let i = 0; i < mask.length; i++) {
    const v = Math.round(mask[i]! * 255);
    out[i] = v < 0 ? 0 : v > 255 ? 255 : v;
  }
  return out;
}

function boxBlurPass(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const dst = new Float32Array(src.length);
  const r = Math.max(1, radius);
  const d = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let x = -r; x <= r; x++) {
      const xi = x < 0 ? 0 : x >= w ? w - 1 : x;
      sum += src[row + xi]!;
    }
    tmp[row] = sum / d;
    for (let x = 1; x < w; x++) {
      const add = x + r >= w ? w - 1 : x + r;
      const rem = x - r - 1 < 0 ? 0 : x - r - 1;
      sum += src[row + add]! - src[row + rem]!;
      tmp[row + x] = sum / d;
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) {
      const yi = y < 0 ? 0 : y >= h ? h - 1 : y;
      sum += tmp[yi * w + x]!;
    }
    dst[x] = sum / d;
    for (let y = 1; y < h; y++) {
      const add = y + r >= h ? h - 1 : y + r;
      const rem = y - r - 1 < 0 ? 0 : y - r - 1;
      sum += tmp[add * w + x]! - tmp[rem * w + x]!;
      dst[y * w + x] = sum / d;
    }
  }
  return dst;
}

export function featherMask(
  mask: Float32Array,
  w: number,
  h: number,
  radius: number
): Float32Array {
  if (radius <= 0 || radius === Infinity) return mask;
  return boxBlurPass(mask, w, h, Math.round(radius));
}

export function erodeMask(
  mask: Float32Array,
  w: number,
  h: number,
  radius: number
): Float32Array {
  if (radius <= 0 || radius === Infinity) return mask;
  const r = Math.round(radius);
  const out = mask.slice();
  const tmp = mask.slice();
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let m = 1;
      for (let k = -r; k <= r; k++) {
        const xi = x + k < 0 ? 0 : x + k >= w ? w - 1 : x + k;
        const v = tmp[row + xi]!;
        if (v < m) m = v;
      }
      out[row + x] = m;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let m = 1;
      for (let k = -r; k <= r; k++) {
        const yi = y + k < 0 ? 0 : y + k >= h ? h - 1 : y + k;
        const v = out[yi * w + x]!;
        if (v < m) m = v;
      }
      tmp[y * w + x] = m;
    }
  }
  return tmp;
}

export function colorDefringe(
  rgba: Uint8ClampedArray,
  alpha: Uint8ClampedArray,
  w: number,
  h: number,
  radius: number,
  strength: number
): Uint8ClampedArray {
  if (strength <= 0) return rgba;
  const r = Math.max(1, Math.round(radius));
  const out = new Uint8ClampedArray(rgba);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const a = alpha[i]!;
      if (a === 0 || a === 255) continue;
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let n = 0;
      const dirs: Array<[number, number]> = [
        [r, 0],
        [-r, 0],
        [0, r],
        [0, -r],
      ];
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = ny * w + nx;
        if (alpha[ni]! >= 240) {
          sr += rgba[ni * 4]!;
          sg += rgba[ni * 4 + 1]!;
          sb += rgba[ni * 4 + 2]!;
          n++;
        }
      }
      if (n === 0) continue;
      const t = strength * (1 - a / 255);
      if (t <= 0) continue;
      out[i * 4] = Math.round(rgba[i * 4]! * (1 - t) + (sr / n) * t);
      out[i * 4 + 1] = Math.round(rgba[i * 4 + 1]! * (1 - t) + (sg / n) * t);
      out[i * 4 + 2] = Math.round(rgba[i * 4 + 2]! * (1 - t) + (sb / n) * t);
    }
  }
  return out;
}

export function applyAlphaToRgba(
  rgba: Uint8ClampedArray,
  alpha: Uint8ClampedArray
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(rgba);
  for (let i = 0; i < alpha.length; i++) {
    out[i * 4 + 3] = alpha[i]!;
  }
  return out;
}
