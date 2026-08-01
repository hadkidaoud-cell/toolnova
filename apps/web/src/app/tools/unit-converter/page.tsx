"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Ruler } from "lucide-react";

const RELATED_SLUGS = ["temperature-converter", "currency-converter", "basic-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "temperature-converter": "T°",
  "currency-converter": "C",
  "basic-calculator": "=",
};

const LONG_DESCRIPTION =
  "Our Unit Converter handles seven categories — length, mass, volume, area, speed, time, and data — with dozens of units each. Pick a category, enter a value, and see the result instantly. Perfect for travel, cooking, engineering, and everyday math. Everything runs locally in your browser.";

type UnitCategory = "length" | "mass" | "volume" | "area" | "speed" | "time" | "data";

const UNITS: Record<UnitCategory, { symbol: string; factor: number }[]> = {
  length: [
    { symbol: "mm", factor: 0.001 },
    { symbol: "cm", factor: 0.01 },
    { symbol: "m", factor: 1 },
    { symbol: "km", factor: 1000 },
    { symbol: "in", factor: 0.0254 },
    { symbol: "ft", factor: 0.3048 },
    { symbol: "yd", factor: 0.9144 },
    { symbol: "mi", factor: 1609.344 },
  ],
  mass: [
    { symbol: "mg", factor: 0.000001 },
    { symbol: "g", factor: 0.001 },
    { symbol: "kg", factor: 1 },
    { symbol: "t", factor: 1000 },
    { symbol: "oz", factor: 0.028349523125 },
    { symbol: "lb", factor: 0.45359237 },
    { symbol: "st", factor: 6.35029318 },
  ],
  volume: [
    { symbol: "mL", factor: 0.001 },
    { symbol: "L", factor: 1 },
    { symbol: "m\u00b3", factor: 1000 },
    { symbol: "gal", factor: 3.785411784 },
    { symbol: "qt", factor: 0.946352946 },
    { symbol: "pt", factor: 0.473176473 },
    { symbol: "cup", factor: 0.2365882365 },
  ],
  area: [
    { symbol: "cm\u00b2", factor: 0.0001 },
    { symbol: "m\u00b2", factor: 1 },
    { symbol: "km\u00b2", factor: 1000000 },
    { symbol: "ha", factor: 10000 },
    { symbol: "acre", factor: 4046.8564224 },
    { symbol: "ft\u00b2", factor: 0.09290304 },
  ],
  speed: [
    { symbol: "m/s", factor: 1 },
    { symbol: "km/h", factor: 0.2777777778 },
    { symbol: "mph", factor: 0.44704 },
    { symbol: "knot", factor: 0.5144444444 },
    { symbol: "ft/s", factor: 0.3048 },
  ],
  time: [
    { symbol: "s", factor: 1 },
    { symbol: "min", factor: 60 },
    { symbol: "h", factor: 3600 },
    { symbol: "day", factor: 86400 },
    { symbol: "week", factor: 604800 },
  ],
  data: [
    { symbol: "B", factor: 1 },
    { symbol: "KB", factor: 1024 },
    { symbol: "MB", factor: 1048576 },
    { symbol: "GB", factor: 1073741824 },
    { symbol: "TB", factor: 1099511627776 },
  ],
};

const FAQ = [
  {
    question: "Which unit categories are supported?",
    answer: "Length, mass, volume, area, speed, time, and digital data (bytes through terabytes).",
  },
  {
    question: "How accurate are the conversions?",
    answer: "Conversions use exact international standard factors where possible, with results rounded to 6 significant digits for display.",
  },
  {
    question: "Is my data shared?",
    answer: "No. All conversions happen locally in your browser — nothing is uploaded.",
  },
];

const ARTICLE = {
  title: "One Tool for Every Measurement",
  content:
    "Measurements cross our path constantly — converting kilometers to miles while traveling, grams to cups in a recipe, or gigabytes to megabytes for a file transfer. A converter that spans multiple categories removes the need to memorize factors or dig up a formula. Choose your units, type once, and the answer is there in milliseconds.",
};

const CATEGORY_ORDER: UnitCategory[] = ["length", "mass", "volume", "area", "speed", "time", "data"];

export default function UnitConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.converter;
  const meta = t.meta["unit-converter"];
  const uc = t.unitConverter;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "converter",
    icon: <Ruler className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/converter" },
      { label: meta.name, href: "/tools/unit-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [cat, setCat] = useState<UnitCategory>("length");
  const [value, setValue] = useState("1");
  const [fromIdx, setFromIdx] = useState(2);
  const [toIdx, setToIdx] = useState(3);

  const units = useMemo(() => UNITS[cat], [cat]);
  const fromUnit = units[fromIdx] as { symbol: string; factor: number };
  const toUnit = units[toIdx] as { symbol: string; factor: number };

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (Number.isNaN(v)) return null;
    return (v * fromUnit.factor) / toUnit.factor;
  }, [value, fromUnit, toUnit]);

  const formatResult = useCallback((v: number) => {
    if (!Number.isFinite(v)) return "—";
    return String(parseFloat(v.toPrecision(8)));
  }, []);

  const swap = useCallback(() => {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
  }, [fromIdx, toIdx]);

  const selectCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";
  const labelCls = "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300";

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
          <label className={labelCls}>{uc.category}</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCat(c);
                  setFromIdx(1);
                  setToIdx(2);
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  cat === c
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {uc[c]}
              </button>
            ))}
          </div>
        </div>

        <div dir="ltr" className="grid grid-cols-1 items-end gap-4 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className={labelCls}>{uc.value}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>{uc.from}</label>
            <select value={fromIdx} onChange={(e) => setFromIdx(parseInt(e.target.value, 10))} className={selectCls}>
              {units.map((u, i) => (
                <option key={u.symbol} value={i}>{u.symbol}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-center sm:col-span-1">
            <button
              onClick={swap}
              className="mt-6 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              &#8646;
            </button>
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>{uc.to}</label>
            <select value={toIdx} onChange={(e) => setToIdx(parseInt(e.target.value, 10))} className={selectCls}>
              {units.map((u, i) => (
                <option key={u.symbol} value={i}>{u.symbol}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg bg-brand-50 p-6 text-center dark:bg-brand-900/20">
          <div className="text-sm font-medium text-brand-700 dark:text-brand-300">{uc.result}</div>
          <div className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">
            {result === null ? "—" : `${formatResult(result)} ${toUnit.symbol}`}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
