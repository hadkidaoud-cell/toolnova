export default function SEOPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">SEO</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage SEO settings</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Global SEO</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Site Title</label>
              <input
                type="text"
                defaultValue="ToolNova - Every Tool. One Place."
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Meta Description</label>
              <textarea
                rows={3}
                defaultValue="Discover hundreds of free online tools."
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Save Changes
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Sitemap</h2>
          <div className="mt-4 space-y-3">
            {[
              { url: "/", status: "Indexed", pages: "1" },
              { url: "/tools", status: "Indexed", pages: "124" },
              { url: "/categories", status: "Indexed", pages: "6" },
              { url: "/blog", status: "Pending", pages: "0" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-mono text-neutral-600 dark:text-neutral-400">{item.url}</span>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500">{item.pages} pages</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === "Indexed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
            Regenerate Sitemap
          </button>
        </div>
      </div>
    </div>
  );
}
