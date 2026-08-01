"use client";

import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Braces } from "lucide-react";

const RELATED_SLUGS = ["html-formatter", "css-minifier", "json-formatter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "html-formatter": "HTML",
  "css-minifier": "{}",
  "json-formatter": "{}",
};

const LONG_DESCRIPTION =
  "Our JavaScript Formatter beautifies or minifies your JavaScript code right in your browser. Paste compressed bundles to read them, or shrink readable code for production — with no uploads.";

function formatJs(input: string): string {
  let depth = 0;
  const out: string[] = [];
  const lines = input
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    const closesBefore = line.startsWith("}") ? (line.match(/\}/g) ?? []).length : 0;
    const indentDepth = Math.max(0, depth - closesBefore);
    out.push("  ".repeat(indentDepth) + line);
    const opens = (line.match(/\{/g) ?? []).length;
    const closes = (line.match(/\}/g) ?? []).length;
    depth = Math.max(0, depth - closes + opens);
  }
  return out.join("\n");
}

function minifyJs(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .replace(/;\s+/g, ";")
    .replace(/,\s+/g, ",")
    .replace(/\s*([{}()])\s*/g, "$1")
    .trim();
}

const FAQ = [
  {
    question: "Can it un-minify production bundles?",
    answer: "Yes — Format mode re-indents each statement, so compressed code becomes readable in one click.",
  },
  {
    question: "Does minification break comments and strings?",
    answer: "Comments are stripped and whitespace is collapsed. String contents are preserved.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. All processing happens locally in your browser.",
  },
];

const ARTICLE = {
  title: "Readable and Slim JavaScript",
  content:
    "JavaScript goes through both extremes: hand-written and sprawling, or minified and unreadable. A formatter lets you switch between them freely — understand a minified bundle by formatting it, then ship a smaller file by minifying it again. Two modes, one tool, zero uploads.",
};

export default function JavascriptFormatterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["javascript-formatter"];
  const jf = t.javascriptFormatter;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <Braces className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/javascript-formatter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [mode, setMode] = useState<"format" | "minify">("format");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);

  const run = useCallback(() => {
    setError(false);
    const trimmed = input.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    setOutput(mode === "format" ? formatJs(trimmed) : minifyJs(trimmed));
  }, [input, mode]);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "format" ? "formatted.js" : "minified.js";
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
        <div className="flex flex-wrap gap-2">
          {(["format", "minify"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                mode === m
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {jf[m]}
            </button>
          ))}
        </div>

        <div>
          <label className={labelCls}>{jf.inputPlaceholder}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            dir="ltr"
            placeholder={'function hello(){const x=1;return x+1;}'}
            className={areaCls}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={run}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {jf.formatButton}
          </button>
          {output && (
            <button
              onClick={download}
              className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {jf.download}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {jf.invalidJs}
          </div>
        )}

        <div>
          <label className={labelCls}>{jf.resultPlaceholder}</label>
          <textarea
            value={output}
            readOnly
            rows={8}
            dir="ltr"
            placeholder={jf.resultPlaceholder}
            className={areaCls}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
