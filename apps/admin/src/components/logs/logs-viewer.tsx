"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@toolnova/utils";

export interface LogRow {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  ip: string | null;
  createdAt: string;
}

const LEVELS = ["CREATE", "UPDATE", "DELETE", "ERROR", "INFO", "WARN", "DEBUG"];

const LEVEL_STYLES: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ERROR: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  INFO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  WARN: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  DEBUG: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
};

const PAGE_SIZE = 20;

export function LogsViewer({ logs }: { logs: LogRow[] }) {
  const [level, setLevel] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((log) => {
      if (level !== "ALL" && log.action !== level) return false;
      if (!q) return true;
      const text = `${log.action} ${log.entityType} ${log.entityId ?? ""} ${log.ip ?? ""} ${log.createdAt}`.toLowerCase();
      return text.includes(q);
    });
  }, [logs, level, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center dark:border-neutral-800">
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            resetPage();
          }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
        >
          <option value="ALL">All Levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            placeholder="Search logs..."
            className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          />
        </div>
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {visible.length === 0 && (
          <div className="px-4 py-8 text-center text-neutral-400">No logs match your filters</div>
        )}
        {visible.map((log) => (
          <div key={log.id} className="flex items-start gap-4 px-4 py-3">
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium",
                LEVEL_STYLES[log.action] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
              )}
            >
              {log.action}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-neutral-900 dark:text-white">
                {log.entityType}
                {log.entityId ? ` #${log.entityId}` : ""}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <span>{log.createdAt}</span>
                {log.ip && (
                  <>
                    <span>•</span>
                    <span>{log.ip}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <span className="text-xs text-neutral-500">
            {filtered.length} logs • page {currentPage}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
