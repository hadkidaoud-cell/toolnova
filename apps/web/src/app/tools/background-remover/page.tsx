"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Wand2, Upload, X, Download, Loader2, Check, Eraser, Layers, Zap } from "lucide-react";
import {
  removeBackground,
  type BgModelId,
  type BgImageData,
} from "@/lib/background-remover";
import {
  canvasFromImage,
  formatFileSize,
  loadImage,
  webpEncodeSupported,
} from "@/lib/image-utils";

const RELATED_SLUGS = ["thumbnail-maker", "image-compressor", "favicon-generator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "thumbnail-maker": "🖼",
  "image-compressor": "▼",
  "favicon-generator": "F",
};

const LONG_DESCRIPTION =
  "Remove the background from any photo automatically with on-device AI. Upload an image, choose between a fast or a high-quality model, and download a clean cut-out with a transparent background — or swap in a solid color. Every pixel is processed locally in your browser, so your image never leaves your device.";

const FAQ = [
  {
    question: "Is my image uploaded anywhere?",
    answer:
      "No. The AI model runs directly in your browser using WebAssembly. Your image is processed on your device and never sent to a server.",
  },
  {
    question: "Which model should I pick?",
    answer:
      "Fast (u2netp) is a 4.5 MB model that handles most photos quickly on any device. High quality (isnet) downloads about 170 MB once and gives sharper edges, especially around hair, fur, and complex subjects.",
  },
  {
    question: "What can I do with the result?",
    answer:
      "Download as PNG to keep full transparency, or pick a solid color background and export as PNG or WebP. Feather, halo removal, and de-fringing sliders let you clean up edges.",
  },
];

const ARTICLE = {
  title: "Why Background Removal Matters",
  content:
    "A clean cut-out is the foundation of product shots, profile pictures, thumbnails, and e-commerce listings. Removing the background by hand is slow and fiddly; AI models like u2netp and isnet do it in seconds with a single click. Because the model runs on your device, there are no uploads, no queues, and no privacy trade-offs.",
};

const CHECKERBOARD = {
  backgroundColor: "#fafafa",
  backgroundImage:
    "linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%), linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 8px 8px",
};

const MAX_DIMENSION = 5000;

function rgbaToCanvas(rgba: Uint8ClampedArray, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);
  return canvas;
}

