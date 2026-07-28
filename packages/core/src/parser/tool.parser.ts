import {
  Tool,
  ToolAuthor,
  ToolVersion,
  ToolSEO,
  ToolInput,
  ToolOutput,
  ToolStatus,
  ToolPermission,
} from "../types";
import {
  TOOL_VERSION_DEFAULTS,
  TOOL_SEO_DEFAULTS,
  TOOL_AUTHOR_DEFAULTS,
  TOOL_INPUT_DEFAULTS,
  TOOL_OUTPUT_DEFAULTS,
} from "../defaults";
import { slugify } from "../utils";

export interface ToolDefinitionInput {
  id: string;
  name: string;
  type: ToolInput["type"];
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: unknown;
  required?: boolean;
  options?: ToolInput["options"];
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  accept?: string;
}

export interface ToolDefinitionOutput {
  id: string;
  name: string;
  type: ToolOutput["type"];
  label: string;
  description?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  longDescription?: string;
  icon?: string;
  cover?: string;
  category: string;
  tags?: string[];
  keywords?: string[];
  author?: string | ToolAuthor;
  version?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    canonical?: string;
  };
  permissions?: ToolPermission;
  visibility?: Tool["visibility"];
  featured?: boolean;
  status?: ToolStatus;
  inputs?: ToolDefinitionInput[];
  outputs?: ToolDefinitionOutput[];
}

function parseAuthor(author: string | ToolAuthor | undefined): ToolAuthor {
  if (!author) return { ...TOOL_AUTHOR_DEFAULTS };
  if (typeof author === "string") return { name: author, url: "", avatar: "" };
  return {
    name: author.name || TOOL_AUTHOR_DEFAULTS.name,
    url: author.url || TOOL_AUTHOR_DEFAULTS.url,
    avatar: author.avatar || TOOL_AUTHOR_DEFAULTS.avatar,
  };
}

function parseVersion(version: string | undefined): ToolVersion {
  return {
    current: version || TOOL_VERSION_DEFAULTS.current,
    history: [...TOOL_VERSION_DEFAULTS.history],
  };
}

function parseSEO(
  seo: ToolDefinition["seo"],
  name: string,
  description: string,
  tags: string[]
): ToolSEO {
  return {
    title: seo?.title || name,
    description: seo?.description || description,
    keywords: seo?.keywords || tags,
    ogImage: seo?.ogImage || TOOL_SEO_DEFAULTS.ogImage,
    canonical: seo?.canonical || TOOL_SEO_DEFAULTS.canonical,
  };
}

function parseInputs(inputs: ToolDefinitionInput[] | undefined): ToolInput[] {
  if (!inputs) return [];
  return inputs.map((input) => ({
    id: input.id,
    name: input.name,
    type: input.type,
    label: input.label,
    description: input.description || TOOL_INPUT_DEFAULTS.description,
    placeholder: input.placeholder || TOOL_INPUT_DEFAULTS.placeholder,
    defaultValue: input.defaultValue,
    required: input.required ?? TOOL_INPUT_DEFAULTS.required ?? false,
    options: input.options,
    min: input.min,
    max: input.max,
    step: input.step,
    pattern: input.pattern,
    accept: input.accept,
  }));
}

function parseOutputs(outputs: ToolDefinitionOutput[] | undefined): ToolOutput[] {
  if (!outputs) return [];
  return outputs.map((output) => ({
    id: output.id,
    name: output.name,
    type: output.type,
    label: output.label,
    description: output.description || TOOL_OUTPUT_DEFAULTS.description,
  }));
}

export function parseToolDefinition(definition: ToolDefinition): Tool {
  const id = slugify(definition.name);
  const now = new Date().toISOString();
  const tags = definition.tags || [];
  const author = parseAuthor(definition.author);

  return {
    id,
    slug: id,
    name: definition.name,
    description: definition.description,
    longDescription: definition.longDescription,
    icon: definition.icon,
    cover: definition.cover,
    category: definition.category,
    tags,
    keywords: definition.keywords || tags,
    author,
    version: parseVersion(definition.version),
    seo: parseSEO(definition.seo, definition.name, definition.description, tags),
    permissions: definition.permissions || "public",
    visibility: definition.visibility || "public",
    featured: definition.featured ?? false,
    status: definition.status || "published",
    popularity: 0,
    inputs: parseInputs(definition.inputs),
    outputs: parseOutputs(definition.outputs),
    createdAt: now,
    updatedAt: now,
  };
}

export function parseToolDefinitions(definitions: ToolDefinition[]): Tool[] {
  return definitions.map(parseToolDefinition);
}
