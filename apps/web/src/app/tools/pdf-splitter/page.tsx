"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import {
  Scissors,
  ShieldCheck,
  Download,
  Eye,
  Loader2,
  FileArchive,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  analyzePdf,
  splitAll,
  splitRanges,
  splitGroups,
  createZip,
  type SplitMode,
  type SplitResult,
} from "@/lib/pdf-splitter";

const RELATED_SLUGS = ["pdf-merger", "pdf-compressor", "image-to-pdf"] as const;

const RELATED_ICONS: Record<string, string> = {
  "pdf-merger": "M",
  "pdf-compressor": "Z",
  "image-to-pdf": "I",
};

const LONG_DESCRIPTION =
  "Our PDF Splitter extracts pages from a PDF into separate files, entirely on your device — nothing is uploaded. Split every page into its own PDF, pick custom ranges like 1-3, 5, 8-10, or split into groups of N pages, then download the files individually or as one ZIP archive. Powered by pdf-lib, the split is lossless: text, fonts and images are preserved.";

const FAQ = [
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. Splitting happens locally in your browser using pdf-lib. Your file never leaves your device, which keeps the tool private, fast, and free of upload limits.",
  },
  {
    question: "Is the split lossless?",
    answer:
      "Yes. Pages are copied into new documents without rasterization, so text stays selectable, fonts stay embedded, and images keep their original quality. What you see in the source PDF is exactly what you get.",
  },
  {
    question: "What range formats are supported?",
    answer:
      "Use comma-separated single pages and ranges, for example 1-3, 5, 8-10. Ranges are clamped to the document, and reversed ranges like 5-3 are read as 3-5.",
  },
  {
    question: "How do I download all the split files?",
    answer:
      "Once splitting finishes, you can download each file individually or use the Download ZIP button to fetch everything in one archive.",
  },
];

const ARTICLE = {
  title: "PDF Splitting Best Practices",
  content:
    "Splitting is lossless — every page keeps its text, fonts, and images. For chapter or section extraction, use custom ranges like '1-3, 5, 8-10' to grab exactly the pages you need. Use 'Every N pages' when preparing a document for printing or separate review batches, and 'Split all' when each page must stand alone (for example, invoices or certificates). Download the ZIP option when you split many pages to avoid managing dozens of files one by one.",
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes.slice().buffer as ArrayBuffer], { type });
}

function plural(u: { one: string; other: string }, n: number): string {
  return n === 1 ? u.one : u.other;
}

