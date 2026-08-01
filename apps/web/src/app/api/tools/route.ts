import { NextResponse } from "next/server";

const tools = [
  { slug: "word-counter", name: "Word Counter", category: "text-tools" },
  { slug: "character-counter", name: "Character Counter", category: "text-tools" },
  { slug: "sentence-counter", name: "Sentence Counter", category: "text-tools" },
  { slug: "reading-time", name: "Reading Time", category: "text-tools" },
  { slug: "text-diff", name: "Text Diff", category: "text-tools" },
  { slug: "case-converter", name: "Case Converter", category: "text-tools" },
  { slug: "text-repeater", name: "Text Repeater", category: "text-tools" },
  { slug: "palindrome-checker", name: "Palindrome Checker", category: "text-tools" },
  { slug: "slug-generator", name: "Slug Generator", category: "text-tools" },
  { slug: "ascii-art-converter", name: "ASCII Art Converter", category: "text-tools" },
  { slug: "password-strength-checker", name: "Password Strength Checker", category: "text-tools" },
  { slug: "image-compressor", name: "Image Compressor", category: "image-tools" },
  { slug: "image-resizer", name: "Image Resizer", category: "image-tools" },
  { slug: "image-converter", name: "Image Converter", category: "image-tools" },
  { slug: "image-cropper", name: "Image Cropper", category: "image-tools" },
  { slug: "color-picker", name: "Color Picker", category: "image-tools" },
  { slug: "image-to-base64", name: "Image to Base64", category: "image-tools" },
  { slug: "svg-compressor", name: "SVG Compressor", category: "image-tools" },
  { slug: "favicon-generator", name: "Favicon Generator", category: "image-tools" },
  { slug: "color-extractor", name: "Color Extractor", category: "image-tools" },
  { slug: "qr-code-generator", name: "QR Code Generator", category: "image-tools" },
  { slug: "json-formatter", name: "JSON Formatter", category: "developer-tools" },
  { slug: "html-formatter", name: "HTML Formatter", category: "developer-tools" },
  { slug: "css-minifier", name: "CSS Minifier", category: "developer-tools" },
  { slug: "javascript-formatter", name: "JavaScript Formatter", category: "developer-tools" },
  { slug: "base64-encoder", name: "Base64 Encoder/Decoder", category: "developer-tools" },
  { slug: "uuid-generator", name: "UUID Generator", category: "developer-tools" },
  { slug: "color-converter", name: "Color Converter", category: "developer-tools" },
  { slug: "markdown-to-html", name: "Markdown to HTML", category: "developer-tools" },
  { slug: "hash-generator", name: "Hash Generator", category: "developer-tools" },
  { slug: "jwt-decoder", name: "JWT Decoder", category: "developer-tools" },
  { slug: "url-encoder-decoder", name: "URL Encoder/Decoder", category: "developer-tools" },
  { slug: "regex-tester", name: "Regex Tester", category: "developer-tools" },
  { slug: "basic-calculator", name: "Basic Calculator", category: "calculators" },
  { slug: "percentage-calculator", name: "Percentage Calculator", category: "calculators" },
  { slug: "bmi-calculator", name: "BMI Calculator", category: "calculators" },
  { slug: "tip-calculator", name: "Tip Calculator", category: "calculators" },
  { slug: "loan-calculator", name: "Loan Calculator", category: "calculators" },
  { slug: "age-calculator", name: "Age Calculator", category: "calculators" },
  { slug: "date-difference", name: "Date Difference", category: "calculators" },
  { slug: "countdown-timer", name: "Countdown Timer", category: "calculators" },
  { slug: "unit-converter", name: "Unit Converter", category: "converters" },
  { slug: "currency-converter", name: "Currency Converter", category: "converters" },
  { slug: "temperature-converter", name: "Temperature Converter", category: "converters" },
  { slug: "file-converter", name: "File Converter", category: "converters" },
  { slug: "timezone-converter", name: "Timezone Converter", category: "converters" },
  { slug: "number-base-converter", name: "Number Base Converter", category: "converters" },
  { slug: "password-generator", name: "Password Generator", category: "generators" },
  { slug: "resume-builder", name: "Resume Builder", category: "generators" },
  { slug: "random-number", name: "Random Number", category: "generators" },
  { slug: "lorem-ipsum-generator", name: "Lorem Ipsum Generator", category: "generators" },
  { slug: "pdf-merger", name: "PDF Merger", category: "document-tools" },
  { slug: "pdf-compressor", name: "PDF Compressor", category: "document-tools" },
  { slug: "image-to-pdf", name: "Image to PDF", category: "document-tools" },
  { slug: "pdf-splitter", name: "PDF Splitter", category: "document-tools" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let result = tools;
  if (category) result = tools.filter((t) => t.category === category);

  return NextResponse.json(result);
}
