export default function BackupsPage() {
  const backups = [
    { id: 1, name: "backup-2024-01-15.zip", size: "24.5 MB", created: "Jan 15, 2024 10:00 AM", status: "Completed" },
    { id: 2, name: "backup-2024-01-14.zip", size: "24.2 MB", created: "Jan 14, 2024 10:00 AM", status: "Completed" },
    { id: 3, name: "backup-2024-01-13.zip", size: "23.8 MB", created: "Jan 13, 2024 10:00 AM", status: "Completed" },
    { id: 4, name: "backup-2024-01-12.zip", size: "23.5 MB", created: "Jan 12, 2024 10:00 AM", status: "Completed" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Backups</h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage system backups</p>
        </div>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Create Backup
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Name</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Size</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Created</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{backup.name}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{backup.size}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{backup.created}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-brand-600 hover:text-brand-700">Download</button>
                      <button className="text-red-600 hover:text-red-700">Delete</button>
                    </div>
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
