// ============================================================
// ToolNova Category Page
// ============================================================

import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface CategoryPageProps {
  params: { category: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const name = params.category.replace(/-/g, " ");
  return {
    title: `${name} Tools`,
    description: `Browse all ${name} tools available on ToolNova.`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const name = params.category.replace(/-/g, " ");

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container-toolnova py-8">
          <h1 className="text-3xl font-bold capitalize text-neutral-900 dark:text-white">
            {name} Tools
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Browse all {name} tools
          </p>

          <div className="py-16 text-center">
            <div className="mb-4 text-4xl">📂</div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
              Tools coming soon
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              We&apos;re building {name} tools. Check back soon!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
