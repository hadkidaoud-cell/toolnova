"use client";

import React, { useState, useCallback, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { CaseUpper } from "lucide-react";

const RELATED_SLUGS = ["sentence-counter", "word-counter", "text-repeater"] as const;

const RELATED_ICONS: Record<string, string> = {
  "sentence-counter": "S",
  "word-counter": "W",
  "text-repeater": "R",
};

const LONG_DESCRIPTION =
  "Our Case Converter transforms text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, kebab-case, snake_case, PascalCase, and more. It runs instantly in your browser with no uploads. Ideal for formatting headings, emails, code identifiers, social media posts, and clean data.";

const FAQ = [
  {
    question: "Which case styles are supported?",
    answer: "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, kebab-case, snake_case, PascalCase, alternating, and inverse case.",
  },
  {
    question: "How is Title Case applied?",
    answer: "Every word starts with a capital letter and the remaining letters are lowercased. Numbers and symbols are kept as they are.",
  },
  {
    question: "Is my text processed locally?",
    answer: "Yes. All conversions happen in your browser — your text is never sent to a server.",
  },
];

const ARTICLE = {
  title: "Consistent Case for Cleaner Content",
  content:
    "Consistent capitalization makes text easier to scan and more professional. Headings and titles benefit from Title Case, code and data keys need camelCase, snake_case, or kebab-case, and emphasis is sometimes best served by ALL CAPS. Instead of retyping or editing by hand, a case converter applies any style in one click — fast, accurate, and typo-free.",
};

export default function CaseConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["case-converter"];
  const cc = t.caseConverter;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <CaseUpper className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/case-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const splitWords = useCallback((value: string) => {
    const matches = value.toLowerCase().match(/[a-z0-9]+/g);
    return matches ? matches : [];
  }, []);

  const convert = useCallback(
    (mode: string) => {
      const value = text.trim();
      if (!value) {
        setOutput("");
        return;
      }
      let result = "";
      switch (mode) {
        case "upper":
          result = value.toUpperCase();
          break;
        case "lower":
          result = value.toLowerCase();
          break;
        case "title":
          result = value
            .split(/(\s+)/)
            .map((part) =>
              /^\s+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
            )
            .join("");
          break;
        case "sentence":
          result = value
            .toLowerCase()
            .replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());
          break;
        case "camel": {
          const words = splitWords(value);
          result = words
            .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
            .join("");
          break;
        }
        case "kebab":
          result = splitWords(value).join("-");
          break;
        case "snake":
          result = splitWords(value).join("_");
          break;
        case "pascal": {
          const words = splitWords(value);
          result = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
          break;
        }
        case "alternating": {
          let idx = 0;
          result = value
            .toLowerCase()
            .split("")
            .map((ch) => (/[a-z]/.test(ch) ? (idx++ % 2 === 0 ? ch.toUpperCase() : ch) : ch))
            .join("");
          break;
        }
        case "inverse":
          result = value
            .split("")
            .map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()))
            .join("");
          break;
        default:
          result = value;
      }
      setOutput(result);
    },
    [text, splitWords],
  );

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
    setOutput("");
    textareaRef.current?.focus();
  }, []);

  const modes = [
    { id: "upper", label: cc.upper },
    { id: "lower", label: cc.lower },
    { id: "title", label: cc.title },
    { id: "sentence", label: cc.sentence },
    { id: "camel", label: cc.camel },
    { id: "kebab", label: cc.kebab },
    { id: "snake", label: cc.snake },
    { id: "pascal", label: cc.pascal },
    { id: "alternating", label: cc.alternating },
    { id: "inverse", label: cc.inverse },
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
            {cc.enterText}
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOutput("");
            }}
            placeholder={cc.pasteHere}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => convert(mode.id)}
              disabled={!text.trim()}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 dark:hover:text-brand-300"
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {cc.resultPlaceholder}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder={cc.pasteHere}
            rows={6}
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
