"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { KeyRound } from "lucide-react";

const RELATED_SLUGS = ["password-generator", "qr-code-generator", "json-formatter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "password-generator": "K",
  "qr-code-generator": "▦",
  "json-formatter": "{}",
};

const LONG_DESCRIPTION =
  "Our UUID Generator creates random version 4 UUIDs (Universally Unique Identifiers) with true 122 bits of entropy. Customize the number of UUIDs generated, toggle uppercase output, or remove hyphens for compact keys. Perfect for database primary keys, distributed systems, and testing.";

const FAQ = [
  {
    question: "What is a UUID v4?",
    answer: "A UUID version 4 is a randomly generated 128-bit identifier displayed as 32 hexadecimal characters separated by hyphens. The version (4) and variant bits are set while the remaining 122 bits are random, making collisions astronomically unlikely.",
  },
  {
    question: "Are the generated UUIDs truly random?",
    answer: "Yes, our generator uses the browser's Cryptographically Secure Random Number Generator (crypto.getRandomValues) to produce every UUID, ensuring full randomness that is suitable for security-sensitive applications.",
  },
  {
    question: "Can I remove the hyphens from UUIDs?",
    answer: "Yes. Toggle the 'Remove hyphens' option to produce a compact 32-character hex string, which is useful for filenames, URL parameters, or storage keys.",
  },
];

const ARTICLE = {
  title: "Universally Unique Identifiers Explained",
  content:
    "UUIDs are standardized 128-bit identifiers used across distributed systems to avoid identifier collisions without central coordination. The v4 format uses pure randomness, making it ideal for database keys and correlation IDs. Generating them client-side with crypto.getRandomValues provides both convenience and cryptographic strength.",
};

export default function UuidGeneratorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["uuid-generator"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <KeyRound className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/uuid-generator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [removeHyphens, setRemoveHyphens] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    setUuids(generateUuids(count, uppercase, removeHyphens));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generateUuids(n: number, up: boolean, noHyphens: boolean): string[] {
    return Array.from({ length: n }, () => {
      let uuid = "";
      const arr = crypto.getRandomValues(new Uint8Array(16));
      arr[6] = (arr[6]! & 0x0f) | 0x40;
      arr[8] = (arr[8]! & 0x3f) | 0x80;
      for (let i = 0; i < 16; i++) {
        const byte = arr[i]!.toString(16).padStart(2, "0");
        uuid += byte;
        if ([3, 5, 7, 9].includes(i)) uuid += "-";
      }
      uuid = uuid.replace(/-$/, "");
      if (noHyphens) uuid = uuid.replace(/-/g, "");
      return up ? uuid.toUpperCase() : uuid;
    });
  }

  const regenerate = useCallback(() => {
    setUuids(generateUuids(count, uppercase, removeHyphens));
    setCopiedIndex(null);
    setCopiedAll(false);
  }, [count, uppercase, removeHyphens]);

  const copyUuid = useCallback(async (index: number) => {
    try {
      await navigator.clipboard.writeText(uuids[index]!);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch { }
  }, [uuids]);

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch { }
  }, [uuids]);

  const download = useCallback(() => {
    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uuids.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [uuids]);

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
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-48">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t.uuid.numberOfUuids.replace("{count}", String(count))}
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={count}
              onChange={(e) => {
                setCount(Number(e.target.value));
              }}
              className="w-full accent-brand-600"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 accent-brand-600"
              />
              {t.uuid.uppercase}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={removeHyphens}
                onChange={(e) => setRemoveHyphens(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 accent-brand-600"
              />
              {t.uuid.removeHyphens}
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={regenerate}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            {t.uuid.generate}
            {count > 1 ? ` (${count})` : ""}
          </button>
          <button
            onClick={copyAll}
            disabled={uuids.length === 0}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {copiedAll ? t.uuid.copiedAll : t.uuid.copyAll}
          </button>
          <button
            onClick={download}
            disabled={uuids.length === 0}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {t.common.download}
          </button>
        </div>

        <div className="space-y-2">
          {uuids.map((uuid, index) => (
            <div key={index} className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
              <code className="break-all text-sm text-neutral-800 dark:text-neutral-200">{uuid}</code>
              <button
                onClick={() => copyUuid(index)}
                className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                {copiedIndex === index ? t.common.copied : t.common.copy}
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
