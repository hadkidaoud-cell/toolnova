"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTool, syncCatalog } from "@/lib/admin-actions";
import { toast } from "@/lib/toast";

export function DeleteToolButton({ toolId, toolName }: { toolId: number; toolName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${toolName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteTool(toolId);
      if (result.success) {
        toast(`Deleted "${toolName}"`);
        router.refresh();
      } else {
        toast(result.error ?? "Failed to delete tool", "error");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

export function SyncCatalogButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSync() {
    startTransition(async () => {
      const result = await syncCatalog();
      if (result.success) {
        if (result.data) {
          toast(`Synced ${result.data.created} created, ${result.data.updated} updated across ${result.data.categories} categories.`);
        }
        router.refresh();
      } else {
        toast(result.error ?? "Failed to sync catalog", "error");
      }
    });
  }

  return (
    <button
      onClick={handleSync}
      disabled={pending}
      className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {pending ? "Syncing..." : "Sync Catalog"}
    </button>
  );
}
