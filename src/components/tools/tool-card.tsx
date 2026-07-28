// ============================================================
// ToolNova Tool Card
// ============================================================

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tool } from "@/types";

interface ToolCardProps {
  tool: Tool;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <Link
      href={tool.href}
      className={cn("tool-card group flex flex-col", className)}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400">
          <span className="text-xl">{tool.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
            {tool.name}
          </h3>
          <div className="flex items-center gap-2">
            {tool.isNew && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                New
              </span>
            )}
            {tool.isPopular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Sparkles className="h-3 w-3" />
                Popular
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mb-4 flex-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
        {tool.description}
      </p>

      <div className="flex items-center text-sm font-medium text-brand-600 transition-colors group-hover:text-brand-700 dark:text-brand-400">
        Try it now
        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
