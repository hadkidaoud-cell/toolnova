"use client";

import React, { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { FileCode, Upload, X } from "lucide-react";

const RELATED_SLUGS = ["image-compressor", "favicon-generator", "color-extractor"] as const;

const RELATED_ICONS: Record<string, string> = {
  "image-compressor": "🖼",
  "favicon-generator": "F",
  "color-extractor": "◍",
};

const LONG_DESCRIPTION =
  "The SVG Compressor minifies SVG files by stripping comments, XML declarations, and unnecessary whitespace while preserving the structure and appearance. See the original versus compressed size and the exact percentage you saved, then download the optimized file. All processing happens locally in your browser.";

const FAQ = [
  {
    question: "Does compression change how the SVG looks?",
    answer: "No. We only remove redundant whitespace, comments, and the XML declaration. Visual output stays identical.",
  },
  {
    question: "Why are SVG files so verbose?",
    answer: "Design tools export lots of metadata and formatting. A minified SVG can be dramatically smaller, which matters for icons and logos shipped over the web.",
  },
  {
    question: "Can I compress multiple files?",
    answer: "Process one file at a time here. The tool is fast, so run each file through the same simple workflow.",
  },
];

const ARTICLE = {
  title: "Optimizing SVGs for the Web",
  content:
    "SVGs are text, so they compress incredibly well once you remove what the parser doesn't need. A cleaner file means faster page loads, smaller bundles, and tidier code reviews. Our compressor automates the safe deletions and shows you exactly what you saved.",
};

export default function SvgCompressorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["svg-compressor"];
  const u = t.svgCompressor;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <FileCode className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/image" },
      { label: meta.name, href: "/tools/svg-compressor" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [source, setSource] = useState("");
  const [output, setOutput] = useState("");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const compress = useCallback(
    (text: string) => {
      if (!/<svg[\s>]/i.test(text)) {
        setError(u.invalidSvg);
        return;
      }
      let out = text.replace(/<\?xml[^>]*\?>/g, "");
      out = out.replace(/<!--[\s\S]*?-->/g, "");
      out = out.replace(/>\s+</g, "><");
      out = out.replace(/\s{2,}/g, " ");
      out = out.replace(/>\s+/g, ">");
      out = out.replace(/\s+</g, "<");
      out = out.trim();
      setOutput(out);
      setProgress(false);
    },
    [u.invalidSvg]
  );

  const handleFile = useCallback(
    (file: File) => {
      setError("");
      if (!file.name.toLowerCase().endsWith(".svg")) {
        setError(u.invalidSvg);
        return;
      }
      setFileName(file.name);
      setProgress(true);
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        setSource(text);
        compress(text);
      };
      reader.onerror = () => {
        setProgress(false);
        setError(u.invalidSvg);
      };
      reader.readAsText(file);
    },
    [compress, u.invalidSvg]
  );

  const download = () => {
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName || "icon").replace(/\.svg$/i, "") + ".min.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const kb = (n: number) => `${(n / 1024).toFixed(2)} KB`;
  const originalSize = new Blob([source]).size;
  const outputSize = new Blob([output]).size;
  const saved = originalSize > 0 ? Math.max(0, Math.round((1 - outputSize / originalSize) * 100)) : 0;

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
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {!source ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/10"
          >
            <Upload className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{u.dropSvg}</span>
          </button>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <FileCode className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{fileName}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{kb(originalSize)}</p>
            </div>
            <button
              onClick={() => {
                setSource("");
                setOutput("");
                setFileName("");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {progress && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{u.compressProgress}</p>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {output && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
                <div className="text-xl font-bold text-neutral-900 dark:text-white">{kb(originalSize)}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.originalSize}</div>
              </div>
              <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
                <div className="text-xl font-bold text-brand-600 dark:text-brand-400">{kb(outputSize)}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.compressedSize}</div>
              </div>
              <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{saved}%</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {u.savedPercent.split("{percent}")[0]?.trim() ?? ""}
                </div>
              </div>
            </div>

            <button
              onClick={download}
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              {u.download}
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
