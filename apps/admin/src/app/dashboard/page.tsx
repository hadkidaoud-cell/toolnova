import { prisma } from "@/lib/prisma";
import { parseToolMetadata } from "@/lib/tool-metadata";
import { cardClass } from "@/components/admin/ui";
import { TopToolsBar, CategoryPie } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

export default async function DashboardPage() {
  const weekAgo = daysAgo(7);
  const twoWeeksAgo = daysAgo(14);

  const [
    toolCount,
    userCount,
    usageCount,
    categoryCount,
    newTools,
    newUsers,
    newUsages,
    recentLogs,
    popularTools,
    publishedCount,
    categories,
    recentUsages,
  ] = await Promise.all([
    prisma.tool.count(),
    prisma.user.count(),
    prisma.toolUsage.count(),
    prisma.category.count(),
    prisma.tool.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.toolUsage.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.tool.findMany({ orderBy: { views: "desc" }, take: 8 }),
    prisma.tool.count({ where: { status: "PUBLISHED" } }),
    prisma.category.findMany({ include: { _count: { select: { tools: true } } }, orderBy: { name: "asc" } }),
    prisma.toolUsage.findMany({ where: { createdAt: { gte: twoWeeksAgo } }, select: { createdAt: true } }),
  ]);

  const stats = [
    { label: "Total Tools", value: toolCount, change: `+${newTools} this week`, color: "text-brand-600" },
    { label: "Published", value: publishedCount, change: `${toolCount - publishedCount} not live`, color: "text-green-600" },
    { label: "Total Users", value: userCount, change: `+${newUsers} this week`, color: "text-blue-600" },
    { label: "Tool Usages", value: usageCount, change: `+${newUsages} this week`, color: "text-amber-600" },
    { label: "Categories", value: categoryCount, change: `${categoryCount} total`, color: "text-red-600" },
  ];

  const topToolsData = popularTools.map((tool) => {
    const meta = parseToolMetadata(tool.metadata);
    const views = meta.uses > 0 && tool.views === 0 ? meta.uses : tool.views;
    return { name: tool.name, views };
  });

  const categoryData = categories.map((c) => ({ name: c.name, value: c._count.tools }));

  const dayKeys = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(twoWeeksAgo);
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().slice(0, 10);
  });
  const dayCounts = new Map<string, number>();
  for (const u of recentUsages) {
    const key = u.createdAt.toISOString().slice(0, 10);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const usageData = dayKeys.map((day) => ({ day, count: dayCounts.get(day) ?? 0 }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">Welcome back, Admin</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className={`${cardClass} p-5`}>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</div>
            <div className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{stat.value.toLocaleString()}</div>
            <div className={`mt-1 text-sm ${stat.color}`}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={`${cardClass} p-5`}>
          <h2 className="font-semibold text-neutral-900 dark:text-white">Popular Tools</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">By views</p>
          <div className="mt-4">
            <TopToolsBar data={topToolsData} />
          </div>
        </div>

        <div className={`${cardClass} p-5`}>
          <h2 className="font-semibold text-neutral-900 dark:text-white">Tools by Category</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Distribution across categories</p>
          <div className="mt-4">
            <CategoryPie data={categoryData} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={`${cardClass} p-5`}>
          <h2 className="font-semibold text-neutral-900 dark:text-white">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {recentLogs.length === 0 && (
              <p className="text-sm text-neutral-400">No activity yet</p>
            )}
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-neutral-900 dark:text-white">{log.action}</span>
                  <span className="ml-2 text-neutral-500 dark:text-neutral-400">{log.entityType}</span>
                </div>
                <span className="shrink-0 text-neutral-400">{log.createdAt.toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardClass} p-5`}>
          <h2 className="font-semibold text-neutral-900 dark:text-white">Tool Usage</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Last 14 days</p>
          <div className="mt-4 space-y-2">
            {usageData.every((d) => d.count === 0) ? (
              <p className="text-sm text-neutral-400">No usage recorded yet. Usages appear as visitors use your tools.</p>
            ) : (
              usageData.map((d) => (
                <div key={d.day} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-neutral-500 dark:text-neutral-400">{d.day}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.min(100, (d.count / Math.max(...usageData.map((x) => x.count))) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-neutral-600 dark:text-neutral-300">{d.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
