export type ToolBadge = "new" | "ai" | "popular" | "recommended";

export interface ToolSeed {
  slug: string;
  name: string;
  description: string;
  category: string;
  badges: ToolBadge[];
  time: number;
  uses: number;
  free: boolean;
}

export interface CategorySeed {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export const CATEGORY_SEED: CategorySeed[] = [
  {
    slug: "text",
    name: "Text Tools",
    description: "Manipulate, format, and analyze text with our collection of text processing tools.",
    icon: "text",
  },
  {
    slug: "image",
    name: "Image Tools",
    description: "Edit, convert, and optimize images with our powerful image tools.",
    icon: "image",
  },
  {
    slug: "developer",
    name: "Developer Tools",
    description: "Code utilities, formatters, and tools for developers.",
    icon: "code",
  },
  {
    slug: "calculation",
    name: "Calculators",
    description: "Math, financial, and scientific calculators for everyday use.",
    icon: "calculator",
  },
  {
    slug: "converter",
    name: "Converters",
    description: "Convert between units, formats, and data types.",
    icon: "converter",
  },
  {
    slug: "generator",
    name: "Generators",
    description: "Generate random content, codes, and more.",
    icon: "sparkles",
  },
  {
    slug: "document",
    name: "Document Tools",
    description: "Create, merge, compress, and manage PDF documents right in your browser.",
    icon: "document",
  },
];

export const TOOL_SEED: ToolSeed[] = [
  { slug: "word-counter", name: "Word Counter", description: "Count words, characters, and sentences", category: "text", badges: ["popular"], time: 1, uses: 980000, free: true },
  { slug: "character-counter", name: "Character Counter", description: "Count characters in your text", category: "text", badges: [], time: 1, uses: 640000, free: true },
  { slug: "sentence-counter", name: "Sentence Counter", description: "Count sentences in your text", category: "text", badges: [], time: 1, uses: 380000, free: true },
  { slug: "reading-time", name: "Reading Time", description: "Estimate reading time for your text", category: "text", badges: [], time: 1, uses: 210000, free: true },
  { slug: "text-diff", name: "Text Diff Checker", description: "Compare two texts and find differences", category: "text", badges: [], time: 1, uses: 175000, free: true },
  { slug: "case-converter", name: "Case Converter", description: "Convert text between different cases", category: "text", badges: [], time: 1, uses: 540000, free: true },
  { slug: "text-repeater", name: "Text Repeater", description: "Repeat text multiple times", category: "text", badges: [], time: 1, uses: 120000, free: true },
  { slug: "palindrome-checker", name: "Palindrome Checker", description: "Check if text is a palindrome", category: "text", badges: [], time: 1, uses: 98000, free: true },
  { slug: "slug-generator", name: "Slug Generator", description: "Create URL slugs", category: "text", badges: [], time: 1, uses: 150000, free: true },
  { slug: "ascii-art-converter", name: "ASCII Art Generator", description: "Turn text into ASCII art", category: "text", badges: ["new"], time: 2, uses: 76000, free: true },
  { slug: "password-strength-checker", name: "Password Strength Checker", description: "Check password strength", category: "text", badges: [], time: 1, uses: 130000, free: true },

  { slug: "image-compressor", name: "Image Compressor", description: "Reduce image file size without losing quality", category: "image", badges: ["popular"], time: 8, uses: 870000, free: true },
  { slug: "image-resizer", name: "Image Resizer", description: "Resize images to exact dimensions", category: "image", badges: [], time: 6, uses: 620000, free: true },
  { slug: "image-converter", name: "Image Converter", description: "Convert images between formats", category: "image", badges: ["popular"], time: 7, uses: 580000, free: true },
  { slug: "image-cropper", name: "Image Cropper", description: "Crop images to any aspect ratio", category: "image", badges: ["new"], time: 5, uses: 190000, free: true },
  { slug: "color-picker", name: "Color Picker", description: "Pick colors from images", category: "image", badges: ["recommended"], time: 1, uses: 490000, free: true },
  { slug: "image-to-base64", name: "Image to Base64", description: "Convert images to Base64", category: "image", badges: [], time: 2, uses: 240000, free: true },
  { slug: "svg-compressor", name: "SVG Compressor", description: "Compress SVG files", category: "image", badges: ["new"], time: 3, uses: 88000, free: true },
  { slug: "favicon-generator", name: "Favicon Generator", description: "Create favicons from images", category: "image", badges: [], time: 4, uses: 110000, free: true },
  { slug: "color-extractor", name: "Color Extractor", description: "Extract colors from images", category: "image", badges: ["ai", "new"], time: 6, uses: 96000, free: true },
  { slug: "webp-converter", name: "WebP Converter", description: "Convert images to WebP", category: "image", badges: ["popular"], time: 6, uses: 430000, free: true },
  { slug: "thumbnail-maker", name: "Thumbnail Maker", description: "Create social thumbnails", category: "image", badges: ["recommended", "new"], time: 5, uses: 140000, free: true },
  { slug: "background-remover", name: "AI Background Remover", description: "Remove image backgrounds", category: "image", badges: ["ai", "popular", "recommended"], time: 12, uses: 720000, free: true },

  { slug: "json-formatter", name: "JSON Formatter", description: "Format and validate JSON data", category: "developer", badges: ["popular"], time: 1, uses: 760000, free: true },
  { slug: "html-formatter", name: "HTML Formatter", description: "Format and beautify HTML code", category: "developer", badges: [], time: 1, uses: 310000, free: true },
  { slug: "css-minifier", name: "CSS Minifier", description: "Minify and compress CSS", category: "developer", badges: [], time: 1, uses: 220000, free: true },
  { slug: "javascript-formatter", name: "JS Formatter", description: "Format JavaScript code", category: "developer", badges: [], time: 1, uses: 200000, free: true },
  { slug: "base64-encoder", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64", category: "developer", badges: [], time: 1, uses: 360000, free: true },
  { slug: "uuid-generator", name: "UUID Generator", description: "Generate random UUIDs", category: "developer", badges: [], time: 1, uses: 180000, free: true },
  { slug: "color-converter", name: "Color Converter", description: "Convert between color formats", category: "developer", badges: [], time: 1, uses: 260000, free: true },
  { slug: "markdown-to-html", name: "Markdown to HTML", description: "Convert Markdown to HTML", category: "developer", badges: [], time: 1, uses: 230000, free: true },
  { slug: "hash-generator", name: "Hash Generator", description: "Hash any text instantly", category: "developer", badges: [], time: 2, uses: 160000, free: true },
  { slug: "jwt-decoder", name: "JWT Decoder", description: "Decode JWT tokens", category: "developer", badges: [], time: 1, uses: 170000, free: true },
  { slug: "url-encoder-decoder", name: "URL Encoder/Decoder", description: "Encode and decode URLs", category: "developer", badges: [], time: 1, uses: 290000, free: true },
  { slug: "regex-tester", name: "Regex Tester", description: "Test regex patterns", category: "developer", badges: ["recommended"], time: 1, uses: 145000, free: true },
  { slug: "qr-code-generator", name: "QR Code Generator", description: "Generate custom QR codes", category: "developer", badges: ["popular"], time: 1, uses: 1200000, free: true },

  { slug: "basic-calculator", name: "Basic Calculator", description: "Perform basic arithmetic operations", category: "calculation", badges: [], time: 1, uses: 420000, free: true },
  { slug: "percentage-calculator", name: "Percentage Calculator", description: "Calculate percentages easily", category: "calculation", badges: [], time: 1, uses: 310000, free: true },
  { slug: "bmi-calculator", name: "BMI Calculator", description: "Calculate your body mass index", category: "calculation", badges: ["popular"], time: 1, uses: 350000, free: true },
  { slug: "tip-calculator", name: "Tip Calculator", description: "Calculate tips and split bills", category: "calculation", badges: [], time: 1, uses: 230000, free: true },
  { slug: "loan-calculator", name: "Loan Calculator", description: "Calculate loan payments and interest", category: "calculation", badges: [], time: 1, uses: 190000, free: true },
  { slug: "age-calculator", name: "Age Calculator", description: "Calculate your exact age", category: "calculation", badges: [], time: 1, uses: 270000, free: true },
  { slug: "date-difference", name: "Date Difference", description: "Days between two dates", category: "calculation", badges: [], time: 1, uses: 155000, free: true },
  { slug: "countdown-timer", name: "Countdown Timer", description: "Count down to any event", category: "calculation", badges: [], time: 1, uses: 205000, free: true },

  { slug: "unit-converter", name: "Unit Converter", description: "Convert between measurement units", category: "converter", badges: ["popular"], time: 1, uses: 450000, free: true },
  { slug: "currency-converter", name: "Currency Converter", description: "Convert between world currencies", category: "converter", badges: ["popular"], time: 1, uses: 520000, free: true },
  { slug: "temperature-converter", name: "Temperature Converter", description: "Convert temperature units", category: "converter", badges: [], time: 1, uses: 330000, free: true },
  { slug: "file-converter", name: "File Converter", description: "Convert between file formats", category: "converter", badges: [], time: 3, uses: 130000, free: true },
  { slug: "timezone-converter", name: "Timezone Converter", description: "Convert time zones", category: "converter", badges: [], time: 1, uses: 120000, free: true },
  { slug: "number-base-converter", name: "Number Base Converter", description: "Convert number bases", category: "converter", badges: [], time: 1, uses: 140000, free: true },
  { slug: "format-converter", name: "Data Format Converter", description: "Convert between data formats", category: "converter", badges: ["new"], time: 2, uses: 105000, free: true },

  { slug: "password-generator", name: "Password Generator", description: "Generate secure passwords", category: "generator", badges: ["recommended"], time: 1, uses: 380000, free: true },
  { slug: "random-number", name: "Random Number Generator", description: "Generate random numbers", category: "generator", badges: [], time: 1, uses: 165000, free: true },
  { slug: "lorem-ipsum-generator", name: "Lorem Ipsum Generator", description: "Generate Lorem Ipsum text", category: "generator", badges: [], time: 1, uses: 210000, free: true },

  { slug: "pdf-merger", name: "PDF Merger", description: "Combine multiple PDF files into one", category: "document", badges: ["popular"], time: 10, uses: 650000, free: true },
  { slug: "pdf-compressor", name: "PDF Compressor", description: "Compress and shrink PDF file size", category: "document", badges: ["popular"], time: 12, uses: 480000, free: true },
  { slug: "image-to-pdf", name: "Image to PDF", description: "Convert images into a single PDF", category: "document", badges: ["popular"], time: 8, uses: 590000, free: true },
  { slug: "pdf-splitter", name: "PDF Splitter", description: "Split a PDF into separate pages", category: "document", badges: [], time: 8, uses: 340000, free: true },
  { slug: "resume-builder", name: "Resume Builder", description: "Create professional resumes", category: "document", badges: ["recommended", "popular"], time: 2, uses: 410000, free: true },
];
