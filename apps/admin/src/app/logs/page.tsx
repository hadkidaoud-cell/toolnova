import { prisma } from "@/lib/prisma";
import { LogsViewer } from "@/components/logs/logs-viewer";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows = logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    ip: log.ip,
    createdAt: log.createdAt.toLocaleString(),
  }));

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Logs</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">View application logs</p>
      </div>

      <LogsViewer logs={rows} />
    </div>
  );
}
