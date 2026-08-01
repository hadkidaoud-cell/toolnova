"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PLANNED_TOOLS = new Set([
  "word-counter",
  "character-counter",
  "sentence-counter",
  "reading-time",
  "text-diff",
  "case-converter",
  "text-repeater",
  "palindrome-checker",
  "image-compressor",
  "image-resizer",
  "image-converter",
  "image-cropper",
  "color-picker",
  "json-formatter",
  "html-formatter",
  "css-minifier",
  "javascript-formatter",
  "base64-encoder",
  "uuid-generator",
  "color-converter",
  "basic-calculator",
  "percentage-calculator",
  "bmi-calculator",
  "tip-calculator",
  "loan-calculator",
  "unit-converter",
  "currency-converter",
  "temperature-converter",
  "file-converter",
  "qr-code-generator",
  "password-generator",
  "resume-builder",
  "random-number",
  "pdf-merger",
  "pdf-compressor",
  "image-to-pdf",
  "pdf-splitter",
]);

export default function ToolFallbackPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { dict } = useI18n();
  const planned = PLANNED_TOOLS.has(slug);

  if (planned) {
    const t = dict.comingSoon;
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">{t.badge}</Badge>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-md text-neutral-600 dark:text-neutral-400">{t.description}</p>
          <Link href="/">
            <Button className="mt-8">{t.backToHome}</Button>
          </Link>
        </div>
      </main>
    );
  }

  const t = dict.notFoundPage;
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 dark:text-white">{t.title}</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{t.description}</p>
        <Link href="/">
          <Button className="mt-8">{t.backToHome}</Button>
        </Link>
      </div>
    </main>
  );
}
