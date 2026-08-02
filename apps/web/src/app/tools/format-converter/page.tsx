"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { UpgradeGate } from "@/components/billing/upgrade-gate";
import { usePlan } from "@/components/billing/plan-provider";
import { useI18n } from "@/i18n";
import { FileType } from "lucide-react";
import { FORMATS, parseData, serializeData, countRows, FORMAT_EXTENSION, type FormatId } from "@/lib/data-formats";

const RELATED_SLUGS = ["file-converter", "json-formatter", "base64-encoder"] as const;

const RELATED_ICONS: Record<string, string> = {
  "file-converter": "F",
  "json-formatter": "{}",
  "base64-encoder": "64",
};

const LONG_DESCRIPTION =
  "The Data Format Converter moves structured data between JSON, CSV, TSV, YAML, and XML — entirely in your browser. Pick a source format, paste your data, choose the target, and download a clean file. Robust parsing handles quoted fields, nesting, and arrays.";

const FAQ = [
  {
    question: "Which formats are supported?",
    answer: "JSON, CSV, TSV, YAML, and XML in any direction. CSV and TSV accept an array of objects; YAML and JSON preserve numbers and booleans.",
  },
  {
    question: "Why would I need to convert between these?",
    answer: "APIs speak JSON, spreadsheets export CSV, configs use YAML, and legacy systems rely on XML. Moving between them is a daily chore for developers and analysts.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All parsing and generation run locally with MIT-licensed libraries (js-yaml) and native browser APIs. Nothing ever leaves your device.",
  },
];

const ARTICLE = {
  title: "Five Formats, One Pipeline",
  content:
    "Data almost never lives in a single format. A report starts in a spreadsheet (CSV), is loaded into an app (JSON), and gets documented in configs (YAML). A reliable converter turns format migration from a debugging session into a two-second step.",
};

type FormatLabelKey = "formatJson" | "formatCsv" | "formatTsv" | "formatYaml" | "formatXml";

const FORMAT_LABEL_KEY: Record<FormatId, FormatLabelKey> = {
  json: "formatJson",
  csv: "formatCsv",
  tsv: "formatTsv",
  yaml: "formatYaml",
  xml: "formatXml",
};

const SAMPLES: Record<FormatId, string> = {
  json: '[\n  { "name": "Ali", "age": 30, "city": "Cairo" },\n  { "name": "Sara", "age": 27, "city": "Dubai" }\n]',
  csv: "name,age,city\nAli,30,Cairo\nSara,27,Dubai",
  tsv: "name\tage\tcity\nAli\t30\tCairo\nSara\t27\tDubai",
  yaml: "- name: Ali\n  age: 30\n  city: Cairo\n- name: Sara\n  age: 27\n  city: Dubai",
  xml: "<root>\n  <item>\n    <name>Ali</name>\n    <age>30</age>\n    <city>Cairo</city>\n  </item>\n  <item>\n    <name>Sara</name>\n    <age>27</age>\n    <city>Dubai</city>\n  </item>\n</root>",
};

export default function FormatConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.converter;
  const meta = t.meta["format-converter"];
  const fc = t.formatConverter;
  const { plan, limitFor } = usePlan();

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "converter",
    icon: <FileType className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/converter" },
      { label: meta.name, href: "/tools/format-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [from, setFrom] = useState<FormatId>("json");
  const [to, setTo] = useState<FormatId>("csv");
  const [input, setInput] = useState(SAMPLES.json);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<keyof typeof fc | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const rowLimit = limitFor("csvRows");

  useEffect(() => {
    if (plan !== "free" && gateOpen) setGateOpen(false);
  }, [plan, gateOpen]);

  const switchFormat = (next: FormatId, isSource: boolean) => {
    if (isSource) {
      setFrom(next);
      setInput(SAMPLES[next]);
      setOutput("");
      setError(null);
    } else {
      setTo(next);
      setOutput("");
      setError(null);
    }
    setGateOpen(false);
  };

  const convert = useCallback(() => {
    setError(null);
    setGateOpen(false);
    const parsed = parseData(from, input);
    if (!parsed.ok) {
      setError(parsed.error as keyof typeof fc);
      setOutput("");
      return;
    }
    const rows = countRows(parsed.data);
    if (plan === "free" && rowLimit !== null && rows > rowLimit) {
      setGateOpen(true);
      setOutput("");
      return;
    }
    const serialized = serializeData(to, parsed.data);
    if (!serialized.ok) {
      setError(serialized.error as keyof typeof fc);
      setOutput("");
      return;
    }
    setOutput(serialized.data);
  }, [from, to, input, plan, rowLimit]);

  const download = useCallback(() => {
    if (!output) return;
    const ext = FORMAT_EXTENSION[to];
    const mimeTypes: Record<FormatId, string> = {
      json: "application/json",
      csv: "text/csv",
      tsv: "text/tab-separated-values",
      yaml: "text/yaml",
      xml: "application/xml",
    };
    const blob = new Blob([output], { type: mimeTypes[to] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, to]);

  const formatButton = (id: FormatId, selected: boolean, isSource: boolean) => {
    const key = FORMAT_LABEL_KEY[id];
    return (
      <button
        key={id}
        onClick={() => switchFormat(id, isSource)}
        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
          selected
            ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
            : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        }`}
      >
        {fc[key]}
      </button>
    );
  };

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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{fc.from}</label>
            <div className="flex flex-wrap gap-2">{FORMATS.map((id) => formatButton(id, id === from, true))}</div>
          </div>
          <div>
            <label className={labelCls}>{fc.to}</label>
            <div className="flex flex-wrap gap-2">{FORMATS.map((id) => formatButton(id, id === to, false))}</div>
          </div>
        </div>

        <div>
          <label className={labelCls}>{fc.from} → {fc.to}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            dir="ltr"
            spellCheck={false}
            placeholder={fc.inputPlaceholder}
            className={areaCls}
          />
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
              {fc.download.replace("{format}", fc[FORMAT_LABEL_KEY[to]])}
            </button>
          )}
        </div>

        {plan === "free" && rowLimit !== null && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {fc.freeRowLimit.replace("{count}", String(rowLimit))}
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {fc[error]}
          </div>
        )}

        {gateOpen && rowLimit !== null && (
          <UpgradeGate description={fc.freeRowLimit.replace("{count}", String(rowLimit))} />
        )}

        <div>
          <label className={labelCls}>{fc.to}</label>
          <textarea
            value={output}
            readOnly
            rows={10}
            dir="ltr"
            spellCheck={false}
            placeholder={fc.outputPlaceholder}
            className={areaCls}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
