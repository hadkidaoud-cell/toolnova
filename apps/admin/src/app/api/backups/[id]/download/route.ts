import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBackupFilePath } from "@/lib/backup-store";
import { auth } from "@/lib/auth";
import fs from "node:fs";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "MODERATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const backupId = Number(id);
  if (!Number.isFinite(backupId)) {
    return NextResponse.json({ error: "Invalid backup id" }, { status: 400 });
  }

  const backup = await prisma.backup.findUnique({ where: { id: backupId } });
  if (!backup) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  }

  const filePath = getBackupFilePath(backup.filename);
  if (!filePath) {
    return NextResponse.json({ error: "Backup file is missing" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${backup.filename}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
