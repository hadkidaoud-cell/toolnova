import type { HashAlgorithm } from "./storage.types";

export interface StorageConfig {
  backend: import("./storage.types").StorageBackend;
  rootDirectory: string;
  tempDirectory: string;
  maxFileSize: number;
  maxTotalStorage: number;
  allowedMimeTypes: string[];
  blockedMimeTypes: string[];
  hashAlgorithm: HashAlgorithm;
  requireHashValidation: boolean;
  defaultExpirationMs: number;
  tempExpirationMs: number;
  cleanupIntervalMs: number;
  enableVirusScan: boolean;
  enableDeduplication: boolean;
  allowedExtensions: string[];
  blockedExtensions: string[];
  generateUniqueNames: boolean;
  preserveOriginalNames: boolean;
  maxNameLength: number;
  concurrency: number;
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  backend: "filesystem",
  rootDirectory: "./storage",
  tempDirectory: "./storage/temp",
  maxFileSize: 50 * 1024 * 1024,
  maxTotalStorage: 5 * 1024 * 1024 * 1024,
  allowedMimeTypes: [],
  blockedMimeTypes: [
    "application/x-executable",
    "application/x-msdownload",
    "application/x-sh",
    "text/html",
  ],
  hashAlgorithm: "sha256",
  requireHashValidation: true,
  defaultExpirationMs: 24 * 60 * 60 * 1000,
  tempExpirationMs: 60 * 60 * 1000,
  cleanupIntervalMs: 5 * 60 * 1000,
  enableVirusScan: false,
  enableDeduplication: true,
  allowedExtensions: [],
  blockedExtensions: [".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".msi"],
  generateUniqueNames: true,
  preserveOriginalNames: false,
  maxNameLength: 255,
  concurrency: 4,
};

export interface StorageOptions {
  config?: Partial<StorageConfig>;
  metadata?: Partial<import("./storage.types").FileMetadata>;
  expirationMs?: number;
  isTemp?: boolean;
  tags?: string[];
  overwrite?: boolean;
}

export interface UploadOptions {
  filename?: string;
  mimeType?: string;
  metadata?: Partial<import("./storage.types").FileMetadata>;
  expirationMs?: number;
  isTemp?: boolean;
  tags?: string[];
  overwrite?: boolean;
  validateHash?: string;
  hashAlgorithm?: HashAlgorithm;
}

export interface StorageQuota {
  used: number;
  total: number;
  fileCount: number;
  percentage: number;
}

export interface StorageStats {
  totalFiles: number;
  activeFiles: number;
  tempFiles: number;
  expiredFiles: number;
  totalSize: number;
  tempSize: number;
  oldestFile: number | null;
  newestFile: number | null;
  averageFileSize: number;
}
