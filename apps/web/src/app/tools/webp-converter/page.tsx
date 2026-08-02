"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { UpgradeGate } from "@/components/billing/upgrade-gate";
import { usePlan } from "@/components/billing/plan-provider";
import { useI18n } from "@/i18n";
import { ImageIcon } from "lucide-react";
import { detectImageFormat, encodeToWebp, encodeFromWebp, type ImageFormat, type WebpTarget } from "@/lib/webp";
import { formatFileSize, loadImage, webpEncodeSupported } from "@/lib/image-utils";

const RELATED_SLUGS = ["image-converter", "image-compressor", "image-resizer"] as const;

const RELATED_ICONS: Record<string, string> = {
  "image-converter": "↔",
  "image-compressor": "🖼",
  "image-resizer": "↗",
};

const LONG_DESCRIPTION =
  "WebP Converter turns any image into a compact WebP file — and back. Choose the direction, tune the quality slider, and convert whole batches in your browser. The encoder behind the scenes is the same libwebp your browser uses for WebP output, so files stay crisp and small.";

const FAQ = [
  {
    question: "Why convert images to WebP?",
    answer:
      "WebP compresses photos 25-35% smaller than JPEG at the same quality, and supports transparency like PNG. Switching to WebP means faster pages and lower bandwidth for the same look.",
  },
  {
    question: "Is the conversion lossy?",
    answer:
      "The quality slider controls lossy compression. Lower values shrink files more; higher values keep more detail. JPEG output replaces transparency with white since JPEG has no alpha channel.",
  },
  {
    question: "Are my images uploaded anywhere?",
    answer: "No. Everything happens locally in your browser using the native canvas WebP encoder — your files never leave your device.",
  },
];

const ARTICLE = {
  title: "Smaller Images, Better Web",
  content:
    "Every millisecond of load time matters, and images are usually the heaviest part of a page. WebP gives you modern compression with broad browser support, which makes it the practical default for the web. Convert, compare the saved percentage, and keep your library consistent.",
};

interface WebpImage {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
  format: ImageFormat;
}

interface WebpResult {
  dataUrl: string;
  size: number;
}

type Mode = "toWebp" | "fromWebp";

