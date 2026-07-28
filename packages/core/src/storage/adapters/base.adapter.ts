import type { StoredFile, FileReference } from "../types/storage.types";
import type {
  StorageAdapter,
  StorageWriteOptions,
  StorageWriteResult,
  StorageFileInfo,
} from "./adapter.interface";
import type { StorageConfig } from "../types/config.types";

export abstract class BaseStorageAdapter implements StorageAdapter {
  abstract readonly name: string;
  abstract readonly backend: import("../types/storage.types").StorageBackend;

  protected config!: StorageConfig;
  protected initialized = false;

  async initialize(config: StorageConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
  }

  abstract write(name: string, data: Buffer, options: StorageWriteOptions): Promise<StorageWriteResult>;
  abstract read(name: string): Promise<Buffer>;
  abstract delete(name: string): Promise<boolean>;
  abstract exists(name: string): Promise<boolean>;
  abstract stat(name: string): Promise<StorageFileInfo>;
  abstract list(directory?: string): Promise<FileReference[]>;
  abstract mkdir(directory: string): Promise<void>;
  abstract rmdir(directory: string, recursive?: boolean): Promise<void>;
  abstract copy(src: string, dest: string): Promise<void>;
  abstract move(src: string, dest: string): Promise<void>;
  abstract getQuota(): Promise<import("../types/config.types").StorageQuota>;
  abstract getUsedSpace(): Promise<number>;
  abstract cleanup(expiredBefore: number): Promise<string[]>;
  abstract getAbsolutePath(name: string): string;

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Storage adapter ${this.name} is not initialized`);
    }
  }

  protected toStoredFile(name: string, _data: Buffer, options: StorageWriteOptions): StoredFile {
    const id = `file-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();

    return {
      id,
      name,
      originalName: name,
      path: this.getAbsolutePath(name),
      mimeType: options.mimeType,
      size: options.size,
      hash: options.hash,
      hashAlgorithm: options.hashAlgorithm,
      status: "active",
      metadata: options.metadata,
      createdAt: now,
      updatedAt: now,
      expiresAt: options.expiresAt,
      isTemp: options.isTemp,
      tags: [],
    };
  }

  protected toFileReference(name: string, info: StorageFileInfo): FileReference {
    return {
      id: name,
      name,
      path: this.getAbsolutePath(name),
      mimeType: info.mimeType,
      size: info.size,
    };
  }
}
