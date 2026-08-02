import type { ECLevel, QRMatrix } from "./types";
import { EC_LEVELS } from "./types";
import { generateECBytes } from "./gf256";
import { getDataCapacity, getBlockInfo } from "./version-table";

const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

function getEncodingMode(text: string): "numeric" | "alphanumeric" | "byte" {
  if (/^[0-9]+$/.test(text)) return "numeric";
  if (text.split("").every((c) => ALPHANUMERIC_CHARS.includes(c))) return "alphanumeric";
  return "byte";
}

function getCharCountIndicatorLength(version: number, mode: string): number {
  if (version <= 9) {
    if (mode === "numeric") return 10;
    if (mode === "alphanumeric") return 9;
    return 8;
  }
  if (mode === "numeric") return 12;
  if (mode === "alphanumeric") return 11;
  return 16;
}

function getModeIndicator(mode: string): number {
  if (mode === "numeric") return 0b0001;
  if (mode === "alphanumeric") return 0b0010;
  return 0b0100;
}

function encodeNumeric(text: string): number[] {
  const bits: number[] = [];
  for (let i = 0; i < text.length; i += 3) {
    const chunk = text.substring(i, Math.min(i + 3, text.length));
    const num = parseInt(chunk, 10);
    const bitsLen = chunk.length === 3 ? 10 : chunk.length === 2 ? 7 : 4;
    for (let b = bitsLen - 1; b >= 0; b--) {
      bits.push((num >> b) & 1);
    }
  }
  return bits;
}

function encodeAlphanumeric(text: string): number[] {
  const bits: number[] = [];
  for (let i = 0; i < text.length; i += 2) {
    if (i + 1 < text.length) {
      const val = ALPHANUMERIC_CHARS.indexOf(text[i]!) * 45 + ALPHANUMERIC_CHARS.indexOf(text[i + 1]!);
      for (let b = 10; b >= 0; b--) bits.push((val >> b) & 1);
    } else {
      const val = ALPHANUMERIC_CHARS.indexOf(text[i]!);
      for (let b = 5; b >= 0; b--) bits.push((val >> b) & 1);
    }
  }
  return bits;
}

function encodeByte(text: string): number[] {
  const bits: number[] = [];
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  for (const byte of bytes) {
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1);
  }
  return bits;
}

function findMinVersion(dataBits: number, ecLevel: ECLevel): number {
  for (let v = 1; v <= 10; v++) {
    const capacity = getDataCapacity(v, ecLevel) * 8;
    if (dataBits <= capacity) return v;
  }
  throw new Error("Data too long for QR code (max version 10)");
}

function addTerminator(bits: number[], version: number, ecLevel: ECLevel): void {
  const capacity = getDataCapacity(version, ecLevel) * 8;
  const terminatorLen = Math.min(4, capacity - bits.length);
  for (let i = 0; i < terminatorLen; i++) bits.push(0);
}

function padToByteBoundary(bits: number[]): void {
  while (bits.length % 8 !== 0) bits.push(0);
}

function addPadding(bytes: number[], totalBytes: number): void {
  let i = 0;
  while (bytes.length < totalBytes) {
    bytes.push(i % 2 === 0 ? 0xec : 0x11);
    i++;
  }
}

function bitsToBytes(bits: number[]): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | (bits[i + b] ?? 0);
    }
    bytes.push(byte);
  }
  return bytes;
}

function interleaveBlocks(blocks: number[][], ecPerBlock: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const dataLen = block.length - ecPerBlock[i]!;
    for (let j = 0; j < dataLen; j++) {
      result.push(block[j]!);
    }
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const dataLen = block.length - ecPerBlock[i]!;
    for (let j = dataLen; j < block.length; j++) {
      result.push(block[j]!);
    }
  }

  return result;
}

function createMatrix(version: number): QRMatrix {
  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  return { size, modules, isFunction };
}

