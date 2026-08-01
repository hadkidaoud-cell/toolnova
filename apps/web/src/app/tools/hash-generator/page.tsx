"use client";

import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Hash } from "lucide-react";
import { md5 } from "@/lib/md5";

const RELATED_SLUGS = ["jwt-decoder", "base64-encoder", "password-strength-checker"] as const;

const RELATED_ICONS: Record<string, string> = {
  "jwt-decoder": "JWT",
  "base64-encoder": "64",
  "password-strength-checker": "🛡",
};

const LONG_DESCRIPTION =
  "The Hash Generator instantly produces MD5, SHA-1, SHA-256, and SHA-512 hashes for any text. Choose an algorithm, type or paste your content, and the hash updates immediately. SHA hashes are computed with the Web Crypto API and MD5 with an optimized implementation, all locally in your browser with zero uploads.";

const FAQ = [
  {
    question: "What is a hash?",
    answer: "A hash is a fixed-length fingerprint of data. The same input always produces the same hash, but you cannot reverse a hash to recover the original text.",
  },
  {
    question: "Which algorithm should I use?",
    answer: "For security purposes use SHA-256 or SHA-512. MD5 and SHA-1 are fast but considered broken for cryptographic use; they are handy for checksums and legacy systems.",
  },
  {
    question: "Is my data uploaded anywhere?",
    answer: "No. All hashing happens locally in your browser using the Web Crypto API.",
  },
];

const ARTICLE = {
  title: "Understanding Hash Functions",
  content:
    "Hash functions map arbitrary data to fixed-size values. They are the backbone of password storage, file integrity checks, and digital signatures. A good hash is deterministic, fast to compute, and infeasible to reverse. Our generator makes it easy to experiment with the most common algorithms and compare their outputs side by side.",
};

async function sha(text: string, algo: "SHA-1" | "SHA-256" | "SHA-512"): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashGeneratorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["hash-generator"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <Hash className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/hash-generator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [text, setText] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);
  const u = t.hashGenerator;

  const generate = useCallback(async () => {
    if (!text) {
      setHash("");
      return;
    }
    if (algorithm === "MD5") setHash(md5(text));
    else setHash(await sha(text, algorithm as "SHA-1" | "SHA-256" | "SHA-512"));
  }, [text, algorithm]);

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const algorithms = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

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
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {u.text}
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setHash("");
            }}
            placeholder={u.hashPlaceholder}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-64">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {u.algorithm}
            </label>
            <select
              value={algorithm}
              onChange={(e) => {
                setAlgorithm(e.target.value);
                setHash("");
              }}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            >
              {algorithms.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={generate}
            disabled={!text}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-neutral-900"
          >
            {u.generate}
          </button>
        </div>

        {hash && (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {algorithm}
            </label>
            <div className="flex items-start gap-3">
              <code className="flex-1 break-all rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100">
                {hash}
              </code>
              <button
                onClick={copyHash}
                className="shrink-0 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {copied ? t.common.copied : t.common.copy}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
