export interface ToolOutputDefinition {
  id: string;
  name: string;
  type: ToolOutputType;
  label: string;
  description?: string;
}

export type ToolOutputType = "text" | "html" | "json" | "file" | "data-url";

export interface ToolOutputResult {
  [outputId: string]: unknown;
}

export interface ToolOutputFormatted {
  id: string;
  name: string;
  type: ToolOutputType;
  value: unknown;
  formatted: string;
}

export function defineOutput(output: ToolOutputDefinition): ToolOutputDefinition {
  return output;
}

export function defineOutputs(outputs: ToolOutputDefinition[]): ToolOutputDefinition[] {
  return outputs;
}

export function formatOutputValue(value: unknown, type: ToolOutputType): string {
  switch (type) {
    case "text":
      return String(value ?? "");
    case "json":
      return typeof value === "string" ? value : JSON.stringify(value, null, 2);
    case "html":
      return String(value ?? "");
    case "file":
      return value instanceof Blob ? URL.createObjectURL(value) : String(value ?? "");
    case "data-url":
      return String(value ?? "");
    default:
      return String(value ?? "");
  }
}
