import fs from "node:fs";
import path from "node:path";

function getDbFilePath(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const raw = url.startsWith("file:") ? url.slice("file:".length) : url;
  const clean = raw.includes("?") ? (raw.split("?")[0] ?? raw) : raw;
  return clean.replace(/\\/g, "/");
}

function getBackupsDir(): string | null {
  const dbPath = getDbFilePath();
  if (!dbPath) return null;
  return path.join(path.dirname(dbPath), "backups");
}

export function getBackupFilePath(filename: string): string | null {
  const backupsDir = getBackupsDir();
  if (!backupsDir) return null;
  const file = path.join(backupsDir, filename);
  return fs.existsSync(file) ? file : null;
}

export function resolveBackupDestination(): { dbPath: string; backupsDir: string } | null {
  const dbPath = getDbFilePath();
  const backupsDir = getBackupsDir();
  if (!dbPath || !backupsDir) return null;
  return { dbPath, backupsDir };
}
