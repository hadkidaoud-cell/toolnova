import type { HashAlgorithm } from "./storage.types";

export interface ValidationRule {
  type: ValidationRuleType;
  params: Record<string, unknown>;
  message: string;
  severity: "error" | "warning";
}

export type ValidationRuleType =
  | "max-size"
  | "min-size"
  | "mime-allow"
  | "mime-block"
  | "ext-allow"
  | "ext-block"
  | "hash-match"
  | "name-length"
  | "name-pattern"
  | "custom";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  rule: string;
  type: ValidationRuleType;
  message: string;
  value?: unknown;
  expected?: unknown;
}

export interface ValidationWarning {
  rule: string;
  type: ValidationRuleType;
  message: string;
  value?: unknown;
  expected?: unknown;
}

export interface FileValidationInput {
  filename: string;
  mimeType: string;
  size: number;
  extension: string;
  hash?: string;
  hashAlgorithm?: HashAlgorithm;
  buffer?: Buffer;
}

export interface MimeValidationResult {
  valid: boolean;
  detectedMime: string;
  extension: string;
  reason?: string;
}

export interface HashValidationResult {
  valid: boolean;
  computed: string;
  expected: string;
  algorithm: HashAlgorithm;
}

export const COMMON_MIME_TYPES: Record<string, string[]> = {
  image: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp", "image/svg+xml"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ],
  archive: ["application/zip", "application/x-tar", "application/gzip", "application/x-7z-compressed"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  code: ["text/javascript", "text/typescript", "text/html", "text/css", "application/json"],
};

export const EXTENSION_MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".json": "application/json",
  ".xml": "application/xml",
  ".zip": "application/zip",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".7z": "application/x-7z-compressed",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".ts": "text/typescript",
  ".py": "text/x-python",
  ".rb": "text/x-ruby",
  ".go": "text/x-go",
  ".rs": "text/x-rust",
  ".java": "text/x-java",
  ".c": "text/x-c",
  ".cpp": "text/x-c++",
  ".h": "text/x-c",
};
