import { prisma, parseToolMetadata, type ToolBadge } from "@toolnova/database";
import { getDbIcon } from "@/lib/db-icons";

export { getDbIcon };

export interface DbTool {
  slug: string;
  name: string;
  description: string;
  longDescription: string | null;
  categorySlug: string;
  categoryName: string;
  iconName: string | null;
  views: number;
  badges: ToolBadge[];
  time: number;
  uses: number;
  free: boolean;
}

function toDbTool(tool: {
  slug: string;
  name: string;
  description: string;
  longDescription: string | null;
  icon: string | null;
  views: number;
  metadata: string | null;
  category: { slug: string; name: string };
}): DbTool {
  const meta = parseToolMetadata(tool.metadata);
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    longDescription: tool.longDescription,
    categorySlug: tool.category.slug,
    categoryName: tool.category.name,
    iconName: tool.icon,
    views: tool.views,
    badges: meta.badges.filter(
      (b): b is ToolBadge => b === "new" || b === "ai" || b === "popular" || b === "recommended"
    ),
    time: meta.time,
    uses: meta.uses > 0 ? meta.uses : tool.views,
    free: meta.free,
  };
}

export async function getDbPublishedTools(): Promise<DbTool[] | null> {
  try {
    const tools = await prisma.tool.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { name: "asc" },
    });
    return tools.map(toDbTool);
  } catch {
    return null;
  }
}

export async function getDbToolBySlug(slug: string): Promise<DbTool | null> {
  try {
    const tool = await prisma.tool.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!tool || tool.status !== "PUBLISHED") return null;
    return toDbTool(tool);
  } catch {
    return null;
  }
}

export async function getDbRelatedTools(
  categorySlug: string,
  excludeSlug: string,
  take = 5
): Promise<{ slug: string; name: string; description: string }[] | null> {
  try {
    const tools = await prisma.tool.findMany({
      where: { status: "PUBLISHED", slug: { not: excludeSlug }, category: { slug: categorySlug } },
      select: { slug: true, name: true, description: true },
      take,
      orderBy: { views: "desc" },
    });
    return tools;
  } catch {
    return null;
  }
}

export async function getDbFeaturedTools(
  take = 4
): Promise<{ slug: string; name: string }[]> {
  try {
    const tools = await prisma.tool.findMany({
      where: { status: "PUBLISHED", featured: true },
      select: { slug: true, name: true },
      take,
      orderBy: { views: "desc" },
    });
    return tools;
  } catch {
    return [];
  }
}

export async function getDbCategories(): Promise<{ slug: string; name: string; description: string | null }[] | null> {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return categories.map((c) => ({ slug: c.slug, name: c.name, description: c.description }));
  } catch {
    return null;
  }
}
