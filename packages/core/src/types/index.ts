export type {
  Tool,
  ToolAuthor,
  ToolVersion,
  ToolSEO,
  ToolStatus,
  ToolPermission,
  ToolInput,
  ToolOutput,
  InputType,
} from "./tool";
export type { Category } from "./category";
export type { Tag } from "./tag";

export interface SearchResult {
  tool: import("./tool").Tool;
  score: number;
}

export interface ToolFilter {
  category?: string;
  tags?: string[];
  search?: string;
  featured?: boolean;
  visible?: boolean;
  status?: import("./tool").ToolStatus;
  permissions?: import("./tool").ToolPermission;
  sortBy?: "name" | "popularity" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
