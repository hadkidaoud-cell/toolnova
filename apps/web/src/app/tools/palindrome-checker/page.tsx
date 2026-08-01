"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { ArrowRightLeft } from "lucide-react";

const RELATED_SLUGS = ["word-counter", "sentence-counter", "case-converter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "word-counter": "W",
  "sentence-counter": "S",
  "case-converter": "Aa",
};

const LONG_DESCRIPTION =
  "Our Palindrome Checker tells you whether any text reads the same forwards and backwards. It can ignore case and punctuation, shows the reversed text, and finds the longest palindrome substring using an efficient algorithm — all in your browser with no uploads.";

const MAX_INPUT = 20000;

function normalize(text: string, ignoreCasePunct: boolean): string {
  if (!ignoreCasePunct) return text;
  const cleaned = text.normalize("NFKC").toLowerCase();
  return (cleaned.match(/[\p{L}\p{N}]/gu) ?? []).join("");
}

function longestPalindromeSubstring(s: string): string {
  const n = s.length;
  if (n <= 1) return s;
  const t = "#" + s.split("").join("#") + "#";
  const m = t.length;
  const p = new Array(m).fill(0);
  let center = 0;
  let right = 0;
  for (let i = 0; i < m; i++) {
    const mirror = 2 * center - i;
    if (i < right) p[i] = Math.min(right - i, p[mirror]);
    while (i - p[i] - 1 >= 0 && i + p[i] + 1 < m && t[i - p[i] - 1] === t[i + p[i] + 1]) p[i]++;
    if (i + p[i] > right) {
      center = i;
      right = i + p[i];
    }
  }
  let maxLen = 0;
  let centerIdx = 0;
  for (let i = 0; i < m; i++) {
    if (p[i] > maxLen) {
      maxLen = p[i];
      centerIdx = i;
    }
  }
  return s.slice(Math.floor((centerIdx - maxLen) / 2), Math.floor((centerIdx - maxLen) / 2) + maxLen);
}

const FAQ = [
  {
    question: "What is a palindrome?",
    answer: "A palindrome is a word, phrase, number, or sequence that reads the same forwards and backwards — like 'racecar' or 'Never odd or even'.",
  },
  {
    question: "What does ignoring case and punctuation do?",
    answer: "It removes spaces, punctuation, and letter case before checking, so phrases like 'A man, a plan, a canal: Panama' are detected as palindromes.",
  },
  {
    question: "How is the longest palindrome found?",
    answer: "We use Manacher's algorithm, which finds the longest palindromic substring in linear time even for large texts.",
  },
];

const ARTICLE = {
  title: "The Charm of Palindromes",
  content:
    "Palindromes have fascinated writers and mathematicians for centuries. They appear in wordplay, poetry, DNA sequences, and even number theory. While finding a palindrome by eye can be fun, machines make it exact — checking every possible symmetry in linear time. Our checker does precisely that, whether you are solving puzzles or analyzing strings in data.",
};

export default function PalindromeCheckerPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["palindrome-checker"];
  const wc = t.wordCounter;
  const pc = t.palindrome;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <ArrowRightLeft className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/palindrome-checker" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [text, setText] = useState("");
  const [ignoreCasePunct, setIgnoreCasePunct] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const result = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const normalized = normalize(trimmed, ignoreCasePunct);
    if (normalized.length === 0) return null;
    const reversed = Array.from(normalized).reverse().join("");
    const isPalindrome = normalized === reversed;
    const longest = longestPalindromeSubstring(normalized);
    const plainReversed = Array.from(trimmed).reverse().join("");
    return { isPalindrome, longest, plainReversed, normalizedLength: normalized.length };
  }, [text, ignoreCasePunct]);

  const copyReversed = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.plainReversed);
    } catch {
      /* clipboard unavailable */
    }
  }, [result]);

  const clearText = useCallback(() => {
    setText("");
    textareaRef.current?.focus();
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
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {pc.enterText}
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_INPUT))}
            placeholder={pc.pasteHere}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={ignoreCasePunct}
            onChange={(e) => setIgnoreCasePunct(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
          />
          {pc.ignoreCasePunct}
        </label>

        {result ? (
          <div
            className={`rounded-lg border p-4 ${
              result.isPalindrome
                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          >
            <div className="text-lg font-semibold">
              {result.isPalindrome ? pc.isPalindrome : pc.notPalindrome}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
            {pc.enterText}
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">{pc.reversed}</h3>
            <div
              dir="ltr"
              className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-white p-3 font-mono text-sm text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
            >
              {result.plainReversed}
            </div>
            <button
              onClick={copyReversed}
              className="mt-3 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {t.common.copy}
            </button>
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{result.normalizedLength}</div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{wc.characters}</div>
            </div>
            <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
              <div className="truncate text-2xl font-bold text-brand-600 dark:text-brand-400" title={result.longest}>
                {result.longest}
              </div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{pc.longestSubstring}</div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
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
