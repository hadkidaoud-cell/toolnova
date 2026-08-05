import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toolToInput } from "@/lib/tool-metadata";
import { ToolForm } from "@/components/tools/tool-form";
import { pageTitleClass, pageDescClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

interface EditToolPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditToolPage({ params }: EditToolPageProps) {
  const { id } = await params;
  const tool = await prisma.tool.findUnique({ where: { id: Number(id) } });
  if (!tool) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/tools" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
          ← Back
        </Link>
        <div>
          <h1 className={pageTitleClass}>Edit Tool</h1>
          <p className={pageDescClass}>Update “{tool.name}” details.</p>
        </div>
      </div>
      <ToolForm categories={categories} initial={toolToInput(tool)} toolId={tool.id} />
    </div>
  );
}
