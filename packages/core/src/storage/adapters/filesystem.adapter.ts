import * as fs from "fs";
import * as path from "path";
import { BaseStorageAdapter } from "./base.adapter";
import type { FileReference } from "../types/storage.types";
import type { StorageWriteOptions, StorageWriteResult, StorageFileInfo } from "./adapter.interface";
import type { StorageConfig } from "../types/config.types";

export class FileSystemAdapter extends BaseStorageAdapter {
  readonly name = "filesystem";
  readonly backend = "filesystem" as const;

  private rootDir = "";
  private tempDir = "";

  async initialize(config: StorageConfig): Promise<void> {
    await super.initialize(config);
    this.rootDir = path.resolve(config.rootDirectory);
    this.tempDir = path.resolve(config.tempDirectory);

    await fs.promises.mkdir(this.rootDir, { recursive: true });
    await fs.promises.mkdir(this.tempDir, { recursive: true });
  }

  async write(name: string, data: Buffer, options: StorageWriteOptions): Promise<StorageWriteResult> {
    this.ensureInitialized();

    const dir = options.isTemp ? this.tempDir : this.rootDir;
    const filePath = path.join(dir, name);
    const overwritten = await this.exists(name);

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, data);

    const file = this.toStoredFile(name, data, options);
    return { file, overwritten };
  }

  async read(name: string): Promise<Buffer> {
    this.ensureInitialized();
    const filePath = this.resolveFilePath(name);
    return fs.promises.readFile(filePath);
  }

  async delete(name: string): Promise<boolean> {
    this.ensureInitialized();
    const filePath = this.resolveFilePath(name);

    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async exists(name: string): Promise<boolean> {
    this.ensureInitialized();
    const filePath = this.resolveFilePath(name);

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async stat(name: string): Promise<StorageFileInfo> {
    this.ensureInitialized();
    const filePath = this.resolveFilePath(name);

    try {
      const stats = await fs.promises.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        mimeType: "application/octet-stream",
        createdAt: stats.birthtimeMs || stats.ctimeMs,
        modifiedAt: stats.mtimeMs,
      };
    } catch {
      return {
        exists: false,
        size: 0,
        mimeType: "",
        createdAt: 0,
        modifiedAt: 0,
      };
    }
  }

  async list(directory?: string): Promise<FileReference[]> {
    this.ensureInitialized();
    const dir = directory ? path.join(this.rootDir, directory) : this.rootDir;
    const references: FileReference[] = [];

    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const filePath = path.join(dir, entry.name);
          const stats = await fs.promises.stat(filePath);
          references.push({
            id: entry.name,
            name: entry.name,
            path: filePath,
            mimeType: "application/octet-stream",
            size: stats.size,
          });
        }
      }
    } catch {
      // directory doesn't exist
    }

    return references;
  }

  async mkdir(directory: string): Promise<void> {
    this.ensureInitialized();
    await fs.promises.mkdir(path.join(this.rootDir, directory), { recursive: true });
  }

  async rmdir(directory: string, recursive: boolean = false): Promise<void> {
    this.ensureInitialized();
    await fs.promises.rm(path.join(this.rootDir, directory), { recursive, force: true });
  }

  async copy(src: string, dest: string): Promise<void> {
    this.ensureInitialized();
    const srcPath = this.resolveFilePath(src);
    const destPath = path.join(this.rootDir, dest);
    await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
    await fs.promises.copyFile(srcPath, destPath);
  }

  async move(src: string, dest: string): Promise<void> {
    this.ensureInitialized();
    const srcPath = this.resolveFilePath(src);
    const destPath = path.join(this.rootDir, dest);
    await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
    await fs.promises.rename(srcPath, destPath);
  }

  async getQuota(): Promise<import("../types/config.types").StorageQuota> {
    this.ensureInitialized();
    const used = await this.getUsedSpace();
    const total = this.config.maxTotalStorage;
    const fileCount = await this.countFiles(this.rootDir);

    return {
      used,
      total,
      fileCount,
      percentage: total > 0 ? (used / total) * 100 : 0,
    };
  }

  async getUsedSpace(): Promise<number> {
    this.ensureInitialized();
    return this.calculateDirSize(this.rootDir);
  }

  async cleanup(expiredBefore: number): Promise<string[]> {
    this.ensureInitialized();
    const deleted: string[] = [];
    await this.cleanupDir(this.tempDir, expiredBefore, deleted);
    await this.cleanupDir(this.rootDir, expiredBefore, deleted);
    return deleted;
  }

  getAbsolutePath(name: string): string {
    return path.join(this.rootDir, name);
  }

  private resolveFilePath(name: string): string {
    const tempPath = path.join(this.tempDir, name);
    if (fs.existsSync(tempPath)) return tempPath;
    return path.join(this.rootDir, name);
  }

  private async cleanupDir(dir: string, expiredBefore: number, deleted: string[]): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const filePath = path.join(dir, entry.name);
          try {
            const stats = await fs.promises.stat(filePath);
            if (stats.mtimeMs < expiredBefore) {
              await fs.promises.unlink(filePath);
              deleted.push(entry.name);
            }
          } catch {
            // skip
          }
        } else if (entry.isDirectory()) {
          await this.cleanupDir(path.join(dir, entry.name), expiredBefore, deleted);
        }
      }
    } catch {
      // dir doesn't exist
    }
  }

  private async calculateDirSize(dir: string): Promise<number> {
    let size = 0;
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const stats = await fs.promises.stat(path.join(dir, entry.name));
          size += stats.size;
        } else if (entry.isDirectory()) {
          size += await this.calculateDirSize(path.join(dir, entry.name));
        }
      }
    } catch {
      // skip
    }
    return size;
  }

  private async countFiles(dir: string): Promise<number> {
    let count = 0;
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          count++;
        } else if (entry.isDirectory()) {
          count += await this.countFiles(path.join(dir, entry.name));
        }
      }
    } catch {
      // skip
    }
    return count;
  }
}
