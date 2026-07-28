import {
  SEOConfig,
  OpenGraph,
  ToolSEOInput,
  CategorySEOInput,
  ArticleSEOInput,
} from "../seo.types";

const DEFAULT_CONFIG: SEOConfig = {
  siteName: "ToolNova",
  siteUrl: "https://toolnova.com",
  defaultTitle: "ToolNova - Every Tool. One Place.",
  defaultDescription: "Discover hundreds of free online tools.",
  defaultImage: "/og-default.png",
  locale: "en_US",
};

export class OpenGraphGenerator {
  private config: SEOConfig;

  constructor(config: Partial<SEOConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getImage(image?: string): string {
    if (!image) return `${this.config.siteUrl}${this.config.defaultImage}`;
    if (image.startsWith("http")) return image;
    return `${this.config.siteUrl}${image}`;
  }

  generateToolOG(tool: ToolSEOInput): OpenGraph {
    return {
      title: `${tool.name} - Free Online Tool`,
      description: tool.description,
      url: `${this.config.siteUrl}/tools/${tool.slug}`,
      image: this.getImage(tool.ogImage),
      type: "website",
      siteName: this.config.siteName,
      locale: this.config.locale || "en_US",
    };
  }

  generateCategoryOG(category: CategorySEOInput): OpenGraph {
    return {
      title: `${category.name} - Free Online Tools`,
      description: category.description,
      url: `${this.config.siteUrl}/category/${category.slug}`,
      image: this.getImage(category.icon),
      type: "website",
      siteName: this.config.siteName,
      locale: this.config.locale || "en_US",
    };
  }

  generateArticleOG(article: ArticleSEOInput): OpenGraph {
    return {
      title: article.title,
      description: article.description,
      url: `${this.config.siteUrl}/blog/${article.slug}`,
      image: this.getImage(article.image),
      type: "article",
      siteName: this.config.siteName,
      locale: this.config.locale || "en_US",
    };
  }

  generateHomeOG(): OpenGraph {
    return {
      title: this.config.defaultTitle,
      description: this.config.defaultDescription,
      url: this.config.siteUrl,
      image: this.getImage(),
      type: "website",
      siteName: this.config.siteName,
      locale: this.config.locale || "en_US",
    };
  }
}

export const openGraphGenerator = new OpenGraphGenerator();
