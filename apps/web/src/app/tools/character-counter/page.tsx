"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { TextCursorInput } from "lucide-react";

const RELATED_SLUGS = ["word-counter", "json-formatter", "uuid-generator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "word-counter": "W",
  "json-formatter": "{}",
  "uuid-generator": "U",
};

const LONG_DESCRIPTION =
  "Our Character Counter provides detailed text statistics including character counts (with and without spaces), word count, sentence count, paragraph count, line count, and reading/speaking time estimates. It also features character frequency analysis and top keyword extraction.";

const FAQ = [
  {
    question: "What's the difference between characters with and without spaces?",
    answer: "Characters with spaces counts every character including spaces, tabs, and newlines. Characters without spaces excludes all whitespace characters for a true letter/digit count.",
  },
  {
    question: "How is reading time calculated?",
    answer: "Reading time uses an average of 200-250 words per minute. Speaking time uses a slower rate of 150 words per minute for a more natural speech pace.",
  },
  {
    question: "What does the character frequency chart show?",
    answer: "The frequency chart shows how many times each letter (a-z, case-insensitive) appears in your text, helping you analyze letter usage patterns.",
  },
];

const ARTICLE = {
  title: "Understanding Text Metrics",
  content:
    "Character and word counts are essential for many writing tasks. From social media character limits to academic word counts, knowing these metrics helps you tailor your content appropriately. Our tool provides comprehensive text analysis with real-time updates as you type.",
};

export default function CharacterCounterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["character-counter"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <TextCursorInput className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/character-counter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const lines = text ? text.split("\n").length : 0;

    const readingMin = words / 200;
    const readingSec = Math.round(readingMin * 60);
    const readingTime = readingMin >= 1 ? `${Math.floor(readingMin)} ${t.units.min} ${readingSec % 60} ${t.units.sec}` : `${readingSec} ${t.units.sec}`;

    const speakingMin = words / 150;
    const speakingSec = Math.round(speakingMin * 60);
    const speakingTime = speakingMin >= 1 ? `${Math.floor(speakingMin)} ${t.units.min} ${speakingSec % 60} ${t.units.sec}` : `${speakingSec} ${t.units.sec}`;

    const wordFreq: Record<string, number> = {};
    const wordMatches = trimmed ? trimmed.toLowerCase().match(/\b[a-z]+\b/g) : null;
    if (wordMatches) {
      for (const w of wordMatches) wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }));

    const letterFreq: Record<string, number> = {};
    const letters = text.toLowerCase().match(/[a-z]/g);
    if (letters) {
      for (const l of letters) letterFreq[l] = (letterFreq[l] || 0) + 1;
    }
    const maxLetterCount = Math.max(...Object.values(letterFreq), 1);

    return { chars, charsNoSpace, words, sentences, paragraphs, lines, readingTime, speakingTime, topKeywords, letterFreq, maxLetterCount };
  }, [text, t.units]);

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, [text]);

  const clearText = useCallback(() => {
    setText("");
    textareaRef.current?.focus();
  }, []);

  const downloadTxt = useCallback(() => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [text]);

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
            {t.wordCounter.enterYourText}
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.wordCounter.pasteText}
            rows={8}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.chars}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.characters}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.charsNoSpace}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.charsNoSpace}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.words}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.words}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.sentences}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.sentences}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.paragraphs}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.paragraphs}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.lines}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.lines}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.readingTime}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.readingTime}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.speakingTime}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.speakingTime}</div>
          </div>
        </div>

        {Object.keys(stats.letterFreq).length > 0 && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.charCounter.characterFrequency}</h3>
            <div className="flex flex-wrap items-end gap-1">
              {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => {
                const count = stats.letterFreq[letter] || 0;
                const height = count > 0 ? Math.max(4, (count / stats.maxLetterCount) * 60) : 4;
                return (
                  <div key={letter} className="flex flex-col items-center" style={{ width: "3.5%" }}>
                    <div className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400">{count || ""}</div>
                    <div
                      className="w-full rounded-t-sm bg-brand-500"
                      style={{ height: `${height}px`, minHeight: count > 0 ? "4px" : "2px", opacity: count > 0 ? 1 : 0.2 }}
                    />
                    <div className="mt-0.5 text-[10px] font-medium text-neutral-500">{letter}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats.topKeywords.length > 0 && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.wordCounter.topKeywords}</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topKeywords.map((kw) => (
                <span key={kw.word} className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                  {kw.word} <span className="ml-1 font-bold">{kw.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyText}
            disabled={!text}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {copied ? t.common.copied : t.wordCounter.copyText}
          </button>
          <button
            onClick={downloadTxt}
            disabled={!text}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {t.wordCounter.downloadTxt}
          </button>
          <button
            onClick={clearText}
            disabled={!text}
            className="rounded-lg border border-red-300 bg-white px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:border-red-800 dark:bg-neutral-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {t.wordCounter.clear}
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}