function placeFunctionPatterns(matrix: QRMatrix, version: number): void {
  const size = matrix.size;

  function setModule(row: number, col: number, dark: boolean): void {
    if (row >= 0 && row < size && col >= 0 && col < size) {
      matrix.modules[row]![col] = dark;
      matrix.isFunction[row]![col] = true;
    }
  }

  for (let i = 0; i < 8; i++) {
    const pos = [i, size - 1 - i];
    for (const p of pos) {
      setModule(7, p, i !== 1 && i !== 5 && i !== 6);
      setModule(p, 7, i !== 1 && i !== 5 && i !== 6);
    }
  }

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const inFinder = row < 8 && col < 8;
      const inSeparator = (row === 7 || col === 7);
      if (inFinder || inSeparator) {
        const dark = inFinder && !(
          (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
          (row === 1 || row === 5 || (row === 0 && (col === 2 || col === 4 || col === 6))) ||
          (col === 1 || col === 5 || (col === 0 && (row === 2 || row === 4 || row === 6)))
        );
        setModule(row, col, dark);
        setModule(row, size - 1 - col, dark);
        setModule(size - 1 - row, col, dark);
      }
    }
  }

  for (let i = 0; i < 7; i++) {
    const dark = i === 0 || i === 6;
    setModule(8, i, dark);
    setModule(i, 8, dark);
    setModule(size - 1 - i, 8, dark);
    setModule(8, size - 1 - i, dark);
  }

  setModule(8, 8, false);
  setModule(size - 8, 8, true);
  setModule(8, size - 8, true);

  for (let i = 0; i < version * 4 + 1; i++) {
    const row = 6;
    const col = i;
    if (!matrix.isFunction[row]![col]) {
      setModule(row, col, i % 2 === 0);
    }
    const r2 = i;
    const c2 = 6;
    if (!matrix.isFunction[r2]![c2]) {
      setModule(r2, c2, i % 2 === 0);
    }
  }

  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        setModule(size - 11 + j, i, i !== 5);
        setModule(i, size - 11 + j, i !== 5);
      }
    }
  }
}

function placeData(matrix: QRMatrix, data: number[]): void {
  const size = matrix.size;
  let bitIndex = 0;
  const totalBits = data.length * 8;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((right + 1) & 2) === 0;
        const row = upward ? size - 1 - vert : vert;

        if (!matrix.isFunction[row]![col] && bitIndex < totalBits) {
          const byteIdx = Math.floor(bitIndex / 8);
          const bitShift = 7 - (bitIndex % 8);
          matrix.modules[row]![col] = ((data[byteIdx]! >> bitShift) & 1) === 1;
          bitIndex++;
        }
      }
    }
  }
}

function applyMask(matrix: QRMatrix, maskPattern: number): void {
  const size = matrix.size;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (matrix.isFunction[row]![col]) continue;
      let invert = false;
      switch (maskPattern) {
        case 0: invert = (row + col) % 2 === 0; break;
        case 1: invert = row % 2 === 0; break;
        case 2: invert = col % 3 === 0; break;
        case 3: invert = (row + col) % 3 === 0; break;
        case 4: invert = (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0; break;
        case 5: invert = ((row * col) % 2 + (row * col) % 3) === 0; break;
        case 6: invert = ((row * col) % 2 + (row * col) % 3) % 2 === 0; break;
        case 7: invert = ((row + col) % 2 + (row * col) % 3) % 2 === 0; break;
      }
      if (invert) matrix.modules[row]![col] = !matrix.modules[row]![col];
    }
  }
}

function calculatePenalty(matrix: QRMatrix): number {
  const size = matrix.size;
  let penalty = 0;

  for (let row = 0; row < size; row++) {
    let count = 1;
    for (let col = 1; col < size; col++) {
      if (matrix.modules[row]![col] === matrix.modules[row]![col - 1]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty += 1;
      } else {
        count = 1;
      }
    }
  }

  for (let col = 0; col < size; col++) {
    let count = 1;
    for (let row = 1; row < size; row++) {
      if (matrix.modules[row]![col] === matrix.modules[row - 1]![col]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty += 1;
      } else {
        count = 1;
      }
    }
  }

  return penalty;
}

function selectBestMask(matrix: QRMatrix, ecLevel: ECLevel, data: number[]): number {
  let bestMask = 0;
  let bestPenalty = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const testMatrix: QRMatrix = {
      size: matrix.size,
      modules: matrix.modules.map((row) => [...row]),
      isFunction: matrix.isFunction.map((row) => [...row]),
    };
    placeData(testMatrix, data);
    applyMask(testMatrix, mask);
    placeFormatBits(testMatrix, ecLevel, mask);
    const penalty = calculatePenalty(testMatrix);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
  }

  return bestMask;
}

function placeFormatBits(matrix: QRMatrix, ecLevel: ECLevel, maskPattern: number): void {
  const size = matrix.size;
  const ecIdx = EC_LEVELS[ecLevel]!;
  const formatInfo = (ecIdx << 3) | maskPattern;
  let rem = formatInfo;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >> 9) * 0x537);
  }
  const bits = ((formatInfo << 10) | rem) ^ 0x5412;

  for (let i = 0; i < 6; i++) {
    matrix.modules[8]![i] = ((bits >> (14 - i)) & 1) === 1;
    matrix.isFunction[8]![i] = true;
  }
  matrix.modules[8]![7] = ((bits >> 8) & 1) === 1;
  matrix.isFunction[8]![7] = true;
  matrix.modules[8]![8] = ((bits >> 9) & 1) === 1;
  matrix.isFunction[8]![8] = true;
  matrix.modules[7]![8] = ((bits >> 10) & 1) === 1;
  matrix.isFunction[7]![8] = true;

  for (let i = 0; i < 7; i++) {
    matrix.modules[5 - i]![8] = ((bits >> i) & 1) === 1;
    matrix.isFunction[5 - i]![8] = true;
  }

  for (let i = 0; i < 8; i++) {
    matrix.modules[size - 1 - i]![8] = ((bits >> (14 - i)) & 1) === 1;
    matrix.isFunction[size - 1 - i]![8] = true;
  }

  for (let i = 0; i < 7; i++) {
    matrix.modules[8]![size - 15 + i] = ((bits >> i) & 1) === 1;
    matrix.isFunction[8]![size - 15 + i] = true;
  }
}

