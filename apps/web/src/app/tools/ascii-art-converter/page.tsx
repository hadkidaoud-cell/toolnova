"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Type } from "lucide-react";

const RELATED_SLUGS = ["case-converter", "text-repeater", "word-counter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "case-converter": "Aa",
  "text-repeater": "↻",
  "word-counter": "W",
};

const LONG_DESCRIPTION =
  "Turn your text into ASCII art you can use in terminal banners, README files, comments, and retro designs. Pick a character style and a pixel size, then preview the result as rows of characters. Copy it and paste it anywhere.";

const FAQ = [
  {
    question: "How does it work?",
    answer: "Your text is drawn onto a hidden canvas, then each cell's brightness is mapped to a character from the chosen style — dense characters for dark cells, light ones for bright cells.",
  },
  {
    question: "Why does it look different in my terminal?",
    answer: "ASCII art depends on monospace fonts. If your terminal or editor uses proportional fonts or unusual spacing, the proportions will shift.",
  },
  {
    question: "Can I adjust the detail?",
    answer: "Yes. The pixel size controls how fine the sampling is — smaller values produce wider, more detailed output; larger values keep it compact.",
  },
];

const ARTICLE = {
  title: "The Charm of ASCII Art",
  content:
    "Before graphics cards, ASCII art was the only way to show images on screen. Today it survives as a nostalgic style for banners, email signatures, and retro game titles. Because it's plain text, it works everywhere — no images, no fonts, no dependencies.",
};

const STYLES: { id: string; chars: string }[] = [
  { id: "bold", chars: "@%#*+=-:. " },
  { id: "standard", chars: "#@%*=-:. " },
  { id: "block", chars: "█▓▒░ " },
  { id: "dots", chars: "⣿⠿⠟⠛⠙⠉⠀ " },
];

export default function AsciiArtConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["ascii-art-converter"];
  const u = t.asciiArt;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <Type className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/ascii-art-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [text, setText] = useState("");
  const [styleId, setStyleId] = useState("bold");
  const [px, setPx] = useState(12);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const style = STYLES.find((s) => s.id === styleId) ?? STYLES[0]!;
  const charW = 0.6 * px;
  const charH = 1.0 * px;

  const generate = () => {
    if (!text.trim()) {
      setOutput("");
      return;
    }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = `${px}px monospace`;
    const textW = ctx.measureText(text.trim()).width;
    const cols = Math.max(1, Math.ceil(textW / charW));
    canvas.width = Math.max(1, Math.ceil(cols * charW));
    canvas.height = Math.max(1, Math.ceil(2 * charH));
    const ctx2 = canvas.getContext("2d");
    if (!ctx2) return;
    ctx2.font = `${px}px monospace`;
    ctx2.fillStyle = "#000";
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
    ctx2.fillStyle = "#fff";
    ctx2.fillText(text.trim(), 0, charH);
    const data = ctx2.getImageData(0, 0, canvas.width, canvas.height).data;
    const ramp = style.chars;
    const rows: string[] = [];
    const rowCount = Math.max(1, Math.floor(canvas.height / charH));
    for (let r = 0; r < rowCount; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        let sum = 0;
        let n = 0;
        const startX = Math.floor(c * charW);
        const endX = Math.min(canvas.width, Math.floor((c + 1) * charW));
        const startY = Math.floor(r * charH);
        const endY = Math.min(canvas.height, Math.floor((r + 1) * charH));
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const i = (y * canvas.width + x) * 4;
            sum += 0.299 * (data[i] ?? 0) + 0.587 * (data[i + 1] ?? 0) + 0.114 * (data[i + 2] ?? 0);
            n++;
          }
        }
        const lum = n > 0 ? sum / n : 0;
        const idx = Math.floor((lum / 255) * (ramp.length - 1));
        line += ramp[Math.min(ramp.length - 1, Math.max(0, idx))] ?? " ";
      }
      rows.push(line.replace(/\s+$/, ""));
    }
    setOutput(rows.join("\n"));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

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
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.input}</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={u.input}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.font}</label>
            <select value={styleId} onChange={(e) => setStyleId(e.target.value)} className={inputCls}>
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.chars.trim()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.widthLabel}</label>
            <input
              type="number"
              min={6}
              max={24}
              value={px}
              onChange={(e) => setPx(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generate}
              className="w-full rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              {u.generate}
            </button>
          </div>
        </div>

        {output && (
          <div>
            <div className="mb-2 flex items-center justify-end">
              <button
                onClick={copy}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {copied ? t.common.copied : u.copy}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-neutral-300 bg-neutral-950 p-4 font-mono text-[12px] leading-[1.2] text-neutral-100 dark:border-neutral-700">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