export default function WebpConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["webp-converter"];
  const wc = t.webpConverter;
  const common = t.common;
  const { plan, limitFor } = usePlan();

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <ImageIcon className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/image" },
      { label: meta.name, href: "/tools/webp-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [mode, setMode] = useState<Mode>("toWebp");
  const [targetFormat, setTargetFormat] = useState<WebpTarget>("png");
  const [quality, setQuality] = useState(80);
  const [images, setImages] = useState<WebpImage[]>([]);
  const [results, setResults] = useState<Map<string, WebpResult>>(new Map());
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSupported(webpEncodeSupported());
  }, []);

  const batchLimit = limitFor("imageBatch");
  const overLimit = plan === "free" && batchLimit !== null && images.length > batchLimit;

  const acceptedTypes = mode === "toWebp"
    ? "image/png,image/jpeg,image/webp,image/gif,image/bmp"
    : "image/webp";

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError("");
      const incoming = Array.from(files);
      const valid: WebpImage[] = [];
      for (const file of incoming) {
        if (!file.type.startsWith("image/")) continue;
        if (mode === "fromWebp" && file.type !== "image/webp") continue;
        if (file.size > 50 * 1024 * 1024) continue;
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        try {
          const img = await loadImage(dataUrl);
          valid.push({
            id,
            name: file.name,
            size: file.size,
            dataUrl,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            format: detectImageFormat(file.name, file.type),
          });
        } catch {
          setError(common.failedLoadImage.replace("{name}", file.name));
        }
      }
      setImages((prev) => [...prev, ...valid]);
    },
    [mode, common.failedLoadImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const convertOne = useCallback(
    (image: WebpImage): Promise<WebpResult> => {
      return loadImage(image.dataUrl).then((img) => {
        if (mode === "toWebp") {
          return encodeToWebp(img, quality);
        }
        return encodeFromWebp(img, targetFormat, quality).then(({ dataUrl, size }) => ({ dataUrl, size }));
      });
    },
    [mode, targetFormat, quality]
  );

  const convertAll = useCallback(async () => {
    if (images.length === 0) return;
    if (mode === "toWebp" && !supported) {
      setError(wc.unsupportedNote);
      return;
    }
    setError("");
    setProcessing(true);
    setResults(new Map());
    setProgress({ completed: 0, total: images.length });
    const next = new Map(results);
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image) continue;
      try {
        const result = await convertOne(image);
        next.set(image.id, result);
      } catch {
        setError(common.failedLoadImage.replace("{name}", image.name));
      }
      setProgress({ completed: i + 1, total: images.length });
    }
    setResults(next);
    setProcessing(false);
  }, [images, results, convertOne, mode, supported, common.failedLoadImage, wc.unsupportedNote]);

  const downloadOne = useCallback((image: WebpImage) => {
    const result = results.get(image.id);
    if (!result) return;
    const ext = mode === "toWebp" ? "webp" : targetFormat;
    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = image.name.replace(/\.[^.]+$/, "") + "." + ext;
    link.click();
  }, [results, mode, targetFormat]);

  const downloadAll = useCallback(() => {
    images.forEach(downloadOne);
  }, [images, downloadOne]);

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

  const switchMode = (next: Mode) => {
    setMode(next);
    setImages([]);
    setResults(new Map());
    setError("");
  };

  const labelCls = "mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400";

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
        <div>
          <label className={labelCls}>{wc.targetFormat}</label>
          <div className="flex flex-wrap gap-2">
            {(["toWebp", "fromWebp"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  mode === m
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {m === "toWebp" ? wc.modeToWebp : wc.modeFromWebp}
              </button>
            ))}
          </div>
        </div>

        {mode === "toWebp" && !supported && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            {wc.unsupportedNote}
          </p>
        )}

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
          <p className="mt-3 font-medium text-neutral-700 dark:text-neutral-300">{wc.validFormats}</p>
          <p className="mt-1 text-sm text-neutral-400">{common.imgFormats50mb}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {plan === "free" && batchLimit !== null && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {wc.freeBatchLimit.replace("{count}", String(batchLimit))}
          </p>
        )}

        {overLimit && batchLimit !== null && (
          <UpgradeGate description={wc.freeBatchLimit.replace("{count}", String(batchLimit))} />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{wc.quality}: {quality}%</label>
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>{common.smaller}</span>
              <span>{common.better}</span>
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{wc.lossyNote}</p>
          </div>

          {mode === "fromWebp" && (
            <div>
              <label className={labelCls}>{wc.targetFormat}</label>
              <div className="flex gap-2">
                {(["png", "jpeg"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTargetFormat(f)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      targetFormat === f
                        ? "bg-brand-600 text-white"
                        : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 sm:col-span-2">
            <button
              onClick={convertAll}
              disabled={images.length === 0 || processing || overLimit}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {processing
                ? wc.processing.replace("{done}", String(progress.completed)).replace("{total}", String(progress.total))
                : wc.convertAll.replace("{count}", String(images.length))}
            </button>
            {results.size > 0 && (
              <button onClick={downloadAll} className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
                {wc.downloadAll}
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {images.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-800">
            <p className="text-neutral-400">{wc.noImagesUploaded}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((img) => {
              const result = results.get(img.id);
              const saved = result && result.size < img.size ? Math.round((1 - result.size / img.size) * 100) : null;
              return (
                <div key={img.id} className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    <img src={img.dataUrl} alt={img.name} className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{img.name}</p>
                    <p className="text-xs text-neutral-500">
                      {img.width}×{img.height} | {img.format.toUpperCase()} | {formatFileSize(img.size)}
                    </p>
                    {result && (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-neutral-500">
                          {mode === "toWebp" ? wc.webpSize : targetFormat.toUpperCase()} | {formatFileSize(result.size)}
                        </span>
                        {saved !== null && saved > 0 && (
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {wc.savedPercent.replace("{percent}", String(saved))}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {result && (
                      <button onClick={() => downloadOne(img)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
                        {common.download}
                      </button>
                    )}
                    <button onClick={() => removeImage(img.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                      {common.remove}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {images.length > 0 && (
          <button onClick={clearAll} className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-neutral-800 dark:text-red-400">
            {common.clearAll}
          </button>
        )}
      </div>
    </ToolLayout>
  );
}
