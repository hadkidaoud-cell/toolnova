"use client";

import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Binary } from "lucide-react";

const RELATED_SLUGS = ["color-converter", "html-formatter", "uuid-generator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "color-converter": "#",
  "html-formatter": "HTML",
  "uuid-generator": "U",
};

const LONG_DESCRIPTION =
  "Our Base64 Encoder/Decoder converts text to Base64 and back — with full Unicode support. Paste your text or Base64 string, choose a direction, and copy or download the result. Everything runs locally.";

function toBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

function fromBase64(b64: string): { ok: boolean; value?: string } {
  const cleaned = b64.trim().replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) || cleaned.length % 4 !== 0) {
    return { ok: false };
  }
  try {
    return { ok: true, value: decodeURIComponent(escape(atob(cleaned))) };
  } catch {
    return { ok: false };
  }
}

const FAQ = [
  {
    question: "Why use Base64?",
    answer: "Base64 encodes binary or text data into a safe ASCII string, useful for embedding data in URLs, emails, and JSON.",
  },
  {
    question: "Does it support non-ASCII characters?",
    answer: "Yes — Unicode text (Arabic, French, emoji) is handled correctly on both encode and decode.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. Encoding and decoding happen entirely in your browser.",
  },
];

const ARTICLE = {
  title: "Base64 Made Simple",
  content:
    "Base64 is everywhere: data URIs, JWT payloads, email attachments. While converting by hand is error-prone, a reliable encoder/decoder turns it into a two-second task. Unicode-safe handling means no more garbled output for international text.",
};

export default function Base64EncoderPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["base64-encoder"];
  const b64 = t.base64;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <Binary className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/base64-encoder" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);

  const convert = useCallback(() => {
    setError(false);
    if (!input.trim()) {
      setError(true);
      return;
    }
    if (mode === "encode") {
      setOutput(toBase64(input));
    } else {
      const res = fromBase64(input);
      if (!res.ok) {
        setError(true);
        return;
      }
      setOutput(res.value ?? "");
    }
  }, [input, mode]);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "encode" ? "encoded.txt" : "decoded.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, mode]);

  const labelCls = "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300";
  const areaCls =
    "w-full rounded-lg border border-neutral-300 bg-white p-3 font-mono text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

  return (
    <ToolLayout
      name={tool.name}
      description={tool.description}
      longDescription={tool.longDescription}
      category={tool.category}
      categorySlug={tool.categorySlug}
      breadcrumbs={tool.breadcrumbs}
      icon={tool.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                mode === m
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {b64[m]}
            </button>
          ))}
        </div>

        <div>
          <label className={labelCls}>{b64.inputPlaceholder}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            dir="ltr"
            placeholder={mode === "encode" ? "Hello, world!" : "SGVsbG8sIHdvcmxkIQ=="}
            className={areaCls}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={convert}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {b64.convert}
          </button>
          {output && (
            <button
              onClick={download}
              className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {b64.download}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {b64.invalidBase64}
          </div>
        )}

        <div>
          <label className={labelCls}>{b64.outputPlaceholder}</label>
          <textarea
            value={output}
            readOnly
            rows={6}
            dir="ltr"
            placeholder={b64.outputPlaceholder}
            className={areaCls}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
