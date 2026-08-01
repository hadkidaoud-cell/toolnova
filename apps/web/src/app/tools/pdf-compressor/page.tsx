"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import {
  FileArchive,
  ShieldCheck,
  Gauge,
  Download,
  RefreshCw,
  Eye,
  Loader2,
  Settings2,
} from "lucide-react";
import { compressPdf, analyzePdf, PRESETS, type CompressionMode, type CompressResult } from "@/lib/pdf-compressor";

const RELATED_SLUGS = ["pdf-merger", "resume-builder", "image-compressor"] as const;

const RELATED_ICONS: Record<string, string> = {
  "pdf-merger": "M",
  "resume-builder": "R",
  "image-compressor": "I",
};

const LONG_DESCRIPTION =
  "Our PDF Compressor shrinks your PDF files entirely in your browser — nothing is uploaded. It combines a lossless structural pass (object streams + metadata cleanup) with an optional page re-encoding engine that recompresses images at your chosen DPI and quality. Pick Lossless for text-heavy documents, or Balanced/Maximum to aggressively reduce scanned and image-heavy PDFs.";

const FAQ = [
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. Everything happens locally in your browser using pdf-lib and PDF.js. Your file never leaves your device, which makes the tool private, fast, and unlimited — even for sensitive documents.",
  },
  {
    question: "What is the difference between Lossless and Balanced?",
    answer:
      "Lossless only restructures the PDF (compressed object streams, metadata removal) and never touches pixels — ideal for text-heavy files. Balanced and Maximum re-encode page images at a lower DPI and JPEG quality, which gives the biggest savings on scanned or image-heavy PDFs but is lossy.",
  },
  {
    question: "Will text stay selectable after compression?",
    answer:
      "With Lossless mode, yes — everything is preserved. With Balanced/Maximum, pages are re-encoded as optimized images, so text is no longer selectable. For documents you need to edit or search, use Lossless.",
  },
  {
    question: "What file size is supported?",
    answer:
      "There is no hard limit. Very large PDFs (over 100MB) may take longer and use more memory since processing happens on your device. For best results, compress files under 150MB.",
  },
];

const ARTICLE = {
  title: "PDF Compression Best Practices",
  content:
    "Scanned PDFs and image-heavy documents benefit most from compression: re-encoding embedded images at 150 DPI with ~70% JPEG quality typically cuts file size by 50-80% with little visible loss. Text-only PDFs are already compact and gain the most from structural optimization like object streams and metadata cleanup. Always keep a copy of the original before lossy compression, and pick Lossless mode when the document must stay editable or searchable.",
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

/** Create a Blob from a Uint8Array (handles TS 5.7 generic typed arrays). */
function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes.slice().buffer as ArrayBuffer], { type });
}

function getSavingsColor(percent: number): string {
  if (percent > 50) return "#198754";
  if (percent > 20) return "#ffc107";
  return "#dc3545";
}

function plural(u: { one: string; other: string }, n: number): string {
  return n === 1 ? u.one : u.other;
}

