export type StorageBackend = "filesystem" | "memory" | "s3" | "gcs" | "azure";

export type FileStatus = "active" | "expired" | "deleted" | "corrupted";

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

export interface StoredFile {
  id: string;
  name: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  hash: string;
  hashAlgorithm: HashAlgorithm;
  status: FileStatus;
  metadata: FileMetadata;
  createdAt: number;
  updatedAt: number;
  expiresAt: number | null;
  isTemp: boolean;
  tags: string[];
}

export interface FileMetadata {
  uploadedBy?: string;
  sessionId?: string;
  requestId?: string;
  toolId?: string;
  description?: string;
  custom: Record<string, unknown>;
}

export interface FileReference {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
}

export const FILE_STATUS: Record<FileStatus, FileStatus> = {
  active: "active",
  expired: "expired",
  deleted: "deleted",
  corrupted: "corrupted",
};
