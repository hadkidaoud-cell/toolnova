import type { StoredFile, FileReference, HashAlgorithm } from "../types/storage.types";

export interface StorageWriteResult {
  file: StoredFile;
  overwritten: boolean;
}

export interface StorageAdapter {
  readonly name: string;
  readonly backend: import("../types/storage.types").StorageBackend;

  initialize(config: import("../types/config.types").StorageConfig): Promise<void>;
  shutdown(): Promise<void>;

  write(
    name: string,
    data: Buffer,
    options: StorageWriteOptions
  ): Promise<StorageWriteResult>;
  read(name: string): Promise<Buffer>;
  delete(name: string): Promise<boolean>;
  exists(name: string): Promise<boolean>;
  stat(name: string): Promise<StorageFileInfo>;

  list(directory?: string): Promise<FileReference[]>;
  mkdir(directory: string): Promise<void>;
  rmdir(directory: string, recursive?: boolean): Promise<void>;

  copy(src: string, dest: string): Promise<void>;
  move(src: string, dest: string): Promise<void>;

  getQuota(): Promise<import("../types/config.types").StorageQuota>;
  getUsedSpace(): Promise<number>;

  cleanup(expiredBefore: number): Promise<string[]>;

  getAbsolutePath(name: string): string;
}

export interface StorageWriteOptions {
  mimeType: string;
  hash: string;
  hashAlgorithm: HashAlgorithm;
  size: number;
  metadata: import("../types/storage.types").FileMetadata;
  isTemp: boolean;
  expiresAt: number | null;
  overwrite: boolean;
}

export interface StorageFileInfo {
  exists: boolean;
  size: number;
  mimeType: string;
  createdAt: number;
  modifiedAt: number;
}
