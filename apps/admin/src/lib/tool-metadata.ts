import {
  parseToolMetadata,
  stringifyToolMetadata,
  type ToolBadge,
  type ToolMetadata,
} from "@toolnova/database";
import type { ToolInput, ToolStatus } from "@/lib/types";

export type { ToolBadge, ToolMetadata };

export { parseToolMetadata, stringifyToolMetadata };

export function toolToInput(tool: {
  name: string;
  slug: string;
  description: string;
  longDescription: string | null;
  categoryId: number;
  icon: string | null;
  status: ToolStatus;
  views: number;
  featured: boolean;
  metadata: string | null;
}): ToolInput {
  const meta = parseToolMetadata(tool.metadata);
  return {
    name: tool.name,
    slug: tool.slug,
    description: tool.description,
    longDescription: tool.longDescription ?? undefined,
    categoryId: tool.categoryId,
    icon: tool.icon ?? undefined,
    status: tool.status,
    views: tool.views,
    featured: tool.featured,
    badges: meta.badges as ToolBadge[],
    time: meta.time,
    uses: meta.uses,
    free: meta.free,
  };
}
