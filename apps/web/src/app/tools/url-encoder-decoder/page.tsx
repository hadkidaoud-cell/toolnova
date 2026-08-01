"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Link2 } from "lucide-react";

const RELATED_SLUGS = ["base64-encoder", "slug-generator", "html-formatter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "base64-encoder": "64",
  "slug-generator": "🔗",
  "html-formatter": "<>",
};

const LONG_DESCRIPTION =
  "Encode and decode URL components with one click. Use encoding to safely include special characters, spaces, and non-Latin text inside query strings and paths. Decoding turns percent-encoded URLs back into readable text. Everything runs locally in your browser.";

const FAQ = [
  {
    question: "What does URL encoding do?",
    answer: "URL encoding replaces unsafe characters (like spaces, &, and =) with percent sequences (%20) so they can travel safely inside URLs and query strings.",
  },
  {
    question: "EncodeURIComponent vs encodeURI?",
    answer: "We use encodeURIComponent, which escapes everything needed for a query parameter value, including & and =.",
  },
  {
    question: "Is my input sent to a server?",
    answer: "No. Encoding and decoding happen entirely in your browser.",
  },
];

const ARTICLE = {
  title: "Safe URLs With Proper Encoding",
  content:
    "URLs can only contain a limited set of characters. When you need to pass arbitrary text — search terms, emails, or international characters — you must encode it first. Our tool makes encoding and decoding effortless, whether you're building API calls, deep links, or analytics tags.",
};

export default function UrlCodecPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["url-encoder-decoder"];
  const u = t.urlCodec;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <Link2 className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/url-encoder-decoder" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = useMemo(() => {
    return () => {
      setError("");
      if (!input) {
        setOutput("");
        return;
      }
      try {
        setOutput(mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input));
      } catch {
        setOutput("");
        setError(u.invalidInput);
      }
    };
  }, [mode, input, u.invalidInput]);

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500";

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
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.mode}</label>
          <div className="flex rounded-lg border border-neutral-300 p-0.5 dark:border-neutral-600">
            {(["encode", "decode"] as const).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setMode(key);
                  setOutput("");
                  setError("");
                }}
                className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  mode === key
                    ? "bg-brand-600 text-white"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
              >
                {key === "encode" ? u.encode : u.decode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.input}</label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput("");
            }}
            placeholder={u.urlPlaceholder}
            rows={4}
            className={inputCls}
          />
        </div>

        <button
          onClick={convert}
          disabled={!input}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-neutral-900"
        >
          {u.convert}
        </button>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {output && (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.output}</label>
            <textarea readOnly value={output} rows={4} className={inputCls + " bg-neutral-50 dark:bg-neutral-900"} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
