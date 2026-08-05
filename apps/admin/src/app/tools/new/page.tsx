import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ToolForm } from "@/components/tools/tool-form";
import { pageTitleClass, pageDescClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function NewToolPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/tools" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
          ← Back
        </Link>
        <div>
          <h1 className={pageTitleClass}>Add Tool</h1>
          <p className={pageDescClass}>Create a new tool and save it to the database.</p>
        </div>
      </div>
      <ToolForm categories={categories} />
    </div>
  );
}
