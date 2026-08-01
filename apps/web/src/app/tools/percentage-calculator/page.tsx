"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Percent } from "lucide-react";

const RELATED_SLUGS = ["basic-calculator", "tip-calculator", "loan-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "basic-calculator": "C",
  "tip-calculator": "T",
  "loan-calculator": "L",
};

const LONG_DESCRIPTION =
  "Our Percentage Calculator handles the four most common percent problems: what is X% of Y, X is what percent of Y, increase Y by X%, and decrease Y by X%. Perfect for discounts, taxes, tips, grades, and data analysis — all computed instantly in your browser.";

const FAQ = [
  {
    question: "Which percent problems can it solve?",
    answer: "Four modes: percentage of a number (X% of Y), percentage ratio (X is what % of Y), percentage increase, and percentage decrease.",
  },
  {
    question: "How do I calculate a 20% discount?",
    answer: "Use the 'Decrease Y by X%' mode with X = 20 and Y = the original price. The result is the discounted price.",
  },
  {
    question: "Is there a limit on the numbers?",
    answer: "Inputs can be any positive or negative number. Results are rounded to 6 decimal places for display.",
  },
];

const ARTICLE = {
  title: "Percentages Made Simple",
  content:
    "Percentages appear everywhere — sales, interest rates, exam scores, statistics, and more. The four core calculations cover nearly every real-world use, from 'how much is 15% of 200' to 'by what percent did sales grow?'. A dedicated percentage calculator removes arithmetic mistakes and gives you results in a single click.",
};

export default function PercentageCalculatorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.calculation;
  const meta = t.meta["percentage-calculator"];
  const pc = t.percentageCalculator;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "calculation",
    icon: <Percent className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/calculation" },
      { label: meta.name, href: "/tools/percentage-calculator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const modes = [
    { id: "what", label: pc.modeWhatPercent },
    { id: "of", label: pc.modePercentOf },
    { id: "increase", label: pc.modeIncrease },
    { id: "decrease", label: pc.modeDecrease },
  ] as const;

  type Mode = (typeof modes)[number]["id"];

  const [mode, setMode] = useState<Mode>("what");
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const result = useMemo(() => {
    const xv = parseFloat(x);
    const yv = parseFloat(y);
    if (Number.isNaN(xv) || Number.isNaN(yv)) return null;
    let value: number;
    switch (mode) {
      case "what":
        value = (xv / 100) * yv;
        break;
      case "of":
        value = yv === 0 ? NaN : (xv / yv) * 100;
        break;
      case "increase":
        value = yv * (1 + xv / 100);
        break;
      case "decrease":
        value = yv * (1 - xv / 100);
        break;
      default:
        value = NaN;
    }
    return Number.isFinite(value) ? value : null;
  }, [mode, x, y]);

  const formatResult = useCallback((value: number) => {
    const rounded = parseFloat(value.toFixed(6));
    return String(rounded);
  }, []);

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
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                mode === m.id
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {mode === "what" ? pc.percentage : pc.firstNumber}
            </label>
            <input
              type="number"
              value={x}
              onChange={(e) => setX(e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {pc.secondNumber}
            </label>
            <input
              type="number"
              value={y}
              onChange={(e) => setY(e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </div>
        </div>

        <div className="rounded-lg bg-brand-50 p-6 text-center dark:bg-brand-900/20">
          <div className="text-sm font-medium text-brand-700 dark:text-brand-300">{pc.result}</div>
          <div className="mt-1 text-4xl font-bold text-brand-600 dark:text-brand-400">
            {result === null ? "—" : mode === "of" ? `${formatResult(result)} %` : formatResult(result)}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
