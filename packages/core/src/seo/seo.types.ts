export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle?: string;
  locale?: string;
  type?: string;
}

export interface MetaTags {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  keywords: string[];
}

export interface OpenGraph {
  title: string;
  description: string;
  url: string;
  image: string;
  type: string;
  siteName: string;
  locale: string;
}

export interface TwitterCard {
  card: string;
  title: string;
  description: string;
  image: string;
  site?: string;
}

export interface JsonLdSchema {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

export interface SEOOutput {
  meta: MetaTags;
  openGraph: OpenGraph;
  twitter: TwitterCard;
  jsonLd: JsonLdSchema[];
  breadcrumbs: JsonLdSchema;
  sitemap: SitemapEntry[];
}

export interface ToolSEOInput {
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  categorySlug: string;
  icon?: string;
  ogImage?: string;
  canonical?: string;
  keywords: string[];
  version: string;
  updatedAt: string;
}

export interface CategorySEOInput {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  toolCount: number;
}

export interface ArticleSEOInput {
  title: string;
  slug: string;
  description: string;
  content?: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  image?: string;
  tags: string[];
}
