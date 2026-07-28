import type { ECLevel } from "./types";

interface VersionInfo {
  version: number;
  totalCodewords: number;
  ecCodewordsPerBlock: number[];
  blocksInGroup1: number[];
  dataCodewordsPerBlock1: number[];
  blocksInGroup2: number[];
  dataCodewordsPerBlock2: number[];
}

const VERSION_TABLE: VersionInfo[] = [
  { version: 1, totalCodewords: 26, ecCodewordsPerBlock: [10, 16, 13, 7], blocksInGroup1: [1, 1, 1, 1], dataCodewordsPerBlock1: [16, 7, 10, 13], blocksInGroup2: [0, 0, 0, 0], dataCodewordsPerBlock2: [0, 0, 0, 0] },
  { version: 2, totalCodewords: 44, ecCodewordsPerBlock: [16, 28, 22, 14], blocksInGroup1: [1, 1, 1, 1], dataCodewordsPerBlock1: [28, 10, 14, 10], blocksInGroup2: [0, 0, 0, 0], dataCodewordsPerBlock2: [0, 0, 0, 0] },
  { version: 3, totalCodewords: 70, ecCodewordsPerBlock: [26, 22, 18, 26], blocksInGroup1: [1, 1, 2, 2], dataCodewordsPerBlock1: [44, 16, 22, 18], blocksInGroup2: [0, 0, 0, 0], dataCodewordsPerBlock2: [0, 0, 0, 0] },
  { version: 4, totalCodewords: 100, ecCodewordsPerBlock: [18, 16, 26, 20], blocksInGroup1: [2, 1, 2, 4], dataCodewordsPerBlock1: [32, 28, 18, 10], blocksInGroup2: [0, 0, 0, 0], dataCodewordsPerBlock2: [0, 0, 0, 0] },
  { version: 5, totalCodewords: 134, ecCodewordsPerBlock: [24, 22, 20, 16], blocksInGroup1: [2, 1, 4, 4], dataCodewordsPerBlock1: [43, 31, 15, 19], blocksInGroup2: [0, 0, 1, 1], dataCodewordsPerBlock2: [0, 0, 16, 6] },
  { version: 6, totalCodewords: 172, ecCodewordsPerBlock: [16, 28, 26, 22], blocksInGroup1: [4, 2, 4, 8], dataCodewordsPerBlock1: [27, 23, 15, 17], blocksInGroup2: [0, 1, 2, 1], dataCodewordsPerBlock2: [0, 19, 16, 19] },
  { version: 7, totalCodewords: 196, ecCodewordsPerBlock: [18, 26, 24, 26], blocksInGroup1: [4, 4, 6, 8], dataCodewordsPerBlock1: [31, 25, 17, 19], blocksInGroup2: [0, 1, 2, 1], dataCodewordsPerBlock2: [0, 19, 23, 15] },
  { version: 8, totalCodewords: 242, ecCodewordsPerBlock: [22, 24, 20, 24], blocksInGroup1: [2, 4, 6, 10], dataCodewordsPerBlock1: [38, 27, 19, 21], blocksInGroup2: [2, 0, 4, 2], dataCodewordsPerBlock2: [14, 34, 25, 19] },
  { version: 9, totalCodewords: 292, ecCodewordsPerBlock: [22, 28, 24, 22], blocksInGroup1: [3, 6, 8, 8], dataCodewordsPerBlock1: [36, 25, 21, 23], blocksInGroup2: [2, 2, 4, 4], dataCodewordsPerBlock2: [14, 26, 19, 27] },
  { version: 10, totalCodewords: 346, ecCodewordsPerBlock: [26, 24, 20, 28], blocksInGroup1: [4, 6, 8, 10], dataCodewordsPerBlock1: [43, 27, 21, 23], blocksInGroup2: [1, 4, 6, 4], dataCodewordsPerBlock2: [14, 28, 27, 25] },
];

export const MAX_VERSION = 10;

export function getECIndex(level: ECLevel): number {
  const map: Record<ECLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
  return map[level]!;
}

export function getVersionInfo(version: number, _ecLevel: ECLevel): VersionInfo {
  const info = VERSION_TABLE[version - 1];
  if (!info) throw new Error(`Version ${version} not supported (max ${MAX_VERSION})`);
  return info;
}

export function getDataCapacity(version: number, ecLevel: ECLevel): number {
  const info = getVersionInfo(version, ecLevel);
  const ecIdx = getECIndex(ecLevel);
  const totalData = info.blocksInGroup1[ecIdx]! * info.dataCodewordsPerBlock1[ecIdx]! +
    info.blocksInGroup2[ecIdx]! * info.dataCodewordsPerBlock2[ecIdx]!;
  return totalData;
}

export function getECCount(version: number, ecLevel: ECLevel): number {
  const info = getVersionInfo(version, ecLevel);
  const ecIdx = getECIndex(ecLevel);
  return info.ecCodewordsPerBlock[ecIdx]!;
}

export function getBlockInfo(version: number, ecLevel: ECLevel): {
  totalBlocks: number;
  ecPerBlock: number;
  dataPerBlock1: number;
  dataPerBlock2: number;
  blocks1: number;
  blocks2: number;
} {
  const info = getVersionInfo(version, ecLevel);
  const ecIdx = getECIndex(ecLevel);
  return {
    totalBlocks: info.blocksInGroup1[ecIdx]! + info.blocksInGroup2[ecIdx]!,
    ecPerBlock: info.ecCodewordsPerBlock[ecIdx]!,
    dataPerBlock1: info.dataCodewordsPerBlock1[ecIdx]!,
    dataPerBlock2: info.dataCodewordsPerBlock2[ecIdx]!,
    blocks1: info.blocksInGroup1[ecIdx]!,
    blocks2: info.blocksInGroup2[ecIdx]!,
  };
}

export function getTotalCodewords(version: number): number {
  return VERSION_TABLE[version - 1]!.totalCodewords;
}
