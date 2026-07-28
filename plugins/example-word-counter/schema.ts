import type { PluginSchema } from "@toolnova/core";

export const schema: PluginSchema = {
  inputs: [
    {
      id: "text",
      name: "text",
      type: "textarea",
      label: "Text to Count",
      placeholder: "Enter or paste your text here...",
      required: true,
    },
  ],
  outputs: [
    {
      id: "words",
      name: "words",
      type: "number",
      label: "Word Count",
    },
    {
      id: "characters",
      name: "characters",
      type: "number",
      label: "Character Count",
    },
    {
      id: "sentences",
      name: "sentences",
      type: "number",
      label: "Sentence Count",
    },
    {
      id: "paragraphs",
      name: "paragraphs",
      type: "number",
      label: "Paragraph Count",
    },
  ],
};
