"use client";

import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Shrink } from "lucide-react";

const RELATED_SLUGS = ["html-formatter", "javascript-formatter", "json-formatter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "html-formatter": "HTML",
  "javascript-formatter": "JS",
  "json-formatter": "{}",
};

const LONG_DESCRIPTION =
  "Our CSS Minifier shrinks your stylesheets by stripping comments and collapsing whitespace — right in your browser. See the original size, minified size, and exactly how much you saved before downloading.";

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function bytes(str: string): number {
  return new Blob([str]).size;
}

const FAQ = [
  {
    question: "What does the minifier remove?",
    answer: "It removes comments and every unnecessary space, newline, and tab, then trims trailing semicolons before closing braces.",
  },
  {
    question: "Can I preview the savings?",
    answer: "Yes — the tool reports the original size, the minified size, and the percentage saved.",
  },
  {
    question: "Is my CSS sent to a server?",
    answer: "No. All processing happens locally in your browser.",
  },
];

const ARTICLE = {
  title: "Smaller CSS, Faster Pages",
  content:
    "Every kilobyte counts when it comes to load times. Removing comments and whitespace from production CSS is a quick, risk-free win that many developers skip simply because it is tedious. Our minifier does it in a click, shows you the savings, and hands you a download-ready file.",
};

export default function CssMinifierPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["css-minifier"];
  const cm = t.cssMinifier;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <Shrink className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/css-minifier" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const originalSize = bytes(input);
  const minifiedSize = bytes(output);
  const savedPercent = originalSize > 0 && minifiedSize < originalSize
    ? Math.round((1 - minifiedSize / originalSize) * 100)
    : 0;

  const compress = useCallback(() => {
    setOutput(input.trim() ? minifyCss(input) : "");
  }, [input]);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.css";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output]);

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
          <label className={labelCls}>{cm.inputPlaceholder}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            dir="ltr"
            placeholder={".box {  color: red;  margin: 0;  }"}
            className={areaCls}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={compress}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {cm.compress}
          </button>
          {output && (
            <button
              onClick={download}
              className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {cm.download}
            </button>
          )}
        </div>

        {output && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{cm.originalSize}</div>
              <div className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">{originalSize} B</div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{cm.minifiedSize}</div>
              <div className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">{minifiedSize} B</div>
            </div>
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
              <div className="text-xs font-medium text-brand-600 dark:text-brand-400">{cm.savedPercent}</div>
              <div className="mt-1 text-xl font-semibold text-brand-600 dark:text-brand-400">-{savedPercent}%</div>
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>{cm.resultPlaceholder}</label>
          <textarea
            value={output}
            readOnly
            rows={8}
            dir="ltr"
            placeholder={cm.resultPlaceholder}
            className={areaCls}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
