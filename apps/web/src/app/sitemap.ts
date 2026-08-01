import { MetadataRoute } from "next";

const BASE_URL = "https://toolnova.com";

const staticRoutes = [
  { url: "/", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
  { url: "/login", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
];

const toolSlugs = [
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
];

const categorySlugs = [
  "text", "image", "developer", "calculation", "converter", "generator", "document",
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
