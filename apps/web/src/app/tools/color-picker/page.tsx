"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";

const TOOL = {
  slug: "color-picker",
  name: "Color Picker",
  description: "Pick colors and convert between HEX, RGB, and HSL formats instantly.",
  longDescription:
    "Our Color Picker lets you visually select colors and instantly see their values in HEX, RGB, and HSL formats. You can copy any format with one click and see the complementary color. Perfect for web designers, graphic artists, and developers who need to work with colors across different formats.",
  category: "Design Tools",
  categorySlug: "design",
  icon: "●",
  breadcrumbs: [
    { label: "Design Tools", href: "/category/design" },
    { label: "Color Picker", href: "/tools/color-picker" },
  ],
};

const RELATED_TOOLS = [
  { slug: "image-color-picker", name: "Image Color Picker", description: "Pick colors from images", icon: "🎨" },
  { slug: "gradient-generator", name: "Gradient Generator", description: "Create beautiful gradients", icon: "▰" },
  { slug: "palette-generator", name: "Palette Generator", description: "Generate color palettes", icon: "◼" },
];

const FAQ = [
  {
    question: "What is HEX color format?",
    answer: "HEX (hexadecimal) represents colors as #RRGGBB, where RR, GG, and BB are two-digit hex values (00-FF) for red, green, and blue components. It's the most common format in web development.",
  },
  {
    question: "What is RGB color format?",
    answer: "RGB stands for Red, Green, Blue. Each component is a value from 0 to 255 representing the intensity of that color channel. RGB is widely used in CSS and graphic design software.",
  },
  {
    question: "What is HSL color format?",
    answer: "HSL stands for Hue, Saturation, Lightness. Hue is a degree on the color wheel (0-360), saturation is a percentage (0-100%), and lightness is a percentage (0-100%). HSL is often more intuitive for humans to understand and adjust.",
  },
  {
    question: "What is a complementary color?",
    answer: "A complementary color is directly opposite on the color wheel. When placed next to each other, complementary colors create strong contrast and visual interest. The complementary of red is green, blue is orange, and yellow is purple.",
  },
];

const ARTICLE = {
  title: "Understanding Color Formats",
  content:
    "Colors can be represented in multiple formats, each with its own advantages. HEX is compact and web-friendly. RGB is intuitive for screens and additive color mixing. HSL is more human-readable — you can easily lighten a color by increasing lightness or make it more vibrant by increasing saturation. Understanding all three formats helps you work more effectively across different tools and contexts in design and development.",
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

function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  const comp = {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b,
  };
  return `#${comp.r.toString(16).padStart(2, "0")}${comp.g.toString(16).padStart(2, "0")}${comp.b.toString(16).padStart(2, "0")}`;
}

export default function ColorPickerPage() {
  const [color, setColor] = useState("#6366f1");

  const rgb = useMemo(() => hexToRgb(color), [color]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null, [rgb]);
  const complementary = useMemo(() => getComplementary(color), [color]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyValue = useCallback(async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch { }
  }, []);

  const formats = useMemo(() => {
    if (!rgb || !hsl) return [];
    return [
      { key: "hex", label: "HEX", value: color.toUpperCase() },
      { key: "rgb", label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
      { key: "hsl", label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    ];
  }, [color, rgb, hsl]);

  return (
    <ToolLayout
      name={TOOL.name}
      description={TOOL.description}
      longDescription={TOOL.longDescription}
      category={TOOL.category}
      categorySlug={TOOL.categorySlug}
      breadcrumbs={TOOL.breadcrumbs}
      icon={TOOL.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={RELATED_TOOLS}
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
            <span className="text-sm text-neutral-500">Click to pick</span>
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
                  {copiedKey === key ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Complementary Color</h3>
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-lg border border-neutral-300 dark:border-neutral-600"
              style={{ backgroundColor: complementary }}
            />
            <div>
              <span className="font-mono text-sm text-neutral-900 dark:text-white">{complementary.toUpperCase()}</span>
              <button
                onClick={() => copyValue(complementary, "complementary")}
                className="ml-3 rounded-md px-3 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
              >
                {copiedKey === "complementary" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-neutral-400">
          Tip: You can type any valid 6-character hex code directly into the color picker.
        </div>
      </div>
    </ToolLayout>
  );
}
