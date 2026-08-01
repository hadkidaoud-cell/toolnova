"use client";

import React, { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Palette, Upload, X } from "lucide-react";

const RELATED_SLUGS = ["svg-compressor", "color-extractor", "image-resizer"] as const;

const RELATED_ICONS: Record<string, string> = {
  "svg-compressor": "SVG",
  "color-extractor": "◍",
  "image-resizer": "✂",
};

const LONG_DESCRIPTION =
  "Generate favicons in every size your site needs, straight from a single image. We produce PNGs at 16, 32, 48, 64, 128, 192, and 512 pixels plus a ready-to-use .ico file, all in your browser with no uploads. Ideal for progressive web apps, browser tabs, and Apple touch icons.";

const FAQ = [
  {
    question: "Which sizes do I need?",
    answer: "16 and 32 px for browser tabs, 180 px for iOS home screens, and 192/512 px for Android and PWA manifests. We generate all of them.",
  },
  {
    question: "What is an .ico file?",
    answer: "The .ico format bundles multiple PNGs so old browsers can pick the right size. We embed 16, 32, and 48 px versions in a single ICO.",
  },
  {
    question: "Is the image uploaded anywhere?",
    answer: "No. All resizing happens on your device using the HTML canvas API.",
  },
];

const ARTICLE = {
  title: "Favicons: Small Files, Big Impact",
  content:
    "Your favicon is often the first impression users get of your brand — in bookmarks, tabs, and search results. Serving every size your platform expects keeps icons crisp at any resolution. Our generator creates the complete set in one click.",
};

const SIZES = [16, 32, 48, 64, 128, 192, 512];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load failed"));
    img.src = src;
  });
}

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const idx = dataUrl.indexOf(",");
  const b64 = dataUrl.slice(idx + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function buildIco(pngs: Uint8Array[]): string {
  const count = pngs.length;
  const headerSize = 6;
  const dirSize = 16 * count;
  const total = headerSize + dirSize + pngs.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  const dv = new DataView(out.buffer);
  dv.setUint16(0, 0, true);
  dv.setUint16(2, 1, true);
  dv.setUint16(4, count, true);
  let offset = headerSize + dirSize;
  for (let i = 0; i < count; i++) {
    const entry = headerSize + i * 16;
    const sz = SIZES[i] ?? 0;
    const size = sz >= 256 ? 0 : sz;
    dv.setUint8(entry, size);
    dv.setUint8(entry + 1, size);
    dv.setUint8(entry + 2, 0);
    dv.setUint8(entry + 3, 0);
    dv.setUint16(entry + 4, 1, true);
    dv.setUint16(entry + 6, 32, true);
    dv.setUint32(entry + 8, pngs[i]!.length, true);
    dv.setUint32(entry + 12, offset, true);
    out.set(pngs[i]!, offset);
    offset += pngs[i]!.length;
  }
  let binary = "";
  for (let i = 0; i < out.length; i++) binary += String.fromCharCode(out[i]!);
  return "data:image/x-icon;base64," + btoa(binary);
}

export default function FaviconGeneratorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["favicon-generator"];
  const u = t.faviconGenerator;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <Palette className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/image" },
      { label: meta.name, href: "/tools/favicon-generator" },
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
  const [pngs, setPngs] = useState<{ size: number; dataUrl: string }[]>([]);
  const [ico, setIco] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
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
        try {
          const img = await loadImage(dataUrl);
          const results: { size: number; dataUrl: string }[] = [];
          for (const size of SIZES) {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) continue;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, size, size);
            results.push({ size, dataUrl: canvas.toDataURL("image/png") });
          }
          setPngs(results);
          if (results.length >= 3) {
            setIco(buildIco(results.slice(0, 3).map((r) => dataUrlToUint8(r.dataUrl))));
          }
        } catch {
          setError(u.noFile);
        }
      };
      reader.onerror = () => setError(u.noFile);
      reader.readAsDataURL(file);
    },
    [u.noFile]
  );

  const download = (dataUrl: string, name: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name;
    a.click();
  };

  const reset = () => {
    setSrc("");
    setFileName("");
    setPngs([]);
    setIco("");
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
          <>
            <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <img src={src} alt={fileName} className="h-16 w-16 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{fileName}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{u.note}</p>
              </div>
              <button
                onClick={reset}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {pngs.length > 0 && (
              <div>
                <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {u.preview} — {u.sizes}
                </label>
                <div className="flex flex-wrap gap-4">
                  {pngs.map((p) => (
                    <div key={p.size} className="flex flex-col items-center gap-2">
                      <div
                        className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                        style={{ width: 64, height: 64 }}
                      >
                        <img src={p.dataUrl} alt={`${p.size}px`} className="max-h-full max-w-full" style={{ width: p.size, height: p.size }} />
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{p.size}px</span>
                      <button
                        onClick={() => download(p.dataUrl, `favicon-${p.size}x${p.size}.png`)}
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        {u.downloadPng}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ico && (
              <button
                onClick={() => download(ico, "favicon.ico")}
                className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
              >
                {u.downloadIco}
              </button>
            )}
          </>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