function composeCanvas(rgba: Uint8ClampedArray, width: number, height: number, bg: string | null): HTMLCanvasElement {
  const source = rgbaToCanvas(rgba, width, height);
  if (!bg) return source;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

export default function BackgroundRemoverPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["background-remover"];
  const br = t.backgroundRemover;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <Wand2 className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/image" },
      { label: meta.name, href: "/tools/background-remover" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [fileName, setFileName] = useState("");
  const [source, setSource] = useState<BgImageData | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [result, setResult] = useState<BgImageData | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [model, setModel] = useState<BgModelId>("u2netp");
  const [feather, setFeather] = useState(0);
  const [halo, setHalo] = useState(0);
  const [defringe, setDefringe] = useState(0);
  const [bgType, setBgType] = useState<"transparent" | "solid">("transparent");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);
  const firstRun = useRef(true);

  const handleFile = useCallback(async (file: File) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return;
    setError("");
    setResult(null);
    setPreviewUrl("");
    setProgress(null);
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    try {
      const img = await loadImage(dataUrl);
      const canvas = canvasFromImage(img);
      let w = canvas.width;
      let h = canvas.height;
      let final = canvas;
      if (Math.max(w, h) > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
        final = document.createElement("canvas");
        final.width = w;
        final.height = h;
        const ctx = final.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(canvas, 0, 0, w, h);
        }
      }
      const ctx = final.getContext("2d");
      if (!ctx) throw new Error("no-canvas");
      const imageData = ctx.getImageData(0, 0, w, h);
      setSource({ rgba: imageData.data, width: w, height: h });
      setOriginalUrl(dataUrl);
      setFileName(file.name);
    } catch {
      setError(br.error);
    }
  }, [br.error]);

  const run = useCallback(async (post: { feather: number; halo: number; defringe: number }) => {
    if (!source) return;
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      const res = await removeBackground(source, model, post, setProgress);
      setResult(res);
    } catch {
      setError(br.error);
      setResult(null);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [source, model, br.error]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!source) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void run({ feather, halo, defringe });
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [feather, halo, defringe, model, source, run]);

  useEffect(() => {
    if (!result) return;
    const bg = bgType === "solid" ? bgColor : null;
    const canvas = composeCanvas(result.rgba, result.width, result.height, bg);
    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [result, bgType, bgColor]);

  const download = useCallback(
    async (format: "png" | "webp") => {
      if (!result) return;
      const bg = bgType === "solid" ? bgColor : null;
      const canvas = composeCanvas(result.rgba, result.width, result.height, bg);
      const mime = format === "webp" ? "image/webp" : "image/png";
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), mime, 0.92);
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(fileName || "image").replace(/\.[^.]+$/, "")}-bg-removed.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [result, bgType, bgColor, fileName]
  );

  const isWebp = typeof window !== "undefined" && webpEncodeSupported();

  const labelCls = "mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400";

  const slider = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    max = 8,
    step = 0.5
  ) => (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className={labelCls}>{label}</label>
        <span className="text-xs tabular-nums text-neutral-400">{value.toFixed(step < 1 ? 1 : 0)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand-600 dark:accent-brand-500"
        aria-label={label}
      />
    </div>
  );

  const busyLabel = () => {
    if (progress === null) return br.removing;
    if (progress < 0.55) return br.downloadingModel.replace("{pct}", String(Math.round((progress / 0.55) * 100)));
    return br.processing;
  };

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
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          {!source ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void handleFile(f);
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                dragActive
                  ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                  : "border-neutral-300 hover:border-brand-400 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:border-brand-500 dark:hover:bg-neutral-800"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {dragActive ? br.dragActive : br.drop}
              </p>
              <p className="text-xs text-neutral-400">{br.formats}</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
              <span className="min-w-0 flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
                {fileName}
              </span>
              <button
                onClick={() => inputRef.current?.click()}
                className="shrink-0 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {br.changeImage}
              </button>
              <button
                onClick={() => {
                  setSource(null);
                  setResult(null);
                  setOriginalUrl("");
                  setPreviewUrl("");
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                aria-label={br.changeImage}
              >
                <X className="h-4 w-4" />
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
            </div>
          )}

          <div>
            <label className={labelCls}>{br.model}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModel("u2netp")}
                className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                  model === "u2netp"
                    ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                    : "border-neutral-300 bg-white hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
                  <Zap className="h-4 w-4 text-brand-500" />
                  {br.modelFast}
                </span>
                <span className="mt-1 block text-xs leading-snug text-neutral-500 dark:text-neutral-400">
                  {br.modelFastDesc}
                </span>
              </button>
              <button
                onClick={() => setModel("isnet")}
                className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                  model === "isnet"
                    ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                    : "border-neutral-300 bg-white hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
                  <Layers className="h-4 w-4 text-brand-500" />
                  {br.modelQuality}
                </span>
                <span className="mt-1 block text-xs leading-snug text-neutral-500 dark:text-neutral-400">
                  {br.modelQualityDesc}
                </span>
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-400">{br.firstUseNote}</p>
          </div>

          <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            {slider(br.feather, feather, setFeather)}
            {slider(br.halo, halo, setHalo)}
            {slider(br.defringe, defringe, setDefringe)}
          </div>

          <div>
            <label className={labelCls}>{br.background}</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBgType("transparent")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  bgType === "transparent"
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                <Eraser className="h-4 w-4" />
                {br.transparent}
              </button>
              <button
                onClick={() => setBgType("solid")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  bgType === "solid"
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {br.solid}
              </button>
              {bgType === "solid" && (
                <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-600">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="absolute -left-2 -top-2 h-16 w-20 cursor-pointer border-0 bg-transparent p-0"
                    aria-label={br.solid}
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => void run({ feather, halo, defringe })}
            disabled={!source || busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {busy ? busyLabel() : br.remove}
          </button>

          {busy && progress !== null && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            {source && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <span
                      className={`flex h-6 items-center rounded-full px-2 text-xs font-semibold ${
                        result
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {result ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          {br.ready}
                        </>
                      ) : (
                        br.result
                      )}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {source.width}×{source.height}
                    </span>
                  </div>
                </div>
                <div
                  className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
                  style={bgType === "transparent" ? CHECKERBOARD : undefined}
                >
                  <div className="flex h-96 items-center justify-center overflow-hidden">
                    <img
                      src={result ? previewUrl : originalUrl}
                      alt={meta.name}
                      className="max-h-96 max-w-full object-contain"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {result ? (
                    <>
                      {br.size}: {formatFileSize(result.rgba.length * 4)}
                    </>
                  ) : (
                    br.canvasNote
                  )}
                </p>
              </div>
            )}

            {result && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => void download("png")}
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  <Download className="h-4 w-4" />
                  {br.download} {br.downloadPng}
                </button>
                {isWebp && (
                  <button
                    onClick={() => void download("webp")}
                    className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    <Download className="h-4 w-4" />
                    {br.download} {br.downloadWebp}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
