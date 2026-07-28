// ============================================================
// Word Counter Tool - Plugin Definition
// ============================================================

import { createToolPlugin } from "@/plugins/base";
import WordCounterTool from "./component";

export const wordCounterPlugin = createToolPlugin({
  id: "word-counter",
  slug: "word-counter",
  name: "Word Counter",
  description: "Count words, characters, sentences, and paragraphs in your text instantly.",
  longDescription:
    "A powerful word counting tool that gives you detailed statistics about your text. Count words, characters (with and without spaces), sentences, paragraphs, and lines. Also includes estimated reading time.",
  category: "text",
  icon: "📝",
  keywords: ["word counter", "word count", "character count", "text counter", "text stats", "reading time"],
  version: "1.0.0",
  author: "ToolNova",
  isNew: false,
  isPopular: true,
  requiresAuth: false,
  isPremium: false,
  component: WordCounterTool,
});
