"use client";

import React, { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { FileImage, Upload, X } from "lucide-react";

const RELATED_SLUGS = ["base64-encoder", "image-converter", "image-compressor"] as const;

const RELATED_ICONS: Record<string, string> = {
  "base64-encoder": "64",
  "image-converter": "↔",
  "image-compressor": "🖼",
};

const LONG_DESCRIPTION =
  "Convert any image into a Base64 string or a full data URL. Useful for embedding images in HTML, CSS, JSON, and email signatures without hosting a file. Small to medium images work best, and everything is processed locally in your browser.";

const FAQ = [
  {
    question: "What is Base64?",
    answer: "Base64 is a text representation of binary data. It lets you embed images inside HTML, CSS, JSON, and APIs using only ASCII characters.",
  },
  {
    question: "Data URL or raw Base64?",
    answer: "A data URL includes the prefix like 'data:image/png;base64,'. Use a data URL where browsers expect a URL; use raw Base64 when the API adds its own prefix.",
  },
  {
    question: "Are there size limits?",
    answer: "We cap uploads at 5 MB to keep the browser responsive. Base64 grows images by about 33%, so factor that into your payload size.",
  },
];

const ARTICLE = {
  title: "Embedding Images With Base64",
  content:
    "Base64 encoding trades file size for portability: a 33% overhead removes the need to host a separate file. That makes it ideal for icons, small illustrations, and dynamic content. Our converter gives you both the data URL and the raw string, ready to paste anywhere.",
};

const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageToBase64Page() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["image-to-base64"];
  const u = t.imageToBase64;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <FileImage className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/image" },
      { label: meta.name, href: "/tools/image-to-base64" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [dataUrl, setDataUrl] = useState("");
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState<"dataUrl" | "raw" | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError("");
      if (!file.type.startsWith("image/")) {
        setError(t.common.invalidPdf ? t.common.failedLoadImage : u.noFile);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(u.fileTooLarge);
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setDataUrl(result);
        const idx = result.indexOf(",");
        setRaw(idx >= 0 ? result.slice(idx + 1) : result);
      };
      reader.onerror = () => setError(u.noFile);
      reader.readAsDataURL(file);
    },
    [t.common, u]
  );

  const copy = async (kind: "dataUrl" | "raw") => {
    try {
      await navigator.clipboard.writeText(kind === "dataUrl" ? dataUrl : raw);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const downloadTxt = () => {
    const blob = new Blob([dataUrl], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName || "image").replace(/\.[^.]+$/, "") + "-base64.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-xs leading-relaxed break-all text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

  return (
    <ToolLayout
      name={tool.name}
      description={tool.description}
      longDescription={tool.longDescription}
      category={tool.category}
      categorySlug={tool.categorySlug}
      breadcrumbs={tool.breadcrumbs}
      icon={tool.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {!dataUrl ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/10"
          >
            <Upload className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{u.upload}</span>
          </button>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <img src={dataUrl} alt={fileName} className="h-16 w-16 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{fileName}</p>
              <p className="text-xs text-green-600 dark:text-green-400">{u.converted}</p>
            </div>
            <button
              onClick={() => {
                setDataUrl("");
                setRaw("");
                setFileName("");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {dataUrl && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.dataUrl}</label>
              <div className="flex items-start gap-3">
                <textarea readOnly value={dataUrl} rows={4} className={inputCls} />
                <button
                  onClick={() => copy("dataUrl")}
                  className="shrink-0 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {copied === "dataUrl" ? t.common.copied : u.copy}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.rawBase64}</label>
              <div className="flex items-start gap-3">
                <textarea readOnly value={raw} rows={4} className={inputCls} />
                <button
                  onClick={() => copy("raw")}
                  className="shrink-0 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {copied === "raw" ? t.common.copied : u.copy}
                </button>
              </div>
            </div>

            <button
              onClick={downloadTxt}
              className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {u.download}
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
