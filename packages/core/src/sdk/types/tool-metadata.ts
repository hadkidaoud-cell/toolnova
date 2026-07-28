export interface ToolMetadata {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  version: string;
  category: string;
  tags: string[];
  icon?: string;
  cover?: string;
  author: ToolMetadataAuthor;
  permissions: string;
  visibility: "public" | "hidden" | "private";
  featured: boolean;
  status: "draft" | "published" | "archived" | "deprecated";
  createdAt: string;
  updatedAt: string;
}

export interface ToolMetadataAuthor {
  name: string;
  url?: string;
  avatar?: string;
}

export interface ToolMetadataInput {
  id: string;
  name: string;
  type: string;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: unknown;
  required: boolean;
  options?: Array<{ label: string; value: string | number }>;
}

export interface ToolMetadataOutput {
  id: string;
  name: string;
  type: string;
  label: string;
  description?: string;
}

export function slugifyToolName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
