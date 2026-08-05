import {
  AlignStartVertical,
  ArrowLeftRight,
  ArrowRightLeft,
  Binary,
  Braces,
  Cake,
  Calculator,
  CalendarDays,
  CaseSensitive,
  CaseUpper,
  Code,
  CodeXml,
  Coins,
  Crop,
  Dices,
  Diff,
  Droplets,
  FileArchive,
  FileBox,
  FileCode,
  FileImage,
  FileTerminal,
  FileText,
  FileType,
  FileUser,
  Files,
  Globe,
  Hash,
  HeartPulse,
  Hourglass,
  IdCard,
  Image,
  ImageDown,
  ImageUp,
  Key,
  KeyRound,
  Landmark,
  Link,
  Link2,
  List,
  Merge,
  MoveDiagonal,
  Palette,
  PanelsTopLeft,
  Percent,
  Pipette,
  QrCode,
  Regex,
  Repeat2,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Shrink,
  Shuffle,
  Sigma,
  Sparkles,
  Split,
  SquareFunction,
  Star,
  Terminal,
  TextQuote,
  Thermometer,
  Timer,
  Type,
  Wallet,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ToolCategory =
  | "text"
  | "image"
  | "developer"
  | "calculation"
  | "converter"
  | "generator"
  | "document";

export type ToolBadge = "new" | "ai" | "popular" | "recommended";

export interface CategoryMeta {
  icon: LucideIcon;
  gradient: string;
  soft: string;
  glow: string;
}

export interface ToolMeta {
  slug: string;
  category: ToolCategory;
  icon: LucideIcon;
  badges: ToolBadge[];
  time: number;
  uses: number;
  free: boolean;
}

export const CATEGORY_META: Record<ToolCategory, CategoryMeta> = {
  text: {
    icon: AlignStartVertical,
    gradient: "from-sky-500 to-blue-600",
    soft: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    glow: "shadow-sky-500/20",
  },
  image: {
    icon: Image,
    gradient: "from-emerald-500 to-green-600",
    soft: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  developer: {
    icon: Code,
    gradient: "from-indigo-500 to-violet-600",
    soft: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    glow: "shadow-indigo-500/20",
  },
  calculation: {
    icon: SquareFunction,
    gradient: "from-amber-500 to-orange-600",
    soft: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-500/20",
  },
  converter: {
    icon: ArrowRightLeft,
    gradient: "from-fuchsia-500 to-pink-600",
    soft: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
    glow: "shadow-fuchsia-500/20",
  },
  generator: {
    icon: Sparkles,
    gradient: "from-rose-500 to-red-600",
    soft: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    glow: "shadow-rose-500/20",
  },
  document: {
    icon: FileText,
    gradient: "from-red-500 to-rose-600",
    soft: "bg-red-500/10 text-red-600 dark:text-red-400",
    glow: "shadow-red-500/20",
  },
};

export const TOOL_CATALOG: Record<string, ToolMeta> = {
  "word-counter": { slug: "word-counter", category: "text", icon: Type, badges: ["popular"], time: 1, uses: 980000, free: true },
  "character-counter": { slug: "character-counter", category: "text", icon: CaseUpper, badges: [], time: 1, uses: 640000, free: true },
  "sentence-counter": { slug: "sentence-counter", category: "text", icon: List, badges: [], time: 1, uses: 380000, free: true },
  "reading-time": { slug: "reading-time", category: "text", icon: Timer, badges: [], time: 1, uses: 210000, free: true },
  "text-diff": { slug: "text-diff", category: "text", icon: Diff, badges: [], time: 1, uses: 175000, free: true },
  "case-converter": { slug: "case-converter", category: "text", icon: CaseSensitive, badges: [], time: 1, uses: 540000, free: true },
  "text-repeater": { slug: "text-repeater", category: "text", icon: Repeat2, badges: [], time: 1, uses: 120000, free: true },
  "palindrome-checker": { slug: "palindrome-checker", category: "text", icon: ArrowLeftRight, badges: [], time: 1, uses: 98000, free: true },
  "slug-generator": { slug: "slug-generator", category: "text", icon: Link, badges: [], time: 1, uses: 150000, free: true },
  "ascii-art-converter": { slug: "ascii-art-converter", category: "text", icon: Terminal, badges: ["new"], time: 2, uses: 76000, free: true },
  "password-strength-checker": { slug: "password-strength-checker", category: "text", icon: ShieldCheck, badges: [], time: 1, uses: 130000, free: true },

  "image-compressor": { slug: "image-compressor", category: "image", icon: ImageDown, badges: ["popular"], time: 8, uses: 870000, free: true },
  "image-resizer": { slug: "image-resizer", category: "image", icon: MoveDiagonal, badges: [], time: 6, uses: 620000, free: true },
  "image-converter": { slug: "image-converter", category: "image", icon: Shuffle, badges: ["popular"], time: 7, uses: 580000, free: true },
  "image-cropper": { slug: "image-cropper", category: "image", icon: Crop, badges: ["new"], time: 5, uses: 190000, free: true },
  "color-picker": { slug: "color-picker", category: "image", icon: Pipette, badges: ["recommended"], time: 1, uses: 490000, free: true },
  "image-to-base64": { slug: "image-to-base64", category: "image", icon: Binary, badges: [], time: 2, uses: 240000, free: true },
  "svg-compressor": { slug: "svg-compressor", category: "image", icon: FileCode, badges: ["new"], time: 3, uses: 88000, free: true },
  "favicon-generator": { slug: "favicon-generator", category: "image", icon: Star, badges: [], time: 4, uses: 110000, free: true },
  "color-extractor": { slug: "color-extractor", category: "image", icon: Droplets, badges: ["ai", "new"], time: 6, uses: 96000, free: true },
  "webp-converter": { slug: "webp-converter", category: "image", icon: ImageUp, badges: ["popular"], time: 6, uses: 430000, free: true },
  "thumbnail-maker": { slug: "thumbnail-maker", category: "image", icon: PanelsTopLeft, badges: ["recommended", "new"], time: 5, uses: 140000, free: true },
  "background-remover": { slug: "background-remover", category: "image", icon: WandSparkles, badges: ["ai", "popular", "recommended"], time: 12, uses: 720000, free: true },

  "json-formatter": { slug: "json-formatter", category: "developer", icon: Braces, badges: ["popular"], time: 1, uses: 760000, free: true },
  "html-formatter": { slug: "html-formatter", category: "developer", icon: CodeXml, badges: [], time: 1, uses: 310000, free: true },
  "css-minifier": { slug: "css-minifier", category: "developer", icon: Shrink, badges: [], time: 1, uses: 220000, free: true },
  "javascript-formatter": { slug: "javascript-formatter", category: "developer", icon: FileTerminal, badges: [], time: 1, uses: 200000, free: true },
  "base64-encoder": { slug: "base64-encoder", category: "developer", icon: FileBox, badges: [], time: 1, uses: 360000, free: true },
  "uuid-generator": { slug: "uuid-generator", category: "developer", icon: IdCard, badges: [], time: 1, uses: 180000, free: true },
  "color-converter": { slug: "color-converter", category: "developer", icon: Palette, badges: [], time: 1, uses: 260000, free: true },
  "markdown-to-html": { slug: "markdown-to-html", category: "developer", icon: FileType, badges: [], time: 1, uses: 230000, free: true },
  "hash-generator": { slug: "hash-generator", category: "developer", icon: Hash, badges: [], time: 2, uses: 160000, free: true },
  "jwt-decoder": { slug: "jwt-decoder", category: "developer", icon: KeyRound, badges: [], time: 1, uses: 170000, free: true },
  "url-encoder-decoder": { slug: "url-encoder-decoder", category: "developer", icon: Link2, badges: [], time: 1, uses: 290000, free: true },
  "regex-tester": { slug: "regex-tester", category: "developer", icon: Regex, badges: ["recommended"], time: 1, uses: 145000, free: true },
  "qr-code-generator": { slug: "qr-code-generator", category: "developer", icon: QrCode, badges: ["popular"], time: 1, uses: 1200000, free: true },

  "basic-calculator": { slug: "basic-calculator", category: "calculation", icon: Calculator, badges: [], time: 1, uses: 420000, free: true },
  "percentage-calculator": { slug: "percentage-calculator", category: "calculation", icon: Percent, badges: [], time: 1, uses: 310000, free: true },
  "bmi-calculator": { slug: "bmi-calculator", category: "calculation", icon: HeartPulse, badges: ["popular"], time: 1, uses: 350000, free: true },
  "tip-calculator": { slug: "tip-calculator", category: "calculation", icon: Wallet, badges: [], time: 1, uses: 230000, free: true },
  "loan-calculator": { slug: "loan-calculator", category: "calculation", icon: Landmark, badges: [], time: 1, uses: 190000, free: true },
  "age-calculator": { slug: "age-calculator", category: "calculation", icon: Cake, badges: [], time: 1, uses: 270000, free: true },
  "date-difference": { slug: "date-difference", category: "calculation", icon: CalendarDays, badges: [], time: 1, uses: 155000, free: true },
  "countdown-timer": { slug: "countdown-timer", category: "calculation", icon: Hourglass, badges: [], time: 1, uses: 205000, free: true },

  "unit-converter": { slug: "unit-converter", category: "converter", icon: Ruler, badges: ["popular"], time: 1, uses: 450000, free: true },
  "currency-converter": { slug: "currency-converter", category: "converter", icon: Coins, badges: ["popular"], time: 1, uses: 520000, free: true },
  "temperature-converter": { slug: "temperature-converter", category: "converter", icon: Thermometer, badges: [], time: 1, uses: 330000, free: true },
  "file-converter": { slug: "file-converter", category: "converter", icon: Files, badges: [], time: 3, uses: 130000, free: true },
  "timezone-converter": { slug: "timezone-converter", category: "converter", icon: Globe, badges: [], time: 1, uses: 120000, free: true },
  "number-base-converter": { slug: "number-base-converter", category: "converter", icon: Sigma, badges: [], time: 1, uses: 140000, free: true },
  "format-converter": { slug: "format-converter", category: "converter", icon: RefreshCw, badges: ["new"], time: 2, uses: 105000, free: true },

  "password-generator": { slug: "password-generator", category: "generator", icon: Key, badges: ["recommended"], time: 1, uses: 380000, free: true },
  "random-number": { slug: "random-number", category: "generator", icon: Dices, badges: [], time: 1, uses: 165000, free: true },
  "lorem-ipsum-generator": { slug: "lorem-ipsum-generator", category: "generator", icon: TextQuote, badges: [], time: 1, uses: 210000, free: true },

  "pdf-merger": { slug: "pdf-merger", category: "document", icon: Merge, badges: ["popular"], time: 10, uses: 650000, free: true },
  "pdf-compressor": { slug: "pdf-compressor", category: "document", icon: FileArchive, badges: ["popular"], time: 12, uses: 480000, free: true },
  "image-to-pdf": { slug: "image-to-pdf", category: "document", icon: FileImage, badges: ["popular"], time: 8, uses: 590000, free: true },
  "pdf-splitter": { slug: "pdf-splitter", category: "document", icon: Split, badges: [], time: 8, uses: 340000, free: true },
  "resume-builder": { slug: "resume-builder", category: "document", icon: FileUser, badges: ["recommended", "popular"], time: 2, uses: 410000, free: true },
};

export function formatUses(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}

export const CATEGORY_ORDER: Record<ToolCategory, string[]> = {
  text: ["word-counter", "character-counter", "sentence-counter", "reading-time", "text-diff", "case-converter", "text-repeater", "palindrome-checker", "slug-generator", "ascii-art-converter", "password-strength-checker"],
  image: ["image-compressor", "image-resizer", "image-converter", "image-cropper", "color-picker", "image-to-base64", "svg-compressor", "favicon-generator", "color-extractor", "webp-converter", "thumbnail-maker", "background-remover"],
  developer: ["json-formatter", "html-formatter", "css-minifier", "javascript-formatter", "base64-encoder", "uuid-generator", "color-converter", "markdown-to-html", "hash-generator", "jwt-decoder", "url-encoder-decoder", "regex-tester", "qr-code-generator"],
  calculation: ["basic-calculator", "percentage-calculator", "bmi-calculator", "tip-calculator", "loan-calculator", "age-calculator", "date-difference", "countdown-timer"],
  converter: ["unit-converter", "currency-converter", "temperature-converter", "file-converter", "timezone-converter", "number-base-converter", "format-converter"],
  generator: ["password-generator", "random-number", "lorem-ipsum-generator"],
  document: ["pdf-merger", "pdf-compressor", "image-to-pdf", "pdf-splitter", "resume-builder"],
};

export const ALL_TOOL_SLUGS: string[] = Object.keys(TOOL_CATALOG);

export const DISCOVERY: Record<
  "mostUsed" | "topRated" | "trending" | "newAI" | "recentlyAdded",
  string[]
> = {
  mostUsed: [
    "qr-code-generator",
    "image-compressor",
    "pdf-merger",
    "json-formatter",
    "word-counter",
    "pdf-compressor",
    "image-to-pdf",
    "webp-converter",
  ],
  topRated: [
    "resume-builder",
    "color-picker",
    "password-generator",
    "currency-converter",
    "unit-converter",
    "regex-tester",
  ],
  newAI: [
    "background-remover",
    "color-extractor",
    "svg-compressor",
    "image-cropper",
    "format-converter",
    "ascii-art-converter",
  ],
  trending: [
    "thumbnail-maker",
    "bmi-calculator",
    "image-converter",
    "hash-generator",
    "markdown-to-html",
    "temperature-converter",
  ],
  recentlyAdded: [
    "password-strength-checker",
    "countdown-timer",
    "palindrome-checker",
    "lorem-ipsum-generator",
    "reading-time",
    "case-converter",
  ],
};

export const BADGE_PRIORITY: ToolBadge[] = ["ai", "new", "recommended", "popular"];

export function getToolMeta(slug: string): ToolMeta | undefined {
  return TOOL_CATALOG[slug];
}

export function getCategoryMeta(category: ToolCategory): CategoryMeta {
  return CATEGORY_META[category];
}
