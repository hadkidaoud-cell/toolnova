"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBackup, deleteBackup, restoreBackup } from "@/lib/panel-actions";
import { Download, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";

export interface BackupRow {
  id: number;
  filename: string;
  size: number;
  status: string;
  type: string;
  createdAt: string;
}

function statusStyle(status: string): string {
  if (status === "COMPLETED") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (status === "FAILED") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
}

export function BackupsTable({ backups }: { backups: BackupRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const result = await createBackup();
      if (result.success) {
        toast("Backup created");
        router.refresh();
      } else {
        toast(result.error ?? "Failed to create backup", "error");
      }
    });
  }

  function handleDelete(id: number, filename: string) {
    if (!window.confirm(`Delete backup "${filename}"?`)) return;
    startTransition(async () => {
      const result = await deleteBackup(id);
      if (result.success) {
        toast(`Deleted backup "${filename}"`);
        router.refresh();
      } else {
        toast(result.error ?? "Failed to delete backup", "error");
      }
    });
  }

  function handleRestore(id: number, filename: string) {
    if (
      !window.confirm(
        `Restore backup "${filename}"?\n\nThis replaces the current database. The database file must not be locked by a running server.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await restoreBackup(id);
      if (result.success) {
        toast(`Restored backup "${filename}"`);
        router.refresh();
      } else {
        toast(result.error ?? "Failed to restore backup", "error");
      }
    });
  }

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
        <span className="text-sm text-neutral-500">{backups.length} backup{backups.length !== 1 ? "s" : ""}</span>
        <button
          onClick={handleCreate}
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create Backup"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Name</th>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Size</th>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Created</th>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
              <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {backups.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  No backups yet. Create one to snapshot the database.
                </td>
              </tr>
            )}
            {backups.map((backup) => (
              <tr key={backup.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{backup.filename}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {(backup.size / 1024 / 1024).toFixed(2)} MB
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{backup.createdAt}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(backup.status)}`}>
                    {backup.status.charAt(0) + backup.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {backup.status === "COMPLETED" && (
                      <a
                        href={`/api/backups/${backup.id}/download`}
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    )}
                    {backup.status === "COMPLETED" && (
                      <button
                        onClick={() => handleRestore(backup.id, backup.filename)}
                        disabled={pending}
                        className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-amber-400"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(backup.id, backup.filename)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
