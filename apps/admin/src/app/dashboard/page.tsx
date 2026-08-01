import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [toolCount, userCount, activityCount, recentLogs, popularTools] = await Promise.all([
    prisma.tool.count(),
    prisma.user.count(),
    prisma.toolUsage.count(),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.tool.findMany({ orderBy: { views: "desc" }, take: 4 }),
  ]);

  const stats = [
    { label: "Total Tools", value: toolCount.toString(), change: `+${toolCount > 0 ? '12' : '0'}`, color: "text-brand-600" },
    { label: "Total Users", value: userCount.toString(), change: `+${userCount > 0 ? '8' : '0'}`, color: "text-green-600" },
    { label: "Tool Usages", value: activityCount.toString(), change: "+0", color: "text-blue-600" },
    { label: "Categories", value: (await prisma.category.count()).toString(), change: "0", color: "text-red-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">Welcome back, Admin</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            {recentLogs.length === 0 && (
              <p className="text-sm text-neutral-400">No activity yet</p>
            )}
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-neutral-900 dark:text-white">{log.action}</span>
                  <span className="ml-2 text-neutral-500 dark:text-neutral-400">{log.entityType}</span>
                </div>
                <span className="text-neutral-400">{log.createdAt.toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Popular Tools</h2>
          <div className="mt-4 space-y-3">
            {popularTools.length === 0 && (
              <p className="text-sm text-neutral-400">No tools yet</p>
            )}
            {popularTools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between text-sm">
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
