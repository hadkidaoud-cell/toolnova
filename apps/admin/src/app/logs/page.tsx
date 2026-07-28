export default function LogsPage() {
  const logs = [
    { id: 1, level: "INFO", message: "Application started", timestamp: "2024-01-15 10:30:00", source: "server" },
    { id: 2, level: "INFO", message: "New user registered: john@example.com", timestamp: "2024-01-15 10:35:00", source: "auth" },
    { id: 3, level: "WARN", message: "Rate limit exceeded for IP 192.168.1.1", timestamp: "2024-01-15 10:40:00", source: "api" },
    { id: 4, level: "ERROR", message: "Failed to process image: invalid format", timestamp: "2024-01-15 10:45:00", source: "tools" },
    { id: 5, level: "INFO", message: "Tool updated: JSON Formatter", timestamp: "2024-01-15 10:50:00", source: "admin" },
    { id: 6, level: "DEBUG", message: "Cache cleared successfully", timestamp: "2024-01-15 10:55:00", source: "cache" },
  ];

  const levelColors: Record<string, string> = {
    INFO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    WARN: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    ERROR: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    DEBUG: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Logs</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">View application logs</p>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3 border-b border-neutral-200 p-4 dark:border-neutral-800">
          <select className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white">
            <option>All Levels</option>
            <option>INFO</option>
            <option>WARN</option>
            <option>ERROR</option>
            <option>DEBUG</option>
          </select>
          <input
            type="text"
            placeholder="Search logs..."
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 px-4 py-3">
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${levelColors[log.level]}`}>
                {log.level}
              </span>
              <div className="flex-1">
                <div className="text-sm text-neutral-900 dark:text-white">{log.message}</div>
                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                  <span>{log.timestamp}</span>
                  <span>•</span>
                  <span>{log.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
