"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { MessageSquareText } from "lucide-react";

const RELATED_SLUGS = ["word-counter", "character-counter", "case-converter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "word-counter": "W",
  "character-counter": "C",
  "case-converter": "Aa",
};

const LONG_DESCRIPTION =
  "Our Sentence Counter tool analyzes the sentences in your text: total count, questions, exclamations, average words per sentence, and the longest and shortest sentences. It helps writers polish rhythm, keep sentences varied, and check readability. Paste your text and the analysis updates instantly — everything runs locally in your browser.";

const FAQ = [
  {
    question: "How do you split sentences?",
    answer: "Sentences are split on periods, exclamation marks, and question marks. Abbreviations are not specially handled, so uncommon abbreviations may cause a sentence split.",
  },
  {
    question: "What is the average sentence length?",
    answer: "Average sentence length is the total number of words divided by the number of sentences. Good readability guides often recommend averages between 15 and 20 words.",
  },
  {
    question: "Are question and exclamation counts separate?",
    answer: "Yes. We count sentences ending with '?' as questions and those ending with '!' as exclamations, alongside the total sentence count.",
  },
];

const ARTICLE = {
  title: "Why Sentence Variety Matters",
  content:
    "Varying your sentence lengths keeps writing engaging. Too many long sentences tire readers, while a page of short ones feels choppy. By tracking the average, longest, and shortest sentences, you can spot monotony and deliberately introduce rhythm — mixing short punchy lines with longer flowing ones. Our sentence counter gives you these metrics instantly so you can refine your draft with confidence.",
};

export default function SentenceCounterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["sentence-counter"];
  const wc = t.wordCounter;
  const sc = t.sentenceCounter;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <MessageSquareText className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/sentence-counter" },
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
    if (!trimmed) {
      return { sentences: 0, questions: 0, exclamations: 0, avgLength: "0", longest: 0, shortest: 0 };
    }
    const sentencesList: string[] = [];
    let current = "";
    for (const ch of trimmed) {
      current += ch;
      if (/[.!?]/.test(ch)) {
        sentencesList.push(current.trim());
        current = "";
      }
    }
    if (current.trim()) sentencesList.push(current.trim());

    let questions = 0;
    let exclamations = 0;
    let longest = 0;
    let shortest = Infinity;
    let totalWords = 0;
    for (const s of sentencesList) {
      const last = s.replace(/[.!?]+$/, "").trimEnd();
      const lastChar = last[last.length - 1];
      if (lastChar === "?") questions++;
      if (lastChar === "!") exclamations++;
      const words = s.split(/\s+/).filter(Boolean).length;
      totalWords += words;
      longest = Math.max(longest, words);
      shortest = Math.min(shortest, words);
    }

    return {
      sentences: sentencesList.length,
      questions,
      exclamations,
      avgLength: sentencesList.length > 0 ? (totalWords / sentencesList.length).toFixed(1) : "0",
      longest,
      shortest: shortest === Infinity ? 0 : shortest,
    };
  }, [text]);

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
    a.download = "sentence-counter-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [text]);

  const cards = [
    { value: stats.sentences, label: wc.sentences },
    { value: stats.questions, label: sc.question },
    { value: stats.exclamations, label: sc.exclamation },
    { value: stats.avgLength, label: sc.avgSentenceLength },
    { value: stats.longest, label: sc.longestSentence },
    { value: stats.shortest, label: sc.shortestSentence },
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
            {wc.enterYourText}
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={wc.pasteText}
            rows={8}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{card.value}</div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{card.label}</div>
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
