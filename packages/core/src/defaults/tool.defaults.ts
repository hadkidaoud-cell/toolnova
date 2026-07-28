import { Tool, ToolStatus, ToolPermission } from "../types";

export const TOOL_VERSION_DEFAULTS = {
  current: "1.0.0",
  history: [],
  changelog: "",
};

export const TOOL_SEO_DEFAULTS = {
  title: "",
  description: "",
  keywords: [],
  ogImage: "",
  canonical: "",
};

export const TOOL_AUTHOR_DEFAULTS = {
  name: "ToolNova",
  url: "",
  avatar: "",
};

export const TOOL_STATUS_DEFAULTS: ToolStatus = "published";

export const TOOL_PERMISSIONS_DEFAULTS: ToolPermission = "public";

export const TOOL_INPUT_DEFAULTS: Partial<Tool["inputs"][number]> = {
  required: false,
  placeholder: "",
  description: "",
};

export const TOOL_OUTPUT_DEFAULTS: Partial<Tool["outputs"][number]> = {
  description: "",
};

export const TOOL_FIELD_DEFAULTS: Partial<Tool> = {
  slug: "",
  longDescription: "",
  icon: "",
  cover: "",
  tags: [],
  keywords: [],
  permissions: TOOL_PERMISSIONS_DEFAULTS,
  visibility: "public",
  featured: false,
  status: TOOL_STATUS_DEFAULTS,
  popularity: 0,
  inputs: [],
  outputs: [],
  author: TOOL_AUTHOR_DEFAULTS,
  version: TOOL_VERSION_DEFAULTS,
  seo: TOOL_SEO_DEFAULTS,
};