export default function PdfCompressorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.document;
  const meta = t.meta["pdf-compressor"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "document",
    icon: <FileArchive className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/document" },
      { label: meta.name, href: "/tools/pdf-compressor" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const presetLabels: Record<string, { label: string; description: string }> = {
    lossless: { label: t.compressor.presetLossless, description: t.compressor.presetLosslessDesc },
    balanced: { label: t.compressor.presetBalanced, description: t.compressor.presetBalancedDesc },
    maximum: { label: t.compressor.presetMaximum, description: t.compressor.presetMaximumDesc },
  };

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [mode, setMode] = useState<CompressionMode>("balanced");
  const [dpi, setDpi] = useState(150);
  const [quality, setQuality] = useState(72);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState({ page: 0, total: 0 });
  const [result, setResult] = useState<CompressResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up the object URL when the result changes or unmounts.
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResult(null);
    setResultUrl(null);
    setShowPreview(false);
    setError("");
  }, [resultUrl]);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError(t.common.invalidPdf);
      return;
    }
    reset();
    setFileName(file.name);
    setFileSize(file.size);
    setFileBytes(null);
    setPageCount(null);

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setFileBytes(bytes);

    const info = await analyzePdf(bytes);
    setPageCount(info?.pageCount ?? null);
  }, [reset, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleCompress = useCallback(async () => {
    if (!fileBytes) return;
    setCompressing(true);
    setError("");
    setResult(null);
    setShowPreview(false);

    try {
      const preset = PRESETS.find((p) => p.mode === mode) ?? PRESETS[1]!;
      const res = await compressPdf({
        data: fileBytes,
        fileName,
        preset,
        dpi,
        quality: quality / 100,
        onProgress: (page, total) => setProgress({ page, total }),
      });
      setResult(res);
      setResultUrl(URL.createObjectURL(bytesToBlob(res.bytes, "application/pdf")));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.compressor.compressionFailed);
    } finally {
      setCompressing(false);
      setProgress({ page: 0, total: 0 });
    }
  }, [fileBytes, fileName, mode, dpi, quality, t]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = resultUrl!;
    a.download = fileName.replace(/\.pdf$/i, "") + "-compressed.pdf";
    a.click();
  }, [result, resultUrl, fileName]);

  const selectedPreset = PRESETS.find((p) => p.mode === mode) ?? PRESETS[1]!;
  const savingsColor = result ? getSavingsColor(result.savingsPercent) : undefined;

  const strategyText = result
    ? result.strategyKind === "optimized"
      ? t.compressor.strategyOptimized
      : `${result.strategyKind === "reencode"
          ? t.compressor.strategyReencode
              .replace("{dpi}", String(result.dpi ?? 150))
              .replace("{quality}", String(Math.round((result.quality ?? 0.7) * 100)))
          : t.compressor.strategyStructural
        } — ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}`
    : "";

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
              <FileArchive className="h-6 w-6 text-red-500" />
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
            <button onClick={() => { reset(); setFileName(""); setFileSize(0); setFileBytes(null); setPageCount(null); }}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
              {t.common.remove}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
              className="hidden" />
          </div>
        )}

        {/* Compression presets */}
        {fileBytes && (
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Gauge className="h-4 w-4" /> {t.compressor.compressionMode}
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {PRESETS.map((p) => {
                const labels = presetLabels[p.mode];
                return (
                  <button key={p.mode}
                    onClick={() => setMode(p.mode)}
                    className={`rounded-lg border-2 p-3 text-left transition-all ${
                      mode === p.mode
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                        : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
                    }`}
                  >
                    <div className={`text-sm font-bold ${mode === p.mode ? "text-brand-600 dark:text-brand-400" : "text-neutral-900 dark:text-white"}`}>
                      {labels?.label ?? p.label}
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-neutral-500">{labels?.description ?? p.description}</div>
                  </button>
                );
              })}
            </div>

            {/* Advanced / custom controls */}
            <button
              onClick={() => setMode((m) => (m === "custom" ? "balanced" : "custom"))}
              className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${
                mode === "custom" ? "text-brand-600 dark:text-brand-400" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" /> {t.compressor.customSettings}
            </button>

            {mode === "custom" && (
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex justify-between text-xs font-medium text-neutral-500">
                    <span>{t.compressor.resolution}</span>
                    <span className="font-mono text-brand-600 dark:text-brand-400">{dpi} DPI</span>
                  </label>
                  <input type="range" min={72} max={300} step={1} value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>{t.common.smaller}</span>
                    <span>{t.common.sharper}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 flex justify-between text-xs font-medium text-neutral-500">
                    <span>{t.compressor.jpegQuality}</span>
                    <span className="font-mono text-brand-600 dark:text-brand-400">{quality}%</span>
                  </label>
                  <input type="range" min={30} max={95} step={1} value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>{t.common.smaller}</span>
                    <span>{t.common.better}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedPreset.dpi && (
              <p className="mt-3 text-xs text-neutral-400">
                {t.compressor.presetInfo
                  .replace("{label}", presetLabels[selectedPreset.mode]?.label ?? selectedPreset.label)
                  .replace("{dpi}", String(selectedPreset.dpi))
                  .replace("{quality}", String(Math.round((selectedPreset.quality ?? 0.7) * 100)))}
              </p>
            )}

            <button onClick={handleCompress} disabled={compressing}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
              {compressing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {progress.total > 0
                    ? t.compressor.compressingProgress.replace("{page}", String(progress.page)).replace("{total}", String(progress.total))
                    : t.compressor.compressing}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> {t.compressor.compress}
                </>
              )}
            </button>

            {compressing && progress.total > 0 && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-brand-200 dark:bg-brand-800">
                  <div className="h-full rounded-full bg-brand-600 transition-all"
                    style={{ width: `${(progress.page / progress.total) * 100}%` }} />
                </div>
              </div>
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
                <p className="font-bold text-green-700 dark:text-green-400">{t.compressor.compressionComplete}</p>
                <p className="text-xs text-green-600 dark:text-green-500">{strategyText}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-white p-3 text-center dark:bg-neutral-800">
                <p className="text-xs text-neutral-500">{t.common.original}</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{formatFileSize(result.originalSize)}</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center dark:bg-neutral-800">
                <p className="text-xs text-neutral-500">{t.common.compressed}</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{formatFileSize(result.compressedSize)}</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center dark:bg-neutral-800">
                <p className="text-xs text-neutral-500">{t.common.saved}</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{formatFileSize(result.originalSize - result.compressedSize)}</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center dark:bg-neutral-800">
                <p className="text-xs text-neutral-500">{t.common.reduction}</p>
                <p className="text-lg font-bold" style={{ color: savingsColor }}>
                  {result.savingsPercent > 0 ? "-" : ""}{Math.abs(result.savingsPercent)}%
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleDownload}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 sm:flex-none sm:px-8">
                <Download className="h-4 w-4" /> {t.compressor.downloadCompressed}
              </button>
              <button onClick={() => setShowPreview((s) => !s)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-600 bg-white px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-600 dark:bg-neutral-800 dark:text-green-400 sm:flex-none sm:px-6">
                <Eye className="h-4 w-4" /> {showPreview ? t.common.hidePreview : t.common.preview}
              </button>
            </div>

            {showPreview && (
              <iframe src={resultUrl!} className="mt-4 h-[500px] w-full rounded-lg border-none bg-white" title={t.compressor.previewTitle} />
            )}
          </div>
        )}

        {/* Privacy note */}
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{t.common.privateFree}</p>
            <p className="text-sm text-neutral-500">{t.common.privacyPdfJs}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
