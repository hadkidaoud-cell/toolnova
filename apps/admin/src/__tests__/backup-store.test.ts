import { afterEach, describe, expect, it, vi } from "vitest";
import path from "node:path";
import { resolveBackupDestination } from "@/lib/backup-store";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveBackupDestination", () => {
  it("resolves an absolute file: URL", () => {
    vi.stubEnv("DATABASE_URL", "file:C:/ToolNova/packages/database/prisma/dev.db");
    const dest = resolveBackupDestination();
    expect(dest).toEqual({
      dbPath: "C:/ToolNova/packages/database/prisma/dev.db",
      backupsDir: path.join(path.dirname("C:/ToolNova/packages/database/prisma/dev.db"), "backups"),
    });
  });

  it("strips query parameters from the database URL", () => {
    vi.stubEnv("DATABASE_URL", "file:./prisma/dev.db?connection_limit=1");
    expect(resolveBackupDestination()?.dbPath).toBe("./prisma/dev.db");
  });

  it("handles a URL without a file: prefix", () => {
    vi.stubEnv("DATABASE_URL", "C:/data/dev.db");
    const dest = resolveBackupDestination();
    expect(dest?.dbPath).toBe("C:/data/dev.db");
    expect(dest?.backupsDir).toBe(path.join("C:/data", "backups"));
  });

  it("returns null when no DATABASE_URL is set", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(resolveBackupDestination()).toBeNull();
  });

  it("places backups in a sibling directory", () => {
    vi.stubEnv("DATABASE_URL", "file:./packages/database/prisma/dev.db");
    const dest = resolveBackupDestination();
    expect(dest?.backupsDir).toBe(path.join(path.dirname("./packages/database/prisma/dev.db"), "backups"));
  });
});
