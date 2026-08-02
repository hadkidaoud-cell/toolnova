"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import {
  BADGE_PRIORITY,
  getCategoryMeta,
  getToolMeta,
  type ToolBadge,
} from "@/lib/tool-catalog";

const BADGE_STYLES: Record<ToolBadge, string> = {
  ai: "bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-violet-500/30 dark:text-violet-300",
  new: "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/30 dark:text-emerald-300",
  popular:
    "bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/30 dark:text-amber-300",
  recommended:
    "bg-brand-500/10 text-brand-600 ring-1 ring-inset ring-brand-500/30 dark:text-brand-300",
};

export interface ToolCardProps {
  slug: string;
  name?: string;
  description?: string;
  className?: string;
  compact?: boolean;
  animate?: boolean;
  delay?: number;
  href?: string;
}

export function ToolBadgePill({ badge }: { badge: ToolBadge }) {
  const { dict } = useI18n();
  const label =
    badge === "ai"
      ? dict.ui.badgeAI
      : badge === "new"
        ? dict.ui.badgeNew
        : badge === "popular"
          ? dict.ui.badgePopular
          : dict.ui.badgeRecommended;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        BADGE_STYLES[badge]
      )}
    >
      {badge === "ai" && <Sparkles className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}

export function ToolCard({
  slug,
  name,
  description,
  className,
  compact,
  animate = true,
  delay = 0,
  href,
}: ToolCardProps) {
  const { dict } = useI18n();
  const meta = getToolMeta(slug);
  const category = meta ? getCategoryMeta(meta.category) : null;
  const categoryName = meta ? dict.tools.categories[meta.category] : "";
  const toolName = name ?? dict.tools.meta[slug as keyof typeof dict.tools.meta]?.name ?? slug;
  const toolDescription = description ?? dict.tools.meta[slug as keyof typeof dict.tools.meta]?.short ?? "";
  const Icon = meta?.icon;
  const badges = BADGE_PRIORITY.filter((b) => meta?.badges.includes(b) ?? false).slice(
    0,
    compact ? 1 : 2
  );
  const linkHref = href ?? `/tools/${slug}`;

  const card = (
    <Link
      href={linkHref}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-brand-700/50",
        category ? category.glow : "hover:shadow-brand-500/10",
        compact && "p-4",
        className
      )}
    >
      {category && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-15",
            category.gradient
          )}
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        {Icon && category ? (
          <div className="relative">
            <div
              className={cn(
                "absolute -inset-1.5 rounded-2xl bg-gradient-to-br opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100",
                category.gradient
              )}
            />
            <div
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ring-1 ring-inset ring-white/25 transition-transform duration-300 group-hover:scale-105",
                category.gradient,
                compact && "h-10 w-10"
              )}
            >
              <Icon className={cn("h-5 w-5", compact && "h-4 w-4")} />
            </div>
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-base font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {(toolName[0] ?? "?").toUpperCase()}
          </div>
        )}

        {badges.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-1">
            {badges.map((b) => (
              <ToolBadgePill key={b} badge={b} />
            ))}
          </div>
        )}
      </div>

      <h3 className="mt-4 font-semibold leading-snug text-neutral-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
        {toolName}
      </h3>

      {!compact && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {toolDescription}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        {categoryName && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              category?.soft ?? "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            )}
          >
            {categoryName}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-neutral-400 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand-600 group-hover:opacity-100 dark:text-neutral-500 dark:group-hover:text-brand-400 rtl:-translate-x-0.5 rtl:group-hover:-translate-x-0.5">
          {dict.toolLayout.useTool}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );

  if (!animate) return card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      {card}
    </motion.div>
  );
}
