"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Palette } from "lucide-react";

const RELATED_SLUGS = ["image-compressor", "qr-code-generator", "resume-builder"] as const;

const RELATED_ICONS: Record<string, string> = {
  "image-compressor": "🖼",
  "qr-code-generator": "▦",
  "resume-builder": "R",
};

const LONG_DESCRIPTION =
  "Our Color Picker lets you visually select colors and instantly see their values in HEX, RGB, HSL, and CMYK formats. You can copy any format with one click, view color harmonies, and check contrast ratios for WCAG accessibility compliance.";

const FAQ = [
  {
    question: "What is the difference between HEX, RGB, HSL, and CMYK?",
    answer: "HEX is a 6-digit hex code for web colors. RGB specifies red/green/blue (0-255). HSL uses hue/saturation/lightness for intuitive adjustments. CMYK is used for printing with cyan/magenta/yellow/key values (0-100%).",
  },
  {
    question: "What are WCAG AA and AAA?",
    answer: "WCAG AA requires a 4.5:1 contrast ratio for normal text and 3:1 for large text. AAA requires 7:1 for normal text and 4.5:1 for large text. These standards ensure content is accessible to users with visual impairments.",
  },
];

const ARTICLE = {
  title: "Understanding Color Formats",
  content:
    "Colors can be represented in multiple formats, each with its own advantages. HEX is compact and web-friendly. RGB is intuitive for screens and additive color mixing. HSL is more human-readable — you can easily lighten a color by increasing lightness or make it more vibrant by increasing saturation. CMYK is subtractive, used for print. Understanding all formats helps you work more effectively across different tools and contexts in design and development.",
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const diff = max - min;
  let h = 0, s = 0, l = (max + min) / 2;
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    if (max === rr) h = ((gg - bb) / diff + (gg < bb ? 6 : 0)) * 60;
    else if (max === gg) h = ((bb - rr) / diff + 2) * 60;
    else h = ((rr - gg) / diff + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = ((1 - rr - k) / (1 - k)) * 100;
  const m = ((1 - gg - k) / (1 - k)) * 100;
  const y = ((1 - bb - k) / (1 - k)) * 100;
  return { c: Math.round(c), m: Math.round(m), y: Math.round(y), k: Math.round(k * 100) };
}

function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

function getAnalogous(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return ["#000000", "#000000"];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const [r1, g1, b1] = hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);
  const [r2, g2, b2] = hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l);
  return [rgbToHex(r1, g1, b1), hex, rgbToHex(r2, g2, b2)];
}

function getTriadic(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return ["#000000", "#000000", "#000000"];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const [r1, g1, b1] = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);
  const [r2, g2, b2] = hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l);
  return [hex, rgbToHex(r1, g1, b1), rgbToHex(r2, g2, b2)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const ss = s / 100, ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function luminance(r: number, g: number, b: number): number {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  ) as [number, number, number];
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
}

function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1), c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 1;
  const l1 = luminance(c1.r, c1.g, c1.b);
  const l2 = luminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function loadHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("colorPickerHistory");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveHistory(colors: string[]) {
  try {
    localStorage.setItem("colorPickerHistory", JSON.stringify(colors.slice(0, 10)));
  } catch { }
}

