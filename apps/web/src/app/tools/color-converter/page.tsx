"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Palette, Copy, Check } from "lucide-react";

const RELATED_SLUGS = ["color-picker", "base64-encoder", "html-formatter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "color-picker": "CP",
  "base64-encoder": "64",
  "html-formatter": "HTML",
};

const LONG_DESCRIPTION =
  "Our Color Converter instantly converts any color between HEX, RGB, HSL, and CMYK. Type a hex code or pick a color visually, then copy each format with one click.";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.replace("#", "").trim();
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h.split("").map((c) => c + c).join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

const FAQ = [
  {
    question: "Which color formats are supported?",
    answer: "HEX, RGB, HSL, and CMYK — the formats most used in web design, app development, and printing.",
  },
  {
    question: "Can I paste a short hex like #f00?",
    answer: "Yes — 3-digit hex codes are expanded automatically, and the color picker lets you choose visually.",
  },
  {
    question: "How do I copy a value?",
    answer: "Each format row has a copy button that copies the value to your clipboard in one click.",
  },
];

const ARTICLE = {
  title: "One Color, Every Format",
  content:
    "Designers switch between HEX for CSS, RGB for design tools, HSL for intuitive tweaks, and CMYK for print. Recomputing these by hand is tedious and error-prone. This converter keeps all four formats in sync live — as you type or pick a color, every representation updates instantly.",
};

export default function ColorConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["color-converter"];
  const cc = t.colorConverter;
  const common = t.common;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <Palette className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/color-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [hex, setHex] = useState("#3498db");
  const [copied, setCopied] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const isValid = rgb !== null;

  const values = useMemo(() => {
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hexStr = `#${((1 << 24) | (rgb.r << 16) | (rgb.g << 8) | rgb.b).toString(16).slice(1).toUpperCase()}`;
    return {
      [cc.hex]: hexStr,
      [cc.rgb]: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      [cc.hsl]: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      [cc.cmyk]: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    } as Record<string, string>;
  }, [rgb, cc]);

  const copy = useCallback(
    async (label: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1500);
    },
    []
  );

  const labelCls = "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300";
  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 font-mono text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

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
          <label className={labelCls}>{cc.colorInput}</label>
          <div className="flex gap-3">
            <input
              type="color"
              value={isValid ? hex : "#000000"}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="h-11 w-16 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              dir="ltr"
              placeholder="#3498db"
              className={inputCls}
            />
          </div>
        </div>

        {!isValid && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {cc.invalidHex}
          </div>
        )}

        {values && (
          <>
            <div
              className="h-16 rounded-lg border border-neutral-200 dark:border-neutral-700"
              style={{ backgroundColor: values[cc.hex] }}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(values).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</div>
                    <div dir="ltr" className="mt-1 truncate font-mono text-sm text-neutral-900 dark:text-white">
                      {value}
                    </div>
                  </div>
                  <button
                    onClick={() => copy(label, value)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    aria-label={common.copy}
                  >
                    {copied === label ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
