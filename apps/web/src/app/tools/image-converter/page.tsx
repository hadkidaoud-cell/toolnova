"use client";

import React, { useState, useCallback, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { UpgradeGate } from "@/components/billing/upgrade-gate";
import { usePlan } from "@/components/billing/plan-provider";
import { useI18n } from "@/i18n";
import { RefreshCw } from "lucide-react";

const RELATED_SLUGS = ["image-resizer", "image-cropper", "image-compressor"] as const;

const RELATED_ICONS: Record<string, string> = {
  "image-resizer": "↗",
  "image-cropper": "⌗",
  "image-compressor": "▼",
};

const LONG_DESCRIPTION =
  "Our Image Converter converts PNG, JPEG, and WebP images between formats — right in your browser. Pick an output format, adjust the quality, and convert any number of images at once with no uploads.";

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

interface ImageFile {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
}

interface ConvertResult {
  id: string;
  dataUrl: string;
  size: number;
}

const FAQ = [
  {
    question: "Which conversions are supported?",
    answer: "PNG, JPEG, and WebP can be converted to any of the three formats, with a quality slider for JPEG and WebP output.",
  },
  {
    question: "What happens to transparency?",
    answer: "PNG keeps transparency. Converting to JPEG replaces transparent areas with white, since JPEG has no alpha channel.",
  },
  {
    question: "Where are my images processed?",
    answer: "100% in your browser. Images are never uploaded to any server.",
  },
];

const ARTICLE = {
  title: "Convert Without Compromise",
  content:
    "Web design often demands the same image in several formats: PNG for logos, JPEG for photos, WebP for performance. Converting manually between tools is slow and risks quality loss. Batch conversion with a quality control keeps your library consistent — and keeps your images private.",
};

export default function ImageConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["image-converter"];
  const ic = t.imageConverter;
  const common = t.common;
  const { plan, limitFor } = usePlan();

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <RefreshCw className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/image" },
      { label: meta.name, href: "/tools/image-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [images, setImages] = useState<ImageFile[]>([]);
  const [results, setResults] = useState<Map<string, ConvertResult>>(new Map());
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("png");
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const batchLimit = limitFor("imageBatch");
  const overLimit = plan === "free" && batchLimit !== null && images.length > batchLimit;

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
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
      });
      valid.push({ id, name: file.name, size: file.size, dataUrl, width: img.width, height: img.height });
    }
    setImages((prev) => [...prev, ...valid]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const convertSingle = useCallback(
    (image: ImageFile): Promise<ConvertResult> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            if (format === "jpeg") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
          }
          const mimeType = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
          const outDataUrl = canvas.toDataURL(mimeType, quality / 100);
          const outSize = Math.round((outDataUrl.length * 3) / 4);
          resolve({ id: image.id, dataUrl: outDataUrl, size: outSize });
        };
        img.src = image.dataUrl;
      });
    },
    [format, quality]
  );

  const convertAll = useCallback(async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setResults(new Map());
    setProgress({ completed: 0, total: images.length });
    const newResults = new Map(results);
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img) continue;
      const result = await convertSingle(img);
      newResults.set(img.id, result);
      setProgress({ completed: i + 1, total: images.length });
    }
    setResults(newResults);
    setProcessing(false);
  }, [images, results, convertSingle]);

  const downloadImage = useCallback(
    (result: ConvertResult, name: string) => {
      const link = document.createElement("a");
      link.href = result.dataUrl;
      const ext = format === "png" ? "png" : format === "webp" ? "webp" : "jpg";
      link.download = name.replace(/\.[^.]+$/, "") + `.${ext}`;
      link.click();
    },
    [format]
  );

  const downloadAll = useCallback(() => {
    results.forEach((result, id) => {
      const img = images.find((i) => i.id === id);
      if (img) downloadImage(result, img.name);
    });
  }, [results, images, downloadImage]);

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
          <p className="mt-3 font-medium text-neutral-700 dark:text-neutral-300">{common.dropImages}</p>
          <p className="mt-1 text-sm text-neutral-400">{common.imgFormats50mb}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
        {plan === "free" && batchLimit !== null && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {ic.freeBatchLimit.replace("{count}", String(batchLimit))}
          </p>
        )}

        {overLimit && batchLimit !== null && (
          <UpgradeGate description={ic.freeBatchLimit.replace("{count}", String(batchLimit))} />
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>{ic.outputFormat}</label>
            <div className="flex gap-2">
              {(["jpeg", "png", "webp"] as const).map((f) => (
                <button
                  key={f}
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
            <label className={labelCls}>{ic.quality}: {quality}%</label>
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
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={convertAll}
              disabled={images.length === 0 || processing || overLimit}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {processing
                ? ic.processing.replace("{done}", String(progress.completed)).replace("{total}", String(progress.total))
                : ic.convertAll.replace("{count}", String(images.length))}
            </button>
            {results.size > 0 && (
              <button onClick={downloadAll} className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
                {ic.downloadAll}
              </button>
            )}
          </div>
        </div>

        {images.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-800">
            <p className="text-neutral-400">{ic.noImagesUploaded}</p>
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
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                        <span>{format.toUpperCase()} | {formatFileSize(result.size)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {result && (
                      <button onClick={() => downloadImage(result, img.name)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
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
