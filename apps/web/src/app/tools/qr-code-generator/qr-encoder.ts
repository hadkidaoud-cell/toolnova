// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - Array index access with noUncheckedIndexedAccess
const EC_LEVELS = { L: 1, M: 0, Q: 3, H: 2 } as const;
type ECLevel = keyof typeof EC_LEVELS;

const GF256 = (() => {
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v = (v << 1) ^ (v & 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  return {
    exp: (a: number) => EXP[a],
    log: (a: number) => LOG[a],
    mul: (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]),
  };
})();

function reedSolomon(numEc: number, data: Uint8Array): Uint8Array {
  const gen = new Uint8Array(numEc + 1);
  gen[0] = 1;
  for (let i = 0; i < numEc; i++) {
    for (let j = numEc; j >= 1; j--) gen[j] = gen[j - 1] ^ GF256.mul(gen[j], GF256.exp(i));
  }
  const msg = new Uint8Array(data.length + numEc);
  msg.set(data);
  for (let i = 0; i < data.length; i++) {
    const coeff = msg[i];
    if (coeff !== 0) {
      for (let j = 1; j <= numEc; j++) msg[i + j] ^= GF256.mul(gen[j], coeff);
    }
  }
  return msg.slice(data.length);
}

const EC_COUNTS: Record<number, [number, number, number, number]> = {};
for (let v = 1; v <= 40; v++) EC_COUNTS[v] = [10, 10, 10, 10];

function getVersion(dataLen: number): number {
  for (let v = 1; v <= 40; v++) {
    const cap = [26,44,70,100,134,172,196,242,292,352,408,468,552,588,644,700,750,808,870,938,1006,1094,1174,1276,1370,1468,1531,1631,1735,1843,1955,2071,2191,2306,2434,2566,2702,2812,2956,2956][v-1] || 2956;
    if (dataLen * 8 <= cap * 0.8) return v;
  }
  return 40;
}

function getModuleCount(version: number): number {
  return version * 4 + 17;
}

