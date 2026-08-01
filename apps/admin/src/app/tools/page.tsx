import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await prisma.tool.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Tools</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage your tools</p>
        </div>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Add Tool
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
          <input
            type="text"
            placeholder="Search tools..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Name</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Category</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Views</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Updated</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {tools.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No tools found</td>
                </tr>
              )}
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{tool.name}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{tool.category.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      tool.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : tool.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}>
                      {tool.status.charAt(0) + tool.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{tool.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{tool.updatedAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button className="text-brand-600 hover:text-brand-700">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
