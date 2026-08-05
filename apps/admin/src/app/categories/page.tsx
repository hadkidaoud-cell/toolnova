import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getIcon } from "@/lib/icon-registry";
import { DeleteCategoryButton } from "@/components/categories/category-actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage tool categories</p>
        </div>
        <Link
          href="/categories/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Add Category
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 && (
          <p className="col-span-full text-center text-neutral-400">
            No categories yet. Click “Add Category” to get started.
          </p>
        )}
        {categories.map((cat) => {
          const Icon = getIcon(cat.icon);
          return (
          <div
            key={cat.id}
            className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                  {Icon ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{(cat.name[0] ?? "?").toUpperCase()}</span>
                  )}
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{cat.name}</h3>
                  {cat.slug && <div className="text-xs text-neutral-400">/{cat.slug}</div>}
                </div>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Active
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {cat.toolCount} tool{cat.toolCount !== 1 ? "s" : ""}
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/categories/${cat.id}/edit`}
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Edit
              </Link>
              <DeleteCategoryButton categoryId={cat.id} categoryName={cat.name} />
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
