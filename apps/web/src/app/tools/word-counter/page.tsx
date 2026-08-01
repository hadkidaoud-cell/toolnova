"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { BookOpen } from "lucide-react";

const RELATED_SLUGS = ["character-counter", "json-formatter", "uuid-generator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "character-counter": "C",
  "json-formatter": "{}",
  "uuid-generator": "U",
};

const LONG_DESCRIPTION =
  "Our Word Counter tool helps you quickly count words, characters, sentences, and paragraphs in any text. Whether you're writing an essay, blog post, or document, this tool gives you accurate counts to help you meet your requirements. Simply paste your text and see the results instantly. The tool also estimates reading time based on average reading speed.";

const FAQ = [
  {
    question: "What counts as a word?",
    answer: "A word is any sequence of characters separated by spaces. Numbers are included in the word count. Hyphenated words like 'well-known' count as one word.",
  },
  {
    question: "What is reading time based on?",
    answer: "Reading time is estimated based on an average reading speed of 200-250 words per minute. Speaking time uses a slower rate of 150 words per minute.",
  },
  {
    question: "Are there file size limits?",
    answer: "You can analyze up to 100,000 characters at once. For larger texts, we recommend processing them in sections.",
  },
];

const ARTICLE = {
  title: "Why Word Count Matters",
  content:
    "Word count is important for many types of writing. Academic papers, blog posts, and social media all have specific word limits. Knowing your word count helps you stay within requirements and communicate more effectively. Our tool makes it easy to track your word count in real-time as you write, helping you craft content that meets your exact specifications.",
};

export default function WordCounterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["word-counter"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <BookOpen className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/word-counter" },
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

  const counts = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const lines = text ? text.split("\n").length : 0;
    const readingTimeMinutes = words / 200;
    const readingTimeSec = Math.round(readingTimeMinutes * 60);
    const readingTime = readingTimeMinutes >= 1
      ? `${Math.floor(readingTimeMinutes)} ${t.units.min} ${readingTimeSec % 60} ${t.units.sec}`
      : `${readingTimeSec} ${t.units.sec}`;
    const speakingTimeMinutes = words / 150;
    const speakingTimeSec = Math.round(speakingTimeMinutes * 60);
    const speakingTime = speakingTimeMinutes >= 1
      ? `${Math.floor(speakingTimeMinutes)} ${t.units.min} ${speakingTimeSec % 60} ${t.units.sec}`
      : `${speakingTimeSec} ${t.units.sec}`;

    const wordFreq: Record<string, number> = {};
    const wordMatches = trimmed ? trimmed.toLowerCase().match(/\b[a-z]+\b/g) : null;
    if (wordMatches) {
      for (const w of wordMatches) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    const density = topKeywords.map((k) => ({
      ...k,
      percent: words > 0 ? ((k.count / words) * 100).toFixed(1) : "0",
    }));

    return { words, chars, charsNoSpace, sentences, paragraphs, lines, readingTime, speakingTime, density };
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
    a.download = "word-counter-output.txt";
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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.words}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.words}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.chars}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.characters}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.charsNoSpace}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.charsNoSpace}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.sentences}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.sentences}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.paragraphs}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.paragraphs}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.lines}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.lines}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.readingTime}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.readingTime}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.speakingTime}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.wordCounter.speakingTime}</div>
          </div>
        </div>

        {counts.density.length > 0 && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.wordCounter.topKeywords}</h3>
            <div className="space-y-2">
              {counts.density.map((item) => (
                <div key={item.word} className="flex items-center gap-3">
                  <span className="w-24 truncate text-sm font-medium text-neutral-900 dark:text-white">{item.word}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.min(100, parseFloat(item.percent) * 5)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs text-neutral-500">
                    {item.count} ({item.percent}%)
                  </span>
                </div>
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
