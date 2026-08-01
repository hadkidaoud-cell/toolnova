"use client";

import React, { useState, useCallback, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Image as ImageIcon } from "lucide-react";

const RELATED_SLUGS = ["color-picker", "qr-code-generator", "image-to-pdf"] as const;

const RELATED_ICONS: Record<string, string> = {
  "color-picker": "●",
  "qr-code-generator": "▦",
  "image-to-pdf": "I",
};

const LONG_DESCRIPTION =
  "Our Image Compressor uses the Canvas API to re-encode images with adjustable quality. Upload images, adjust quality settings, choose output format, and download compressed versions. Supports batch compression for multiple files at once.";

const FAQ = [
  {
    question: "How does image compression work?",
    answer: "Our tool uses the Canvas API to re-encode images. For JPEG and WebP, the quality parameter controls the compression level (higher = better quality, larger file). PNG compression is lossless but can reduce file size through color reduction.",
  },
  {
    question: "Where are my images processed?",
    answer: "All processing happens entirely in your browser. Your images are never uploaded to any server. This makes the tool fast and privacy-friendly.",
  },
  {
    question: "What file types are supported?",
    answer: "We support JPEG, PNG, and WebP input formats. Output formats include JPEG, PNG, and WebP.",
  },
];

const ARTICLE = {
  title: "Image Compression Best Practices",
  content:
    "For web use, JPEG at 80% quality offers a great balance of size and quality. PNG is best for images with transparency or text. WebP provides superior compression but isn't supported by all browsers yet. Always keep original files as backups when compressing images.",
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

interface ImageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  width: number;
  height: number;
}

interface CompressResult {
  id: string;
  dataUrl: string;
  size: number;
  savingsPercent: number;
  processingTime: number;
}

function getSavingsColor(percent: number): string {
  if (percent > 50) return "#198754";
  if (percent > 20) return "#ffc107";
  return "#dc3545";
}

