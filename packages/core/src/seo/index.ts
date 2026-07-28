export { SEOService, seoService } from "./seo.service";

export { MetaGenerator, metaGenerator } from "./generators/meta.generator";
export { OpenGraphGenerator, openGraphGenerator } from "./generators/opengraph.generator";
export { TwitterGenerator, twitterGenerator } from "./generators/twitter.generator";
export { SitemapGenerator, sitemapGenerator } from "./generators/sitemap.generator";
export { BreadcrumbGenerator, breadcrumbGenerator } from "./generators/breadcrumb.generator";

export {
  createWebApplicationSchema,
  createSoftwareApplicationSchema,
  createArticleSchema,
  createBreadcrumbSchema,
  createCollectionPageSchema,
  createFAQSchema,
  createOrganizationSchema,
  createWebsiteSchema,
} from "./schemas";

export type {
  SEOConfig,
  MetaTags,
  OpenGraph,
  TwitterCard,
  JsonLdSchema,
  BreadcrumbItem,
  SitemapEntry,
  SEOOutput,
  ToolSEOInput,
  CategorySEOInput,
  ArticleSEOInput,
} from "./seo.types";
