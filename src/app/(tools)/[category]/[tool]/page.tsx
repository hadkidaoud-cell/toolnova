// ============================================================
// ToolNova Tool Page - Dynamic Route
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { pluginRegistry } from "@/plugins/tools";

interface ToolPageProps {
  params: { category: string; tool: string };
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const plugin = pluginRegistry.get(params.tool);
  if (!plugin) {
    return { title: "Tool Not Found" };
  }
  return {
    title: `${plugin.name} - Free Online ${plugin.category} Tool`,
    description: plugin.description,
    keywords: [...plugin.keywords],
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const plugin = pluginRegistry.get(params.tool);

  if (!plugin) {
    notFound();
  }

  const ToolComponent = plugin.component;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="container-toolnova py-8">
          <nav className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-neutral-900 dark:hover:text-white">Tools</Link>
            <span className="mx-2">/</span>
            <Link href={`/tools/${params.category}`} className="hover:text-neutral-900 dark:hover:text-white capitalize">
              {params.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-900 dark:text-white">{plugin.name}</span>
          </nav>

          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <span className="text-2xl">{plugin.icon}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    {plugin.name}
                  </h1>
                </div>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                {plugin.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                <span>By {plugin.author}</span>
                <span>v{plugin.version}</span>
                {plugin.isNew && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">New</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <ToolComponent plugin={plugin} />
            </div>

            {plugin.longDescription && (
              <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                  About this tool
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {plugin.longDescription}
                </p>
              </div>
            )}

            <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                Features
              </h2>
              <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  100% free to use
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  No registration required
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Works in your browser
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Your data stays on your device
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
