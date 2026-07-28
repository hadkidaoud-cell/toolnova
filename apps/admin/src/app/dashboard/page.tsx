export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">Welcome back, Admin</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Tools", value: "124", change: "+12", color: "text-brand-600" },
          { label: "Total Users", value: "5,432", change: "+180", color: "text-green-600" },
          { label: "Page Views", value: "89,234", change: "+5.2%", color: "text-blue-600" },
          { label: "Errors", value: "23", change: "-4", color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</div>
            <div className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</div>
            <div className={`mt-1 text-sm ${stat.color}`}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {[
              { action: "New tool added", tool: "JSON Formatter", time: "2 hours ago" },
              { action: "Tool updated", tool: "Word Counter", time: "5 hours ago" },
              { action: "User registered", tool: "john@example.com", time: "1 day ago" },
              { action: "Error fixed", tool: "Image Compressor", time: "2 days ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-neutral-900 dark:text-white">{item.action}</span>
                  <span className="ml-2 text-neutral-500 dark:text-neutral-400">{item.tool}</span>
                </div>
                <span className="text-neutral-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Popular Tools</h2>
          <div className="mt-4 space-y-3">
            {[
              { name: "JSON Formatter", views: "12,345" },
              { name: "Word Counter", views: "8,923" },
              { name: "Password Generator", views: "7,654" },
              { name: "Image Compressor", views: "5,432" },
            ].map((tool, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-900 dark:text-white">{tool.name}</span>
                <span className="text-neutral-500 dark:text-neutral-400">{tool.views} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-semibold text-neutral-900 dark:text-white">Traffic Overview</h2>
        <div className="mt-4 h-64 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <span className="text-neutral-400">Chart Placeholder</span>
        </div>
      </div>
    </div>
  );
}
