// ============================================================
// ToolNova Tool Grid
// ============================================================

import { ToolCard } from "./tool-card";
import type { Tool } from "@/types";

interface ToolGridProps {
  tools: Tool[];
  emptyMessage?: string;
}

export function ToolGrid({ tools, emptyMessage = "No tools found" }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
