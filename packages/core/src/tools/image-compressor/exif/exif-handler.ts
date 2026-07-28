import type { ExifData } from "../types";

export function extractExifFromJpeg(buffer: Buffer): ExifData | null {
  if (buffer.length < 4) return null;
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  const exifStart = findExifBlock(buffer);
  if (!exifStart) return null;

  const raw = buffer.slice(exifStart.offset, exifStart.offset + exifStart.length);

  const data: ExifData = { raw: new Uint8Array(raw) };

  try {
    const view = new DataView(raw.buffer as ArrayBuffer, raw.byteOffset, raw.byteLength);
    const byteOrder = view.getUint16(0);
    const bigEndian = byteOrder === 0x4d4d;

    if (raw.length < 8) return data;

    const ifdOffset = view.getUint32(4, bigEndian);
    parseIFD(view, ifdOffset, bigEndian, data);
  } catch {
    // malformed EXIF — return raw
  }

  return data;
}

function findExifBlock(buffer: Buffer): { offset: number; length: number } | null {
  let offset = 2;

  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === undefined) break;

    if (marker === 0xe1) {
      const length = buffer.readUInt16BE(offset + 2);
      const header = buffer.toString("ascii", offset + 4, offset + 8);
      if (header === "Exif") {
        return { offset: offset + 4, length: length - 2 };
      }
    }

    if (marker === 0xda) break;

    if (marker === 0xd9) break;

    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    } else if (marker === 0xff) {
      offset++;
    } else {
      offset += 2;
    }
  }

  return null;
}

function parseIFD(
  view: DataView,
  offset: number,
  bigEndian: boolean,
  data: ExifData
): void {
  if (offset + 2 > view.byteLength) return;

  const entries = view.getUint16(offset, bigEndian);

  for (let i = 0; i < entries; i++) {
    const entryOffset = offset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, bigEndian);
    const type = view.getUint16(entryOffset + 2, bigEndian);
    const count = view.getUint32(entryOffset + 4, bigEndian);

    const valueOffset = entryOffset + 8;
    const totalBytes = typeSize(type) * count;

    let strOffset = valueOffset;
    if (totalBytes > 4) {
      strOffset = view.getUint32(valueOffset, bigEndian);
    }

    switch (tag) {
      case 0x010f: data.make = readString(view, strOffset, count, bigEndian); break;
      case 0x0110: data.model = readString(view, strOffset, count, bigEndian); break;
      case 0x0131: data.software = readString(view, strOffset, count, bigEndian); break;
      case 0x0132: data.dateTime = readString(view, strOffset, count, bigEndian); break;
      case 0x9003: data.dateTimeOriginal = readString(view, strOffset, count, bigEndian); break;
      case 0x829a: data.exposureTime = readRational(view, strOffset, bigEndian); break;
      case 0x829d: data.fNumber = readRational(view, strOffset, bigEndian); break;
      case 0x8827: data.iso = view.getUint16(strOffset, bigEndian); break;
      case 0xa405: data.focalLength = readRational(view, strOffset, bigEndian); break;
      case 0xa433: data.whiteBalance = readString(view, strOffset, count, bigEndian); break;
      case 0x0112: data.orientation = view.getUint16(strOffset, bigEndian); break;
      case 0x8298: data.copyright = readString(view, strOffset, count, bigEndian); break;
      case 0x013b: data.artist = readString(view, strOffset, count, bigEndian); break;
    }
  }
}

function typeSize(type: number): number {
  switch (type) {
    case 1: return 1;
    case 2: return 1;
    case 3: return 2;
    case 4: return 4;
    case 5: return 8;
    case 7: return 1;
    case 9: return 4;
    case 10: return 8;
    default: return 1;
  }
}

function readString(view: DataView, offset: number, count: number, _bigEndian: boolean): string {
  const bytes: number[] = [];
  for (let i = 0; i < count - 1 && offset + i < view.byteLength; i++) {
    const byte = view.getUint8(offset + i);
    if (byte === 0) break;
    bytes.push(byte);
  }
  return String.fromCharCode(...bytes);
}

function readRational(view: DataView, offset: number, bigEndian: boolean): string {
  if (offset + 8 > view.byteLength) return "0";
  const num = view.getUint32(offset, bigEndian);
  const den = view.getUint32(offset + 4, bigEndian);
  if (den === 0) return String(num);
  return `${num}/${den}`;
}

export function buildExifBuffer(data: ExifData): Buffer | null {
  if (!data.raw || data.raw.length === 0) return null;
  return Buffer.from(data.raw);
}

export function stripExif(buffer: Buffer): Buffer {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return buffer;

  const segments: Buffer[] = [Buffer.from([0xff, 0xd8])];
  let offset = 2;

  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) { offset++; continue; }

    const marker = buffer[offset + 1];
    if (marker === undefined) break;

    if (marker === 0xe1) {
      offset += 2 + buffer.readUInt16BE(offset + 2);
      continue;
    }

    if (marker === 0xda || marker === 0xd9) {
      break;
    }

    if (marker === 0xff) {
      offset++;
      continue;
    }

    const length = buffer.readUInt16BE(offset + 2);
    segments.push(buffer.slice(offset, offset + 2 + length));
    offset += 2 + length;
  }

  if (offset < buffer.length) {
    segments.push(buffer.slice(offset));
  }

  return Buffer.concat(segments);
}

export function copyExifToOutput(
  originalBuffer: Buffer,
  outputBuffer: Buffer,
  maintainExif: boolean
): Buffer {
  if (!maintainExif) return outputBuffer;
  if (!isJpeg(originalBuffer)) return outputBuffer;

  const exif = extractExifFromJpeg(originalBuffer);
  if (!exif || !exif.raw) return outputBuffer;

  const exifBlock = buildExifBuffer(exif);
  if (!exifBlock) return outputBuffer;

  if (!isJpeg(outputBuffer)) return outputBuffer;

  const header = outputBuffer.slice(0, 2);
  const rest = outputBuffer.slice(2);

  const exifSegment = Buffer.alloc(4 + 2 + exifBlock.length);
  exifSegment[0] = 0xff;
  exifSegment[1] = 0xe1;
  exifSegment.writeUInt16BE(exifBlock.length + 2, 2);
  exifSegment.write("Exif\x00\x00", 4);
  exifBlock.copy(exifSegment, 8);

  return Buffer.concat([header, exifSegment, rest]);
}

function isJpeg(buffer: Buffer): boolean {
  return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
}