export default function ImageCompressorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["image-compressor"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <ImageIcon className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/design" },
      { label: meta.name, href: "/tools/image-compressor" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [images, setImages] = useState<ImageFile[]>([]);
  const [results, setResults] = useState<Map<string, CompressResult>>(new Map());
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [quality, setQuality] = useState(85);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const incoming = Array.from(files);
    const valid: ImageFile[] = [];

    for (const file of incoming) {
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) continue;
      if (file.size > 50 * 1024 * 1024) continue;

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
      });

      valid.push({ id, name: file.name, size: file.size, type: file.type, dataUrl, width: img.width, height: img.height });
    }

    setImages((prev) => [...prev, ...valid]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const compressSingle = useCallback((image: ImageFile): Promise<CompressResult> => {
    return new Promise((resolve) => {
      const start = performance.now();
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        let mimeType = "image/jpeg";
        if (format === "png") mimeType = "image/png";
        else if (format === "webp") mimeType = "image/webp";

        const outDataUrl = canvas.toDataURL(mimeType, quality / 100);
        const outSize = Math.round((outDataUrl.length * 3) / 4);
        const savingsPercent = image.size > 0 ? Math.round((1 - outSize / image.size) * 100) : 0;
        const processingTime = Math.round(performance.now() - start);

        resolve({ id: image.id, dataUrl: outDataUrl, size: outSize, savingsPercent, processingTime });
      };
      img.src = image.dataUrl;
    });
  }, [format, quality]);

  const compressAll = useCallback(async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setResults(new Map());
    setProgress({ completed: 0, total: images.length });

    const newResults = new Map(results);
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img) continue;
      const result = await compressSingle(img);
      newResults.set(img.id, result);
      setProgress({ completed: i + 1, total: images.length });
    }
    setResults(newResults);
    setProcessing(false);
  }, [images, compressSingle]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setResults((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    setResults(new Map());
  }, []);

  const downloadImage = useCallback((result: CompressResult, name: string) => {
    const link = document.createElement("a");
    link.href = result.dataUrl;
    const ext = format === "png" ? "png" : format === "webp" ? "webp" : "jpg";
    link.download = name.replace(/\.[^.]+$/, "") + `-compressed.${ext}`;
    link.click();
  }, [format]);

  const downloadAll = useCallback(() => {
    results.forEach((result, id) => {
      const img = images.find((i) => i.id === id);
      if (img) downloadImage(result, img.name);
    });
  }, [results, images, downloadImage]);

  const totalOriginal = images.reduce((sum, img) => sum + img.size, 0);
  const totalCompressed = Array.from(results.values()).reduce((sum, r) => sum + r.size, 0);
  const totalSavings = totalOriginal - totalCompressed;
  const totalSavingsPercent = totalOriginal > 0 ? Math.round((totalSavings / totalOriginal) * 100) : 0;

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
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
            dragOver ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800"
          }`}
        >
          <svg className="mx-auto h-12 w-12 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <p className="mt-3 font-medium text-neutral-700 dark:text-neutral-300">{t.common.dropImages}</p>
          <p className="mt-1 text-sm text-neutral-400">{t.common.imgFormats50mb}</p>
          <input ref={fileInputRef} type="file" multiple accept="image/png,image/jpeg,image/webp"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t.imageCompressor.outputFormat}</label>
            <div className="flex gap-2">
              {(["jpeg", "png", "webp"] as const).map((f) => (
                <button key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    format === f
                      ? "bg-brand-600 text-white"
                      : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t.imageCompressor.qualityLabel.replace("{quality}", String(quality))}</label>
            <input type="range" min={1} max={100} value={quality}
              onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>{t.common.smaller}</span>
              <span>{t.common.better}</span>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button onClick={compressAll} disabled={images.length === 0 || processing}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {processing
                ? t.imageCompressor.compressingProgress.replace("{done}", String(progress.completed)).replace("{total}", String(progress.total))
                : t.imageCompressor.compressAll.replace("{count}", String(images.length))}
            </button>
            {results.size > 0 && (
              <button onClick={downloadAll}
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
                {t.imageCompressor.downloadAll}
              </button>
            )}
          </div>
        </div>

        {processing && (
          <div className="rounded-lg bg-brand-50 p-3 dark:bg-brand-900/20">
            <div className="h-2 overflow-hidden rounded-full bg-brand-200 dark:bg-brand-800">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(progress.completed / progress.total) * 100}%` }} />
            </div>
            <p className="mt-1 text-center text-xs text-brand-600 dark:text-brand-400">
              {t.imageCompressor.processing.replace("{done}", String(progress.completed)).replace("{total}", String(progress.total))}
            </p>
          </div>
        )}

        {images.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-800">
            <p className="text-neutral-400">{t.imageCompressor.noImagesUploaded}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((img) => {
              const result = results.get(img.id);
              return (
                <div key={img.id} className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    <img src={img.dataUrl} alt={img.name} className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{img.name}</p>
                    <p className="text-xs text-neutral-500">{img.width}×{img.height} | {formatFileSize(img.size)}</p>
                    {result && (
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="text-neutral-400">→ {formatFileSize(result.size)}</span>
                        <span className={`rounded px-1.5 py-0.5 font-bold text-white`} style={{ background: getSavingsColor(result.savingsPercent) }}>
                          {result.savingsPercent > 0 ? "-" : "+"}{Math.abs(result.savingsPercent)}%
                        </span>
                        <span className="text-neutral-400">{result.processingTime}ms</span>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {result ? (
                      <button onClick={() => downloadImage(result, img.name)}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
                        {t.common.download}
                      </button>
                    ) : (
                      <button onClick={() => compressSingle(img).then((r) => setResults((prev) => new Map(prev).set(img.id, r)))}
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {t.imageCompressor.compress}
                      </button>
                    )}
                    <button onClick={() => removeImage(img.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                      {t.common.remove}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {results.size > 0 && (
          <div className="grid grid-cols-4 gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="text-center">
              <p className="text-xs text-neutral-500">{t.common.original}</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{formatFileSize(totalOriginal)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500">{t.common.compressed}</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{formatFileSize(totalCompressed)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500">{t.common.saved}</p>
              <p className="text-lg font-bold" style={{ color: getSavingsColor(totalSavingsPercent) }}>{formatFileSize(Math.abs(totalSavings))}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500">{t.common.reduction}</p>
              <p className="text-lg font-bold" style={{ color: getSavingsColor(totalSavingsPercent) }}>
                {totalSavingsPercent > 0 ? "-" : ""}{Math.abs(totalSavingsPercent)}%
              </p>
            </div>
          </div>
        )}

        {images.length > 0 && (
          <button onClick={clearAll}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-neutral-800 dark:text-red-400">
            {t.common.clearAll}
          </button>
        )}
      </div>
    </ToolLayout>
  );
}
