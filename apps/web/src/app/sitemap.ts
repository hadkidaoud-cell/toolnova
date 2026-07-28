import { MetadataRoute } from "next";

const BASE_URL = "https://toolnova.com";

const staticRoutes = [
  { url: "/", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
  { url: "/login", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
];

const toolSlugs = [
  "word-counter", "json-formatter", "image-compressor", "uuid-generator",
  "password-generator", "color-picker", "qr-code-generator", "pdf-merger",
  "resume-builder", "character-counter",
];

const categorySlugs = [
  "text-tools", "image-tools", "developer-tools", "calculators",
  "converters", "generators", "security-tools", "design-tools",
  "document-tools", "seo-tools",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const toolRoutes = toolSlugs.map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolRoutes, ...categoryRoutes];
}
