"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  ArrowRight,
  FileText,
  Image,
  Code,
  Calculator,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

type CategorySlug = "text" | "image" | "developer" | "calculation" | "converter" | "generator" | "document";

const CATEGORY_META: Record<CategorySlug, { icon: React.ElementType; color: string }> = {
  text: { icon: FileText, color: "from-blue-500 to-cyan-500" },
  image: { icon: Image, color: "from-green-500 to-emerald-500" },
  developer: { icon: Code, color: "from-indigo-500 to-violet-500" },
  calculation: { icon: Calculator, color: "from-amber-500 to-yellow-500" },
  converter: { icon: RefreshCw, color: "from-purple-500 to-pink-500" },
  generator: { icon: Sparkles, color: "from-red-500 to-orange-500" },
  document: { icon: FileText, color: "from-rose-500 to-red-500" },
};

const CATEGORY_ORDER: Record<CategorySlug, string[]> = {
  text: ["word-counter", "character-counter", "sentence-counter", "reading-time", "text-diff", "case-converter", "text-repeater", "palindrome-checker", "slug-generator", "ascii-art-converter", "password-strength-checker"],
  image: ["image-compressor", "image-resizer", "image-converter", "image-cropper", "color-picker", "image-to-base64", "svg-compressor", "favicon-generator", "color-extractor", "webp-converter", "thumbnail-maker"],
  developer: ["json-formatter", "html-formatter", "css-minifier", "javascript-formatter", "base64-encoder", "uuid-generator", "color-converter", "markdown-to-html", "hash-generator", "jwt-decoder", "url-encoder-decoder", "regex-tester", "qr-code-generator"],
  calculation: ["basic-calculator", "percentage-calculator", "bmi-calculator", "tip-calculator", "loan-calculator", "age-calculator", "date-difference", "countdown-timer"],
  converter: ["unit-converter", "currency-converter", "temperature-converter", "file-converter", "timezone-converter", "number-base-converter", "format-converter"],
  generator: ["password-generator", "random-number", "lorem-ipsum-generator"],
  document: ["pdf-merger", "pdf-compressor", "image-to-pdf", "pdf-splitter", "resume-builder"],
};

const TOOL_ICONS: Record<string, string> = {
  "word-counter": "W",
  "character-counter": "C",
  "sentence-counter": "S",
  "reading-time": "⏱",
  "text-diff": "≠",
  "case-converter": "Aa",
  "text-repeater": "↻",
  "palindrome-checker": "↔",
  "image-compressor": "🖼",
  "image-resizer": "✂",
  "image-converter": "↔",
  "image-cropper": "⊞",
  "color-picker": "🎨",
  "json-formatter": "{",
  "html-formatter": "<",
  "css-minifier": "#",
  "javascript-formatter": "JS",
  "base64-encoder": "64",
  "uuid-generator": "U",
  "color-converter": "#",
  "basic-calculator": "+",
  "percentage-calculator": "%",
  "bmi-calculator": "⚖",
  "tip-calculator": "💵",
  "loan-calculator": "🏦",
  "unit-converter": "📏",
  "currency-converter": "💱",
  "temperature-converter": "🌡",
  "file-converter": "📁",
  "qr-code-generator": "📱",
  "password-generator": "🔑",
  "resume-builder": "📝",
  "random-number": "🎲",
  "pdf-merger": "M",
  "pdf-compressor": "C",
  "image-to-pdf": "I",
  "pdf-splitter": "S",
  "image-to-base64": "64",
  "svg-compressor": "SVG",
  "favicon-generator": "F",
  "color-extractor": "◍",
  "age-calculator": "🎂",
  "date-difference": "↔",
  "timezone-converter": "🕐",
  "countdown-timer": "⏳",
  "lorem-ipsum-generator": "¶",
  "slug-generator": "S",
  "ascii-art-converter": "A",
  "password-strength-checker": "🔒",
  "markdown-to-html": "MD",
  "hash-generator": "#",
  "jwt-decoder": "JWT",
  "url-encoder-decoder": "URL",
  "regex-tester": ".*",
  "number-base-converter": "0x",
  "webp-converter": "W",
  "format-converter": "⇄",
  "thumbnail-maker": "🖼",
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { dict } = useI18n();
  const cat = dict.category;
  const [search, setSearch] = React.useState("");

  const categorySlug = slug as CategorySlug;
  const category = React.useMemo(() => {
    if (!(slug in CATEGORY_ORDER)) return null;
    return {
      name: cat.categories[categorySlug].name,
      description: cat.categories[categorySlug].description,
      tools: CATEGORY_ORDER[categorySlug].map((toolSlug) => ({
        id: toolSlug,
        name: cat.tools[toolSlug]?.name ?? toolSlug,
        description: cat.tools[toolSlug]?.description ?? "",
      })),
    };
  }, [slug, cat, categorySlug]);

  const filteredTools = React.useMemo(() => {
    const all = category?.tools ?? [];
    if (!search) return all;
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, category]);

  if (!category) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">{cat.notFoundTitle}</h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">{cat.notFoundDesc}</p>
          <Link href="/">
            <Button className="mt-8">{cat.backToHome}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = CATEGORY_META[categorySlug].icon;
  const color = CATEGORY_META[categorySlug].color;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-brand-50/50 to-white pb-16 pt-12 dark:border-neutral-800 dark:from-brand-950/10 dark:to-neutral-950">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Link href="/" className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400">
              <Home className="h-3.5 w-3.5" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{category.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                color
              )}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
                {category.name}
              </h1>
              <p className="mt-1 text-lg text-neutral-600 dark:text-neutral-400">
                {category.description}
              </p>
              <Badge variant="secondary" className="mt-2">
                {cat.toolsSuffix.replace("{count}", String(category.tools.length))}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={cat.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={`/tools/${tool.id}`}
                  className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-700"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                      color
                    )}
                  >
                    {TOOL_ICONS[tool.id] ?? "+"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-neutral-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                      {tool.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {cat.useTool} <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">{cat.noToolsFound}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
