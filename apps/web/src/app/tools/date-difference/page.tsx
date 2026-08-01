"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { CalendarDays, ArrowLeftRight } from "lucide-react";

const RELATED_SLUGS = ["age-calculator", "countdown-timer", "timezone-converter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "age-calculator": "🎂",
  "countdown-timer": "⏳",
  "timezone-converter": "🕐",
};

const LONG_DESCRIPTION =
  "Calculate the exact span between any two dates: the number of years, months, and days, plus the total days and weeks. Swap the dates instantly to check the reverse span. Great for project timelines, service lengths, and countdown planning.";

const FAQ = [
  {
    question: "Does the result include the end date?",
    answer: "We measure full elapsed periods between midnight of each date, matching how calendar spans are typically counted.",
  },
  {
    question: "What if I pick the dates in the wrong order?",
    answer: "Just hit Swap to reverse them, or we'll tell you to check the order so the result is always meaningful.",
  },
  {
    question: "Is this calculated on my device?",
    answer: "Yes, entirely in your browser — nothing is sent to a server.",
  },
];

const ARTICLE = {
  title: "Counting Time Between Two Dates",
  content:
    "Dates are everywhere in planning: holidays, deadlines, anniversaries, and project milestones. Breaking a span into years, months, and days — or total days and weeks — makes comparisons and scheduling concrete. Our calculator does the calendar math for you instantly.",
};

interface DiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  valid: boolean;
}

function computeDiff(fromStr: string, toStr: string): DiffResult {
  if (!fromStr || !toStr) return { years: 0, months: 0, days: 0, totalDays: 0, totalWeeks: 0, valid: false };
  const from = new Date(fromStr + "T00:00:00");
  const to = new Date(toStr + "T00:00:00");
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
    return { years: 0, months: 0, days: 0, totalDays: 0, totalWeeks: 0, valid: false };
  }
  const totalDays = Math.floor((to.getTime() - from.getTime()) / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days, totalDays, totalWeeks, valid: true };
}

export default function DateDifferencePage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.calculation;
  const meta = t.meta["date-difference"];
  const u = t.dateDifference;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "calculation",
    icon: <CalendarDays className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/calculation" },
      { label: meta.name, href: "/tools/date-difference" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const result = useMemo(() => computeDiff(from, to), [from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

  const statCls = "rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800";

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
        <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.from}</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </div>
          <button
            onClick={swap}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
            title={u.swap}
          >
            <ArrowLeftRight className="h-4 w-4 rtl:rotate-90" />
          </button>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.to}</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </div>
        </div>

        {!result.valid && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {u.invalidRange}
          </p>
        )}

        {result.valid && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className={statCls}>
                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">{result.years}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.years}</div>
              </div>
              <div className={statCls}>
                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">{result.months}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.months}</div>
              </div>
              <div className={statCls}>
                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">{result.days}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.days}</div>
              </div>
              <div className={statCls}>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{result.totalDays.toLocaleString()}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.totalDays}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <div className="text-lg font-bold text-neutral-900 dark:text-white">{result.totalWeeks.toLocaleString()}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.totalWeeks}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
