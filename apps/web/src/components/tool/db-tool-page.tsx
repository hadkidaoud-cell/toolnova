"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Clock, Home, Users } from "lucide-react";
import { useI18n } from "@/i18n";
import { CATEGORY_META, formatUses, type ToolBadge, type ToolCategory } from "@/lib/tool-catalog";
import { DbIcon } from "@/lib/db-icons";
import { ToolBadgePill, ToolCard } from "@/components/tool/tool-card";
import { ToolViewTracker } from "@/components/tool/tool-view-tracker";

export interface DbToolViewProps {
  tool: {
    slug: string;
    name: string;
    description: string;
    longDescription?: string | null;
    categorySlug: string;
    categoryName: string;
    iconName?: string | null;
    time: number;
    uses: number;
    free: boolean;
    badges: ToolBadge[];
  };
  related: { slug: string; name: string; description: string }[];
}

export function DbToolView({ tool, related }: DbToolViewProps) {
  const { dict } = useI18n();
  const catSlug = tool.categorySlug as ToolCategory;
  const catMeta = catSlug in CATEGORY_META ? CATEGORY_META[catSlug] : null;

  const timeLabel =
    tool.time < 60
      ? `~${tool.time} ${dict.tools.units.sec}`
      : `~${Math.round(tool.time / 60)} ${dict.tools.units.min}`;
  const usesLabel = `${formatUses(tool.uses)} ${dict.ui.uses}`;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <ToolViewTracker />
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-brand-50/50 to-white pb-14 pt-12 dark:border-neutral-800 dark:from-brand-950/10 dark:to-neutral-950">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Link href="/" className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400">
              <Home className="h-3.5 w-3.5" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            <Link
              href="/tools"
              className="hover:text-brand-600 dark:hover:text-brand-400"
            >
              {dict.tools.allTools.title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            <span className="text-neutral-900 dark:text-white">{tool.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-start gap-6 md:flex-row md:items-center"
          >
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ring-1 ring-inset ring-white/25 ${
                catMeta?.gradient ?? "from-brand-500 to-brand-700"
              }`}
            >
              {tool.iconName ? (
                <DbIcon name={tool.iconName} className="h-7 w-7 text-white" />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {(tool.name[0] ?? "?").toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
                  {tool.name}
                </h1>
                {tool.badges.map((badge) => (
                  <ToolBadgePill key={badge} badge={badge} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                {catMeta && (
                  <Link
                    href={`/category/${tool.categorySlug}`}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${catMeta.soft}`}
                  >
                    {dict.category.categories[catSlug]?.name ?? tool.categoryName}
                  </Link>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {timeLabel}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {usesLabel}
                </span>
                {tool.free && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300">
                    {dict.ui.free}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="text-lg text-neutral-600 dark:text-neutral-400">{tool.description}</p>

            <div className="mt-6 flex flex-col items-start gap-4 rounded-xl bg-neutral-50 p-6 sm:flex-row sm:items-center dark:bg-neutral-800/60">
              <div className="flex-1">
                <h2 className="font-semibold text-neutral-900 dark:text-white">
                  {dict.comingSoon.title}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {dict.comingSoon.description}
                </p>
              </div>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                {dict.comingSoon.backToHome}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
            </div>

            {tool.longDescription && (
              <div className="mt-6">
                <h2 className="font-semibold text-neutral-900 dark:text-white">
                  {dict.toolLayout.aboutThisTool}
                </h2>
                <p className="mt-2 whitespace-pre-line text-neutral-600 dark:text-neutral-400">
                  {tool.longDescription}
                </p>
              </div>
            )}
          </motion.div>

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {dict.toolLayout.relatedTools}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {related.map((r, i) => (
                  <ToolCard
                    key={r.slug}
                    slug={r.slug}
                    name={r.name}
                    description={r.description}
                    delay={Math.min(i * 0.03, 0.2)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
