"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search, ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tool/tool-card";
import { useI18n } from "@/i18n";
import { CATEGORY_META, CATEGORY_ORDER, type ToolCategory } from "@/lib/tool-catalog";

const CATEGORY_SLUGS: ToolCategory[] = [
  "text",
  "image",
  "developer",
  "calculation",
  "converter",
  "generator",
  "document",
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { dict } = useI18n();
  const cat = dict.category;
  const [search, setSearch] = React.useState("");

  const categorySlug = slug as ToolCategory;
  const category = React.useMemo(() => {
    if (!(slug in CATEGORY_ORDER)) return null;
    return {
      name: cat.categories[categorySlug].name,
      description: cat.categories[categorySlug].description,
      tools: CATEGORY_ORDER[categorySlug],
    };
  }, [slug, cat, categorySlug]);

  const filteredTools = React.useMemo(() => {
    const all = category?.tools ?? [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((toolSlug) => {
      const meta = dict.tools.meta[toolSlug as keyof typeof dict.tools.meta];
      const text = `${meta?.name ?? ""} ${meta?.short ?? ""} ${meta?.description ?? ""} ${toolSlug}`.toLowerCase();
      return text.includes(q);
    });
  }, [search, category, dict]);

  if (!category || !CATEGORY_SLUGS.includes(categorySlug)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">{cat.notFoundTitle}</h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">{cat.notFoundDesc}</p>
          <Link href="/">
            <Button className="mt-8">{cat.backToHome}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const meta = CATEGORY_META[categorySlug];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-brand-50/50 to-white pb-16 pt-12 dark:border-neutral-800 dark:from-brand-950/10 dark:to-neutral-950">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Link href="/" className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400">
              <Home className="h-3.5 w-3.5" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{category.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                meta.gradient
              )}
            >
              <meta.icon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
                {category.name}
              </h1>
              <p className="mt-1 text-lg text-neutral-600 dark:text-neutral-400">
                {category.description}
              </p>
              <Badge variant="secondary" className="mt-2">
                {cat.toolsSuffix.replace("{count}", String(category.tools.length))}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                placeholder={cat.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 rtl:pl-4 rtl:pr-10"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((toolSlug, i) => (
              <ToolCard key={toolSlug} slug={toolSlug} delay={Math.min(i * 0.05, 0.25)} />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">{cat.noToolsFound}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
