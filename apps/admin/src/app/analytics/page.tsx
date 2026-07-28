export default function AnalyticsPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Track your performance</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Page Views", value: "89,234", change: "+5.2%", up: true },
          { label: "Unique Visitors", value: "12,456", change: "+3.1%", up: true },
          { label: "Bounce Rate", value: "45.2%", change: "-2.3%", up: false },
          { label: "Avg. Session", value: "3m 24s", change: "+0.5%", up: true },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</div>
            <div className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</div>
            <div className={`mt-1 text-sm ${stat.up ? "text-green-600" : "text-red-600"}`}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Traffic Over Time</h2>
          <div className="mt-4 h-64 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <span className="text-neutral-400">Line Chart Placeholder</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Top Pages</h2>
          <div className="mt-4 space-y-3">
            {[
              { page: "/tools/json-formatter", views: "12,345" },
              { page: "/tools/word-counter", views: "8,923" },
              { page: "/tools/password-generator", views: "7,654" },
              { page: "/", views: "5,432" },
              { page: "/tools/image-compressor", views: "3,210" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-mono text-neutral-600 dark:text-neutral-400">{item.page}</span>
                <span className="text-neutral-500">{item.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
