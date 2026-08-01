import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [totalUsages, uniqueIps, toolCount, popularTools] = await Promise.all([
    prisma.toolUsage.count(),
    prisma.toolUsage.groupBy({ by: ["ip"] }).then((r) => r.length),
    prisma.tool.count(),
    prisma.tool.findMany({ orderBy: { views: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Track your performance</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tool Usages", value: totalUsages.toLocaleString(), change: "0%", up: true },
          { label: "Unique Visitors", value: uniqueIps.toLocaleString(), change: "0%", up: true },
          { label: "Total Tools", value: toolCount.toLocaleString(), change: "0%", up: true },
          { label: "Avg. Views/Tool", value: toolCount > 0 ? Math.round(totalUsages / toolCount).toLocaleString() : "0", change: "0%", up: true },
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
          <h2 className="font-semibold text-neutral-900 dark:text-white">Top Tools</h2>
          <div className="mt-4 space-y-3">
            {popularTools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between text-sm">
                <span className="font-mono text-neutral-600 dark:text-neutral-400">{tool.name}</span>
                <span className="text-neutral-500">{tool.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
