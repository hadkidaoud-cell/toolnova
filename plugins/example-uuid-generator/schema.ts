import type { PluginSchema } from "@toolnova/core";

export const schema: PluginSchema = {
  inputs: [
    {
      id: "count",
      name: "count",
      type: "number",
      label: "Number of UUIDs",
      description: "How many UUIDs to generate (1-100)",
      placeholder: "1",
      defaultValue: 1,
      required: false,
      min: 1,
      max: 100,
      step: 1,
    },
    {
      id: "uppercase",
      name: "uppercase",
      type: "boolean",
      label: "Uppercase",
      description: "Generate uppercase UUIDs",
      defaultValue: false,
      required: false,
    },
  ],
  outputs: [
    {
      id: "uuids",
      name: "uuids",
      type: "text",
      label: "Generated UUIDs",
    },
  ],
};
