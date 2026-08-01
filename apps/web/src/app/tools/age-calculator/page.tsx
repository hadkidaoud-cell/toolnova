"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { computeAge } from "@/lib/date-math";
import { Cake } from "lucide-react";

const RELATED_SLUGS = ["date-difference", "countdown-timer", "bmi-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "date-difference": "📅",
  "countdown-timer": "⏳",
  "bmi-calculator": "⚖",
};

const LONG_DESCRIPTION =
  "Find out your exact age down to the day. Enter your birth date and we compute your age in years, months, and days, plus the total days and weeks you've lived and how many days remain until your next birthday.";

const FAQ = [
  {
    question: "How is age calculated exactly?",
    answer: "We count full years, then remaining months, then remaining days between the birth date and the reference date, following calendar rules for month lengths and leap years.",
  },
  {
    question: "Can I change the reference date?",
    answer: "Yes. The reference date defaults to today, but you can pick any date to calculate your age on that day.",
  },
  {
    question: "Is my data stored?",
    answer: "No. Everything is computed locally in your browser and nothing is saved.",
  },
];

const ARTICLE = {
  title: "Precise Age, Down to the Day",
  content:
    "A simple 'years old' number hides a lot of detail. Age in years, months, and days matters for milestones, eligibility windows, and legal documents. Our calculator handles all the calendar edge cases automatically.",
};

export default function AgeCalculatorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.calculation;
  const meta = t.meta["age-calculator"];
  const u = t.ageCalculator;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "calculation",
    icon: <Cake className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/calculation" },
      { label: meta.name, href: "/tools/age-calculator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [birth, setBirth] = useState("");
  const [ref, setRef] = useState(today);
  const result = useMemo(() => computeAge(birth, ref), [birth, ref]);

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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.birthdate}</label>
            <input type="date" value={birth} max={ref} onChange={(e) => setBirth(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.today}</label>
            <input type="date" value={ref} onChange={(e) => setRef(e.target.value)} className={inputCls} />
          </div>
        </div>

        {!result.valid && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {u.invalidDate}
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
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{result.nextBirthdayDays}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.nextBirthday}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <div className="text-lg font-bold text-neutral-900 dark:text-white">{result.totalDays.toLocaleString()}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.totalDays}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <div className="text-lg font-bold text-neutral-900 dark:text-white">{result.totalWeeks.toLocaleString()}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.weeksLived}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
