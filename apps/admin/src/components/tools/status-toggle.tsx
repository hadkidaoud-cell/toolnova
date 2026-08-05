"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setToolStatus } from "@/lib/admin-actions";
import { toast } from "@/lib/toast";

const STATUS_OPTIONS = [
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export function StatusToggle({
  toolId,
  toolName,
  status,
}: {
  toolId: number;
  toolName: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(next: "PUBLISHED" | "DRAFT" | "ARCHIVED") {
    if (next === status) return;
    startTransition(async () => {
      const result = await setToolStatus(toolId, next);
      if (result.success) {
        toast(`"${toolName}" set to ${next.toLowerCase()}`);
        router.refresh();
      } else {
        toast(result.error ?? "Failed to update status", "error");
      }
    });
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value as "PUBLISHED" | "DRAFT" | "ARCHIVED")}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex rounded-full border border-transparent px-2 py-0.5 text-xs font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
        status === "PUBLISHED"
          ? "bg-green-100 text-green-700 hover:border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:hover:border-green-700"
          : status === "DRAFT"
            ? "bg-yellow-100 text-yellow-700 hover:border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:border-yellow-700"
            : "bg-neutral-100 text-neutral-700 hover:border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600"
      }`}
      title="Change status"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
