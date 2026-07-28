import * as crypto from "crypto";
import type { HashAlgorithm } from "../types/storage.types";

export function computeHash(
  data: Buffer,
  algorithm: HashAlgorithm = "sha256"
): string {
  return crypto.createHash(algorithm).update(data).digest("hex");
}

export function computeFileHash(
  filePath: string,
  algorithm: HashAlgorithm = "sha256"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fs = require("fs");
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data: Buffer) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err: Error) => reject(err));
  });
}

export function computeStreamHash(
  stream: NodeJS.ReadableStream,
  algorithm: HashAlgorithm = "sha256"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);

    stream.on("data", (data: Buffer) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err: Error) => reject(err));
  });
}

export function verifyHash(
  data: Buffer,
  expectedHash: string,
  algorithm: HashAlgorithm = "sha256"
): boolean {
  const computed = computeHash(data, algorithm);
  return computed === expectedHash;
}

export function computeHashes(data: Buffer, algorithms: HashAlgorithm[]): Record<HashAlgorithm, string> {
  const results = {} as Record<HashAlgorithm, string>;
  for (const algo of algorithms) {
    results[algo] = computeHash(data, algo);
  }
  return results;
}

export function createChecksum(data: Buffer): string {
  return computeHash(data, "md5");
}

export function verifyChecksum(data: Buffer, checksum: string): boolean {
  return createChecksum(data) === checksum;
}

export function hashToFilename(hash: string, extension: string): string {
  return `${hash}${extension}`;
}

export function generateIntegrityToken(data: Buffer): string {
  const hash = computeHash(data, "sha256");
  const timestamp = Date.now().toString(36);
  return `${hash.substring(0, 16)}.${timestamp}`;
}
