"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Binary } from "lucide-react";

const RELATED_SLUGS = ["unit-converter", "temperature-converter", "currency-converter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "unit-converter": "📏",
  "temperature-converter": "🌡",
  "currency-converter": "💱",
};

const LONG_DESCRIPTION =
  "Convert numbers between binary, octal, decimal, and hexadecimal instantly. Type any value and pick the source and target bases. Large numbers are handled with BigInt precision, so even huge integers convert exactly. Perfect for programming, network math, and digital design.";

const FAQ = [
  {
    question: "What are number bases?",
    answer: "A base is the number of digits a system uses: binary uses 0 and 1, octal uses 0-7, decimal uses 0-9, and hexadecimal uses 0-9 plus A-F.",
  },
  {
    question: "Why is binary used in computing?",
    answer: "Computers store everything as binary because transistors have two states: on and off. Hexadecimal is a compact shorthand for binary.",
  },
  {
    question: "Does it support negative or fractional numbers?",
    answer: "It supports large positive integers precisely. For negatives, prefix with a minus sign; fractions are best converted separately.",
  },
];

const ARTICLE = {
  title: "Bases in Everyday Computing",
  content:
    "Every number you see is just a convention. Choosing the right base makes patterns visible: subnet masks, color codes, and memory addresses are all easier to understand in hexadecimal, while binary reveals the raw bits. Our converter moves between bases instantly and precisely.",
};

const BASES = [
  { value: 2, label: "binary" },
  { value: 8, label: "octal" },
  { value: 10, label: "decimal" },
  { value: 16, label: "hexadecimal" },
] as const;

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

function parseInBase(input: string, base: number): bigint {
  let s = input.trim().toLowerCase();
  if (base === 16 && s.startsWith("0x")) s = s.slice(2);
  if (base === 2 && s.startsWith("0b")) s = s.slice(2);
  if (base === 8 && s.startsWith("0o")) s = s.slice(2);
  if (!s) throw new Error("empty");
  let big = 0n;
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) throw new Error("invalid");
    big = big * BigInt(base) + BigInt(d);
  }
  return big;
}

export default function NumberBaseConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.converter;
  const meta = t.meta["number-base-converter"];
  const u = t.numberBase;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "converter",
    icon: <Binary className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/converter" },
      { label: meta.name, href: "/tools/number-base-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [value, setValue] = useState("255");
  const [from, setFrom] = useState(10);
  const [to, setTo] = useState(16);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const convert = useMemo(() => {
    return () => {
      setError("");
      if (!value.trim()) {
        setResult("");
        return;
      }
      try {
        const big = parseInBase(value, from);
        setResult(big.toString(to).toUpperCase());
      } catch {
        setResult("");
        setError(u.invalidNumber);
      }
    };
  }, [value, from, to, u.invalidNumber]);

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500";

  const baseLabel = (b: number) => {
    const match = BASES.find((x) => x.value === b);
    return match ? u[match.label] : String(b);
  };

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
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.value}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.fromBase}</label>
            <select
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            >
              {BASES.map((b) => (
                <option key={b.value} value={b.value}>
                  {baseLabel(b.value)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.toBase}</label>
            <select
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            >
              {BASES.map((b) => (
                <option key={b.value} value={b.value}>
                  {baseLabel(b.value)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={convert}
          disabled={!value}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-neutral-900"
        >
          {u.convert}
        </button>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {result && (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.result}</label>
            <div className="rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 font-mono text-lg font-semibold break-all text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white">
              {result}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
