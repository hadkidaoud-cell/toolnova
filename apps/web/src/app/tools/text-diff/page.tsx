"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { FileDiff } from "lucide-react";

const RELATED_SLUGS = ["word-counter", "case-converter", "json-formatter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "word-counter": "W",
  "case-converter": "Aa",
  "json-formatter": "{}",
};

const LONG_DESCRIPTION =
  "Our Text Diff tool compares two texts line by line and highlights exactly what was added or removed. It uses a fast in-house LCS (longest common subsequence) algorithm running entirely in your browser — no uploads, no dependencies. Perfect for reviewing drafts, tracking edits, and comparing code or configuration files.";

const MAX_LINES_PER_SIDE = 1500;

type DiffLine = { type: "added" | "removed" | "unchanged"; value: string };

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const a = oldText.split("\n").slice(0, MAX_LINES_PER_SIDE);
  const b = newText.split("\n").slice(0, MAX_LINES_PER_SIDE);
  const n = a.length;
  const m = b.length;
  const dp = new Int32Array((n + 1) * (m + 1));
  const idx = (i: number, j: number) => i * (m + 1) + j;
  const at = (i: number, j: number): number => dp[idx(i, j)] as number;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const ai = a[i] as string;
      const bj = b[j] as string;
      dp[idx(i, j)] = ai === bj
        ? at(i + 1, j + 1) + 1
        : Math.max(at(i + 1, j), at(i, j + 1));
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    const ai = a[i] as string;
    const bj = b[j] as string;
    if (ai === bj) {
      out.push({ type: "unchanged", value: ai });
      i++;
      j++;
    } else if (at(i + 1, j) >= at(i, j + 1)) {
      out.push({ type: "removed", value: ai });
      i++;
    } else {
      out.push({ type: "added", value: bj });
      j++;
    }
  }
  while (i < n) {
    out.push({ type: "removed", value: a[i] as string });
    i++;
  }
  while (j < m) {
    out.push({ type: "added", value: b[j] as string });
    j++;
  }
  return out;
}

const FAQ = [
  {
    question: "How does the diff work?",
    answer: "We compare both texts line by line using the longest common subsequence algorithm, then mark lines that were removed in red and lines that were added in green.",
  },
  {
    question: "Is my text uploaded anywhere?",
    answer: "No. The comparison runs entirely in your browser with an in-house algorithm — nothing leaves your device.",
  },
  {
    question: "Is there a size limit?",
    answer: "Each side is limited to 1,500 lines for reliable performance. For larger files, compare sections separately.",
  },
];

const ARTICLE = {
  title: "Tracking Changes with Precision",
  content:
    "Reviewing edits is part of every writing and development workflow. A precise diff shows you the exact scope of a change — what was added, what was removed, and what stayed the same — so you can approve or reject each edit with confidence. Our lightweight, dependency-free diff makes that possible without sending your text anywhere.",
};

export default function TextDiffPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["text-diff"];
  const td = t.textDiff;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <FileDiff className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/text-diff" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [compared, setCompared] = useState(false);
  const originalRef = useRef<HTMLTextAreaElement>(null);

  const diff = useMemo(() => {
    if (!compared) return [];
    return computeDiff(original, changed);
  }, [original, changed, compared]);

  const summary = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const line of diff) {
      if (line.type === "added") added++;
      if (line.type === "removed") removed++;
    }
    return { added, removed, identical: diff.length === 0 || diff.every((l) => l.type === "unchanged") };
  }, [diff]);

  const compare = useCallback(() => {
    setCompared(true);
  }, []);

  const clearAll = useCallback(() => {
    setOriginal("");
    setChanged("");
    setCompared(false);
    originalRef.current?.focus();
  }, []);

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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {td.original}
            </label>
            <textarea
              ref={originalRef}
              value={original}
              onChange={(e) => {
                setOriginal(e.target.value);
                setCompared(false);
              }}
              placeholder={td.pasteHere}
              rows={8}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {td.changed}
            </label>
            <textarea
              value={changed}
              onChange={(e) => {
                setChanged(e.target.value);
                setCompared(false);
              }}
              placeholder={td.pasteHere}
              rows={8}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={compare}
            disabled={!original && !changed}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {td.compare}
          </button>
          <button
            onClick={clearAll}
            disabled={!original && !changed}
            className="rounded-lg border border-red-300 bg-white px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:border-red-800 dark:bg-neutral-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {t.common.clearAll}
          </button>
        </div>

        {compared && summary.identical && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            {td.noDifferences}
          </div>
        )}

        {compared && !summary.identical && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.removed}</div>
                <div className="mt-1 text-sm text-red-700 dark:text-red-400">{td.removedLines}</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.added}</div>
                <div className="mt-1 text-sm text-green-700 dark:text-green-400">{td.addedLines}</div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="max-h-96 overflow-auto font-mono text-sm">
                {diff.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.type === "added"
                        ? "bg-green-100 px-4 py-0.5 text-green-900 dark:bg-green-900/40 dark:text-green-200"
                        : line.type === "removed"
                          ? "bg-red-100 px-4 py-0.5 text-red-900 line-through dark:bg-red-900/40 dark:text-red-200"
                          : "bg-white px-4 py-0.5 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    }
                  >
                    <span className="mr-3 inline-block w-5 select-none text-neutral-400">
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                    </span>
                    {line.value || " "}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!compared && (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            {td.resultPlaceholder}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
