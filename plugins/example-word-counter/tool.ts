import type { Plugin, PluginContext, PluginResult } from "@toolnova/core";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countCharacters(text: string): number {
  return text.length;
}

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
}

function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

function execute(context: PluginContext): PluginResult {
  const text = (context.inputs.text as string) || "";

  return {
    outputs: {
      words: countWords(text),
      characters: countCharacters(text),
      sentences: countSentences(text),
      paragraphs: countParagraphs(text),
    },
  };
}

function validate(inputs: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const text = inputs.text;

  if (typeof text !== "string") {
    errors.push("Text input is required and must be a string");
  } else if (text.trim().length === 0) {
    errors.push("Text input cannot be empty");
  }

  return errors;
}

export const tool: Plugin["execute"] = execute;
export const validator: Plugin["validate"] = validate;
