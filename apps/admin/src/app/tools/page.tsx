export default function ToolsPage() {
  const tools = [
    { id: 1, name: "JSON Formatter", category: "Developer", status: "Published", views: "12,345", updated: "2 hours ago" },
    { id: 2, name: "Word Counter", category: "Text", status: "Published", views: "8,923", updated: "5 hours ago" },
    { id: 3, name: "Password Generator", category: "Security", status: "Published", views: "7,654", updated: "1 day ago" },
    { id: 4, name: "Image Compressor", category: "Image", status: "Draft", views: "5,432", updated: "2 days ago" },
    { id: 5, name: "UUID Generator", category: "Generator", status: "Published", views: "3,210", updated: "3 days ago" },
    { id: 6, name: "Color Picker", category: "Design", status: "Published", views: "2,876", updated: "1 week ago" },
  ];

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
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{tool.name}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{tool.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      tool.status === "Published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {tool.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{tool.views}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{tool.updated}</td>
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