export default function ColorPickerPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.image;
  const meta = t.meta["color-picker"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "image",
    icon: <Palette className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/image" },
      { label: meta.name, href: "/tools/color-picker" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [color, setColor] = useState("#6366f1");
  const [hexInput, setHexInput] = useState("#6366f1");
  const [hexError, setHexError] = useState("");
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [fgContrast, setFgContrast] = useState("#000000");
  const [bgContrast, setBgContrast] = useState("#ffffff");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(color), [color]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null, [rgb]);
  const cmyk = useMemo(() => rgb ? rgbToCmyk(rgb.r, rgb.g, rgb.b) : null, [rgb]);
  const complementary = useMemo(() => getComplementary(color), [color]);
  const analogous = useMemo(() => getAnalogous(color), [color]);
  const triadic = useMemo(() => getTriadic(color), [color]);
  const contrast = useMemo(() => contrastRatio(fgContrast, bgContrast), [fgContrast, bgContrast]);
  const wcagAA = contrast >= 4.5;
  const wcagAALarge = contrast >= 3;
  const wcagAAA = contrast >= 7;

  useEffect(() => {
    setHexInput(color);
    setHexError("");
    setHistory((prev) => {
      if (prev[0] === color) return prev;
      const next = [color, ...prev.filter((c) => c !== color)].slice(0, 10);
      saveHistory(next);
      return next;
    });
  }, [color]);

  const handleHexInput = useCallback((value: string) => {
    setHexInput(value);
    const clean = value.replace("#", "");
    if (/^[0-9a-fA-F]{6}$/.test(clean)) {
      setColor("#" + clean.toLowerCase());
      setHexError("");
    } else if (value.length >= 7) {
      setHexError(t.colorPicker.invalidHex);
    } else {
      setHexError("");
    }
  }, [t.colorPicker.invalidHex]);

  const copyValue = useCallback(async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch { }
  }, []);

  const formats = useMemo(() => {
    if (!rgb || !hsl || !cmyk) return [];
    return [
      { key: "hex", label: "HEX", value: color.toUpperCase() },
      { key: "rgb", label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
      { key: "hsl", label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      { key: "cmyk", label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
    ];
  }, [color, rgb, hsl, cmyk]);

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
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-32 w-32 cursor-pointer rounded-xl border border-neutral-300 bg-transparent p-1 dark:border-neutral-600"
            />
            <span className="text-sm text-neutral-500">{t.colorPicker.clickToPick}</span>
            <div>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                placeholder="#000000"
                maxLength={7}
                className="w-28 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-center font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
              {hexError && <p className="mt-1 text-xs text-red-500">{hexError}</p>}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div
              className="h-24 rounded-xl border border-neutral-300 dark:border-neutral-600"
              style={{ backgroundColor: color }}
            />

            {formats.map(({ key, label, value }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <div>
                  <span className="text-xs font-medium text-neutral-500">{label}</span>
                  <span className="ml-3 font-mono text-sm text-neutral-900 dark:text-white">{value}</span>
                </div>
                <button
                  onClick={() => copyValue(value, key)}
                  className="rounded-md px-3 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
                >
                  {copiedKey === key ? t.common.copied : t.common.copy}
                </button>
              </div>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.colorPicker.colorHistory}</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-lg border border-neutral-300 dark:border-neutral-600"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.colorPicker.complementary}</h3>
            <button onClick={() => copyValue(complementary, "comp")} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg border border-neutral-300 dark:border-neutral-600" style={{ backgroundColor: complementary }} />
              <span className="font-mono text-sm text-neutral-900 dark:text-white">{complementary.toUpperCase()}</span>
            </button>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.colorPicker.analogous}</h3>
            <div className="flex gap-2">
              {analogous.map((c, i) => (
                <button key={i} onClick={() => setColor(c)} className="h-10 w-10 rounded-lg border border-neutral-300 dark:border-neutral-600" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.colorPicker.triadic}</h3>
            <div className="flex gap-2">
              {triadic.map((c, i) => (
                <button key={i} onClick={() => setColor(c)} className="h-10 w-10 rounded-lg border border-neutral-300 dark:border-neutral-600" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.colorPicker.contrastChecker}</h3>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">{t.colorPicker.foreground}</label>
              <div className="flex gap-2">
                <input type="color" value={fgContrast} onChange={(e) => setFgContrast(e.target.value)} className="h-8 w-8 cursor-pointer rounded border border-neutral-300 p-0.5" />
                <input type="text" value={fgContrast} onChange={(e) => setFgContrast(e.target.value)} className="flex-1 rounded border border-neutral-300 px-2 py-1 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">{t.colorPicker.background}</label>
              <div className="flex gap-2">
                <input type="color" value={bgContrast} onChange={(e) => setBgContrast(e.target.value)} className="h-8 w-8 cursor-pointer rounded border border-neutral-300 p-0.5" />
                <input type="text" value={bgContrast} onChange={(e) => setBgContrast(e.target.value)} className="flex-1 rounded border border-neutral-300 px-2 py-1 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm dark:bg-neutral-800">
              {t.colorPicker.ratio.replace("{ratio}", contrast.toFixed(2))}
            </div>
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${wcagAA ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              <span>AA</span>
              <span className="text-xs">{wcagAA ? t.colorPicker.pass : t.colorPicker.fail}</span>
            </div>
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${wcagAALarge ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              <span>{t.colorPicker.aaLarge}</span>
              <span className="text-xs">{wcagAALarge ? t.colorPicker.pass : t.colorPicker.fail}</span>
            </div>
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${wcagAAA ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              <span>AAA</span>
              <span className="text-xs">{wcagAAA ? t.colorPicker.pass : t.colorPicker.fail}</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
