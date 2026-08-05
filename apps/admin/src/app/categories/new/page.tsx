import Link from "next/link";
import { CategoryForm } from "@/components/categories/category-form";
import { pageTitleClass, pageDescClass } from "@/components/admin/ui";

export default function NewCategoryPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/categories" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
          ← Back
        </Link>
        <div>
          <h1 className={pageTitleClass}>Add Category</h1>
          <p className={pageDescClass}>Create a new tool category.</p>
        </div>
      </div>
      <CategoryForm />
    </div>
  );
}
