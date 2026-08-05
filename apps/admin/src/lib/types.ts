export type ToolStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";
export type ToolBadge = "new" | "ai" | "popular" | "recommended";

export interface ToolInput {
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  categoryId: number;
  icon?: string;
  status: ToolStatus;
  views?: number;
  badges: ToolBadge[];
  time: number;
  uses: number;
  free: boolean;
  featured?: boolean;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };
