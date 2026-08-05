"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { ToolCard } from "@/components/tool/tool-card";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  ALL_TOOL_SLUGS,
  type ToolCategory,
} from "@/lib/tool-catalog";

export interface DbToolLite {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
}

interface ToolsBrowserProps {
  dbTools?: DbToolLite[];
}

export function ToolsBrowser({ dbTools = [] }: ToolsBrowserProps) {
  const { dict } = useI18n();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  const [category, setCategory] = React.useState<ToolCategory | null>(null);

  React.useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const categories = Object.keys(CATEGORY_META) as ToolCategory[];

  const dbMap = React.useMemo(() => {
    const map: Record<string, DbToolLite> = {};
    for (const tool of dbTools) map[tool.slug] = tool;
    return map;
  }, [dbTools]);

  const allSlugs = React.useMemo(
    () => [...new Set([...ALL_TOOL_SLUGS, ...dbTools.map((t) => t.slug)])],
    [dbTools]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return allSlugs.filter((slug) => {
      const dbTool = dbMap[slug];
      if (
        category &&
        !(CATEGORY_ORDER[category]?.includes(slug) || dbTool?.categorySlug === category)
      ) {
        return false;
      }
      if (!q) return true;
      const meta = dict.tools.meta[slug as keyof typeof dict.tools.meta];
      const text = `${meta?.name ?? dbTool?.name ?? ""} ${meta?.short ?? dbTool?.description ?? ""} ${meta?.description ?? ""} ${slug}`.toLowerCase();
      return text.includes(q);
    });
  }, [query, category, dict, allSlugs, dbMap]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-brand-50/50 to-white pb-14 pt-12 dark:border-neutral-800 dark:from-brand-950/10 dark:to-neutral-950">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Link href="/" className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400">
              <Home className="h-3.5 w-3.5" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{dict.tools.allTools.title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
              {dict.tools.allTools.title}
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
              {dict.tools.allTools.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.tools.allTools.searchPlaceholder}
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 rtl:pl-4 rtl:pr-10"
              />
            </div>

            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <button
                onClick={() => setCategory(null)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  category === null
                    ? "border-brand-500 bg-brand-600 text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-brand-300 hover:text-brand-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-brand-600 dark:hover:text-brand-300"
                )}
              >
                {dict.tools.allTools.allCategories}
              </button>
              {categories.map((slug) => {
                const Icon = CATEGORY_META[slug].icon;
                return (
                  <button
                    key={slug}
                    onClick={() => setCategory(category === slug ? null : slug)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      category === slug
                        ? "border-brand-500 bg-brand-600 text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-brand-300 hover:text-brand-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-brand-600 dark:hover:text-brand-300"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {dict.category.categories[slug].name}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((slug, i) => {
              const dbTool = dbMap[slug];
              return (
                <ToolCard
                  key={slug}
                  slug={slug}
                  name={dbTool?.name}
                  description={dbTool?.description}
                  delay={Math.min(i * 0.03, 0.2)}
                />
              );
            })}
          </motion.div>

          {filtered.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">{dict.tools.allTools.noResults}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
