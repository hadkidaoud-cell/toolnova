"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "@/lib/admin-actions";
import { toast } from "@/lib/toast";

export function DeleteCategoryButton({ categoryId, categoryName }: { categoryId: number; categoryName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete category "${categoryName}"?`)) return;
    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        toast(`Deleted category "${categoryName}"`);
        router.refresh();
      } else {
        toast(result.error ?? "Failed to delete category", "error");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
