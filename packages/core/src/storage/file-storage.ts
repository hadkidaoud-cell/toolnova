import type { StoredFile, FileReference } from "./types/storage.types";
import type { StorageConfig, UploadOptions, StorageQuota, StorageStats } from "./types/config.types";
import { DEFAULT_STORAGE_CONFIG } from "./types/config.types";
import type { StorageAdapter } from "./adapters/adapter.interface";
import { FileSystemAdapter } from "./adapters/filesystem.adapter";
import { StorageValidator } from "./validation/storage-validator";
import { TempFileManager, type TempFileEntry } from "./temp/temp-manager";
import { generateUniqueFilename, getExtension, sanitizeFilename } from "./utils/file-utils";
import { computeHash } from "./utils/hash-utils";

export interface FileStorageEvent {
  type: "upload" | "delete" | "expire" | "cleanup" | "error";
  fileId?: string;
  filename?: string;
  size?: number;
  error?: Error;
  timestamp: number;
}

export type FileStorageListener = (event: FileStorageEvent) => void;

export class FileStorage {
  private adapter: StorageAdapter;
  private validator: StorageValidator;
  private tempManager: TempFileManager;
  private config: StorageConfig;
  private files = new Map<string, StoredFile>();
  private listeners = new Set<FileStorageListener>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config?: Partial<StorageConfig>) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
    this.adapter = new FileSystemAdapter();
    this.validator = new StorageValidator(this.config);
    this.tempManager = new TempFileManager(this.adapter, this.config);
  }

  async initialize(): Promise<void> {
    await this.adapter.initialize(this.config);
    this.tempManager.start();
    this.startCleanup();
  }

  async shutdown(): Promise<void> {
    this.stopCleanup();
    this.tempManager.stop();
    await this.adapter.shutdown();
  }

  async upload(
    data: Buffer,
    options: UploadOptions = {}
  ): Promise<StoredFile> {
    const filename = options.filename ?? `upload-${Date.now()}`;
    const ext = getExtension(filename);
    const mimeResult = this.validator.detectMime(filename, data);
    const mimeType = options.mimeType ?? mimeResult.detectedMime;
    const name = this.config.generateUniqueNames
      ? generateUniqueFilename(filename, {
          preserveOriginal: this.config.preserveOriginalNames,
          maxLength: this.config.maxNameLength,
        })
      : sanitizeFilename(filename, this.config.maxNameLength);

    const hash = computeHash(data, options.hashAlgorithm ?? this.config.hashAlgorithm);

    if (options.validateHash) {
      const hashResult = this.validator.validateProvidedHash(
        data,
        options.validateHash,
        options.hashAlgorithm
      );
      if (!hashResult.valid) {
        throw new Error(
          `Hash mismatch: expected ${hashResult.expected}, got ${hashResult.computed}`
        );
      }
    }

    const validation = this.validator.validate({
      filename: name,
      mimeType,
      size: data.length,
      extension: ext,
      hash,
      hashAlgorithm: options.hashAlgorithm ?? this.config.hashAlgorithm,
    });

    if (!validation.valid) {
      const errorMessages = validation.errors.map((e) => e.message).join("; ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const now = Date.now();
    const isTemp = options.isTemp ?? false;
    const expirationMs = options.expirationMs ?? (isTemp ? this.config.tempExpirationMs : this.config.defaultExpirationMs);
    const expiresAt = now + expirationMs;

    const result = await this.adapter.write(name, data, {
      mimeType,
      hash,
      hashAlgorithm: options.hashAlgorithm ?? this.config.hashAlgorithm,
      size: data.length,
      metadata: { custom: {}, ...options.metadata },
      isTemp,
      expiresAt,
      overwrite: options.overwrite ?? false,
    });

    this.files.set(result.file.id, result.file);

    this.emit({
      type: "upload",
      fileId: result.file.id,
      filename: result.file.name,
      size: data.length,
      timestamp: now,
    });

    if (isTemp) {
      await this.tempManager.create(data, {
        filename: name,
        mimeType,
        expirationMs,
      });
    }

    return result.file;
  }

  async read(fileIdOrName: string): Promise<Buffer> {
    const file = this.files.get(fileIdOrName);
    if (file) {
      if (file.expiresAt && Date.now() > file.expiresAt) {
        await this.delete(file.id);
        throw new Error("File has expired");
      }
      return this.adapter.read(file.name);
    }
    return this.adapter.read(fileIdOrName);
  }

  async delete(fileIdOrName: string): Promise<boolean> {
    const file = this.files.get(fileIdOrName);
    if (file) {
      this.files.delete(file.id);
      const deleted = await this.adapter.delete(file.name);
      this.emit({
        type: "delete",
        fileId: file.id,
        filename: file.name,
        timestamp: Date.now(),
      });
      return deleted;
    }
    return this.adapter.delete(fileIdOrName);
  }

  async exists(fileIdOrName: string): Promise<boolean> {
    const file = this.files.get(fileIdOrName);
    if (file) return this.adapter.exists(file.name);
    return this.adapter.exists(fileIdOrName);
  }

  async copy(src: string, dest: string): Promise<void> {
    await this.adapter.copy(src, dest);
  }

  async move(src: string, dest: string): Promise<void> {
    await this.adapter.move(src, dest);
  }

  async getInfo(fileIdOrName: string): Promise<StoredFile | undefined> {
    return this.files.get(fileIdOrName);
  }

  async getQuota(): Promise<StorageQuota> {
    return this.adapter.getQuota();
  }

  async getStats(): Promise<StorageStats> {
    const allFiles = Array.from(this.files.values());
    const active = allFiles.filter((f) => f.status === "active");
    const temp = allFiles.filter((f) => f.isTemp);
    const expired = allFiles.filter((f) => f.status === "expired");
    const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
    const tempSize = temp.reduce((sum, f) => sum + f.size, 0);
    const timestamps = allFiles.map((f) => f.createdAt).filter(Boolean);

    return {
      totalFiles: allFiles.length,
      activeFiles: active.length,
      tempFiles: temp.length,
      expiredFiles: expired.length,
      totalSize,
      tempSize,
      oldestFile: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestFile: timestamps.length > 0 ? Math.max(...timestamps) : null,
      averageFileSize: allFiles.length > 0 ? totalSize / allFiles.length : 0,
    };
  }

  async list(directory?: string): Promise<FileReference[]> {
    return this.adapter.list(directory);
  }

  async createTemp(
    data: Buffer,
    options: {
      filename?: string;
      mimeType: string;
      sessionId?: string;
      expirationMs?: number;
    }
  ): Promise<TempFileEntry> {
    return this.tempManager.create(data, options);
  }

  async getTemp(id: string): Promise<Buffer | null> {
    return this.tempManager.get(id);
  }

  async removeTemp(id: string): Promise<boolean> {
    return this.tempManager.remove(id);
  }

  async listTemp(sessionId?: string): Promise<TempFileEntry[]> {
    return this.tempManager.list(sessionId);
  }

  async cleanup(): Promise<string[]> {
    const now = Date.now();
    const deleted: string[] = [];

    for (const [id, file] of this.files.entries()) {
      if (file.expiresAt && now > file.expiresAt) {
        await this.adapter.delete(file.name);
        this.files.delete(id);
        file.status = "expired";
        deleted.push(file.name);
        this.emit({
          type: "expire",
          fileId: file.id,
          filename: file.name,
          timestamp: now,
        });
      }
    }

    const adapterCleaned = await this.adapter.cleanup(now);
    deleted.push(...adapterCleaned);

    const tempCleaned = await this.tempManager.cleanup();
    deleted.push(...tempCleaned);

    if (deleted.length > 0) {
      this.emit({
        type: "cleanup",
        timestamp: now,
      });
    }

    return deleted;
  }

  on(listener: FileStorageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getAdapter(): StorageAdapter {
    return this.adapter;
  }

  getConfig(): StorageConfig {
    return { ...this.config };
  }

  private emit(event: FileStorageEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // listener error — ignore
      }
    }
  }

  private startCleanup(): void {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch(() => {});
    }, this.config.cleanupIntervalMs);
  }

  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
