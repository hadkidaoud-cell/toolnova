"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createTool, updateTool } from "@/lib/admin-actions";
import type { ToolInput } from "@/lib/types";
import { inputClass, labelClass, btnPrimary, btnSecondary, cardClass } from "@/components/admin/ui";
import { IconPicker } from "@/components/tools/icon-picker";
import { toast } from "@/lib/toast";

const BADGE_OPTIONS = ["new", "ai", "popular", "recommended"] as const;
const STATUS_OPTIONS = ["PUBLISHED", "DRAFT", "ARCHIVED"] as const;

interface ToolFormProps {
  categories: { id: number; name: string }[];
  initial?: ToolInput;
  toolId?: number;
}

const DEFAULTS: ToolInput = {
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  categoryId: 0,
  icon: "",
  status: "DRAFT",
  views: 0,
  badges: [],
  time: 1,
  uses: 0,
  free: true,
  featured: false,
};

export function ToolForm({ categories, initial, toolId }: ToolFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ToolInput>(initial ?? DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ToolInput>(key: K, value: ToolInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleBadge(badge: (typeof BADGE_OPTIONS)[number]) {
    setForm((prev) => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter((b) => b !== badge)
        : [...prev.badges, badge],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = toolId
        ? await updateTool(toolId, form)
        : await createTool(form);
      if (result.success) {
        toast(toolId ? `Updated "${form.name}"` : `Created "${form.name}"`);
        router.push("/tools");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className={`${cardClass} p-6`}>
        <h2 className="font-semibold text-neutral-900 dark:text-white">Basic Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>
              Name *
            </label>
            <input
              id="name"
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Word Counter"
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
              onChange={(e) => set("slug", e.target.value)}
              placeholder="word-counter"
              required
            />
            <p className="mt-1 text-xs text-neutral-400">Used in the URL: /tools/&lt;slug&gt;</p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Short Description *
            </label>
            <textarea
              id="description"
              className={`${inputClass} min-h-[80px] resize-y`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Count words, characters, and sentences"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="longDescription" className={labelClass}>
              Long Description
            </label>
            <textarea
              id="longDescription"
              className={`${inputClass} min-h-[120px] resize-y`}
              value={form.longDescription ?? ""}
              onChange={(e) => set("longDescription", e.target.value)}
              placeholder="Detailed description shown on the tool page"
            />
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6`}>
        <h2 className="font-semibold text-neutral-900 dark:text-white">Organization</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="categoryId" className={labelClass}>
              Category *
            </label>
            <select
              id="categoryId"
              className={inputClass}
              value={form.categoryId}
              onChange={(e) => set("categoryId", Number(e.target.value))}
              required
            >
              <option value={0} disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value as ToolInput["status"])}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="icon" className={labelClass}>
              Icon
            </label>
            <IconPicker value={form.icon ?? ""} onChange={(name) => set("icon", name)} />
          </div>
          <div>
            <label htmlFor="views" className={labelClass}>
              Views
            </label>
            <input
              id="views"
              type="number"
              min={0}
              className={inputClass}
              value={form.views}
              onChange={(e) => set("views", Number(e.target.value))}
            />
          </div>
          <div>
            <span className={labelClass}>Featured</span>
            <label className="flex h-9 items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={Boolean(form.featured)}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
              Show on homepage
            </label>
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6`}>
        <h2 className="font-semibold text-neutral-900 dark:text-white">Metadata &amp; Badges</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="time" className={labelClass}>
              Avg. Time (seconds)
            </label>
            <input
              id="time"
              type="number"
              min={0}
              className={inputClass}
              value={form.time}
              onChange={(e) => set("time", Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="uses" className={labelClass}>
              Uses
            </label>
            <input
              id="uses"
              type="number"
              min={0}
              className={inputClass}
              value={form.uses}
              onChange={(e) => set("uses", Number(e.target.value))}
            />
          </div>
          <div>
            <span className={labelClass}>Free</span>
            <div className="flex h-9 items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={form.free}
                  onChange={(e) => set("free", e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
                Free to use
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <span className={labelClass}>Badges</span>
          <div className="flex flex-wrap gap-3">
            {BADGE_OPTIONS.map((badge) => (
              <label
                key={badge}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700 dark:border-neutral-700 dark:text-neutral-300 dark:has-[:checked]:border-brand-500 dark:has-[:checked]:bg-brand-950/30 dark:has-[:checked]:text-brand-300"
              >
                <input
                  type="checkbox"
                  checked={form.badges.includes(badge)}
                  onChange={() => toggleBadge(badge)}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
                {badge.charAt(0).toUpperCase() + badge.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.back()} className={btnSecondary} disabled={pending}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Saving..." : toolId ? "Update Tool" : "Create Tool"}
        </button>
      </div>
    </form>
  );
}
