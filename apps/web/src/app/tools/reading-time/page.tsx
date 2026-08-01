"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Clock } from "lucide-react";

const RELATED_SLUGS = ["word-counter", "sentence-counter", "text-repeater"] as const;

const RELATED_ICONS: Record<string, string> = {
  "word-counter": "W",
  "sentence-counter": "S",
  "text-repeater": "R",
};

const LONG_DESCRIPTION =
  "Our Reading Time tool tells you how long it takes to read or speak any text. It estimates reading time at fast, average, and slow speeds, and speaking time for presentations and scripts. Paste your text and instantly see accurate estimates — perfect for blog posts, essays, podcasts, and speeches. Everything runs privately in your browser.";

const FAQ = [
  {
    question: "What reading speeds do you use?",
    answer: "We use three common benchmarks: fast readers at 250 words per minute, average readers at 200 wpm, and slow readers at 150 wpm. Speaking time uses 150 words per minute, which matches typical presentation pacing.",
  },
  {
    question: "How is reading time calculated?",
    answer: "We count the words in your text and divide by the words-per-minute rate. The result is rounded to the nearest minute or second for a clean estimate.",
  },
  {
    question: "Can I use this for speech preparation?",
    answer: "Yes. The speaking time estimate at 150 wpm is a good guide for presentations, podcasts, and video scripts, helping you plan your delivery duration.",
  },
];

const ARTICLE = {
  title: "Why Knowing Your Reading Time Helps",
  content:
    "Whether you are writing a blog post, an email, or a conference talk, knowing how long your content takes to read shapes your audience's experience. Readers skim for time, editors plan around durations, and speakers rehearse to a clock. Our tool removes the guesswork by estimating reading and speaking times from your actual word count at realistic speeds.",
};

export default function ReadingTimePage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["reading-time"];
  const wc = t.wordCounter;
  const rt = t.readingTimeTool;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <Clock className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/reading-time" },
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

  const formatDuration = useCallback(
    (totalSeconds: number) => {
      const min = Math.floor(totalSeconds / 60);
      const sec = totalSeconds % 60;
      if (min >= 1) return `${min} ${t.units.min} ${sec} ${t.units.sec}`;
      return `${sec} ${t.units.sec}`;
    },
    [t.units],
  );

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;

    const at = (wpm: number) => formatDuration(Math.round((words / wpm) * 60));
    const speaking = formatDuration(Math.round((words / 150) * 60));

    return {
      words,
      chars,
      fast: at(250),
      average: at(200),
      slow: at(150),
      speaking,
    };
  }, [text, formatDuration]);

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
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
    a.download = "reading-time-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [text]);

  const speedCards = [
    { label: rt.fast, sub: rt.atWpm.replace("{wpm}", "250"), value: stats.fast },
    { label: rt.average, sub: rt.atWpm.replace("{wpm}", "200"), value: stats.average },
    { label: rt.slow, sub: rt.atWpm.replace("{wpm}", "150"), value: stats.slow },
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
            {rt.enterText}
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={rt.pasteHere}
            rows={8}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.words}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{wc.words}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.chars}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{wc.characters}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.average}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{rt.readingTime}</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.speaking}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{rt.speakingTime}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {speedCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{card.label}</div>
              <div className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400">{card.value}</div>
              <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">{card.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyText}
            disabled={!text}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {copied ? t.common.copied : wc.copyText}
          </button>
          <button
            onClick={downloadTxt}
            disabled={!text}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {wc.downloadTxt}
          </button>
          <button
            onClick={clearText}
            disabled={!text}
            className="rounded-lg border border-red-300 bg-white px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:border-red-800 dark:bg-neutral-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {wc.clear}
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}
