export type ToolStatus = "draft" | "published" | "archived" | "deprecated";

export type ToolPermission = "public" | "authenticated" | "admin";

export type InputType =
  | "text"
  | "number"
  | "boolean"
  | "file"
  | "color"
  | "select"
  | "textarea"
  | "date"
  | "range"
  | "json";

export interface ToolInput {
  id: string;
  name: string;
  type: InputType;
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
}

export interface ToolOutput {
  id: string;
  name: string;
  type: "text" | "html" | "json" | "file" | "data-url";
  label: string;
  description?: string;
}

export interface ToolAuthor {
  name: string;
  url?: string;
  avatar?: string;
}

export interface ToolVersion {
  current: string;
  history: string[];
  changelog?: string;
}

export interface ToolSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  icon?: string;
  cover?: string;
  category: string;
  tags: string[];
  keywords: string[];
  author: ToolAuthor;
  version: ToolVersion;
  seo: ToolSEO;
  permissions: ToolPermission;
  visibility: "public" | "hidden" | "private";
  featured: boolean;
  status: ToolStatus;
  popularity: number;
  inputs: ToolInput[];
  outputs: ToolOutput[];
  createdAt: string;
  updatedAt: string;
}
