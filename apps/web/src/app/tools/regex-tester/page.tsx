"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Braces } from "lucide-react";

const RELATED_SLUGS = ["javascript-formatter", "json-formatter", "text-diff"] as const;

const RELATED_ICONS: Record<string, string> = {
  "javascript-formatter": "JS",
  "json-formatter": "{}",
  "text-diff": "≠",
};

const LONG_DESCRIPTION =
  "The Regex Tester lets you build and debug regular expressions against real text. Enter a pattern, choose flags, and watch every match light up instantly with the match count. Invalid patterns show a clear error so you can fix them fast. All testing happens locally in your browser.";

const FAQ = [
  {
    question: "Which regex flavor is used?",
    answer: "We use JavaScript regular expressions, the same engine behind Node.js and every modern browser.",
  },
  {
    question: "What do the flags do?",
    answer: "g finds all matches, i ignores case, m makes ^ and $ match line boundaries, and s lets the dot match newlines.",
  },
  {
    question: "Can I extract matches instead of just highlighting?",
    answer: "Yes — the highlighted view shows every occurrence, and the match count tells you exactly how many were found.",
  },
];

const ARTICLE = {
  title: "Regular Expressions, Explained",
  content:
    "Regular expressions are patterns that describe text. They power search, validation, and text transformation everywhere. Testing your pattern against realistic input is the fastest way to catch edge cases, and our tool makes the feedback loop instant.",
};

function splitByRegex(text: string, re: RegExp): { part: string; match: boolean }[] {
  const parts: { part: string; match: boolean }[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const clone = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  clone.lastIndex = 0;
  while ((m = clone.exec(text)) !== null) {
    if (m.index > last) parts.push({ part: text.slice(last, m.index), match: false });
    parts.push({ part: m[0], match: true });
    last = m.index + m[0].length;
    if (m[0].length === 0) clone.lastIndex++;
  }
  if (last < text.length) parts.push({ part: text.slice(last), match: false });
  return parts;
}

export default function RegexTesterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["regex-tester"];
  const u = t.regexTester;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <Braces className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/regex-tester" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [pattern, setPattern] = useState("\\d+");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Orders: 42, 17 and 9 shipped today.");
  const [error, setError] = useState("");

  const result = useMemo(() => {
    setError("");
    if (!pattern) return { parts: [], count: 0 };
    try {
      const re = new RegExp(pattern, flags);
      const parts = splitByRegex(text, re);
      const count = parts.filter((p) => p.match).length;
      return { parts, count };
    } catch {
      setError(u.invalidRegex);
      return { parts: [], count: 0 };
    }
  }, [pattern, flags, text, u.invalidRegex]);

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500";

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
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.pattern}</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder={u.patternPlaceholder}
              className={inputCls + " font-mono"}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.flags}</label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value.replace(/[^gims]/g, ""))}
              placeholder="gims"
              className={inputCls + " font-mono"}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.testText}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={u.testPlaceholder}
            rows={8}
            className={inputCls + " font-mono"}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.matches}</label>
            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              {result.parts.length === 0 && pattern ? "0" : result.count} {u.matchCount.replace("{count}", String(result.count))}
            </span>
          </div>
          <div className="min-h-24 whitespace-pre-wrap rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white">
            {result.parts.length === 0 ? (
              <span className="text-neutral-400 dark:text-neutral-500">{pattern ? u.noMatches : u.testPlaceholder}</span>
            ) : (
              result.parts.map((p, i) =>
                p.match ? (
                  <mark key={i} className="rounded bg-brand-200 px-0.5 text-brand-900 dark:bg-brand-600/40 dark:text-brand-100">
                    {p.part}
                  </mark>
                ) : (
                  <span key={i}>{p.part}</span>
                )
              )
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
