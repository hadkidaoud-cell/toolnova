"use server";

import { revalidatePath } from "next/cache";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth, requireAdmin } from "@/lib/auth";
import { resolveBackupDestination } from "@/lib/backup-store";
import type { ActionResult } from "@/lib/types";

export async function saveSettings(entries: Record<string, string>): Promise<ActionResult> {
  await requireAdmin();
  try {
    for (const [key, value] of Object.entries(entries)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value.trim() },
        create: { key, value: value.trim(), group: "general" },
      });
    }
    await logAction("UPDATE", "Setting");
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save settings." };
  }
}

export async function saveSeoSettings(entries: Record<string, string>): Promise<ActionResult> {
  await requireAdmin();
  try {
    for (const [key, value] of Object.entries(entries)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value.trim() },
        create: { key, value: value.trim(), group: "seo" },
      });
    }
    await logAction("UPDATE", "SeoSetting");
    revalidatePath("/seo");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save SEO settings." };
  }
}

export async function updateProfile(userId: number, name: string, email: string): Promise<ActionResult> {
  await requireAdmin();
  if (!name.trim() || !email.trim()) {
    return { success: false, error: "Name and email are required." };
  }
  try {
    await prisma.user.update({ where: { id: userId }, data: { name: name.trim(), email: email.trim() } });
    await logAction("UPDATE", "User");
    revalidatePath("/profile");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update profile." };
  }
}

export async function updatePassword(
  userId: number,
  current: string,
  next: string
): Promise<ActionResult> {
  await requireAdmin();
  if (!current || !next) {
    return { success: false, error: "Current and new password are required." };
  }
  if (next.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    return { success: false, error: "User not found or password not set." };
  }
  const valid = await bcrypt.compare(current, user.password);
  if (!valid) {
    return { success: false, error: "Current password is incorrect." };
  }
  const hashed = await bcrypt.hash(next, 10);
  try {
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    await logAction("UPDATE", "UserPassword");
    revalidatePath("/profile");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update password." };
  }
}

export async function createBackup(): Promise<ActionResult<number>> {
  await requireAdmin();
  const dest = resolveBackupDestination();
  if (!dest || !fs.existsSync(dest.dbPath)) {
    return { success: false, error: "Database file not found." };
  }

  try {
    fs.mkdirSync(dest.backupsDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${stamp}.db`;
    const filePath = path.join(dest.backupsDir, filename);
    fs.copyFileSync(dest.dbPath, filePath);
    const size = fs.statSync(filePath).size;

    const backup = await prisma.backup.create({
      data: { filename, size, type: "FULL", status: "COMPLETED" },
    });
    await logAction("CREATE", "Backup");
    revalidatePath("/backups");
    return { success: true, data: backup.id };
  } catch {
    return { success: false, error: "Failed to create backup." };
  }
}

export async function deleteBackup(id: number): Promise<ActionResult> {
  await requireAdmin();
  const backup = await prisma.backup.findUnique({ where: { id } });
  if (!backup) return { success: false, error: "Backup not found." };

  try {
    const dest = resolveBackupDestination();
    if (dest) {
      const file = path.join(dest.backupsDir, backup.filename);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
    await prisma.backup.delete({ where: { id } });
    await logAction("DELETE", "Backup");
    revalidatePath("/backups");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete backup." };
  }
}

export async function restoreBackup(id: number): Promise<ActionResult> {
  await requireAdmin();
  const backup = await prisma.backup.findUnique({ where: { id } });
  if (!backup) return { success: false, error: "Backup not found." };

  const dest = resolveBackupDestination();
  if (!dest) return { success: false, error: "Database destination not resolved." };

  const file = path.join(dest.backupsDir, backup.filename);
  if (!fs.existsSync(file)) {
    return { success: false, error: "Backup file missing on disk." };
  }

  try {
    const temp = path.join(dest.backupsDir, `.restore-${Date.now()}.db`);
    fs.copyFileSync(file, temp);
    try {
      fs.copyFileSync(temp, dest.dbPath);
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String((error as { code: unknown }).code) : "unknown";
      return {
        success: false,
        error: `Restore failed: the database file is locked (${code}). Stop the running server and retry.`,
      };
    } finally {
      fs.rmSync(temp, { force: true });
    }
    await logAction("RESTORE", "Backup");
    revalidatePath("/backups");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");
    revalidatePath("/logs");
    revalidatePath("/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to restore backup." };
  }
}

export async function updateUserRole(
  userId: number,
  role: "ADMIN" | "USER" | "MODERATOR"
): Promise<ActionResult> {
  await requireAdmin();
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Only admins can change roles." };
  }
  if (String(userId) === session.user?.id) {
    return { success: false, error: "You cannot change your own role." };
  }
  try {
    await prisma.user.update({ where: { id: userId }, data: { role } });
    await logAction("UPDATE", "UserRole");
    revalidatePath("/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update user role." };
  }
}

export async function setUserStatus(
  userId: number,
  status: "ACTIVE" | "INACTIVE" | "BANNED"
): Promise<ActionResult> {
  await requireAdmin();
  const session = await auth();
  if (String(userId) === session?.user?.id) {
    return { success: false, error: "You cannot change your own status." };
  }
  try {
    await prisma.user.update({ where: { id: userId }, data: { status } });
    await logAction("UPDATE", "UserStatus");
    revalidatePath("/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update user status." };
  }
}

export async function deleteUser(userId: number): Promise<ActionResult> {
  await requireAdmin();
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Only admins can delete users." };
  }
  if (String(userId) === session.user?.id) {
    return { success: false, error: "You cannot delete your own account." };
  }
  try {
    await prisma.user.delete({ where: { id: userId } });
    await logAction("DELETE", "User");
    revalidatePath("/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete user." };
  }
}

async function logAction(action: string, entityType: string) {
  try {
    await prisma.activityLog.create({ data: { action, entityType } });
  } catch {
    // ignore logging failures
  }
}
