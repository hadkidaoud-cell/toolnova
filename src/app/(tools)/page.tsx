// ============================================================
// ToolNova Tools Page - Shows all tools from plugin registry
// ============================================================

import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToolCard } from "@/components/tools/tool-card";
import { pluginRegistry } from "@/plugins/tools";
import type { Tool } from "@/types";

export const metadata: Metadata = {
  title: "Online Tools",
  description: "Browse all free online tools on ToolNova. Image tools, text tools, calculators, converters, and more.",
};

function pluginToTool(plugin: ReturnType<typeof pluginRegistry.getAll>[0]): Tool {
  return {
    id: plugin.id,
    slug: plugin.slug,
    name: plugin.name,
    description: plugin.description,
    longDescription: plugin.longDescription,
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
    config: {
      requiresAuth: plugin.requiresAuth,
      isPremium: plugin.isPremium,
    },
    seo: {
      title: plugin.name,
      description: plugin.description,
      keywords: plugin.keywords,
    },
  };
}

export default function ToolsPage() {
  const allPlugins = pluginRegistry.getAll();
  const tools = allPlugins.map(pluginToTool);

  const categories = [...new Set(allPlugins.map((p) => p.category))];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container-toolnova py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
              Online Tools
            </h1>
            <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
              Free tools to help you get things done
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <button className="rounded-lg border border-brand-600 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-400">
              All ({allPlugins.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 capitalize"
              >
                {cat}
              </button>
            ))}
          </div>

          {tools.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mb-4 text-4xl">🔧</div>
              <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                Tools coming soon
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                We&apos;re building amazing tools. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
