"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/lib/admin-actions";
import type { CategoryInput } from "@/lib/types";
import { inputClass, labelClass, btnPrimary, btnSecondary, cardClass } from "@/components/admin/ui";
import { IconPicker } from "@/components/tools/icon-picker";
import { toast } from "@/lib/toast";

interface CategoryFormProps {
  initial?: CategoryInput;
  categoryId?: number;
}

const DEFAULTS: CategoryInput = { name: "", slug: "", description: "", icon: "" };

export function CategoryForm({ initial, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CategoryInput>(initial ?? DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = categoryId
        ? await updateCategory(categoryId, form)
        : await createCategory(form);
      if (result.success) {
        toast(categoryId ? `Updated category "${form.name}"` : `Created category "${form.name}"`);
        router.push("/categories");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className={`${cardClass} p-6`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>
              Name *
            </label>
            <input
              id="name"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Text Tools"
              required
            />
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug *
            </label>
            <input
              id="slug"
              className={inputClass}
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder="text"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              className={`${inputClass} min-h-[90px] resize-y`}
              value={form.description ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short description of this category"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="icon" className={labelClass}>
              Icon
            </label>
            <IconPicker value={form.icon ?? ""} onChange={(icon) => setForm((p) => ({ ...p, icon }))} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.back()} className={btnSecondary} disabled={pending}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Saving..." : categoryId ? "Update Category" : "Create Category"}
        </button>
      </div>
    </form>
  );
}
