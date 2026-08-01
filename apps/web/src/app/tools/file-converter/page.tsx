"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { UpgradeGate } from "@/components/billing/upgrade-gate";
import { usePlan } from "@/components/billing/plan-provider";
import { useI18n } from "@/i18n";
import { FileType } from "lucide-react";

const RELATED_SLUGS = ["unit-converter", "currency-converter", "image-to-pdf"] as const;

const RELATED_ICONS: Record<string, string> = {
  "unit-converter": "U",
  "currency-converter": "C",
  "image-to-pdf": "PDF",
};

const LONG_DESCRIPTION =
  "Our File Converter transforms CSV data into JSON and JSON data into CSV — right in your browser. Paste your data, choose the direction, and download the result as a ready-to-use file. Nothing is uploaded; everything happens locally.";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] as string;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function toJson(csvText: string): { ok: boolean; data?: unknown; error?: string; invalidKey?: "invalidCsv" | "invalidJson" } {
  const rows = parseCsv(csvText);
  if (rows.length === 0 || (rows.length === 1 && rows[0]!.length === 1 && rows[0]![0]!.trim() === "")) {
    return { ok: false, invalidKey: "invalidCsv" };
  }
  const headers = rows[0]!.map((h) => h.trim());
  const records = rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? "") as string;
    });
    return obj;
  });
  return { ok: true, data: records };
}

function toCsv(data: unknown): { ok: boolean; text?: string; invalidKey?: "invalidCsv" | "invalidJson" } {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
    const headers = Array.from(
      new Set(
        data.flatMap((item) => Object.keys(item as Record<string, unknown>))
      )
    );
    const escape = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const lines = [headers.map(escape).join(",")];
    data.forEach((item) => {
      const rec = item as Record<string, unknown>;
      lines.push(headers.map((h) => escape(String(rec[h] ?? ""))).join(","));
    });
    return { ok: true, text: lines.join("\n") };
  }
  return { ok: false, invalidKey: "invalidJson" };
}

const FAQ = [
  {
    question: "Is the data sent to a server?",
    answer: "No. Conversion happens entirely in your browser using JavaScript — your data never leaves your device.",
  },
  {
    question: "Does the CSV parser handle quoted fields?",
    answer: "Yes. Fields wrapped in double quotes are parsed correctly, including commas and escaped quotes inside them.",
  },
  {
    question: "Can I download the result?",
    answer: "Yes — click the download button to save the converted output as a .json or .csv file.",
  },
];

const ARTICLE = {
  title: "CSV and JSON, Back and Forth",
  content:
    "CSV remains the lingua franca of spreadsheets, while JSON powers nearly every web API. Moving data between the two is a constant chore for developers and analysts. Instead of writing throwaway scripts, convert instantly and download a clean file. Reliable parsing handles messy real-world data, including quoted commas and varied line endings.",
};

export default function FileConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.converter;
  const meta = t.meta["file-converter"];
  const fc = t.fileConverter;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "converter",
    icon: <FileType className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/converter" },
      { label: meta.name, href: "/tools/file-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [mode, setMode] = useState<"csvToJson" | "jsonToCsv">("csvToJson");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<"invalidCsv" | "invalidJson" | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const { plan, limitFor } = usePlan();
  const rowLimit = limitFor("csvRows");

  useEffect(() => {
    if (plan !== "free" && gateOpen) setGateOpen(false);
  }, [plan, gateOpen]);

  const convert = useCallback(() => {
    setError(null);
    if (mode === "csvToJson") {
      const dataRows = parseCsv(input).length - 1;
      if (plan === "free" && rowLimit !== null && dataRows > rowLimit) {
        setGateOpen(true);
        setOutput("");
        return;
      }
      setGateOpen(false);
      const res = toJson(input);
      if (!res.ok) {
        setError(res.invalidKey ?? "invalidCsv");
        return;
      }
      setOutput(JSON.stringify(res.data, null, 2));
    } else {
      let parsed: unknown;
      try {
        parsed = JSON.parse(input);
      } catch {
        setError("invalidJson");
        return;
      }
      const res = toCsv(parsed);
      if (!res.ok) {
        setError(res.invalidKey ?? "invalidJson");
        return;
      }
      setOutput(res.text ?? "");
    }
  }, [input, mode, plan, rowLimit]);

  const download = useCallback(() => {
    if (!output) return;
    const ext = mode === "csvToJson" ? "json" : "csv";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, mode]);

  const labelCls = "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300";
  const areaCls =
    "w-full rounded-lg border border-neutral-300 bg-white p-3 font-mono text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

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
          <label className={labelCls}>{fc.mode}</label>
          <div className="flex flex-wrap gap-2">
            {(["csvToJson", "jsonToCsv"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setOutput("");
                  setError(null);
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  mode === m
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {fc[m]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>
            {mode === "csvToJson" ? fc.pasteCsv : fc.pasteJson}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            dir="ltr"
            placeholder={mode === "csvToJson" ? "name,age,city\nAli,30,Cairo" : '[{"name":"Ali","age":30}]'}
            className={areaCls}
          />
          {plan === "free" && rowLimit !== null && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {fc.freeRowLimit.replace("{count}", String(rowLimit))}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={convert}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {fc.convert}
          </button>
          {output && (
            <button
              onClick={download}
              className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {fc.download}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {fc[error]}
          </div>
        )}

        {plan === "free" && gateOpen && rowLimit !== null && (
          <UpgradeGate description={fc.freeRowLimit.replace("{count}", String(rowLimit))} />
        )}

        <div>
          <label className={labelCls}>{fc.resultPlaceholder}</label>
          <textarea
            value={output}
            readOnly
            rows={8}
            dir="ltr"
            placeholder={fc.resultPlaceholder}
            className={areaCls}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
