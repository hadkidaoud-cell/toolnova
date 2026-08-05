import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDbToolBySlug, getDbRelatedTools } from "@/lib/db-tools";
import { DbToolView } from "@/components/tool/db-tool-page";

export const dynamic = "force-dynamic";

interface ToolSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ToolSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getDbToolBySlug(slug);
  if (!tool) return { title: "Not Found" };
  return {
    title: tool.name,
    description: tool.description,
  };
}

export default async function ToolSlugPage({ params }: ToolSlugPageProps) {
  const { slug } = await params;
  const tool = await getDbToolBySlug(slug);

  if (!tool) notFound();

  const related = (await getDbRelatedTools(tool.categorySlug, tool.slug)) ?? [];

  return (
    <DbToolView
      tool={{
        slug: tool.slug,
        name: tool.name,
        description: tool.description,
        longDescription: tool.longDescription,
        categorySlug: tool.categorySlug,
        categoryName: tool.categoryName,
        iconName: tool.iconName,
        time: tool.time,
        uses: tool.uses,
        free: tool.free,
        badges: tool.badges,
      }}
      related={related}
    />
  );
}
