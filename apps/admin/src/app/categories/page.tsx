export default function CategoriesPage() {
  const categories = [
    { id: 1, name: "Text Tools", slug: "text", tools: 24, status: "Active" },
    { id: 2, name: "Image Tools", slug: "image", tools: 18, status: "Active" },
    { id: 3, name: "Developer Tools", slug: "developer", tools: 32, status: "Active" },
    { id: 4, name: "Calculators", slug: "calculators", tools: 15, status: "Active" },
    { id: 5, name: "Converters", slug: "converters", tools: 21, status: "Active" },
    { id: 6, name: "Generators", slug: "generators", tools: 12, status: "Active" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage tool categories</p>
        </div>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Add Category
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">{cat.name}</h3>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {cat.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{cat.tools} tools</p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                Edit
              </button>
              <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-neutral-700 dark:hover:bg-red-900/20">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
