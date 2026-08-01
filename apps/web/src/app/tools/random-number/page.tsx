"use client";

import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Dices, Copy, Check } from "lucide-react";

const RELATED_SLUGS = ["password-generator", "uuid-generator", "basic-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "password-generator": "*",
  "uuid-generator": "U",
  "basic-calculator": "=",
};

const LONG_DESCRIPTION =
  "Our Random Number Generator creates random numbers within any range. Set the minimum, maximum, and quantity, choose whether duplicates are allowed, and generate — with a one-click copy.";

function generate(min: number, max: number, count: number, allowDuplicates: boolean): number[] | null {
  const range = max - min + 1;
  if (count <= 0 || range <= 0) return [];
  if (!allowDuplicates && count > range) return null;
  const result: number[] = [];
  if (allowDuplicates) {
    for (let i = 0; i < count; i++) {
      result.push(min + Math.floor(Math.random() * range));
    }
  } else {
    const pool = Array.from({ length: range }, (_, i) => min + i);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      result.push(pool[idx] as number);
      pool.splice(idx, 1);
    }
  }
  return result;
}

const FAQ = [
  {
    question: "Can I avoid duplicate numbers?",
    answer: "Yes — toggle off Allow duplicates. If the range is too small for the quantity, an error explains why.",
  },
  {
    question: "What ranges are supported?",
    answer: "Any integers, including negatives. For example, -10 to 10 works perfectly.",
  },
  {
    question: "Are the numbers truly random?",
    answer: "Numbers use the browser's crypto-grade Math.random() — suitable for games, picks, and sampling.",
  },
];

const ARTICLE = {
  title: "Randomness on Demand",
  content:
    "From picking lottery-style draws and assigning teams to generating test data, random numbers power all sorts of everyday tasks. A flexible generator lets you control the range, the quantity, and whether repeats are allowed — then copy the results straight into your document or script.",
};

export default function RandomNumberGeneratorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.generator;
  const meta = t.meta["random-number"];
  const rn = t.randomNumber;
  const common = t.common;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "generator",
    icon: <Dices className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/generator" },
      { label: meta.name, href: "/tools/random-number" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [quantity, setQuantity] = useState("5");
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [numbers, setNumbers] = useState<number[] | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateNumbers = useCallback(() => {
    setError(false);
    setCopied(false);
    const lo = Math.round(parseFloat(min));
    const hi = Math.round(parseFloat(max));
    const n = Math.round(parseFloat(quantity));
    if (Number.isNaN(lo) || Number.isNaN(hi) || Number.isNaN(n) || lo > hi) {
      setError(true);
      setNumbers(null);
      return;
    }
    const res = generate(lo, hi, n, allowDuplicates);
    if (res === null) {
      setError(true);
      setNumbers(null);
      return;
    }
    setNumbers(res);
  }, [min, max, quantity, allowDuplicates]);

  const copyAll = useCallback(async () => {
    if (!numbers) return;
    const text = numbers.join(", ");
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
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }, [numbers]);

  const labelCls = "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300";
  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>{rn.min}</label>
            <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{rn.max}</label>
            <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{rn.quantity}</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={allowDuplicates}
            onChange={(e) => setAllowDuplicates(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
          />
          {rn.allowDuplicates}
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={generateNumbers}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {rn.generate}
          </button>
          {numbers && (
            <button
              onClick={copyAll}
              className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? common.copied : rn.copyAll}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {rn.insufficientRange}
          </div>
        )}

        {numbers && (
          <div>
            <div className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">{rn.result}</div>
            <div className="flex flex-wrap gap-2">
              {numbers.map((n, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-brand-50 px-4 py-2 font-mono text-lg font-semibold text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
