import { prisma } from "@/lib/prisma";
import { parseToolMetadata } from "@/lib/tool-metadata";
import { cardClass } from "@/components/admin/ui";
import { TrafficArea, TopToolsBar, CategoryPie } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

export default async function AnalyticsPage() {
  const thirtyDaysAgo = daysAgo(30);
  const weekAgo = daysAgo(7);

  const [totalUsages, uniqueIps, toolCount, publishedCount, usagesLast7, usageRows, popularTools, categories] =
    await Promise.all([
      prisma.toolUsage.count(),
      prisma.toolUsage.groupBy({ by: ["ip"] }).then((r) => r.length),
      prisma.tool.count(),
      prisma.tool.count({ where: { status: "PUBLISHED" } }),
      prisma.toolUsage.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.toolUsage.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
      prisma.tool.findMany({ orderBy: { views: "desc" }, take: 8 }),
      prisma.category.findMany({ include: { _count: { select: { tools: true } } }, orderBy: { name: "asc" } }),
    ]);

  const dayKeys = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().slice(0, 10);
  });
  const dayCounts = new Map<string, number>();
  for (const u of usageRows) {
    const key = u.createdAt.toISOString().slice(0, 10);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const trafficData = dayKeys.map((day) => ({ day, count: dayCounts.get(day) ?? 0 }));

  const topToolsData = popularTools.map((tool) => {
    const meta = parseToolMetadata(tool.metadata);
    const views = meta.uses > 0 && tool.views === 0 ? meta.uses : tool.views;
    return { name: tool.name, views };
  });

  const categoryData = categories.map((c) => ({ name: c.name, value: c._count.tools }));

  const weekChange = totalUsages > 0 ? Math.round((usagesLast7 / totalUsages) * 100) : 0;

  const stats = [
    { label: "Tool Usages", value: totalUsages.toLocaleString(), change: `+${usagesLast7} this week` },
    { label: "Unique Visitors", value: uniqueIps.toLocaleString(), change: `${weekChange}% of all time` },
    { label: "Total Tools", value: toolCount.toLocaleString(), change: `${publishedCount} published` },
    {
      label: "Avg. Usages / Tool",
      value: toolCount > 0 ? Math.round(totalUsages / toolCount).toLocaleString() : "0",
      change: "all time",
    },
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Track your performance</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${cardClass} p-5`}>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</div>
            <div className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</div>
            <div className="mt-1 text-sm text-brand-600">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={`${cardClass} p-5`}>
          <h2 className="font-semibold text-neutral-900 dark:text-white">Traffic Over Time</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Tool usages, last 30 days</p>
          <div className="mt-4">
            <TrafficArea data={trafficData} />
          </div>
        </div>

        <div className={`${cardClass} p-5`}>
          <h2 className="font-semibold text-neutral-900 dark:text-white">Top Tools</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">By views</p>
          <div className="mt-4">
            <TopToolsBar data={topToolsData} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={`${cardClass} p-5`}>
          <h2 className="font-semibold text-neutral-900 dark:text-white">Tools by Category</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Distribution across categories</p>
          <div className="mt-4">
            <CategoryPie data={categoryData} />
          </div>
        </div>

        <div className={`${cardClass} p-5`}>
          <h2 className="font-semibold text-neutral-900 dark:text-white">Insights</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/60">
              <div>
                <div className="font-medium text-neutral-900 dark:text-white">Most used category</div>
                <div className="text-neutral-500 dark:text-neutral-400">
                  {categoryData.length > 0
                    ? [...categoryData].sort((a, b) => b.value - a.value)[0]?.name ?? "No categories yet"
                    : "No categories yet"}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/60">
              <div>
                <div className="font-medium text-neutral-900 dark:text-white">Top tool</div>
                <div className="text-neutral-500 dark:text-neutral-400">
                  {topToolsData.length > 0 ? topToolsData[0]?.name ?? "No tools yet" : "No tools yet"}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/60">
              <div>
                <div className="font-medium text-neutral-900 dark:text-white">Total views across tools</div>
                <div className="text-neutral-500 dark:text-neutral-400">
                  {popularTools.reduce((acc, t) => acc + (t.views || 0), 0).toLocaleString()} views
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
