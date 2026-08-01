import { NextResponse } from "next/server";

const tools = [
  { slug: "word-counter", name: "Word Counter", category: "text-tools" },
  { slug: "character-counter", name: "Character Counter", category: "text-tools" },
  { slug: "base64-encoder", name: "Base64 Encoder/Decoder", category: "text-tools" },
  { slug: "json-formatter", name: "JSON Formatter", category: "developer-tools" },
  { slug: "html-preview", name: "HTML Preview", category: "developer-tools" },
  { slug: "uuid-generator", name: "UUID Generator", category: "developer-tools" },
  { slug: "qr-code-generator", name: "QR Code Generator", category: "image-tools" },
  { slug: "image-to-base64", name: "Image to Base64", category: "image-tools" },
  { slug: "password-generator", name: "Password Generator", category: "security-tools" },
  { slug: "hash-generator", name: "Hash Generator", category: "security-tools" },
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
