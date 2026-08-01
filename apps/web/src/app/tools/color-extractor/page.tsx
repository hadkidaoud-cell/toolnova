"use client";

import React, { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Droplets, Upload, X } from "lucide-react";

const RELATED_SLUGS = ["color-picker", "color-converter", "image-compressor"] as const;

const RELATED_ICONS: Record<string, string> = {
  "color-picker": "🎨",
  "color-converter": "#",
  "image-compressor": "🖼",
};

const LONG_DESCRIPTION =
  "Extract the dominant colors from any image and get their exact hex codes. We sample the image on-device, cluster similar colors, and rank them by prominence. Copy any color instantly to build palettes, themes, and brand assets from your photos.";

const FAQ = [
  {
    question: "How are dominant colors computed?",
    answer: "We downscale the image, sample every pixel, group similar colors into clusters, and rank the clusters by how many pixels they contain.",
  },
  {
    question: "How many colors do I get?",
    answer: "The tool returns the top 8 most prominent colors, each with a hex code and its share of the image.",
  },
  {
    question: "Is the image uploaded anywhere?",
    answer: "No. Sampling runs entirely in your browser on the original pixels.",
  },
];

const ARTICLE = {
  title: "Building Palettes From Photos",
  content:
    "Great color palettes are often hiding inside your own content. By extracting dominant colors from photography, you can build cohesive themes that match your brand's visual identity. Our extractor turns any image into an actionable palette in seconds.",
};

const TOP = 8;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load failed"));
    img.src = src;
  });
}

interface ColorResult {
  r: number;
  g: number;
  b: number;
  count: number;
}

async function extractColors(dataUrl: string): Promise<ColorResult[]> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const w = 64;
  const h = Math.max(1, Math.round((64 * img.naturalHeight) / img.naturalWidth));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]!;
    if (a < 128) continue;
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const key = `${r >> 4}|${g >> 4}|${b >> 4}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count++;
      existing.r += r;
      existing.g += g;
      existing.b += b;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }
  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP)
    .map((e) => ({
      r: Math.round(e.r / e.count),
      g: Math.round(e.g / e.count),
      b: Math.round(e.b / e.count),
      count: e.count,
    }));
}

function toHex(c: ColorResult): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`.toUpperCase();
}

export default function ColorExtractorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["color-extractor"];
  const u = t.colorExtractor;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <Droplets className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/image" },
      { label: meta.name, href: "/tools/color-extractor" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [src, setSrc] = useState("");
  const [fileName, setFileName] = useState("");
  const [colors, setColors] = useState<ColorResult[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError("");
      if (!file.type.startsWith("image/")) {
        setError(u.noFile);
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        setSrc(dataUrl);
        setFileName(file.name);
        setExtracting(true);
        setColors([]);
        try {
          const result = await extractColors(dataUrl);
          setColors(result);
        } catch {
          setError(u.noFile);
        } finally {
          setExtracting(false);
        }
      };
      reader.onerror = () => setError(u.noFile);
      reader.readAsDataURL(file);
    },
    [u.noFile]
  );

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied(""), 2000);
    } catch {}
  };

  const total = Math.max(1, colors.reduce((sum, c) => sum + c.count, 0));
  const base = (fileName || "image").replace(/\.[^.]+$/, "");

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
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {!src ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/10"
          >
            <Upload className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{u.upload}</span>
          </button>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <img src={src} alt={fileName} className="h-16 w-16 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{fileName}</p>
              {extracting && <p className="text-xs text-neutral-500 dark:text-neutral-400">{u.extracting}</p>}
            </div>
            <button
              onClick={() => {
                setSrc("");
                setFileName("");
                setColors([]);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {colors.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.dominantColors}</label>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {u.count.replace("{count}", String(colors.length))}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {colors.map((c) => {
                const hex = toHex(c);
                const pct = Math.round((c.count / total) * 100);
                return (
                  <button
                    key={hex}
                    onClick={() => copy(hex)}
                    className="overflow-hidden rounded-xl border border-neutral-200 text-left dark:border-neutral-700"
                  >
                    <div className="h-14 w-full" style={{ backgroundColor: hex }} />
                    <div className="flex items-center justify-between bg-white px-3 py-2 dark:bg-neutral-900">
                      <span className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">{hex}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{copied === hex ? t.common.copied : pct}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={toHex(c)}
                  onClick={() => copy(toHex(c))}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 font-mono text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {toHex(c)}
                </button>
              ))}
              <span className="self-center text-xs text-neutral-400 dark:text-neutral-500">
                {base} · CSS · HTML · Figma
              </span>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
