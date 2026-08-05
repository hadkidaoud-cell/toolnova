import React from "react";
import { getDbPublishedTools } from "@/lib/db-tools";
import { ToolsBrowser, type DbToolLite } from "@/components/tools/tools-browser";

export const dynamic = "force-dynamic";

export default async function AllToolsPage() {
  const db = await getDbPublishedTools();
  const dbTools: DbToolLite[] =
    db?.map((t) => ({ slug: t.slug, name: t.name, description: t.description, categorySlug: t.categorySlug })) ?? [];

  return (
    <React.Suspense fallback={null}>
      <ToolsBrowser dbTools={dbTools} />
    </React.Suspense>
  );
}