function placeVersionBits(matrix: QRMatrix, version: number): void {
  if (version < 7) return;
  const size = matrix.size;
  let rem = version;
  for (let i = 0; i < 12; i++) {
    rem = (rem << 1) ^ ((rem >> 11) * 0x1f25);
  }
  const bits = (version << 12) | rem;

  for (let i = 0; i < 18; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const bit = ((bits >> i) & 1) === 1;
    matrix.modules[row]![size - 11 + col] = bit;
    matrix.isFunction[row]![size - 11 + col] = true;
    matrix.modules[size - 11 + col]![row] = bit;
    matrix.isFunction[size - 11 + col]![row] = true;
  }
}

export function encode(text: string, ecLevel: ECLevel): QRMatrix {
  const mode = getEncodingMode(text);

  let dataBits: number[] = [];
  dataBits.push(getModeIndicator(mode), 0, 0, 0);

  const charCountLen = getCharCountIndicatorLength(1, mode);
  const tempBits: number[] = [];

  if (mode === "numeric") {
    for (let b = charCountLen - 1; b >= 0; b--) tempBits.push((text.length >> b) & 1);
    tempBits.push(...encodeNumeric(text));
  } else if (mode === "alphanumeric") {
    for (let b = charCountLen - 1; b >= 0; b--) tempBits.push((text.length >> b) & 1);
    tempBits.push(...encodeAlphanumeric(text));
  } else {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    for (let b = charCountLen - 1; b >= 0; b--) tempBits.push((bytes.length >> b) & 1);
    tempBits.push(...encodeByte(text));
  }

  dataBits.push(...tempBits);

  const version = findMinVersion(dataBits.length + 4, ecLevel);
  const charCountLenFinal = getCharCountIndicatorLength(version, mode);

  dataBits = [];
  dataBits.push(getModeIndicator(mode), 0, 0, 0);
  for (let b = charCountLenFinal - 1; b >= 0; b--) {
    if (mode === "numeric") {
      dataBits.push((text.length >> b) & 1);
    } else if (mode === "alphanumeric") {
      dataBits.push((text.length >> b) & 1);
    } else {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      dataBits.push((bytes.length >> b) & 1);
    }
  }

  if (mode === "numeric") {
    dataBits.push(...encodeNumeric(text));
  } else if (mode === "alphanumeric") {
    dataBits.push(...encodeAlphanumeric(text));
  } else {
    dataBits.push(...encodeByte(text));
  }

  addTerminator(dataBits, version, ecLevel);
  padToByteBoundary(dataBits);

  const dataBytes = bitsToBytes(dataBits);
  const totalDataBytes = getDataCapacity(version, ecLevel);
  addPadding(dataBytes, totalDataBytes);

  const blockInfo = getBlockInfo(version, ecLevel);
  const blocks: number[][] = [];
  const ecCounts: number[] = [];
  let offset = 0;

  for (let i = 0; i < blockInfo.blocks1; i++) {
    const blockData = dataBytes.slice(offset, offset + blockInfo.dataPerBlock1);
    offset += blockInfo.dataPerBlock1;
    const ec = generateECBytes(blockData, blockInfo.ecPerBlock);
    blocks.push([...blockData, ...ec]);
    ecCounts.push(blockInfo.ecPerBlock);
  }

  for (let i = 0; i < blockInfo.blocks2; i++) {
    const blockData = dataBytes.slice(offset, offset + blockInfo.dataPerBlock2);
    offset += blockInfo.dataPerBlock2;
    const ec = generateECBytes(blockData, blockInfo.ecPerBlock);
    blocks.push([...blockData, ...ec]);
    ecCounts.push(blockInfo.ecPerBlock);
  }

  const interleaved = interleaveBlocks(blocks, ecCounts);

  const matrix = createMatrix(version);
  placeFunctionPatterns(matrix, version);
  placeVersionBits(matrix, version);

  const maskPattern = selectBestMask(matrix, ecLevel, interleaved);
  placeData(matrix, interleaved);
  applyMask(matrix, maskPattern);
  placeFormatBits(matrix, ecLevel, maskPattern);

  return matrix;
}
