import { SEOConfig, BreadcrumbItem, JsonLdSchema } from "../seo.types";
import { createBreadcrumbSchema } from "../schemas";

const DEFAULT_CONFIG: SEOConfig = {
  siteName: "ToolNova",
  siteUrl: "https://toolnova.com",
  defaultTitle: "",
  defaultDescription: "",
  defaultImage: "",
};

export class BreadcrumbGenerator {
  private config: SEOConfig;

  constructor(config: Partial<SEOConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private buildItems(...items: Array<{ name: string; path: string }>): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      { name: "Home", url: this.config.siteUrl },
    ];

    for (const item of items) {
      breadcrumbs.push({
        name: item.name,
        url: `${this.config.siteUrl}${item.path}`,
      });
    }

    return breadcrumbs;
  }

  generateToolBreadcrumbs(toolName: string, toolSlug: string, categoryName: string, categorySlug: string): JsonLdSchema {
    const items = this.buildItems(
      { name: categoryName, path: `/category/${categorySlug}` },
      { name: toolName, path: `/tools/${toolSlug}` }
    );
    return createBreadcrumbSchema(items);
  }

  generateCategoryBreadcrumbs(categoryName: string, categorySlug: string): JsonLdSchema {
    const items = this.buildItems(
      { name: categoryName, path: `/category/${categorySlug}` }
    );
    return createBreadcrumbSchema(items);
  }

  generateArticleBreadcrumbs(articleTitle: string, articleSlug: string): JsonLdSchema {
    const items = this.buildItems(
      { name: "Blog", path: "/blog" },
      { name: articleTitle, path: `/blog/${articleSlug}` }
    );
    return createBreadcrumbSchema(items);
  }

  generateHomeBreadcrumbs(): JsonLdSchema {
    return createBreadcrumbSchema([
      { name: "Home", url: this.config.siteUrl },
    ]);
  }

  generateCustomBreadcrumbs(items: Array<{ name: string; path: string }>): JsonLdSchema {
    return createBreadcrumbSchema(this.buildItems(...items));
  }
}

export const breadcrumbGenerator = new BreadcrumbGenerator();
