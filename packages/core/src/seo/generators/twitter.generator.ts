import {
  SEOConfig,
  TwitterCard,
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
  twitterHandle: "@toolnova",
};

export class TwitterGenerator {
  private config: SEOConfig;

  constructor(config: Partial<SEOConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getImage(image?: string): string {
    if (!image) return `${this.config.siteUrl}${this.config.defaultImage}`;
    if (image.startsWith("http")) return image;
    return `${this.config.siteUrl}${image}`;
  }

  generateToolTwitter(tool: ToolSEOInput): TwitterCard {
    return {
      card: "summary_large_image",
      title: `${tool.name} - Free Online Tool`,
      description: tool.description,
      image: this.getImage(tool.ogImage),
      site: this.config.twitterHandle,
    };
  }

  generateCategoryTwitter(category: CategorySEOInput): TwitterCard {
    return {
      card: "summary_large_image",
      title: `${category.name} - Free Online Tools`,
      description: category.description,
      image: this.getImage(category.icon),
      site: this.config.twitterHandle,
    };
  }

  generateArticleTwitter(article: ArticleSEOInput): TwitterCard {
    return {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      image: this.getImage(article.image),
      site: this.config.twitterHandle,
    };
  }

  generateHomeTwitter(): TwitterCard {
    return {
      card: "summary_large_image",
      title: this.config.defaultTitle,
      description: this.config.defaultDescription,
      image: this.getImage(),
      site: this.config.twitterHandle,
    };
  }
}

export const twitterGenerator = new TwitterGenerator();
