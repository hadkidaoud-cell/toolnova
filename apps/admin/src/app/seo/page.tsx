import { prisma } from "@/lib/prisma";
import { SeoForm } from "@/components/seo/seo-form";

export const dynamic = "force-dynamic";

export default async function SEOPage() {
  const [siteTitleSetting, metaDescSetting, publishedTools, categories] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "site_title" } }),
    prisma.setting.findUnique({ where: { key: "meta_description" } }),
    prisma.tool.count({ where: { status: "PUBLISHED" } }),
    prisma.category.count(),
  ]);

  const sitemapItems = [
    { url: "/", status: "Indexed", pages: "1" },
    { url: "/tools", status: "Indexed", pages: publishedTools.toString() },
    { url: "/category", status: "Indexed", pages: categories.toString() },
    { url: "/login", status: "Indexed", pages: "1" },
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">SEO</h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage SEO settings</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SeoForm
          siteTitle={siteTitleSetting?.value ?? "ToolNova - Every Tool. One Place."}
          metaDescription={metaDescSetting?.value ?? "Discover hundreds of free online tools."}
        />

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Sitemap</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {publishedTools} published tools • {categories} categories
          </p>
          <div className="mt-4 space-y-3">
            {sitemapItems.map((item) => (
              <div key={item.url} className="flex items-center justify-between text-sm">
                <span className="font-mono text-neutral-600 dark:text-neutral-400">{item.url}</span>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500">{item.pages} pages</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Open Sitemap
          </a>
        </div>
      </div>
    </div>
  );
}
