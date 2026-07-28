import { EXTENSION_MIME_MAP } from "../types/validation.types";

export function generateFileId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return `file-${ts}-${rand}`;
}

export function generateTempFileId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `tmp-${ts}-${rand}`;
}

export function generateUniqueFilename(
  originalName: string,
  options: {
    preserveOriginal?: boolean;
    maxLength?: number;
    prefix?: string;
    suffix?: string;
  } = {}
): string {
  const { preserveOriginal = false, maxLength = 255, prefix = "", suffix = "" } = options;

  if (preserveOriginal) {
    return sanitizeFilename(originalName, maxLength);
  }

  const ext = getExtension(originalName);
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  const base = prefix ? `${prefix}-${ts}-${rand}` : `${ts}-${rand}`;

  let name = `${base}${suffix}${ext}`;
  if (name.length > maxLength) {
    name = name.substring(0, maxLength - ext.length) + ext;
  }

  return name;
}

export function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === 0) return "";
  return filename.substring(lastDot).toLowerCase();
}

export function getMimeTypeFromExtension(ext: string): string | null {
  return EXTENSION_MIME_MAP[ext.toLowerCase()] ?? null;
}

export function sanitizeFilename(filename: string, maxLength: number = 255): string {
  let sanitized = filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^[.\s]+/, "")
    .replace(/[.\s]+$/, "")
    .replace(/\s+/g, "_");

  if (sanitized.length === 0) {
    sanitized = `file-${Date.now().toString(36)}`;
  }

  if (sanitized.length > maxLength) {
    const ext = getExtension(sanitized);
    const baseName = sanitized.substring(0, sanitized.length - ext.length);
    sanitized = baseName.substring(0, maxLength - ext.length) + ext;
  }

  return sanitized;
}

export function normalizePath(path: string): string {
  return path
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

export function joinPath(...parts: string[]): string {
  return parts.map(normalizePath).join("/");
}

export function getDirectoryFromPath(path: string): string {
  const normalized = normalizePath(path);
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash === -1) return "";
  return normalized.substring(0, lastSlash);
}

export function isPathSecure(path: string, allowedRoots: string[]): boolean {
  const normalized = normalizePath(path);
  const resolved = normalizePath(`root/${normalized}`);

  for (const root of allowedRoots) {
    if (resolved.startsWith(normalizePath(root))) {
      return true;
    }
  }
  return false;
}

export function hasPathTraversal(path: string): boolean {
  const normalized = normalizePath(path);
  return normalized.includes("..") || normalized.startsWith("/");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(3)} GB`;
}

export function parseFileSize(sizeStr: string): number {
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };

  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) throw new Error(`Invalid size string: ${sizeStr}`);

  const value = parseFloat(match[1]!);
  const unit = match[2]!.toUpperCase();
  return Math.round(value * (units[unit] ?? 1));
}
