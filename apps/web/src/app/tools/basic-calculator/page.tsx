"use client";

import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Calculator } from "lucide-react";

const RELATED_SLUGS = ["percentage-calculator", "tip-calculator", "loan-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "percentage-calculator": "%",
  "tip-calculator": "T",
  "loan-calculator": "L",
};

const LONG_DESCRIPTION =
  "Our Basic Calculator handles addition, subtraction, multiplication, and division with a clean keypad and a full calculation history. It runs entirely in your browser — nothing is ever sent to a server. Great for quick math, expense totals, and everyday calculations.";

const FAQ = [
  {
    question: "Does the calculator keep a history?",
    answer: "Yes. Every completed calculation is added to a history panel below the keypad so you can review your work. Use Clear to wipe both the display and the history.",
  },
  {
    question: "Can I use the percentage key?",
    answer: "Yes. The % key divides the displayed number by 100 — handy for quickly converting percentages to decimals during calculations.",
  },
  {
    question: "Is my data sent anywhere?",
    answer: "No. The calculator runs entirely in your browser. Nothing is stored or transmitted.",
  },
];

const ARTICLE = {
  title: "Everyday Math, Done Right",
  content:
    "From splitting dinner bills to budgeting a purchase, quick arithmetic is part of daily life. A simple, reliable calculator removes the mental math and the typos. With a visible history, you can double-check every step — and because it runs in your browser, it works offline with total privacy.",
};

type Op = "+" | "-" | "\u00d7" | "\u00f7";

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return "Error";
  if (Number.isInteger(value)) return String(value);
  return String(parseFloat(value.toFixed(10)));
};

export default function BasicCalculatorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.calculation;
  const meta = t.meta["basic-calculator"];
  const bc = t.basicCalculator;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "calculation",
    icon: <Calculator className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/calculation" },
      { label: meta.name, href: "/tools/basic-calculator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = useCallback((d: string) => {
    setDisplay((cur) => {
      if (waiting) {
        setWaiting(false);
        return d;
      }
      if (cur === "0") return d;
      if (cur.replace(/[-.]/g, "").length >= 15) return cur;
      return cur + d;
    });
  }, [waiting]);

  const inputDot = useCallback(() => {
    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
      return;
    }
    if (!display.includes(".")) setDisplay((cur) => cur + ".");
  }, [display, waiting]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setWaiting(false);
    setHistory([]);
  }, []);

  const backspace = useCallback(() => {
    if (waiting) return;
    setDisplay((cur) => (cur.length > 1 ? cur.slice(0, -1) : "0"));
  }, [waiting]);

  const toggleSign = useCallback(() => {
    if (waiting) return;
    setDisplay((cur) => (cur.startsWith("-") ? cur.slice(1) : "-" + cur));
  }, [waiting]);

  const percent = useCallback(() => {
    if (waiting) return;
    setDisplay((cur) => formatNumber(parseFloat(cur) / 100));
  }, [waiting]);

  const compute = useCallback(
    (a: number, b: number, operator: Op): number => {
      switch (operator) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "\u00d7":
          return a * b;
        case "\u00f7":
          return a / b;
        default:
          return b;
      }
    },
    [],
  );

  const chooseOp = useCallback(
    (next: Op) => {
      const value = parseFloat(display);
      if (prev !== null && op !== null && !waiting) {
        const result = compute(prev, value, op);
        const entry = `${formatNumber(prev)} ${op} ${formatNumber(value)} = ${formatNumber(result)}`;
        setHistory((h) => [...h, entry].slice(-30));
        setPrev(result);
        setDisplay(formatNumber(result));
      } else {
        setPrev(value);
      }
      setOp(next);
      setWaiting(true);
    },
    [display, prev, op, waiting, compute],
  );

  const equals = useCallback(() => {
    if (op === null || prev === null) return;
    const value = parseFloat(display);
    if (waiting) {
      setOp(null);
      setPrev(null);
      setWaiting(false);
      return;
    }
    const result = compute(prev, value, op);
    const entry = `${formatNumber(prev)} ${op} ${formatNumber(value)} = ${formatNumber(result)}`;
    setHistory((h) => [...h, entry].slice(-30));
    setDisplay(formatNumber(result));
    setPrev(null);
    setOp(null);
    setWaiting(false);
  }, [display, prev, op, waiting, compute]);

  const btnBase =
    "h-14 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500";
  const btnNum =
    "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600";
  const btnOp = "bg-brand-600 text-white hover:bg-brand-700";
  const btnFn =
    "bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-500";

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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div dir="ltr" className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700 lg:col-span-2">
          <div className="mb-3 rounded-lg bg-neutral-100 px-4 py-3 text-right dark:bg-neutral-800">
            <div className="min-h-10 break-all text-3xl font-bold text-neutral-900 dark:text-white">
              {display}
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              {op ? `${formatNumber(prev ?? 0)} ${op}` : ""}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button onClick={clearAll} className={`${btnBase} ${btnFn} text-sm`}>{bc.clear}</button>
            <button onClick={backspace} className={`${btnBase} ${btnFn} text-sm`}>{bc.backspace}</button>
            <button onClick={percent} className={`${btnBase} ${btnFn}`}>%</button>
            <button onClick={() => chooseOp("\u00f7")} className={`${btnBase} ${btnOp}`} aria-label={bc.divide}>&#247;</button>

            <button onClick={() => inputDigit("7")} className={`${btnBase} ${btnNum}`}>7</button>
            <button onClick={() => inputDigit("8")} className={`${btnBase} ${btnNum}`}>8</button>
            <button onClick={() => inputDigit("9")} className={`${btnBase} ${btnNum}`}>9</button>
            <button onClick={() => chooseOp("\u00d7")} className={`${btnBase} ${btnOp}`} aria-label={bc.multiply}>&#215;</button>

            <button onClick={() => inputDigit("4")} className={`${btnBase} ${btnNum}`}>4</button>
            <button onClick={() => inputDigit("5")} className={`${btnBase} ${btnNum}`}>5</button>
            <button onClick={() => inputDigit("6")} className={`${btnBase} ${btnNum}`}>6</button>
            <button onClick={() => chooseOp("-")} className={`${btnBase} ${btnOp}`} aria-label={bc.subtract}>-</button>

            <button onClick={() => inputDigit("1")} className={`${btnBase} ${btnNum}`}>1</button>
            <button onClick={() => inputDigit("2")} className={`${btnBase} ${btnNum}`}>2</button>
            <button onClick={() => inputDigit("3")} className={`${btnBase} ${btnNum}`}>3</button>
            <button onClick={() => chooseOp("+")} className={`${btnBase} ${btnOp}`} aria-label={bc.add}>+</button>

            <button onClick={toggleSign} className={`${btnBase} ${btnFn}`}>+/&#8722;</button>
            <button onClick={() => inputDigit("0")} className={`${btnBase} ${btnNum}`}>0</button>
            <button onClick={inputDot} className={`${btnBase} ${btnNum}`}>.</button>
            <button onClick={equals} className={`${btnBase} ${btnOp}`} aria-label={bc.equals}>=</button>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800 lg:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">{bc.history}</h3>
          {history.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{bc.noHistory}</p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-auto font-mono text-sm">
              {history.map((entry, idx) => (
                <li key={idx} className="rounded bg-white px-3 py-1.5 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
