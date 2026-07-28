// ============================================================
// Word Counter Tool - Component
// ============================================================

"use client";

import { useState, useMemo } from "react";
import type { ToolPluginProps } from "@/plugins/types";
import { Copy, RotateCcw, FileText, Hash, Clock, Type } from "lucide-react";

interface Stats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: string;
}

function calculateStats(text: string): Stats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;
  const lines = text.trim() === "" ? 0 : text.split("\n").length;
  const wordCount = words;
  const minutes = Math.ceil(wordCount / 200);
  const readingTime = minutes < 1 ? "Less than 1 min" : `${minutes} min read`;

  return { characters, charactersNoSpaces, words, sentences, paragraphs, lines, readingTime };
}

export default function WordCounterTool({ plugin }: ToolPluginProps) {
  const [text, setText] = useState("");

  const stats = useMemo(() => calculateStats(text), [text]);

  const handleClear = () => setText("");

  const handleCopyStats = () => {
    const statsText = `Characters: ${stats.characters}\nWords: ${stats.words}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nLines: ${stats.lines}\nReading Time: ${stats.readingTime}`;
    navigator.clipboard.writeText(statsText);
  };

  const statCards = [
    { label: "Characters", value: stats.characters, icon: Hash },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces, icon: Type },
    { label: "Words", value: stats.words, icon: FileText },
    { label: "Sentences", value: stats.sentences, icon: FileText },
    { label: "Paragraphs", value: stats.paragraphs, icon: FileText },
    { label: "Lines", value: stats.lines, icon: FileText },
    { label: "Reading Time", value: stats.readingTime, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here..."
          className="h-64 w-full resize-none rounded-xl border border-neutral-300 bg-white p-4 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={handleCopyStats}
            disabled={!text}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Stats
          </button>
          <button
            onClick={handleClear}
            disabled={!text}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <stat.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
