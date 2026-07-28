export interface ToolInputDefinition {
  id: string;
  name: string;
  type: ToolInputType;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: unknown;
  required: boolean;
  options?: Array<{ label: string; value: string | number }>;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  accept?: string;
  validators?: ToolInputValidator[];
}

export type ToolInputType =
  | "text"
  | "number"
  | "boolean"
  | "file"
  | "color"
  | "select"
  | "textarea"
  | "date"
  | "range"
  | "json"
  | "email"
  | "url";

export interface ToolInputValidator {
  type: "required" | "min" | "max" | "pattern" | "custom";
  value?: unknown;
  message: string;
  validate: (value: unknown) => boolean;
}

export interface ToolInputResult {
  [inputId: string]: unknown;
}

export function defineInput(input: ToolInputDefinition): ToolInputDefinition {
  return input;
}

export function defineInputs(inputs: ToolInputDefinition[]): ToolInputDefinition[] {
  return inputs;
}
