"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Repeat } from "lucide-react";

const RELATED_SLUGS = ["case-converter", "reading-time", "word-counter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "case-converter": "Aa",
  "reading-time": "T",
  "word-counter": "W",
};

const LONG_DESCRIPTION =
  "Our Text Repeater tool repeats any text a chosen number of times with a new line, space, or no separator between copies. Great for testing layouts, generating placeholder content, bulk-filling fields, and practicing typing or pronunciation. Everything runs instantly in your browser.";

const MAX_COUNT = 200;

const FAQ = [
  {
    question: "What separators are supported?",
    answer: "You can join the repeated copies with a new line, a single space, or no separator at all.",
  },
  {
    question: "How many times can I repeat text?",
    answer: "Up to 200 repetitions per run, which is plenty for most uses while keeping the page responsive.",
  },
  {
    question: "Where can I use the output?",
    answer: "Use the copy button to paste it anywhere, or download it as a .txt file directly from the tool.",
  },
];

const ARTICLE = {
  title: "Placeholder Content at Scale",
  content:
    "Designers, testers, and content editors often need repeating blocks of text — filler content for mockups, repeated test phrases, or formatted lists. Doing this by hand is tedious and error-prone. A text repeater generates the exact number of copies with the separator you choose, in a single click, saving time and keeping your work consistent.",
};

export default function TextRepeaterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["text-repeater"];
  const tr = t.textRepeater;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <Repeat className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/text-repeater" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [text, setText] = useState("");
  const [count, setCount] = useState(3);
  const [separator, setSeparator] = useState<"newline" | "space" | "none">("newline");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sepMap = useMemo(
    () => ({ newline: "\n", space: " ", none: "" }),
    [],
  );

  const output = useMemo(() => {
    const clean = Math.min(Math.max(1, Math.floor(count) || 1), MAX_COUNT);
    const value = text;
    if (!value) return "";
    const sep = sepMap[separator];
    return Array.from({ length: clean }, () => value).join(sep);
  }, [text, count, separator, sepMap]);

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [output]);

  const clearText = useCallback(() => {
    setText("");
    textareaRef.current?.focus();
  }, []);

  const downloadTxt = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-repeater-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const separators = [
    { id: "newline" as const, label: tr.separatorNewline },
    { id: "space" as const, label: tr.separatorSpace },
    { id: "none" as const, label: tr.separatorNone },
  ];

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
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {tr.enterText}
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tr.pasteHere}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {tr.repeatCount}
            </label>
            <input
              type="number"
              min={1}
              max={MAX_COUNT}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value || "1", 10))}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {tr.separator}
            </label>
            <div className="flex flex-wrap gap-2">
              {separators.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSeparator(opt.id)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    separator === opt.id
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {tr.resultPlaceholder}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder={tr.pasteHere}
            rows={8}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyText}
            disabled={!output}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {copied ? t.common.copied : t.common.copy}
          </button>
          <button
            onClick={downloadTxt}
            disabled={!output}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {t.common.download}
          </button>
          <button
            onClick={clearText}
            disabled={!text}
            className="rounded-lg border border-red-300 bg-white px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:border-red-800 dark:bg-neutral-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {t.common.clearAll}
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}
