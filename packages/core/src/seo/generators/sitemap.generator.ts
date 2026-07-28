import { SEOConfig, SitemapEntry } from "../seo.types";

const DEFAULT_CONFIG: SEOConfig = {
  siteName: "ToolNova",
  siteUrl: "https://toolnova.com",
  defaultTitle: "",
  defaultDescription: "",
  defaultImage: "",
};

export class SitemapGenerator {
  private config: SEOConfig;

  constructor(config: Partial<SEOConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateToolSitemapEntry(slug: string, updatedAt: string): SitemapEntry {
    return {
      url: `${this.config.siteUrl}/tools/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    };
  }

  generateCategorySitemapEntry(slug: string): SitemapEntry {
    return {
      url: `${this.config.siteUrl}/category/${slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.7,
    };
  }

  generateArticleSitemapEntry(slug: string, updatedAt: string): SitemapEntry {
    return {
      url: `${this.config.siteUrl}/blog/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    };
  }

  generateHomeEntry(): SitemapEntry {
    return {
      url: this.config.siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    };
  }

  generateStaticEntries(): SitemapEntry[] {
    const staticPaths = [
      { path: "/", priority: 1.0, changeFrequency: "daily" as const },
      { path: "/tools", priority: 0.9, changeFrequency: "daily" as const },
      { path: "/categories", priority: 0.8, changeFrequency: "weekly" as const },
      { path: "/blog", priority: 0.7, changeFrequency: "daily" as const },
      { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
      { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
      { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
      { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    ];

    return staticPaths.map((p) => ({
      url: `${this.config.siteUrl}${p.path}`,
      lastModified: new Date().toISOString(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    }));
  }

  toXml(entries: SitemapEntry[]): string {
    const urls = entries
      .map(
        (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastModified}</lastmod>
    <changefreq>${e.changeFrequency}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
      )
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  generateFullSitemap(
    toolEntries: SitemapEntry[],
    categoryEntries: SitemapEntry[],
    articleEntries: SitemapEntry[]
  ): string {
    const all = [
      ...this.generateStaticEntries(),
      ...categoryEntries,
      ...toolEntries,
      ...articleEntries,
    ];
    return this.toXml(all);
  }
}

export const sitemapGenerator = new SitemapGenerator();
