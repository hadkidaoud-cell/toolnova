import {
  SEOConfig,
  MetaTags,
  ToolSEOInput,
  CategorySEOInput,
  ArticleSEOInput,
} from "../seo.types";

const DEFAULT_CONFIG: SEOConfig = {
  siteName: "ToolNova",
  siteUrl: "https://toolnova.com",
  defaultTitle: "ToolNova - Every Tool. One Place.",
  defaultDescription: "Discover hundreds of free online tools. Image editors, text processors, calculators, converters, and more.",
  defaultImage: "/og-default.png",
  twitterHandle: "@toolnova",
  locale: "en_US",
  type: "website",
};

export class MetaGenerator {
  private config: SEOConfig;

  constructor(config: Partial<SEOConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateToolMeta(tool: ToolSEOInput): MetaTags {
    const title = `${tool.name} - Free Online ${tool.category} Tool | ${this.config.siteName}`;
    const description = tool.description.length > 160
      ? tool.description.substring(0, 157) + "..."
      : tool.description;
    const canonical = tool.canonical || `${this.config.siteUrl}/tools/${tool.slug}`;

    return {
      title,
      description,
      canonical,
      robots: "index, follow",
      keywords: [...tool.keywords, tool.category, "free online tool", this.config.siteName],
    };
  }

  generateCategoryMeta(category: CategorySEOInput): MetaTags {
    const title = `${category.name} - Free Online ${category.name} | ${this.config.siteName}`;
    const description = `${category.description}. Browse ${category.toolCount} free ${category.name.toLowerCase()} tools.`;
    const canonical = `${this.config.siteUrl}/category/${category.slug}`;

    return {
      title,
      description,
      canonical,
      robots: "index, follow",
      keywords: [category.name, "online tools", "free tools", this.config.siteName],
    };
  }

  generateArticleMeta(article: ArticleSEOInput): MetaTags {
    const title = `${article.title} | ${this.config.siteName}`;
    const description = article.description.length > 160
      ? article.description.substring(0, 157) + "..."
      : article.description;
    const canonical = `${this.config.siteUrl}/blog/${article.slug}`;

    return {
      title,
      description,
      canonical,
      robots: "index, follow",
      keywords: [...article.tags, "blog", this.config.siteName],
    };
  }

  generateHomeMeta(): MetaTags {
    return {
      title: this.config.defaultTitle,
      description: this.config.defaultDescription,
      canonical: this.config.siteUrl,
      robots: "index, follow",
      keywords: ["online tools", "free tools", "web tools", "utilities", this.config.siteName],
    };
  }

  generateSearchMeta(query: string): MetaTags {
    return {
      title: `Search results for "${query}" | ${this.config.siteName}`,
      description: `Search results for "${query}". Find the best free online tools on ${this.config.siteName}.`,
      canonical: `${this.config.siteUrl}/search?q=${encodeURIComponent(query)}`,
      robots: "noindex, follow",
      keywords: [],
    };
  }
}

export const metaGenerator = new MetaGenerator();
