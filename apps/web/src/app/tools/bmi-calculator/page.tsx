"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { HeartPulse } from "lucide-react";

const RELATED_SLUGS = ["percentage-calculator", "tip-calculator", "basic-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "percentage-calculator": "%",
  "tip-calculator": "T",
  "basic-calculator": "C",
};

const LONG_DESCRIPTION =
  "Our BMI Calculator computes your Body Mass Index from height and weight in metric or imperial units, then places it in the standard WHO category and shows the healthy weight range for your height. A quick, private way to understand where your weight falls — everything runs in your browser.";

const FAQ = [
  {
    question: "What is BMI?",
    answer: "Body Mass Index is weight in kilograms divided by height in meters squared. It is a simple screening measure, not a diagnostic tool — muscle mass, age, and body shape are not accounted for.",
  },
  {
    question: "How are categories defined?",
    answer: "Using the standard WHO ranges: below 18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, and 30 or above obese.",
  },
  {
    question: "Can I use imperial units?",
    answer: "Yes. Switch to the Imperial tab and enter height in feet and inches and weight in pounds — the conversion happens automatically.",
  },
];

const ARTICLE = {
  title: "Reading Your BMI in Context",
  content:
    "BMI is one of the most common weight screening tools in the world, and it is only useful when you understand its limits. It gives a quick snapshot, but athletes, children, pregnant women, and elderly adults need a healthcare professional's interpretation. Use our calculator as a starting point, and discuss your results with a provider for a complete picture of your health.",
};

function bmiCategory(bmi: number, t: { underweight: string; normal: string; overweight: string; obese: string }) {
  if (bmi < 18.5) return { label: t.underweight, color: "bg-blue-500" };
  if (bmi < 25) return { label: t.normal, color: "bg-green-500" };
  if (bmi < 30) return { label: t.overweight, color: "bg-amber-500" };
  return { label: t.obese, color: "bg-red-500" };
}

export default function BmiCalculatorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.calculation;
  const meta = t.meta["bmi-calculator"];
  const bm = t.bmi;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "calculation",
    icon: <HeartPulse className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/calculation" },
      { label: meta.name, href: "/tools/bmi-calculator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [system, setSystem] = useState<"metric" | "imperial">("metric");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("70");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weightLb, setWeightLb] = useState("154");

  const result = useMemo(() => {
    let meters: number;
    let kg: number;
    if (system === "metric") {
      const cm = parseFloat(heightCm);
      const w = parseFloat(weightKg);
      if (Number.isNaN(cm) || Number.isNaN(w) || cm <= 0 || w <= 0) return null;
      meters = cm / 100;
      kg = w;
    } else {
      const ft = parseFloat(heightFt);
      const inch = parseFloat(heightIn);
      const lb = parseFloat(weightLb);
      if (
        Number.isNaN(ft) || Number.isNaN(inch) || Number.isNaN(lb) ||
        ft < 0 || inch < 0 || lb <= 0
      ) return null;
      meters = (ft * 12 + inch) * 0.0254;
      kg = lb * 0.453592;
    }
    if (meters <= 0) return null;
    const bmi = kg / (meters * meters);
    const healthyMin = 18.5 * meters * meters;
    const healthyMax = 24.9 * meters * meters;
    return { bmi: parseFloat(bmi.toFixed(1)), healthyMin: healthyMin.toFixed(1), healthyMax: healthyMax.toFixed(1) };
  }, [system, heightCm, weightKg, heightFt, heightIn, weightLb]);

  const cat = result ? bmiCategory(result.bmi, bm) : null;

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
        <div className="flex flex-wrap gap-2">
          {(["metric", "imperial"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSystem(s)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                system === s
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {s === "metric" ? bm.metric : bm.imperial}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {system === "metric" ? (
            <>
              <div>
                <label className={labelCls}>{bm.heightCm}</label>
                <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{bm.weightKg}</label>
                <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className={inputCls} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>{bm.heightFt}</label>
                <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{bm.heightIn}</label>
                <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{bm.weightLb}</label>
                <input type="number" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} className={inputCls} />
              </div>
            </>
          )}
        </div>

        {result ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="text-center">
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{bm.yourBmi}</div>
              <div className="mt-1 text-5xl font-bold text-brand-600 dark:text-brand-400">{result.bmi}</div>
              {cat && (
                <div className={`mx-auto mt-3 inline-block rounded-full px-4 py-1 text-sm font-semibold text-white ${cat.color}`}>
                  {cat.label}
                </div>
              )}
            </div>

            <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
                style={{ width: `${Math.min(100, Math.max(0, ((result.bmi - 10) / 20) * 100))}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-neutral-600 dark:text-neutral-400">
              <div>
                <div className="font-semibold text-blue-500">&lt;18.5</div>
                {bm.underweight}
              </div>
              <div>
                <div className="font-semibold text-green-500">18.5–24.9</div>
                {bm.normal}
              </div>
              <div>
                <div className="font-semibold text-red-500">&ge;30</div>
                {bm.obese}
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-white p-4 text-center text-sm text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
              {bm.healthyRange.replace("18.5", result.healthyMin).replace("24.9", result.healthyMax)}
              <div className="mt-1 font-semibold text-brand-600 dark:text-brand-400">
                {result.healthyMin} – {result.healthyMax}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            {bm.calculate}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
