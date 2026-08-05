import { prisma } from "@/lib/prisma";
import { BackupsTable } from "@/components/backups/backups-table";

export const dynamic = "force-dynamic";

export default async function BackupsPage() {
  const backups = await prisma.backup.findMany({ orderBy: { createdAt: "desc" } });

  const rows = backups.map((backup) => ({
    id: backup.id,
    filename: backup.filename,
    size: backup.size,
    status: backup.status,
    type: backup.type,
    createdAt: backup.createdAt.toLocaleString(),
  }));

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Backups</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage system backups</p>
      </div>

      <BackupsTable backups={rows} />
    </div>
  );
}
