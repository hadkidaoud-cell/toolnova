"use client";

import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { TextQuote } from "lucide-react";

const RELATED_SLUGS = ["word-counter", "text-repeater", "case-converter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "word-counter": "W",
  "text-repeater": "↻",
  "case-converter": "Aa",
};

const LONG_DESCRIPTION =
  "Generate realistic placeholder text for mockups, templates, and designs. Choose between paragraphs, sentences, or a set number of words, and optionally start with the classic 'Lorem ipsum dolor sit amet' opener. Copy the result in one click.";

const FAQ = [
  {
    question: "Why is it called Lorem Ipsum?",
    answer: "It comes from a scrambled passage of Cicero's 'De finibus bonorum et malorum', used since the 1500s to simulate natural text in layouts.",
  },
  {
    question: "Is it real Latin?",
    answer: "Mostly, but it's deliberately scrambled so your eyes focus on the design rather than the words.",
  },
  {
    question: "Can I control the length?",
    answer: "Yes. Choose paragraphs, sentences, or words and set the count. Paragraphs are 4-7 sentences each.",
  },
];

const ARTICLE = {
  title: "Placeholder Text That Works",
  content:
    "Good placeholder text should fill space like real content without distracting the viewer. Lorem Ipsum's varied word lengths and rhythms mimic natural text better than repeating 'text text text'. Our generator gives you exact control over the amount, so every mockup feels real.",
};

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)] ?? "lorem";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function sentence(): string {
  const len = 8 + Math.floor(Math.random() * 9);
  const words: string[] = [];
  for (let i = 0; i < len; i++) words.push(randomWord());
  return capitalize(words.join(" ")) + ".";
}

function paragraph(): string {
  const count = 4 + Math.floor(Math.random() * 4);
  const sents: string[] = [];
  for (let i = 0; i < count; i++) sents.push(sentence());
  return sents.join(" ");
}

export default function LoremIpsumGeneratorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.generator;
  const meta = t.meta["lorem-ipsum-generator"];
  const u = t.loremIpsum;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "generator",
    icon: <TextQuote className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/generator" },
      { label: meta.name, href: "/tools/lorem-ipsum-generator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [mode, setMode] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [includeStart, setIncludeStart] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const n = Math.max(1, Math.min(100, Math.floor(count) || 1));
    let parts: string[] = [];
    if (mode === "paragraphs") {
      parts = Array.from({ length: n }, () => paragraph());
    } else if (mode === "sentences") {
      parts = Array.from({ length: n }, () => sentence());
    } else {
      parts = [Array.from({ length: n }, () => randomWord()).join(" ")];
      if (includeStart) parts[0] = "Lorem ipsum dolor sit amet, " + parts[0];
    }
    if (includeStart && mode !== "words" && parts.length > 0) {
      parts[0] = "Lorem ipsum dolor sit amet, " + parts[0]!.charAt(0).toLowerCase() + parts[0]!.slice(1);
    }
    setOutput(mode === "paragraphs" ? parts.join("\n\n") : parts.join(" "));
  }, [mode, count, includeStart]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(output);
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
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="inline-flex rounded-lg border border-neutral-300 bg-white p-1 dark:border-neutral-600 dark:bg-neutral-800">
              {(["paragraphs", "sentences", "words"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    mode === m
                      ? "bg-brand-600 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                >
                  {u[m]}
                </button>
              ))}
            </div>
          </div>
          <div className="w-32">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {mode === "words" ? u.words : mode === "sentences" ? u.sentences : u.paragraphs}
            </label>
            <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} className={inputCls} />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={includeStart}
            onChange={(e) => setIncludeStart(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
          />
          {u.includeStart}
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generate}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          >
            {u.generate}
          </button>
          {output && (
            <button
              onClick={copyAll}
              className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {copied ? t.common.copied : u.copyAll}
            </button>
          )}
        </div>

        {output && (
          <div>
            <textarea
              readOnly
              value={output}
              rows={12}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
