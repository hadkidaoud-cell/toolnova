import { MetadataRoute } from "next";
import { getDbPublishedTools, getDbCategories } from "@/lib/db-tools";

const BASE_URL = "https://toolnova.com";

const staticRoutes = [
  { url: "/", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
  { url: "/login", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
];

const fallbackToolSlugs = [
  "word-counter", "character-counter", "sentence-counter", "reading-time",
  "text-diff", "case-converter", "text-repeater", "palindrome-checker",
  "image-compressor", "image-resizer", "image-converter", "image-cropper",
  "color-picker", "json-formatter", "html-formatter", "css-minifier",
  "javascript-formatter", "base64-encoder", "uuid-generator", "color-converter",
  "basic-calculator", "percentage-calculator", "bmi-calculator", "tip-calculator",
  "loan-calculator", "unit-converter", "currency-converter", "temperature-converter",
  "file-converter", "qr-code-generator", "password-generator", "resume-builder",
  "random-number", "pdf-merger", "pdf-compressor", "image-to-pdf", "pdf-splitter",
  "image-to-base64", "svg-compressor", "favicon-generator", "color-extractor",
  "age-calculator", "date-difference", "timezone-converter", "countdown-timer",
  "lorem-ipsum-generator", "slug-generator", "ascii-art-converter",
  "password-strength-checker", "markdown-to-html", "hash-generator",
  "jwt-decoder", "url-encoder-decoder", "regex-tester", "number-base-converter",
  "webp-converter", "format-converter", "thumbnail-maker", "background-remover",
];

const fallbackCategorySlugs = [
  "text", "image", "developer", "calculation", "converter", "generator", "document",
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dbTools, dbCategories] = await Promise.all([getDbPublishedTools(), getDbCategories()]);

  const toolSlugs = dbTools && dbTools.length > 0 ? dbTools.map((t) => t.slug) : fallbackToolSlugs;
  const categorySlugs =
    dbCategories && dbCategories.length > 0 ? dbCategories.map((c) => c.slug) : fallbackCategorySlugs;

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
