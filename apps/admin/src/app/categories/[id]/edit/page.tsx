import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/categories/category-form";
import { pageTitleClass, pageDescClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id: Number(id) } });
  if (!category) notFound();

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/categories" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
          ← Back
        </Link>
        <div>
          <h1 className={pageTitleClass}>Edit Category</h1>
          <p className={pageDescClass}>Update “{category.name}”.</p>
        </div>
      </div>
      <CategoryForm
        categoryId={category.id}
        initial={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          icon: category.icon ?? "",
        }}
      />
    </div>
  );
}
