"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Thermometer } from "lucide-react";

const RELATED_SLUGS = ["unit-converter", "currency-converter", "basic-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "unit-converter": "U",
  "currency-converter": "C",
  "basic-calculator": "=",
};

const LONG_DESCRIPTION =
  "Our Temperature Converter instantly converts between Celsius, Fahrenheit, and Kelvin. Type a value, pick the source and target scale, and the result appears immediately. Perfect for travel, cooking, science, and weather — all calculated in your browser with no uploads.";

const FAQ = [
  {
    question: "What are the formulas used?",
    answer: "We convert via Celsius: °F = (°C × 9/5) + 32, K = °C + 273.15, and the reverse formulas accordingly.",
  },
  {
    question: "Can Kelvin be negative?",
    answer: "Absolute zero is 0 K (−273.15 °C). Below that, values are physically impossible — if you enter such values, results will simply be calculated mathematically.",
  },
  {
    question: "Which scales are supported?",
    answer: "Celsius, Fahrenheit, and Kelvin — the three most common temperature scales worldwide.",
  },
];

const ARTICLE = {
  title: "Degrees Across Borders",
  content:
    "Weather forecasts in Fahrenheit, recipes in Celsius, physics labs in Kelvin — temperature scales vary by context and country. Converting between them by hand invites errors, especially in cooking or scientific work. Our converter handles all three scales with exact formulas, so you can trust the number and move on.",
};

const UNITS = ["C", "F", "K"] as const;
type Scale = (typeof UNITS)[number];

function toCelsius(value: number, scale: Scale): number {
  switch (scale) {
    case "C":
      return value;
    case "F":
      return ((value - 32) * 5) / 9;
    case "K":
      return value - 273.15;
  }
}

function fromCelsius(celsius: number, scale: Scale): number {
  switch (scale) {
    case "C":
      return celsius;
    case "F":
      return (celsius * 9) / 5 + 32;
    case "K":
      return celsius + 273.15;
  }
}

export default function TemperatureConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.converter;
  const meta = t.meta["temperature-converter"];
  const tc = t.temperatureConverter;

  const scaleLabels: Record<Scale, string> = {
    C: tc.celsius,
    F: tc.fahrenheit,
    K: tc.kelvin,
  };

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "converter",
    icon: <Thermometer className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/converter" },
      { label: meta.name, href: "/tools/temperature-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [value, setValue] = useState("20");
  const [from, setFrom] = useState<Scale>("C");
  const [to, setTo] = useState<Scale>("F");

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (Number.isNaN(v)) return null;
    return fromCelsius(toCelsius(v, from), to);
  }, [value, from, to]);

  const formatResult = useCallback((v: number) => {
    if (!Number.isFinite(v)) return "—";
    return String(parseFloat(v.toPrecision(8)));
  }, []);

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const labelCls = "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300";
  const selectCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

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
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className={labelCls}>{tc.value}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>{tc.from}</label>
            <select value={from} onChange={(e) => setFrom(e.target.value as Scale)} className={selectCls}>
              {UNITS.map((u) => (
                <option key={u} value={u}>{scaleLabels[u]}</option>
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
            <label className={labelCls}>{tc.to}</label>
            <select value={to} onChange={(e) => setTo(e.target.value as Scale)} className={selectCls}>
              {UNITS.map((u) => (
                <option key={u} value={u}>{scaleLabels[u]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg bg-brand-50 p-6 text-center dark:bg-brand-900/20">
          <div className="text-sm font-medium text-brand-700 dark:text-brand-300">{tc.result}</div>
          <div className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">
            {result === null ? "—" : `${formatResult(result)}° ${UNITS[UNITS.indexOf(to)]}`}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
