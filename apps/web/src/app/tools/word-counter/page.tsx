"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";

const TOOL = {
  slug: "word-counter",
  name: "Word Counter",
  description: "Count words, characters, sentences, and paragraphs in your text instantly.",
  longDescription:
    "Our Word Counter tool helps you quickly count words, characters, sentences, and paragraphs in any text. Whether you're writing an essay, blog post, or document, this tool gives you accurate counts to help you meet your requirements. Simply paste your text and see the results instantly. The tool also estimates reading time based on average reading speed.",
  category: "Text Tools",
  categorySlug: "text",
  icon: "W",
  breadcrumbs: [
    { label: "Text Tools", href: "/category/text" },
    { label: "Word Counter", href: "/tools/word-counter" },
  ],
};

const RELATED_TOOLS = [
  { slug: "character-counter", name: "Character Counter", description: "Count characters in your text", icon: "C" },
  { slug: "sentence-counter", name: "Sentence Counter", description: "Count sentences in your text", icon: "S" },
  { slug: "reading-time", name: "Reading Time", description: "Estimate reading time for your text", icon: "⏱" },
];

const FAQ = [
  {
    question: "What counts as a word?",
    answer: "A word is any sequence of characters separated by spaces. Numbers are included in the word count. Hyphenated words like 'well-known' count as one word.",
  },
  {
    question: "What is reading time based on?",
    answer: "Reading time is estimated based on an average reading speed of 200-250 words per minute. The tool shows both the estimated minutes and seconds.",
  },
  {
    question: "How are sentences detected?",
    answer: "Sentences are counted by detecting sentence-ending punctuation marks like periods (.), exclamation marks (!), and question marks (?). Multiple consecutive punctuation marks are counted as one sentence.",
  },
  {
    question: "Does the character count include spaces?",
    answer: "We show both counts. 'Characters' includes everything including spaces, while 'Characters (no spaces)' excludes all whitespace for a more accurate letter count.",
  },
];

const ARTICLE = {
  title: "Why Word Count Matters",
  content:
    "Word count is important for many types of writing. Academic papers, blog posts, and social media all have specific word limits. Knowing your word count helps you stay within requirements and communicate more effectively. Our tool makes it easy to track your word count in real-time as you write, helping you craft content that meets your exact specifications.",
};

export default function WordCounterPage() {
  const [text, setText] = useState("");

  const counts = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const readingTimeMinutes = words / 200;
    const readingTimeSeconds = Math.round(readingTimeMinutes * 60);
    const readingTime = readingTimeMinutes >= 1
      ? `${Math.floor(readingTimeMinutes)} min ${readingTimeSeconds % 60} sec`
      : `${readingTimeSeconds} sec`;
    return { words, chars, charsNoSpace, sentences, paragraphs, readingTime };
  }, [text]);

  const clearText = useCallback(() => setText(""), []);

  return (
    <ToolLayout
      name={TOOL.name}
      description={TOOL.description}
      longDescription={TOOL.longDescription}
      category={TOOL.category}
      categorySlug={TOOL.categorySlug}
      breadcrumbs={TOOL.breadcrumbs}
      icon={TOOL.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Enter Your Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            rows={8}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.words}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Words</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.chars}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Characters</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.charsNoSpace}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Chars (no spaces)</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.sentences}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Sentences</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.paragraphs}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Paragraphs</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{counts.readingTime}</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Reading Time</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={clearText}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Clear
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}
