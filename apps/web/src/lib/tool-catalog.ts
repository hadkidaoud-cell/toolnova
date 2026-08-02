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
  "word-counter": { slug: "word-counter", category: "text", icon: Type, badges: ["popular"] },
  "character-counter": { slug: "character-counter", category: "text", icon: CaseUpper, badges: [] },
  "sentence-counter": { slug: "sentence-counter", category: "text", icon: List, badges: [] },
  "reading-time": { slug: "reading-time", category: "text", icon: Timer, badges: [] },
  "text-diff": { slug: "text-diff", category: "text", icon: Diff, badges: [] },
  "case-converter": { slug: "case-converter", category: "text", icon: CaseSensitive, badges: [] },
  "text-repeater": { slug: "text-repeater", category: "text", icon: Repeat2, badges: [] },
  "palindrome-checker": { slug: "palindrome-checker", category: "text", icon: ArrowLeftRight, badges: [] },
  "slug-generator": { slug: "slug-generator", category: "text", icon: Link, badges: [] },
  "ascii-art-converter": { slug: "ascii-art-converter", category: "text", icon: Terminal, badges: ["new"] },
  "password-strength-checker": { slug: "password-strength-checker", category: "text", icon: ShieldCheck, badges: [] },

  "image-compressor": { slug: "image-compressor", category: "image", icon: ImageDown, badges: ["popular"] },
  "image-resizer": { slug: "image-resizer", category: "image", icon: MoveDiagonal, badges: [] },
  "image-converter": { slug: "image-converter", category: "image", icon: Shuffle, badges: ["popular"] },
  "image-cropper": { slug: "image-cropper", category: "image", icon: Crop, badges: ["new"] },
  "color-picker": { slug: "color-picker", category: "image", icon: Pipette, badges: ["recommended"] },
  "image-to-base64": { slug: "image-to-base64", category: "image", icon: Binary, badges: [] },
  "svg-compressor": { slug: "svg-compressor", category: "image", icon: FileCode, badges: ["new"] },
  "favicon-generator": { slug: "favicon-generator", category: "image", icon: Star, badges: [] },
  "color-extractor": { slug: "color-extractor", category: "image", icon: Droplets, badges: ["ai", "new"] },
  "webp-converter": { slug: "webp-converter", category: "image", icon: ImageUp, badges: ["popular"] },
  "thumbnail-maker": { slug: "thumbnail-maker", category: "image", icon: PanelsTopLeft, badges: ["recommended", "new"] },
  "background-remover": { slug: "background-remover", category: "image", icon: WandSparkles, badges: ["ai", "popular", "recommended"] },

  "json-formatter": { slug: "json-formatter", category: "developer", icon: Braces, badges: ["popular"] },
  "html-formatter": { slug: "html-formatter", category: "developer", icon: CodeXml, badges: [] },
  "css-minifier": { slug: "css-minifier", category: "developer", icon: Shrink, badges: [] },
  "javascript-formatter": { slug: "javascript-formatter", category: "developer", icon: FileTerminal, badges: [] },
  "base64-encoder": { slug: "base64-encoder", category: "developer", icon: FileBox, badges: [] },
  "uuid-generator": { slug: "uuid-generator", category: "developer", icon: IdCard, badges: [] },
  "color-converter": { slug: "color-converter", category: "developer", icon: Palette, badges: [] },
  "markdown-to-html": { slug: "markdown-to-html", category: "developer", icon: FileType, badges: [] },
  "hash-generator": { slug: "hash-generator", category: "developer", icon: Hash, badges: [] },
  "jwt-decoder": { slug: "jwt-decoder", category: "developer", icon: KeyRound, badges: [] },
  "url-encoder-decoder": { slug: "url-encoder-decoder", category: "developer", icon: Link2, badges: [] },
  "regex-tester": { slug: "regex-tester", category: "developer", icon: Regex, badges: ["recommended"] },
  "qr-code-generator": { slug: "qr-code-generator", category: "developer", icon: QrCode, badges: ["popular"] },

  "basic-calculator": { slug: "basic-calculator", category: "calculation", icon: Calculator, badges: [] },
  "percentage-calculator": { slug: "percentage-calculator", category: "calculation", icon: Percent, badges: [] },
  "bmi-calculator": { slug: "bmi-calculator", category: "calculation", icon: HeartPulse, badges: ["popular"] },
  "tip-calculator": { slug: "tip-calculator", category: "calculation", icon: Wallet, badges: [] },
  "loan-calculator": { slug: "loan-calculator", category: "calculation", icon: Landmark, badges: [] },
  "age-calculator": { slug: "age-calculator", category: "calculation", icon: Cake, badges: [] },
  "date-difference": { slug: "date-difference", category: "calculation", icon: CalendarDays, badges: [] },
  "countdown-timer": { slug: "countdown-timer", category: "calculation", icon: Hourglass, badges: [] },

  "unit-converter": { slug: "unit-converter", category: "converter", icon: Ruler, badges: ["popular"] },
  "currency-converter": { slug: "currency-converter", category: "converter", icon: Coins, badges: ["popular"] },
  "temperature-converter": { slug: "temperature-converter", category: "converter", icon: Thermometer, badges: [] },
  "file-converter": { slug: "file-converter", category: "converter", icon: Files, badges: [] },
  "timezone-converter": { slug: "timezone-converter", category: "converter", icon: Globe, badges: [] },
  "number-base-converter": { slug: "number-base-converter", category: "converter", icon: Sigma, badges: [] },
  "format-converter": { slug: "format-converter", category: "converter", icon: RefreshCw, badges: ["new"] },

  "password-generator": { slug: "password-generator", category: "generator", icon: Key, badges: ["recommended"] },
  "random-number": { slug: "random-number", category: "generator", icon: Dices, badges: [] },
  "lorem-ipsum-generator": { slug: "lorem-ipsum-generator", category: "generator", icon: TextQuote, badges: [] },

  "pdf-merger": { slug: "pdf-merger", category: "document", icon: Merge, badges: ["popular"] },
  "pdf-compressor": { slug: "pdf-compressor", category: "document", icon: FileArchive, badges: ["popular"] },
  "image-to-pdf": { slug: "image-to-pdf", category: "document", icon: FileImage, badges: ["popular"] },
  "pdf-splitter": { slug: "pdf-splitter", category: "document", icon: Split, badges: [] },
  "resume-builder": { slug: "resume-builder", category: "document", icon: FileUser, badges: ["recommended", "popular"] },
};

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