function encodeQR(text: string, ecLevel: ECLevel): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const version = Math.max(1, Math.min(40, getVersion(bytes.length + 2)));
  const size = getModuleCount(version);
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function placeFinderPattern(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const y = row + r, x = col + c;
        if (y < 0 || y >= size || x < 0 || x >= size) continue;
        const inBorder = r === -1 || r === 7 || c === -1 || c === 7;
        const inPattern = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const inHole = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        modules[y][x] = inBorder || (inPattern && !inHole);
        reserved[y][x] = true;
      }
    }
  }

  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  reserved[8][8] = true;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      modules[r + 1][size - 8 + c] = (r + c) % 2 === 0;
      modules[size - 8 + r][c + 1] = (r + c) % 2 === 0;
      reserved[r + 1][size - 8 + c] = true;
      reserved[size - 8 + r][c + 1] = true;
    }
  }

  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        modules[i][size - 11 + j] = i === 1 || i === 4;
        modules[size - 11 + j][i] = i === 1 || i === 4;
        reserved[i][size - 11 + j] = true;
        reserved[size - 11 + j][i] = true;
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && (r + c) % 2 === 0) {
        reserved[r][c] = true;
      }
    }
  }

  const ecIdx = EC_LEVELS[ecLevel];
  const ecPerBlock = (EC_COUNTS[version] ?? [10, 10, 10, 10])[ecIdx];

  const totalCapacities = [26,44,70,100,134,172,196,242,292,352,408,468,552,588,644,700,750,808,870,938,1006,1094,1174,1276,1370,1468,1531,1631,1735,1843,1955,2071,2191,2306,2434,2566,2702,2812,2956,2956];
  const totalCodewords = totalCapacities[version - 1] || 2956;

  const dataBytes = Math.floor(totalCodewords * 8 / 8);

  const data = new Uint8Array(dataBytes + 2);
  if (version <= 9) {
    data[0] = 0x40 | bytes.length;
  } else {
    data[0] = 0x40 | (bytes.length >> 8);
    data[1] = bytes.length & 0xff;
  }
  const offset = version <= 9 ? 1 : 2;
  for (let i = 0; i < Math.min(bytes.length, dataBytes - offset); i++) {
    data[offset + i] = bytes[i];
  }

  const remaining = dataBytes - offset - bytes.length;
  if (remaining >= 2) {
    data[offset + bytes.length] = 0xec;
    if (remaining > 1) data[offset + bytes.length + 1] = 0x11;
  }

  const rawData = data.slice(0, dataBytes);

  const numBlocks = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1][version - 1] || 1;
  const blockSize = Math.floor(dataBytes / numBlocks);
  const longBlocks = dataBytes % numBlocks;
  const ecPer = ecPerBlock;

  const allCodewords: number[] = [];
  let dataIdx = 0;
  const blocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];

  for (let b = 0; b < numBlocks; b++) {
    const sz = blockSize + (b >= numBlocks - longBlocks ? 1 : 0);
    const block = rawData.slice(dataIdx, dataIdx + sz);
    dataIdx += sz;
    blocks.push(block);
    ecBlocks.push(reedSolomon(ecPer, block));
  }

  for (let i = 0; i < blockSize + 1; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < blocks[b].length) allCodewords.push(blocks[b][i]);
    }
  }
  for (let i = 0; i < ecPer; i++) {
    for (let b = 0; b < numBlocks; b++) {
      allCodewords.push(ecBlocks[b][i]);
    }
  }

  const bits: number[] = [];
  for (const byte of allCodewords) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }

  const dataPositions: [number, number][] = [];
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5;
    for (let upward = 0; upward < 2; upward++) {
      for (let i = 0; i < size; i++) {
        const row = upward === 0 ? size - 1 - i : i;
        if (row < 0 || row >= size) continue;
        const rRow = reserved[row];
        if (!rRow) continue;
        if (rRow[col]) continue;
        dataPositions.push([row, col]);
        if (col > 0 && !rRow[col - 1]) {
          dataPositions.push([row, col - 1]);
        }
      }
    }
  }

  const seen = new Set<string>();
  const uniquePos: [number, number][] = [];
  for (const [r, c] of dataPositions) {
    const key = `${r},${c}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePos.push([r, c]);
    }
  }

  for (let i = 0; i < Math.min(bits.length, uniquePos.length); i++) {
    const pos = uniquePos[i];
    if (!pos) continue;
    const [r, c] = pos;
    modules[r]![c] = bits[i] === 1;
  }

  let mask = 0;
  let bestScore = Infinity;
  for (let m = 0; m < 8; m++) {
    let penalty = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (reserved[r][c]) continue;
        let flip = false;
        switch (m) {
          case 0: flip = (r + c) % 2 === 0; break;
          case 1: flip = r % 2 === 0; break;
          case 2: flip = c % 3 === 0; break;
          case 3: flip = (r + c) % 3 === 0; break;
          case 4: flip = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
          case 5: flip = (r * c) % 2 + (r * c) % 3 === 0; break;
          case 6: flip = ((r * c) % 2 + (r * c) % 3) % 2 === 0; break;
          case 7: flip = ((r + c) % 2 + (r * c) % 3) % 2 === 0; break;
        }
        if (flip) penalty++;
      }
    }
    if (penalty < bestScore) { bestScore = penalty; mask = m; }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue;
      let flip = false;
      switch (mask) {
        case 0: flip = (r + c) % 2 === 0; break;
        case 1: flip = r % 2 === 0; break;
        case 2: flip = c % 3 === 0; break;
        case 3: flip = (r + c) % 3 === 0; break;
        case 4: flip = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
        case 5: flip = (r * c) % 2 + (r * c) % 3 === 0; break;
        case 6: flip = ((r * c) % 2 + (r * c) % 3) % 2 === 0; break;
        case 7: flip = ((r + c) % 2 + (r * c) % 3) % 2 === 0; break;
      }
      if (flip) modules[r][c] = !modules[r][c];
    }
  }

  const formatBits = (ecIdx << 3) | mask;
  let format = formatBits;
  for (let i = 0; i < 10; i++) format = (format << 1) ^ ((format >> 9) * 0x537);
  format ^= 0x5412;
  format = (format << 10) | formatBits;
  format &= 0x7fff;
  const finalFormat = format ^ 0x5412;

  const m8 = modules[8];
  for (let i = 0; i < 15; i++) {
    const bit = (finalFormat >> i) & 1;
    if (i < 8) {
      if (m8) m8[size - 1 - i] = bit === 1;
      if (modules[i]) modules[i]![8] = bit === 1;
    } else {
      if (modules[size - 15 + i]) modules[size - 15 + i]![8] = bit === 1;
      if (m8) m8[14 - i] = bit === 1;
    }
  }

  if (m8) m8[8] = true;
  if (modules[size - 8]) modules[size - 8]![8] = true;

  return modules;
}

function renderSVG(modules: boolean[][], size: number, fg: string, bg: string, margin: number = 4): string {
  const count = modules.length;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count + margin * 2} ${count + margin * 2}" width="${size}" height="${size}">`;
  svg += `<rect width="${count + margin * 2}" height="${count + margin * 2}" fill="${bg}"/>`;
  for (let r = 0; r < count; r++) {
    const row = modules[r];
    if (!row) continue;
    for (let c = 0; c < count; c++) {
      if (row[c]) {
        svg += `<rect x="${c + margin}" y="${r + margin}" width="1" height="1" fill="${fg}"/>`;
      }
    }
  }
  svg += "</svg>";
  return svg;
}

export { type ECLevel, EC_LEVELS, encodeQR, renderSVG };
