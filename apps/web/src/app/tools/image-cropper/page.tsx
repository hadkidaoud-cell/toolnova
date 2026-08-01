"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Crop } from "lucide-react";

const RELATED_SLUGS = ["image-resizer", "image-converter", "image-compressor"] as const;

const RELATED_ICONS: Record<string, string> = {
  "image-resizer": "↗",
  "image-converter": "⇄",
  "image-compressor": "▼",
};

const LONG_DESCRIPTION =
  "Our Image Cropper lets you crop a single image to any aspect ratio with a draggable selection box. Choose a preset like 1:1, 4:3, or 16:9, or crop freely, then apply and download the result — all in your browser.";

const MAX_W = 560;
const MAX_H = 480;

interface LoadedImage {
  dataUrl: string;
  name: string;
  width: number;
  height: number;
  dispW: number;
  dispH: number;
}

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const ASPECT_PRESETS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
];

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function centeredCrop(dispW: number, dispH: number, aspect: number | null): CropRect {
  let w = Math.round(dispW * 0.6);
  let h: number;
  if (aspect) {
    h = w / aspect;
    if (h > dispH) {
      h = dispH;
      w = h * aspect;
    }
    if (w > dispW) {
      w = dispW;
      h = w / aspect;
    }
    h = Math.round(h);
  } else {
    h = Math.round(dispH * 0.6);
  }
  return { x: Math.round((dispW - w) / 2), y: Math.round((dispH - h) / 2), w, h };
}

const FAQ = [
  {
    question: "Which aspect ratios are supported?",
    answer: "Free cropping plus presets: 1:1, 4:3, 3:2, and 16:9. The crop box keeps the ratio while you drag it into place.",
  },
  {
    question: "Does cropping lose quality?",
    answer: "No. The result is exported at the source resolution of the selected area, so quality is preserved.",
  },
  {
    question: "Where are my images processed?",
    answer: "100% in your browser. Nothing is uploaded to a server.",
  },
];

const ARTICLE = {
  title: "Crop With Precision",
  content:
    "Profile pictures, thumbnails, and banners all demand specific aspect ratios. Cropping by hand in an editor and guessing dimensions wastes time. A guided crop box with presets gets you to a perfectly framed image in seconds — and keeps your files private.",
};

export default function ImageCropperPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["image-cropper"];
  const cr = t.imageCropper;
  const common = t.common;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <Crop className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/design" },
      { label: meta.name, href: "/tools/image-cropper" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [image, setImage] = useState<LoadedImage | null>(null);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [aspect, setAspect] = useState<number | null>(null);
  const [sizePct, setSizePct] = useState(60);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ lastX: number; lastY: number } | null>(null);

  useEffect(() => {
    if (image) {
      setCrop(centeredCrop(image.dispW, image.dispH, aspect));
      setPreview(null);
      setSizePct(60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const loadFile = useCallback(async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;
    if (file.size > 50 * 1024 * 1024) return;
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = dataUrl;
    });
    const scale = Math.min(MAX_W / img.width, MAX_H / img.height, 1);
    setImage({
      dataUrl,
      name: file.name,
      width: img.width,
      height: img.height,
      dispW: Math.max(1, Math.round(img.width * scale)),
      dispH: Math.max(1, Math.round(img.height * scale)),
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const selectAspect = useCallback(
    (value: number | null) => {
      setAspect(value);
      if (image && crop) {
        setCrop(centeredCrop(image.dispW, image.dispH, value));
      }
    },
    [image, crop]
  );

  const changeSize = useCallback(
    (pct: number) => {
      setSizePct(pct);
      if (image && crop) {
        const factor = pct / 100;
        let w = Math.round(image.dispW * factor);
        let h: number;
        if (aspect) {
          h = w / aspect;
          if (h > image.dispH) {
            h = image.dispH;
            w = Math.round(h * aspect);
          }
          h = Math.round(h);
        } else {
          h = Math.round(image.dispH * factor);
        }
        const cx = crop.x + crop.w / 2;
        const cy = crop.y + crop.h / 2;
        setCrop({
          w,
          h,
          x: Math.round(clamp(cx - w / 2, 0, image.dispW - w)),
          y: Math.round(clamp(cy - h / 2, 0, image.dispH - h)),
        });
      }
    },
    [image, crop, aspect]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      dragRef.current = { lastX: e.clientX, lastY: e.clientY };
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current || !image || !crop) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current = { lastX: e.clientX, lastY: e.clientY };
      setCrop((c) =>
        c
          ? {
              ...c,
              x: Math.round(clamp(c.x + dx, 0, image.dispW - c.w)),
              y: Math.round(clamp(c.y + dy, 0, image.dispH - c.h)),
            }
          : c
      );
    },
    [image, crop]
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const applyCrop = useCallback(() => {
    if (!image || !crop || !imgElementRef.current) return;
    const imgEl = imgElementRef.current;
    const sx = image.width / image.dispW;
    const sy = image.height / image.dispH;
    const srcX = crop.x * sx;
    const srcY = crop.y * sy;
    const srcW = crop.w * sx;
    const srcH = crop.h * sy;
    const outW = Math.max(1, Math.round(srcW));
    const outH = Math.max(1, Math.round(srcH));
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    setPreview(canvas.toDataURL("image/png"));
  }, [image, crop]);

  const download = useCallback(() => {
    if (!preview) return;
    const link = document.createElement("a");
    link.href = preview;
    const base = image?.name.replace(/\.[^.]+$/, "") ?? "cropped";
    link.download = `${base}-cropped.png`;
    link.click();
  }, [preview, image]);

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
        {!image ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
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
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          <>
            <div>
              <label className={labelCls}>{cr.aspectRatio}</label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => selectAspect(preset.value)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      aspect === preset.value
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {preset.label === "Free" ? cr.free : preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>{Math.round(sizePct)}%</label>
              <input
                type="range"
                min={20}
                max={100}
                value={sizePct}
                onChange={(e) => changeSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="relative select-none" style={{ width: image.dispW, height: image.dispH }}>
              <img
                ref={imgElementRef}
                src={image.dataUrl}
                alt={image.name}
                style={{ width: image.dispW, height: image.dispH }}
                className="block rounded-lg"
                draggable={false}
              />
              <div className="absolute inset-0 rounded-lg" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)" }} />
              {crop && (
                <div
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                  className="absolute cursor-move touch-none rounded-md border-2 border-brand-500"
                  style={{
                    left: crop.x,
                    top: crop.y,
                    width: crop.w,
                    height: crop.h,
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                  }}
                />
              )}
            </div>

            <p className="text-sm text-neutral-400">{cr.cropHint}</p>

            <div className="flex items-center gap-3">
              <button
                onClick={applyCrop}
                className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                {cr.applyCrop}
              </button>
              {preview && (
                <button
                  onClick={download}
                  className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {cr.download}
                </button>
              )}
              <button
                onClick={() => setImage(null)}
                className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-800 dark:bg-neutral-800 dark:text-red-400 dark:hover:bg-neutral-700"
              >
                {common.remove}
              </button>
            </div>

            {preview && image && crop && (
              <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                <img src={preview} alt="Cropped preview" className="max-h-48 rounded-lg border border-neutral-200 dark:border-neutral-700" />
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {Math.round(crop.w * (image.width / image.dispW))} × {Math.round(crop.h * (image.height / image.dispH))}px
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
