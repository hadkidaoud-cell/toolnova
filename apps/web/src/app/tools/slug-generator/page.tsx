"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Link } from "lucide-react";

const RELATED_SLUGS = ["url-encoder-decoder", "case-converter", "text-repeater"] as const;

const RELATED_ICONS: Record<string, string> = {
  "url-encoder-decoder": "URL",
  "case-converter": "Aa",
  "text-repeater": "↻",
};

const LONG_DESCRIPTION =
  "Turn any text into a clean, SEO-friendly URL slug. We strip accents, remove special characters, collapse extra spaces, and join words with your chosen separator. Perfect for blog posts, product pages, and API routes. Updates live as you type.";

const FAQ = [
  {
    question: "What makes a slug SEO-friendly?",
    answer: "Short, lowercase, hyphen-separated words that describe the content. Search engines and users both prefer readable URLs.",
  },
  {
    question: "Are accents handled?",
    answer: "Yes. Accented characters like é, ñ, and ü are converted to their plain ASCII equivalents (e, n, u).",
  },
  {
    question: "Which separator should I use?",
    answer: "Hyphens are the standard for URLs. Underscores work in code identifiers, and 'none' produces CamelCase-style or concatenated output.",
  },
];

const ARTICLE = {
  title: "Slugs That Carry Meaning",
  content:
    "A URL slug is more than a path — it's a ranking signal and a promise about the page. Clean slugs improve click-through rates and make links shareable. Our generator normalizes any input into a consistent, readable format in real time.",
};

export default function SlugGeneratorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["slug-generator"];
  const u = t.slugGenerator;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <Link className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/slug-generator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [text, setText] = useState("");
  const [lowercase, setLowercase] = useState(true);
  const [separator, setSeparator] = useState<"-" | "_" | "">("-");
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => {
    let s = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    if (lowercase) s = s.toLowerCase();
    if (separator === "") {
      s = s.replace(/[^a-z0-9]+/gi, "");
      return s;
    }
    s = s.replace(/[^a-z0-9]+/gi, separator);
    s = s.replace(new RegExp(`\\${separator === "-" ? "-" : "_"}+`, "g"), separator);
    s = s.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
    return s;
  }, [text, lowercase, separator]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

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
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.input}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder={u.input}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            {u.lowercase}
          </label>
          <div className="w-40">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.separator}</label>
            <select value={separator} onChange={(e) => setSeparator(e.target.value as typeof separator)} className={inputCls}>
              <option value="-">- (hyphen)</option>
              <option value="_">_ (underscore)</option>
              <option value="">{u.separator} (none)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-start gap-3">
            <input
              type="text"
              readOnly
              value={slug || u.placeholder}
              className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
            />
            <button
              onClick={copy}
              disabled={!slug}
              className="shrink-0 rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {copied ? t.common.copied : u.copy}
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
