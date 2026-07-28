import {
  SEOConfig,
  SEOOutput,
  ToolSEOInput,
  CategorySEOInput,
  ArticleSEOInput,
  SitemapEntry,
} from "./seo.types";
import { MetaGenerator } from "./generators/meta.generator";
import { OpenGraphGenerator } from "./generators/opengraph.generator";
import { TwitterGenerator } from "./generators/twitter.generator";
import { SitemapGenerator } from "./generators/sitemap.generator";
import { BreadcrumbGenerator } from "./generators/breadcrumb.generator";
import {
  createWebApplicationSchema,
  createArticleSchema,
  createCollectionPageSchema,
  createOrganizationSchema,
  createWebsiteSchema,
} from "./schemas";

const DEFAULT_CONFIG: SEOConfig = {
  siteName: "ToolNova",
  siteUrl: "https://toolnova.com",
  defaultTitle: "ToolNova - Every Tool. One Place.",
  defaultDescription: "Discover hundreds of free online tools.",
  defaultImage: "/og-default.png",
  twitterHandle: "@toolnova",
  locale: "en_US",
};

export class SEOService {
  private config: SEOConfig;
  private meta: MetaGenerator;
  private og: OpenGraphGenerator;
  private twitter: TwitterGenerator;
  private sitemap: SitemapGenerator;
  private breadcrumb: BreadcrumbGenerator;

  constructor(config: Partial<SEOConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.meta = new MetaGenerator(this.config);
    this.og = new OpenGraphGenerator(this.config);
    this.twitter = new TwitterGenerator(this.config);
    this.sitemap = new SitemapGenerator(this.config);
    this.breadcrumb = new BreadcrumbGenerator(this.config);
  }

  generateToolSEO(tool: ToolSEOInput): SEOOutput {
    const meta = this.meta.generateToolMeta(tool);
    const openGraph = this.og.generateToolOG(tool);
    const twitter = this.twitter.generateToolTwitter(tool);
    const breadcrumbs = this.breadcrumb.generateToolBreadcrumbs(
      tool.name,
      tool.slug,
      tool.category,
      tool.categorySlug
    );

    const jsonLd = [
      createWebApplicationSchema({
        name: tool.name,
        description: tool.description,
        url: `${this.config.siteUrl}/tools/${tool.slug}`,
        image: tool.ogImage,
        applicationCategory: tool.category,
      }),
      breadcrumbs,
    ];

    const sitemapEntry = this.sitemap.generateToolSitemapEntry(tool.slug, tool.updatedAt);

    return {
      meta,
      openGraph,
      twitter,
      jsonLd,
      breadcrumbs,
      sitemap: [sitemapEntry],
    };
  }

  generateCategorySEO(category: CategorySEOInput): SEOOutput {
    const meta = this.meta.generateCategoryMeta(category);
    const openGraph = this.og.generateCategoryOG(category);
    const twitter = this.twitter.generateCategoryTwitter(category);
    const breadcrumbs = this.breadcrumb.generateCategoryBreadcrumbs(
      category.name,
      category.slug
    );

    const jsonLd = [
      createCollectionPageSchema({
        name: category.name,
        description: category.description,
        url: `${this.config.siteUrl}/category/${category.slug}`,
        itemCount: category.toolCount,
      }),
      breadcrumbs,
    ];

    const sitemapEntry = this.sitemap.generateCategorySitemapEntry(category.slug);

    return {
      meta,
      openGraph,
      twitter,
      jsonLd,
      breadcrumbs,
      sitemap: [sitemapEntry],
    };
  }

  generateArticleSEO(article: ArticleSEOInput): SEOOutput {
    const meta = this.meta.generateArticleMeta(article);
    const openGraph = this.og.generateArticleOG(article);
    const twitter = this.twitter.generateArticleTwitter(article);
    const breadcrumbs = this.breadcrumb.generateArticleBreadcrumbs(
      article.title,
      article.slug
    );

    const jsonLd = [
      createArticleSchema({
        title: article.title,
        description: article.description,
        url: `${this.config.siteUrl}/blog/${article.slug}`,
        image: article.image,
        author: article.author,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
      }),
      breadcrumbs,
    ];

    const sitemapEntry = this.sitemap.generateArticleSitemapEntry(article.slug, article.updatedAt);

    return {
      meta,
      openGraph,
      twitter,
      jsonLd,
      breadcrumbs,
      sitemap: [sitemapEntry],
    };
  }

  generateHomeSEO(): SEOOutput {
    const meta = this.meta.generateHomeMeta();
    const openGraph = this.og.generateHomeOG();
    const twitter = this.twitter.generateHomeTwitter();
    const breadcrumbs = this.breadcrumb.generateHomeBreadcrumbs();

    const jsonLd = [
      createOrganizationSchema({
        name: this.config.siteName,
        url: this.config.siteUrl,
      }),
      createWebsiteSchema({
        name: this.config.siteName,
        url: this.config.siteUrl,
        description: this.config.defaultDescription,
      }),
    ];

    const sitemapEntry = this.sitemap.generateHomeEntry();

    return {
      meta,
      openGraph,
      twitter,
      jsonLd,
      breadcrumbs,
      sitemap: [sitemapEntry],
    };
  }

  generateSearchSEO(query: string): SEOOutput {
    const meta = this.meta.generateSearchMeta(query);
    const openGraph = this.og.generateHomeOG();
    const twitter = this.twitter.generateHomeTwitter();
    const breadcrumbs = this.breadcrumb.generateCustomBreadcrumbs([
      { name: `Search: ${query}`, path: `/search?q=${encodeURIComponent(query)}` },
    ]);

    return {
      meta,
      openGraph,
      twitter,
      jsonLd: [breadcrumbs],
      breadcrumbs,
      sitemap: [],
    };
  }

  generateSitemap(
    toolEntries: SitemapEntry[],
    categoryEntries: SitemapEntry[],
    articleEntries: SitemapEntry[]
  ): string {
    return this.sitemap.generateFullSitemap(toolEntries, categoryEntries, articleEntries);
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /search?

Sitemap: ${this.config.siteUrl}/sitemap.xml`;
  }
}

export const seoService = new SEOService();
