"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { ToolCard } from "@/components/tool/tool-card";

interface DiscoverySectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  slugs: string[];
  id?: string;
  className?: string;
}

export function DiscoverySection({
  badge,
  title,
  subtitle,
  slugs,
  id,
  className,
}: DiscoverySectionProps) {
  const { dict } = useI18n();

  return (
    <section id={id} className={cn("py-12", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {badge && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {badge}
                </span>
              )}
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1.5 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
                  {subtitle}
                </p>
              )}
            </div>
            <Link
              href="/tools"
              className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {dict.ui.viewAll}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </motion.div>

        <div className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {slugs.map((slug, i) => (
            <div
              key={slug}
              className="w-[270px] shrink-0 snap-start sm:w-[290px] lg:w-auto"
            >
              <ToolCard slug={slug} delay={Math.min(i * 0.05, 0.25)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
