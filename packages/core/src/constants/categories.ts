import { Category } from "../types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "text", slug: "text", name: "Text Tools", description: "Text manipulation and formatting", order: 1, visible: true },
  { id: "image", slug: "image", name: "Image Tools", description: "Image editing and conversion", order: 2, visible: true },
  { id: "developer", slug: "developer", name: "Developer Tools", description: "Code and development utilities", order: 3, visible: true },
  { id: "calculation", slug: "calculation", name: "Calculators", description: "Mathematical and financial calculators", order: 4, visible: true },
  { id: "converter", slug: "converter", name: "Converters", description: "Unit and data conversion tools", order: 5, visible: true },
  { id: "generator", slug: "generator", name: "Generators", description: "Random and auto-generated content", order: 6, visible: true },
  { id: "utility", slug: "utility", name: "Utilities", description: "General purpose tools", order: 7, visible: true },
  { id: "security", slug: "security", name: "Security Tools", description: "Encryption, hashing, and security", order: 8, visible: true },
];
