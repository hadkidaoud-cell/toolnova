"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Coins } from "lucide-react";

const RELATED_SLUGS = ["unit-converter", "temperature-converter", "basic-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "unit-converter": "U",
  "temperature-converter": "T°",
  "basic-calculator": "=",
};

const LONG_DESCRIPTION =
  "Our Currency Converter converts between 10 major world currencies using transparent reference rates. Choose the source and target currency, enter an amount, and get the result instantly. Rates are indicative reference values — for live market pricing, connect a rate API on the paid plan.";

const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155,
  CNY: 7.2,
  AED: 3.67,
  SAR: 3.75,
  EGP: 48,
  CAD: 1.36,
  AUD: 1.52,
};

const CURRENCY_CODES = Object.keys(RATES);

const FAQ = [
  {
    question: "How current are the rates?",
    answer: "These are indicative reference rates set by our team and may not reflect live market values. They are suitable for estimates, not financial transactions.",
  },
  {
    question: "Can I get live rates?",
    answer: "Yes — the paid plan connects to a live exchange-rate API so conversions always reflect the current market.",
  },
  {
    question: "Which currencies are supported?",
    answer: "Ten major currencies: USD, EUR, GBP, JPY, CNY, AED, SAR, EGP, CAD, and AUD.",
  },
];

const ARTICLE = {
  title: "Smart Conversion for a Global Economy",
  content:
    "Prices, salaries, and travel budgets all cross borders these days. A quick conversion helps you compare costs and plan spending — whether you are shopping online from another country or estimating an international transfer. Reference rates cover everyday needs, and a live-rate feed turns estimates into precise figures for business decisions.",
};

export default function CurrencyConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.converter;
  const meta = t.meta["currency-converter"];
  const cc = t.currencyConverter;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "converter",
    icon: <Coins className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/converter" },
      { label: meta.name, href: "/tools/currency-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  const result = useMemo(() => {
    const v = parseFloat(amount);
    if (Number.isNaN(v) || v < 0) return null;
    const fromRate = RATES[from] as number;
    const toRate = RATES[to] as number;
    return (v / fromRate) * toRate;
  }, [amount, from, to]);

  const formatMoney = useCallback((v: number) => {
    if (!Number.isFinite(v)) return "—";
    return new Intl.NumberFormat(undefined, {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  }, []);

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

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
        <div dir="ltr" className="grid grid-cols-1 items-end gap-4 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className={labelCls}>{cc.amount}</label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>{cc.from}</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls}>
              {CURRENCY_CODES.map((code) => (
                <option key={code} value={code}>{code} — {cc.currencies[code as keyof typeof cc.currencies]}</option>
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
            <label className={labelCls}>{cc.to}</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className={selectCls}>
              {CURRENCY_CODES.map((code) => (
                <option key={code} value={code}>{code} — {cc.currencies[code as keyof typeof cc.currencies]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg bg-brand-50 p-6 text-center dark:bg-brand-900/20">
          <div className="text-sm font-medium text-brand-700 dark:text-brand-300">{cc.result}</div>
          <div className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">
            {result === null ? "—" : `${formatMoney(result)} ${to}`}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
          <div className="mb-1 font-medium">{cc.ratesNote}</div>
          {cc.disclaimer}
        </div>
      </div>
    </ToolLayout>
  );
}
