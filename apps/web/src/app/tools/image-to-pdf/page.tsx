"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import {
  FileImage,
  ShieldCheck,
  Download,
  RefreshCw,
  Eye,
  Loader2,
  Settings2,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  convertImagesToPdf,
  decodeImageFile,
  reencodeToJpeg,
  PAGE_SIZE_OPTIONS,
  DEFAULT_OPTIONS,
  type EmbeddedImage,
  type FitMode,
  type Orientation,
  type PageSizeKey,
} from "@/lib/image-to-pdf";

const RELATED_SLUGS = ["pdf-merger", "pdf-compressor", "image-compressor"] as const;

const RELATED_ICONS: Record<string, string> = {
  "pdf-merger": "M",
  "pdf-compressor": "Z",
  "image-compressor": "I",
};

const LONG_DESCRIPTION =
  "Turn your images into a single PDF in your browser — nothing is uploaded. Drag in JPG, PNG, WebP, GIF or BMP files, reorder them, pick a page size (A4, Letter, Legal or fit-to-image), tune the margins and orientation, then download a high-quality PDF. An optional compression mode re-encodes images as optimized JPEGs to keep the file small. Powered by pdf-lib.";

const FAQ = [
  {
    question: "Are my images uploaded to a server?",
    answer:
      "No. Everything happens locally in your browser using pdf-lib. Your images never leave your device, which makes the tool private, fast, and free of upload limits — even for sensitive photos and scans.",
  },
  {
    question: "Which image formats are supported?",
    answer:
      "JPG and PNG are embedded as-is (lossless). WebP, GIF and BMP are automatically converted to PNG in your browser before embedding, so every format keeps its quality.",
  },
  {
    question: "What does 'Fit to image' page size do?",
    answer:
      "Each page is sized to exactly match its image (scaled down only for extremely large images), so there is no white space around your photos. Choose A4, Letter or Legal when you want a standard document layout instead.",
  },
  {
    question: "Will the quality be reduced?",
    answer:
      "By default, no — original images are embedded directly. The optional compression mode re-encodes images as JPEG at your chosen quality level, which can shrink the PDF dramatically on photo-heavy documents.",
  },
];

