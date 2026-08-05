"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveSeoSettings } from "@/lib/panel-actions";
import { inputClass, labelClass, btnPrimary } from "@/components/admin/ui";
import { toast } from "@/lib/toast";

interface SeoFormProps {
  siteTitle: string;
  metaDescription: string;
}

export function SeoForm({ siteTitle, metaDescription }: SeoFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(siteTitle);
  const [description, setDescription] = useState(metaDescription);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSeoSettings({ site_title: title, meta_description: description });
      if (result.success) {
        toast("SEO settings saved");
        router.refresh();
      } else {
        toast(result.error ?? "Failed to save SEO settings", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="font-semibold text-neutral-900 dark:text-white">Global SEO</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="site_title" className={labelClass}>
            Site Title
          </label>
          <input
            id="site_title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="meta_description" className={labelClass}>
            Meta Description
          </label>
          <textarea
            id="meta_description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
