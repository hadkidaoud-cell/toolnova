import type { StorageConfig } from "../types/config.types";
import type { StorageAdapter } from "../adapters/adapter.interface";
import { generateTempFileId, generateUniqueFilename, getExtension } from "../utils/file-utils";
import { computeHash } from "../utils/hash-utils";

export interface TempFileEntry {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  hash: string;
  createdAt: number;
  expiresAt: number;
  sessionId?: string;
}

export class TempFileManager {
  private adapter: StorageAdapter;
  private config: StorageConfig;
  private tempFiles = new Map<string, TempFileEntry>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private onExpired: ((entry: TempFileEntry) => void) | null = null;

  constructor(adapter: StorageAdapter, config: StorageConfig) {
    this.adapter = adapter;
    this.config = config;
  }

  start(): void {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => this.cleanup(), this.config.cleanupIntervalMs);
  }

  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  setOnExpired(callback: (entry: TempFileEntry) => void): void {
    this.onExpired = callback;
  }

  async create(
    data: Buffer,
    options: {
      filename?: string;
      mimeType: string;
      sessionId?: string;
      expirationMs?: number;
    }
  ): Promise<TempFileEntry> {
    const id = generateTempFileId();
    const ext = options.filename ? getExtension(options.filename) : "";
    const name = generateUniqueFilename(
      options.filename ?? `temp-${id}${ext}`,
      { maxLength: this.config.maxNameLength }
    );

    const hash = computeHash(data, this.config.hashAlgorithm);
    const now = Date.now();
    const expirationMs = options.expirationMs ?? this.config.tempExpirationMs;
    const expiresAt = now + expirationMs;

    const file = await this.adapter.write(name, data, {
      mimeType: options.mimeType,
      hash,
      hashAlgorithm: this.config.hashAlgorithm,
      size: data.length,
      metadata: {
        sessionId: options.sessionId,
        custom: {},
      },
      isTemp: true,
      expiresAt,
      overwrite: false,
    });

    const entry: TempFileEntry = {
      id,
      name: file.file.name,
      path: file.file.path,
      size: data.length,
      mimeType: options.mimeType,
      hash,
      createdAt: now,
      expiresAt,
      sessionId: options.sessionId,
    };

    this.tempFiles.set(id, entry);
    return entry;
  }

  async get(id: string): Promise<Buffer | null> {
    const entry = this.tempFiles.get(id);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      await this.expire(id);
      return null;
    }

    try {
      return await this.adapter.read(entry.name);
    } catch {
      return null;
    }
  }

  async getEntry(id: string): Promise<TempFileEntry | undefined> {
    return this.tempFiles.get(id);
  }

  async extend(id: string, additionalMs: number): Promise<boolean> {
    const entry = this.tempFiles.get(id);
    if (!entry) return false;

    entry.expiresAt = Date.now() + additionalMs;
    return true;
  }

  async remove(id: string): Promise<boolean> {
    const entry = this.tempFiles.get(id);
    if (!entry) return false;

    await this.adapter.delete(entry.name);
    this.tempFiles.delete(id);
    return true;
  }

  async removeAll(sessionId?: string): Promise<number> {
    let removed = 0;
    const entries = Array.from(this.tempFiles.values());

    for (const entry of entries) {
      if (sessionId && entry.sessionId !== sessionId) continue;
      await this.adapter.delete(entry.name);
      this.tempFiles.delete(entry.id);
      removed++;
    }

    return removed;
  }

  async list(sessionId?: string): Promise<TempFileEntry[]> {
    const entries = Array.from(this.tempFiles.values());
    if (sessionId) {
      return entries.filter((e) => e.sessionId === sessionId);
    }
    return entries;
  }

  async cleanup(): Promise<string[]> {
    const now = Date.now();
    const expired: string[] = [];
    const toDelete: string[] = [];

    for (const [id, entry] of this.tempFiles.entries()) {
      if (now > entry.expiresAt) {
        toDelete.push(id);
        expired.push(entry.name);
      }
    }

    for (const id of toDelete) {
      await this.expire(id);
    }

    const adapterCleaned = await this.adapter.cleanup(now);
    expired.push(...adapterCleaned);

    return expired;
  }

  getStats(): { total: number; totalSize: number; oldestExpiry: number | null } {
    const entries = Array.from(this.tempFiles.values());
    return {
      total: entries.length,
      totalSize: entries.reduce((sum, e) => sum + e.size, 0),
      oldestExpiry: entries.length > 0 ? Math.min(...entries.map((e) => e.expiresAt)) : null,
    };
  }

  private async expire(id: string): Promise<void> {
    const entry = this.tempFiles.get(id);
    if (!entry) return;

    await this.adapter.delete(entry.name);
    this.tempFiles.delete(id);

    this.onExpired?.(entry);
  }
}