const ARTICLE = {
  title: "Image to PDF Best Practices",
  content:
    "For multi-page documents like scanned contracts or product sheets, pick a fixed page size (A4 or Letter) so every page is uniform, and use 'Fit to image' when you want each page to match its source photo exactly. Keep the default 'Contain' fit to avoid cropping; use 'Cover' only when a full-bleed look matters. If the output PDF is too large, enable compression and lower the JPEG quality — photo PDFs stay crisp down to ~70%, while text scans can tolerate lower values.",
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

const ACCEPTED = "image/png,image/jpeg,image/webp,image/gif,image/bmp,.png,.jpg,.jpeg,.webp,.gif,.bmp";

export default function ImageToPdfPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.document;
  const meta = t.meta["image-to-pdf"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "document",
    icon: <FileImage className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/document" },
      { label: meta.name, href: "/tools/image-to-pdf" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const pageSizeLabels: Record<PageSizeKey, string> = {
    "fit-image": t.imageToPdf.fitToImage,
    a4: t.imageToPdf.a4,
    letter: t.imageToPdf.letter,
    legal: t.imageToPdf.legal,
  };

  const [images, setImages] = useState<EmbeddedImage[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeKey>(DEFAULT_OPTIONS.pageSize);
  const [orientation, setOrientation] = useState<Orientation>(DEFAULT_OPTIONS.orientation);
  const [marginPt, setMarginPt] = useState(DEFAULT_OPTIONS.marginPt);
  const [fit, setFit] = useState<FitMode>(DEFAULT_OPTIONS.fit);
  const [compress, setCompress] = useState(false);
  const [quality, setQuality] = useState(72);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState({ page: 0, total: 0 });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [result, setResult] = useState<{ pageCount: number; inputSize: number; outputSize: number } | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFiles = useCallback(async (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const accepted = list.filter((f) =>
      /\.(png|jpe?g|webp|gif|bmp)$/i.test(f.name) || /^image\/(png|jpeg|webp|gif|bmp)$/.test(f.type)
    );
    if (accepted.length !== list.length) {
      setError(t.imageToPdf.someSkipped);
    }

    const decoded: EmbeddedImage[] = [];
    for (const file of accepted) {
      try {
        decoded.push(await decodeImageFile(file));
      } catch {
        setError(t.common.failedLoadImage.replace("{name}", file.name));
      }
    }
    if (decoded.length) {
      setImages((prev) => [...prev, ...decoded]);
      setResult(null);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
      setError("");
    }
  }, [resultUrl, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    setResult(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
  }, [resultUrl]);

  const moveImage = useCallback((from: number, to: number) => {
    if (from === to) return;
    setImages((prev) => {
      const arr = [...prev];
      const item = arr[from]!;
      arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setResult(null);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!images.length) return;
    setConverting(true);
    setError("");
    setResult(null);
    setShowPreview(false);

    try {
      let toEmbed = images;
      if (compress) {
        toEmbed = await Promise.all(images.map((img) => reencodeToJpeg(img, quality / 100)));
      }
      const res = await convertImagesToPdf(
        toEmbed,
        { pageSize, orientation, marginPt, fit },
        (page, total) => setProgress({ page, total })
      );
      setResult({ pageCount: res.pageCount, inputSize: res.inputSize, outputSize: res.outputSize });
      setResultUrl(URL.createObjectURL(bytesToBlob(res.bytes, "application/pdf")));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.imageToPdf.conversionFailed);
    } finally {
      setConverting(false);
      setProgress({ page: 0, total: 0 });
    }
  }, [images, compress, quality, pageSize, orientation, marginPt, fit, t]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const base = images[0]?.name.replace(/\.[^.]+$/, "") || "images";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}-combined.pdf`;
    a.click();
  }, [resultUrl, images]);

  const fitImage = pageSize === "fit-image";
  const totalSize = images.reduce((s, i) => s + i.bytes.length, 0);
  const savings = result && result.inputSize > 0 ? Math.round((1 - result.outputSize / result.inputSize) * 100) : 0;

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

        {/* Drop zone */}
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
          <FileImage className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-3 font-medium text-neutral-700 dark:text-neutral-300">{t.common.dropImages}</p>
          <p className="mt-1 text-sm text-neutral-400">{t.common.imagesOnly}</p>
          <input ref={fileInputRef} type="file" multiple accept={ACCEPTED}
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
            className="hidden" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Image list */}
            {images.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-neutral-400">{t.common.noImages}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== idx) moveImage(dragIdx, idx); setDragIdx(null); }}
                    onDragEnd={() => setDragIdx(null)}
                    className="flex items-center gap-3 rounded-xl border-2 border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <span className="cursor-grab text-neutral-400" title={t.common.dragToReorder}>⠿</span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white">{idx + 1}</span>
                    <img
                      src={img.thumb}
                      alt={img.name}
                      className="h-12 w-14 shrink-0 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{img.name}</p>
                      <p className="text-xs text-neutral-500">
                        {img.width} × {img.height} px · {formatFileSize(img.bytes.length)} · {img.format.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => moveImage(idx, idx - 1)} disabled={idx === 0}
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 dark:hover:bg-neutral-700"
                        title={t.common.moveUp}>
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => moveImage(idx, idx + 1)} disabled={idx === images.length - 1}
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 dark:hover:bg-neutral-700"
                        title={t.common.moveDown}>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeImage(img.id)}
                        className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        title={t.common.remove}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings + convert */}
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <button
                onClick={() => setShowSettings((s) => !s)}
                className="flex w-full items-center justify-between text-sm font-bold text-neutral-900 dark:text-white"
              >
                <span className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> {t.imageToPdf.settings}</span>
                <span className="text-xs font-normal text-neutral-400">{showSettings ? t.imageToPdf.hide : t.imageToPdf.show}</span>
              </button>

              {showSettings && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">{t.imageToPdf.pageSize}</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PAGE_SIZE_OPTIONS.map((opt) => (
                        <button key={opt.key}
                          onClick={() => setPageSize(opt.key)}
                          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                            pageSize === opt.key
                              ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {pageSizeLabels[opt.key]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={fitImage ? "pointer-events-none opacity-40" : ""}>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">{t.imageToPdf.orientation}</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["portrait", "landscape"] as Orientation[]).map((o) => (
                        <button key={o}
                          onClick={() => setOrientation(o)}
                          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                            orientation === o
                              ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {o === "portrait" ? t.imageToPdf.portrait : t.imageToPdf.landscape}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={fitImage ? "pointer-events-none opacity-40" : ""}>
                    <label className="mb-1 flex justify-between text-xs font-medium text-neutral-500">
                      <span>{t.imageToPdf.margin}</span>
                      <span className="font-mono text-brand-600 dark:text-brand-400">{(marginPt / 72).toFixed(2)} in</span>
                    </label>
                    <input type="range" min={0} max={144} step={6} value={marginPt}
                      onChange={(e) => setMarginPt(Number(e.target.value))} className="w-full" />
                  </div>

                  <div className={fitImage ? "pointer-events-none opacity-40" : ""}>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">{t.imageToPdf.imageFit}</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["contain", "cover"] as FitMode[]).map((f) => (
                        <button key={f}
                          onClick={() => setFit(f)}
                          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                            fit === f
                              ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {f === "contain" ? t.imageToPdf.contain : t.imageToPdf.cover}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compression toggle */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <label className="flex cursor-pointer items-center justify-between text-sm font-bold text-neutral-900 dark:text-white">
                <span className="flex items-center gap-2">{t.imageToPdf.compressImages}</span>
                <input type="checkbox" checked={compress} onChange={(e) => setCompress(e.target.checked)}
                  className="h-4 w-4 accent-brand-600" />
              </label>
              {compress && (
                <div className="mt-3">
                  <label className="mb-1 flex justify-between text-xs font-medium text-neutral-500">
                    <span>{t.compressor.jpegQuality}</span>
                    <span className="font-mono text-brand-600 dark:text-brand-400">{quality}%</span>
                  </label>
                  <input type="range" min={30} max={95} step={1} value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
                  <p className="mt-1 text-xs text-neutral-400">{t.imageToPdf.reencodeNote}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800">
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-neutral-500">{t.imageToPdf.images}</span><span className="font-medium">{images.length}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">{t.merger.totalSize}</span><span className="font-medium">{formatFileSize(totalSize)}</span></div>
                {result && (
                  <>
                    <div className="flex justify-between"><span className="text-neutral-500">{t.imageToPdf.output}</span><span className="font-medium">{formatFileSize(result.outputSize)}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">{t.imageToPdf.pages}</span><span className="font-medium">{result.pageCount}</span></div>
                  </>
                )}
              </div>
            </div>

            <button onClick={handleConvert} disabled={!images.length || converting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
              {converting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {progress.total > 0
                    ? t.imageToPdf.addingImage.replace("{page}", String(progress.page)).replace("{total}", String(progress.total))
                    : compress ? t.imageToPdf.compressingImages : t.imageToPdf.converting}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> {t.imageToPdf.convertToPdf}
                </>
              )}
            </button>

            {converting && progress.total > 0 && (
              <div className="h-2 overflow-hidden rounded-full bg-brand-200 dark:bg-brand-800">
                <div className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: `${(progress.page / progress.total) * 100}%` }} />
              </div>
            )}

            {images.length > 0 && (
              <button onClick={() => { setImages([]); setResult(null); if (resultUrl) URL.revokeObjectURL(resultUrl); setResultUrl(null); }}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {t.common.clearAll}
              </button>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl border-2 border-green-500 bg-green-50 p-5 dark:bg-green-900/20">
            <div className="mb-4 flex items-center gap-3">
              <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              <div>
                <p className="font-bold text-green-700 dark:text-green-400">{t.imageToPdf.pdfReady}</p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  {result.pageCount} {plural(t.common.page, result.pageCount)} · {formatFileSize(result.outputSize)}
                  {savings > 0 ? ` · ${t.imageToPdf.smallerThanSource.replace("{savings}", String(savings))}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleDownload}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 sm:flex-none sm:px-8">
                <Download className="h-4 w-4" /> {t.imageToPdf.downloadPdf}
              </button>
              <button onClick={() => setShowPreview((s) => !s)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-600 bg-white px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-600 dark:bg-neutral-800 dark:text-green-400 sm:flex-none sm:px-6">
                <Eye className="h-4 w-4" /> {showPreview ? t.common.hidePreview : t.common.preview}
              </button>
            </div>

            {showPreview && (
              <iframe src={resultUrl!} className="mt-4 h-[500px] w-full rounded-lg border-none bg-white" title={t.imageToPdf.previewTitle} />
            )}
          </div>
        )}

        {/* Privacy note */}
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{t.common.privateFree}</p>
            <p className="text-sm text-neutral-500">{t.common.privacyImages}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
