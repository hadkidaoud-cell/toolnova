"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { ImageIcon, Upload, X } from "lucide-react";
import { THUMBNAIL_PRESETS, getPreset, renderThumbnail, type ThumbnailOptions } from "@/lib/thumbnail";
import { downloadDataUrl, loadImage } from "@/lib/image-utils";

const RELATED_SLUGS = ["favicon-generator", "color-extractor", "image-to-base64"] as const;

const RELATED_ICONS: Record<string, string> = {
  "favicon-generator": "F",
  "color-extractor": "◍",
  "image-to-base64": "64",
};

const LONG_DESCRIPTION =
  "Thumbnail Maker designs YouTube, X, Facebook, Instagram, LinkedIn, and blog images in seconds. Pick a preset size, choose colors, type your headline, drop in a logo, and download a crisp PNG — all rendered locally on a canvas in your browser.";

const FAQ = [
  {
    question: "What sizes are available?",
    answer:
      "YouTube (1280×720), X/Twitter (1600×900), Facebook & blog cards (1200×630), Instagram (1080×1080), Instagram Story (1080×1920), and LinkedIn banner (1584×396).",
  },
  {
    question: "Can I add my logo?",
    answer:
      "Yes. Upload a PNG or JPG and it is placed in the top-left corner, scaled to fit without distortion.",
  },
  {
    question: "How is the image generated?",
    answer:
      "Everything is drawn with the HTML canvas API in your browser. No server rendering, no uploads, and full resolution output.",
  },
];

const ARTICLE = {
  title: "Thumbnails That Earn the Click",
  content:
    "A thumbnail is the first thing people judge. Clear contrast, one strong headline, and a recognizable brand mark beat cluttered designs every time. Generate a template once, keep your colors consistent, and your whole channel or feed looks professional.",
};

const presetLabel = (id: string, labels: Record<string, string>): string => labels[id] ?? id;

export default function ThumbnailMakerPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["thumbnail-maker"];
  const tm = t.thumbnailMaker;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <ImageIcon className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/image" },
      { label: meta.name, href: "/tools/thumbnail-maker" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [presetId, setPresetId] = useState("youtube");
  const [background, setBackground] = useState("#111827");
  const [background2, setBackground2] = useState("#4f46e5");
  const [useGradient, setUseGradient] = useState(true);
  const [accent, setAccent] = useState("#22d3ee");
  const [title, setTitle] = useState("Create Standout Thumbnails");
  const [titleColor, setTitleColor] = useState("#ffffff");
  const [subtitle, setSubtitle] = useState("Made in seconds, right in your browser");
  const [subtitleColor, setSubtitleColor] = useState("#cbd5e1");
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [logoName, setLogoName] = useState("");
  const [preview, setPreview] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const preset = getPreset(presetId);

  useEffect(() => {
    const options: ThumbnailOptions = {
      preset,
      background,
      background2,
      useGradient,
      accent,
      title,
      titleColor,
      subtitle,
      subtitleColor,
      logoImage: logoImage ?? undefined,
    };
    const canvas = renderThumbnail(options);
    setPreview(canvas.toDataURL("image/png"));
  }, [preset, background, background2, useGradient, accent, title, titleColor, subtitle, subtitleColor, logoImage]);

  const handleLogo = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    try {
      const img = await loadImage(dataUrl);
      setLogoImage(img);
      setLogoName(file.name);
    } catch {
      setLogoImage(null);
      setLogoName("");
    }
  }, []);

  const download = useCallback(() => {
    if (!preview) return;
    downloadDataUrl(preview, `thumbnail-${presetId}-${preset.width}x${preset.height}.png`);
  }, [preview, presetId, preset.width, preset.height]);

  const inputCls =
    "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";
  const labelCls = "mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400";

  const colorSwatch = (id: string, label: string, value: string, onChange: (v: string) => void) => (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-600">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -left-2 -top-2 h-16 w-20 cursor-pointer border-0 bg-transparent p-0"
          aria-label={label}
        />
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} aria-label={label} />
    </div>
  );

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
          <div>
            <label className={labelCls}>{tm.preset}</label>
            <div className="grid grid-cols-2 gap-2">
              {THUMBNAIL_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPresetId(p.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                    presetId === p.id
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                >
                  {presetLabel(p.id, tm.presets)}
                  <span className="block text-xs font-normal text-neutral-400">{p.width}×{p.height}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <label className={labelCls}>{tm.useGradient}</label>
              <button
                onClick={() => setUseGradient((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  useGradient ? "bg-brand-600" : "bg-neutral-300 dark:bg-neutral-600"
                }`}
                aria-pressed={useGradient}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    useGradient ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div>
              <label className={labelCls}>{tm.background}</label>
              {colorSwatch("background", tm.background, background, setBackground)}
            </div>
            {useGradient && (
              <div>
                <label className={labelCls}>{tm.background2}</label>
                {colorSwatch("background2", tm.background2, background2, setBackground2)}
              </div>
            )}
            <div>
              <label className={labelCls}>{tm.accent}</label>
              {colorSwatch("accent", tm.accent, accent, setAccent)}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelCls}>{tm.title}</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tm.titlePlaceholder} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{tm.subtitle}</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder={tm.subtitlePlaceholder} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{tm.titleColor}</label>
              {colorSwatch("titleColor", tm.titleColor, titleColor, setTitleColor)}
            </div>
            <div>
              <label className={labelCls}>{tm.subtitleColor}</label>
              {colorSwatch("subtitleColor", tm.subtitleColor, subtitleColor, setSubtitleColor)}
            </div>
          </div>

          <div>
            <label className={labelCls}>{tm.uploadLogo}</label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLogo(f);
              }}
            />
            {logoImage ? (
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
                <span className="min-w-0 flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">{logoName}</span>
                <button onClick={() => logoInputRef.current?.click()} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {tm.changeLogo}
                </button>
                <button
                  onClick={() => {
                    setLogoImage(null);
                    setLogoName("");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  aria-label={tm.removeLogo}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-500 hover:border-brand-400 hover:text-brand-600 dark:border-neutral-600 dark:text-neutral-400"
              >
                <Upload className="h-4 w-4" />
                {tm.uploadLogo}
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
              <img src={preview} alt={title || "Thumbnail preview"} className="block w-full" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{tm.canvasNote}</p>
              <button
                onClick={download}
                className="shrink-0 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                {tm.download}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
