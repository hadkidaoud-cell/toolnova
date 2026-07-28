import type { Plugin, PluginContext, PluginResult } from "@toolnova/core";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function execute(context: PluginContext): PluginResult {
  const count = Math.min(Math.max((context.inputs.count as number) || 1, 1), 100);
  const uppercase = (context.inputs.uppercase as boolean) || false;

  const uuids: string[] = [];
  for (let i = 0; i < count; i++) {
    uuids.push(uppercase ? generateUUID().toUpperCase() : generateUUID());
  }

  return {
    outputs: {
      uuids: uuids.join("\n"),
    },
  };
}

function validate(inputs: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const count = inputs.count;

  if (count !== undefined) {
    if (typeof count !== "number") {
      errors.push("Count must be a number");
    } else if (count < 1 || count > 100) {
      errors.push("Count must be between 1 and 100");
    }
  }

  return errors;
}

export const tool: Plugin["execute"] = execute;
export const validator: Plugin["validate"] = validate;
