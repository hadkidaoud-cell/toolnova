// ============================================================
// ToolNova Home Page
// ============================================================

import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { CTA } from "@/components/marketing/cta";
import { ToolCard } from "@/components/tools/tool-card";
import { pluginRegistry } from "@/plugins/tools";
import type { Tool } from "@/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function pluginToTool(plugin: ReturnType<typeof pluginRegistry.getAll>[0]): Tool {
  return {
    id: plugin.id,
    slug: plugin.slug,
    name: plugin.name,
    description: plugin.description,
    category: plugin.category,
    icon: plugin.icon,
    href: `/tools/${plugin.category}/${plugin.slug}`,
    keywords: plugin.keywords,
    isPopular: plugin.isPopular,
    isNew: plugin.isNew,
    isActive: plugin.isActive,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    config: { requiresAuth: plugin.requiresAuth, isPremium: plugin.isPremium },
    seo: { title: plugin.name, description: plugin.description, keywords: plugin.keywords },
  };
}

export default function HomePage() {
  const popularTools = pluginRegistry.getPopular(6).map(pluginToTool);
  const allTools = pluginRegistry.getAll().map(pluginToTool);

  return (
    <>
      <Hero />

      {allTools.length > 0 && (
        <section className="section-padding bg-white dark:bg-neutral-950">
          <div className="container-toolnova">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
                  Popular Tools
                </h2>
                <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
                  Most used tools by our community
                </p>
              </div>
              <Link
                href="/tools"
                className="hidden items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 sm:flex"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(popularTools.length > 0 ? popularTools : allTools.slice(0, 6)).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/tools"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                View all tools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Features />
      <CTA />
    </>
  );
}
