"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Banknote } from "lucide-react";

const RELATED_SLUGS = ["basic-calculator", "percentage-calculator", "loan-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "basic-calculator": "C",
  "percentage-calculator": "%",
  "loan-calculator": "L",
};

const LONG_DESCRIPTION =
  "Our Tip Calculator works out the tip amount, the total bill, and how much each person pays — whether you're dining solo or splitting among friends. Choose a preset percentage or enter your own, then adjust the number of people. Results update live as you type, right in your browser.";

const FAQ = [
  {
    question: "How do preset percentages work?",
    answer: "Presets (10%, 15%, 18%, 20%, 25%) are common tipping conventions. Click one to apply it instantly, or type a custom percentage.",
  },
  {
    question: "How is the total split calculated?",
    answer: "The bill plus the tip is divided evenly among the number of people, showing both the tip per person and the total per person.",
  },
  {
    question: "Does it round to two decimals?",
    answer: "Yes, all money amounts are rounded to two decimal places for easy payment.",
  },
];

const ARTICLE = {
  title: "Fair Splitting, Zero Math Stress",
  content:
    "At the end of a shared meal, the mental arithmetic begins — tip percentage, total, and the all-important per-person share. A tip calculator eliminates the guesswork and the awkward double-counting, showing exactly what each person owes in seconds. It is private, precise, and works offline.",
};

const PRESETS = [10, 15, 18, 20, 25];

const money = (value: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
    Number.isFinite(value) ? value : 0,
  );

export default function TipCalculatorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.calculation;
  const meta = t.meta["tip-calculator"];
  const tp = t.tip;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "calculation",
    icon: <Banknote className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/calculation" },
      { label: meta.name, href: "/tools/tip-calculator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [bill, setBill] = useState("50");
  const [percent, setPercent] = useState(18);
  const [people, setPeople] = useState(2);

  const result = useMemo(() => {
    const billValue = parseFloat(bill);
    const peopleValue = Math.max(1, Math.floor(people) || 1);
    if (Number.isNaN(billValue) || billValue < 0) return null;
    const tipAmount = billValue * (percent / 100);
    const total = billValue + tipAmount;
    return {
      tipAmount,
      total,
      tipPerPerson: tipAmount / peopleValue,
      totalPerPerson: total / peopleValue,
    };
  }, [bill, percent, people]);

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{tp.billAmount}</label>
            <input type="number" min={0} step="0.01" value={bill} onChange={(e) => setBill(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{tp.numberOfPeople}</label>
            <input type="number" min={1} value={people} onChange={(e) => setPeople(parseInt(e.target.value || "1", 10))} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>{tp.tipPercent}</label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPercent(p)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  percent === p
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {p}%
              </button>
            ))}
            <input
              type="number"
              min={0}
              max={100}
              value={percent}
              onChange={(e) => setPercent(parseFloat(e.target.value) || 0)}
              className={`${inputCls} w-24`}
            />
          </div>
        </div>

        {result ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{money(result.tipAmount)}</div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{tp.tipAmount}</div>
            </div>
            <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{money(result.tipPerPerson)}</div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{tp.tipPerPerson}</div>
            </div>
            <div className="rounded-lg bg-brand-50 p-4 text-center dark:bg-brand-900/20">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{money(result.totalPerPerson)}</div>
              <div className="mt-1 text-sm text-brand-700 dark:text-brand-300">{tp.totalPerPerson}</div>
            </div>
            <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{money(result.total)}</div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{tp.totalPerPerson}</div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            {tp.calculate}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
