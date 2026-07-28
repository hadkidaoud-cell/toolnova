import type { PluginManifest } from "@toolnova/core";

export const manifest: PluginManifest = {
  id: "word-counter",
  name: "Word Counter",
  version: "1.0.0",
  description: "Count words, characters, sentences, and paragraphs in text",
  author: "ToolNova",
  category: "text",
  tags: ["words", "characters", "text", "counter"],
  icon: "word-count",
  permissions: "public",
  visibility: "public",
  featured: true,
  status: "published",
};
