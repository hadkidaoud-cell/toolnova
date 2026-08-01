"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Landmark } from "lucide-react";

const RELATED_SLUGS = ["percentage-calculator", "tip-calculator", "basic-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "percentage-calculator": "%",
  "tip-calculator": "T",
  "basic-calculator": "C",
};

const LONG_DESCRIPTION =
  "Our Loan Calculator estimates your monthly payment, total payment, and total interest for any loan — then shows a full amortization schedule year by year. Adjust the amount, annual interest rate, and term to compare scenarios. Ideal for mortgages, auto loans, and personal loans. All calculations run in your browser.";

const FAQ = [
  {
    question: "How is the monthly payment calculated?",
    answer: "Using the standard amortization formula: M = P × r × (1 + r)^n / ((1 + r)^n − 1), where P is the principal, r is the monthly interest rate, and n is the number of monthly payments.",
  },
  {
    question: "What is an amortization schedule?",
    answer: "It shows how each period's payment is split between interest and principal, and how the remaining balance decreases over time. Early payments are mostly interest; later payments are mostly principal.",
  },
  {
    question: "Are extra payments accounted for?",
    answer: "Not in this version. The schedule assumes fixed equal payments for the full term. For a more advanced analysis, please use the paid plan features.",
  },
];

const ARTICLE = {
  title: "Understanding Your Loan Before You Sign",
  content:
    "A loan is a promise to pay — and the total interest can dwarf the amount you borrow. Before signing, know three numbers: your monthly payment, the total you will pay back, and the total interest. An amortization schedule adds a fourth layer, showing how equity builds over time. Our calculator gives you all of these instantly, so you can compare offers and negotiate with confidence.",
};

const money = (value: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
    Number.isFinite(value) ? value : 0,
  );

export default function LoanCalculatorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.calculation;
  const meta = t.meta["loan-calculator"];
  const ln = t.loan;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "calculation",
    icon: <Landmark className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/calculation" },
      { label: meta.name, href: "/tools/loan-calculator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [amount, setAmount] = useState("250000");
  const [rate, setRate] = useState("5.5");
  const [years, setYears] = useState("30");

  const result = useMemo(() => {
    const principal = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const termYears = parseInt(years, 10);
    if (
      Number.isNaN(principal) || Number.isNaN(annualRate) || Number.isNaN(termYears) ||
      principal <= 0 || annualRate < 0 || termYears <= 0 || termYears > 100
    ) return null;

    const months = termYears * 12;
    const monthlyRate = annualRate / 100 / 12;
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
    } else {
      const factor = Math.pow(1 + monthlyRate, months);
      monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
    }
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    const schedule: { year: number; principal: number; interest: number; balance: number }[] = [];
    let balance = principal;
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 1; m <= months; m++) {
      const interestPart = balance * monthlyRate;
      const principalPart = monthlyPayment - interestPart;
      yearPrincipal += principalPart;
      yearInterest += interestPart;
      balance = balance - principalPart;
      if (m % 12 === 0 || m === months) {
        schedule.push({
          year: m / 12,
          principal: yearPrincipal,
          interest: yearInterest,
          balance: Math.max(0, balance),
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
    };
  }, [amount, rate, years]);

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>{ln.loanAmount}</label>
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{ln.interestRate}</label>
            <input type="number" min={0} step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{ln.loanTermYears}</label>
            <input type="number" min={1} max={100} value={years} onChange={(e) => setYears(e.target.value)} className={inputCls} />
          </div>
        </div>

        {result ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-brand-50 p-4 text-center dark:bg-brand-900/20">
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {money(result.monthlyPayment)}
                </div>
                <div className="mt-1 text-sm text-brand-700 dark:text-brand-300">{ln.monthlyPayment}</div>
              </div>
              <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{money(result.totalPayment)}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{ln.totalPayment}</div>
              </div>
              <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{money(result.totalInterest)}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{ln.totalInterest}</div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">{ln.schedule}</h3>
              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      <th className="px-4 py-2 font-medium">{ln.year}</th>
                      <th className="px-4 py-2 font-medium">{ln.principal}</th>
                      <th className="px-4 py-2 font-medium">{ln.interest}</th>
                      <th className="px-4 py-2 font-medium">{ln.balance}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {result.schedule.map((row) => (
                      <tr key={row.year} className="bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                        <td className="px-4 py-2">{row.year}</td>
                        <td className="px-4 py-2">{money(row.principal)}</td>
                        <td className="px-4 py-2">{money(row.interest)}</td>
                        <td className="px-4 py-2">{money(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            {ln.calculate}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