export default function PdfSplitterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.document;
  const meta = t.meta["pdf-splitter"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "document",
    icon: <Scissors className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/document" },
      { label: meta.name, href: "/tools/pdf-splitter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const MODES: { key: SplitMode; title: string; description: string }[] = [
    { key: "all", title: t.splitter.modeAll, description: t.splitter.modeAllDesc },
    { key: "ranges", title: t.splitter.modeRanges, description: t.splitter.modeRangesDesc },
    { key: "groups", title: t.splitter.modeGroups, description: t.splitter.modeGroupsDesc },
  ];

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [mode, setMode] = useState<SplitMode>("all");
  const [rangesInput, setRangesInput] = useState("");
  const [groupSize, setGroupSize] = useState(2);
  const [splitting, setSplitting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<SplitResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPreview && fileBytes) {
      const url = URL.createObjectURL(bytesToBlob(fileBytes, "application/pdf"));
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [showPreview, fileBytes]);

  const reset = useCallback(() => {
    setResult(null);
    setShowPreview(false);
    setError("");
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError(t.common.invalidPdf);
      return;
    }
    reset();
    setFileName(file.name);
    setFileSize(file.size);
    setPageCount(null);
    setFileBytes(null);

    const bytes = new Uint8Array(await file.arrayBuffer());
    setFileBytes(bytes);
    const info = await analyzePdf(bytes);
    setPageCount(info?.pageCount ?? null);
    if (!info) setError(t.common.failedLoadPdf.replace("{name}", file.name));
  }, [reset, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSplit = useCallback(async () => {
    if (!fileBytes || pageCount === null) return;
    setSplitting(true);
    setError("");
    setResult(null);
    setShowPreview(false);

    try {
      let res: SplitResult;
      const onProgress = (done: number, total: number) => setProgress({ done, total });
      if (mode === "all") {
        res = await splitAll(fileBytes, fileName, onProgress);
      } else if (mode === "ranges") {
        res = await splitRanges(fileBytes, fileName, rangesInput, onProgress);
      } else {
        res = await splitGroups(fileBytes, fileName, groupSize, onProgress);
      }
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.splitter.splittingFailed);
    } finally {
      setSplitting(false);
      setProgress({ done: 0, total: 0 });
    }
  }, [fileBytes, pageCount, fileName, mode, rangesInput, groupSize, t]);

  const downloadBlob = useCallback((blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, []);

  const handleDownloadOne = useCallback((index: number) => {
    if (!result) return;
    const file = result.files[index]!;
    downloadBlob(bytesToBlob(file.bytes, "application/pdf"), file.fileName);
  }, [result, downloadBlob]);

  const handleDownloadZip = useCallback(() => {
    if (!result) return;
    const base = fileName.replace(/\.pdf$/i, "");
    const zip = createZip(result.files.map((f) => ({ name: f.fileName, bytes: f.bytes })));
    downloadBlob(bytesToBlob(zip, "application/zip"), `${base}-split.zip`);
  }, [result, fileName, downloadBlob]);

  const totalOutput = result ? result.files.reduce((s, f) => s + f.size, 0) : 0;

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
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Drop zone / file card */}
        {!fileName ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
              dragOver
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800"
            }`}
          >
            <svg className="mx-auto h-12 w-12 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <p className="mt-3 font-medium text-neutral-700 dark:text-neutral-300">{t.common.dropPdf}</p>
            <p className="mt-1 text-sm text-neutral-400">{t.common.pdfOnly}</p>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
              className="hidden" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
              <FileText className="h-6 w-6 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{fileName}</p>
              <p className="text-xs text-neutral-500">
                {formatFileSize(fileSize)}
                {pageCount !== null ? ` · ${pageCount} ${plural(t.common.page, pageCount)}` : ""}
              </p>
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {t.common.change}
            </button>
            <button onClick={() => { setFileName(""); setFileSize(0); setPageCount(null); setFileBytes(null); reset(); }}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
              {t.common.remove}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
              className="hidden" />
          </div>
        )}

        {fileBytes && pageCount !== null && (
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Scissors className="h-4 w-4" /> {t.splitter.splitMode}
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {MODES.map((m) => (
                <button key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`rounded-lg border-2 p-3 text-left transition-all ${
                    mode === m.key
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
                  }`}
                >
                  <div className={`text-sm font-bold ${mode === m.key ? "text-brand-600 dark:text-brand-400" : "text-neutral-900 dark:text-white"}`}>
                    {m.title}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-neutral-500">{m.description}</div>
                </button>
              ))}
            </div>

            {mode === "ranges" && (
              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-neutral-500">{t.splitter.pageRanges}</label>
                <input
                  type="text"
                  value={rangesInput}
                  onChange={(e) => setRangesInput(e.target.value)}
                  placeholder={t.splitter.rangesPlaceholder.replace("{pageCount}", String(pageCount))}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 font-mono text-sm text-neutral-900 outline-none focus:border-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            )}

            {mode === "groups" && (
              <div className="mt-4">
                <label className="mb-1 flex justify-between text-xs font-medium text-neutral-500">
                  <span>{t.splitter.pagesPerFile}</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">
                    {Math.max(1, Math.floor(groupSize))} {plural(t.common.page, Math.max(1, Math.floor(groupSize)))} →{" "}
                    {Math.ceil(pageCount / Math.max(1, Math.floor(groupSize)))} {plural(t.common.file, Math.ceil(pageCount / Math.max(1, Math.floor(groupSize))))}
                  </span>
                </label>
                <input type="range" min={1} max={20} step={1} value={groupSize}
                  onChange={(e) => setGroupSize(Number(e.target.value))} className="w-full" />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleSplit} disabled={splitting || pageCount === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 sm:flex-none sm:px-8">
                {splitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {progress.total > 0
                      ? t.splitter.splittingProgress.replace("{done}", String(progress.done)).replace("{total}", String(progress.total))
                      : t.splitter.splitting}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" /> {t.splitter.split}
                  </>
                )}
              </button>
              <button onClick={() => setShowPreview((s) => !s)}
                className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                <Eye className="h-4 w-4" /> {showPreview ? t.splitter.hideSource : t.splitter.previewSource}
              </button>
            </div>

            {splitting && progress.total > 0 && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-brand-200 dark:bg-brand-800">
                  <div className="h-full rounded-full bg-brand-600 transition-all"
                    style={{ width: `${(progress.done / progress.total) * 100}%` }} />
                </div>
              </div>
            )}

            {showPreview && fileBytes && previewUrl && (
              <iframe
                src={previewUrl}
                className="mt-4 h-[500px] w-full rounded-lg border-none bg-white"
                title={t.splitter.sourcePreviewTitle}
              />
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl border-2 border-green-500 bg-green-50 p-5 dark:bg-green-900/20">
            <div className="mb-4 flex items-center gap-3">
              <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              <div>
                <p className="font-bold text-green-700 dark:text-green-400">{t.splitter.splitComplete}</p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  {result.files.length} {plural(t.common.file, result.files.length)} from {result.pageCount} {plural(t.common.page, result.pageCount)} · {formatFileSize(totalOutput)}
                </p>
              </div>
            </div>

            {result.files.length > 1 && (
              <button onClick={handleDownloadZip}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700">
                <FileArchive className="h-4 w-4" /> {t.splitter.downloadAllZip} ({formatFileSize(totalOutput)})
              </button>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {result.files.map((file, idx) => (
                <div key={idx}
                  className="flex items-center gap-3 rounded-lg bg-white p-3 dark:bg-neutral-800">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-red-500/10">
                    <FileText className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{file.fileName}</p>
                    <p className="text-xs text-neutral-500">{file.label} · {formatFileSize(file.size)}</p>
                  </div>
                  <button onClick={() => handleDownloadOne(idx)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700">
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy note */}
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{t.common.privateFree}</p>
            <p className="text-sm text-neutral-500">{t.common.privacyPdf}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
