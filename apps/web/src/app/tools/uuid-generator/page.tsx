"use client";

import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";

const TOOL = {
  slug: "uuid-generator",
  name: "UUID Generator",
  description: "Generate UUID v4 identifiers for your projects.",
  longDescription:
    "Our UUID Generator creates RFC 4122 compliant UUID v4 (random) identifiers. UUIDs are 128-bit values used to uniquely identify information in distributed systems. You can generate between 1 and 100 UUIDs at once, copy them individually, or copy all at once for bulk use.",
  category: "Developer Tools",
  categorySlug: "developer",
  icon: "U",
  breadcrumbs: [
    { label: "Developer Tools", href: "/category/developer" },
    { label: "UUID Generator", href: "/tools/uuid-generator" },
  ],
};

const RELATED_TOOLS = [
  { slug: "password-generator", name: "Password Generator", description: "Generate strong passwords", icon: "K" },
  { slug: "token-generator", name: "Token Generator", description: "Generate secure API tokens", icon: "T" },
  { slug: "nanoid-generator", name: "NanoID Generator", description: "Generate compact NanoIDs", icon: "N" },
];

const FAQ = [
  {
    question: "What is a UUID?",
    answer: "A UUID (Universally Unique Identifier) is a 128-bit number used to uniquely identify information. UUID v4 is randomly generated, providing 122 bits of randomness, making collisions virtually impossible.",
  },
  {
    question: "Are UUIDs guaranteed to be unique?",
    answer: "While UUID v4 uses random generation, the probability of collision is extremely low — about 1 in 5.3×10²⁹ for generating 1 billion UUIDs per second for 100 years. For most practical purposes, UUIDs are unique.",
  },
  {
    question: "What are UUIDs used for?",
    answer: "UUIDs are commonly used as database primary keys, API identifiers, session tokens, transaction IDs, and any scenario where unique identifiers are needed across distributed systems.",
  },
];

const ARTICLE = {
  title: "Understanding UUID v4",
  content:
    "UUID v4 is the most commonly used UUID version, generating random identifiers that require no central authority. Each UUID is formatted as 36 characters (32 hexadecimal digits and 4 hyphens) in the pattern 8-4-4-4-12. The 'v4' in UUID v4 refers specifically to the version field (always 4) within the UUID, while the variant field follows RFC 4122. This randomness makes UUID v4 ideal for distributed systems where coordination-free unique ID generation is needed.",
};

function generateUUID(): string {
  const hex = "0123456789abcdef";
  const chars = new Array(36);
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      chars[i] = "-";
    } else if (i === 14) {
      chars[i] = "4";
    } else if (i === 19) {
      chars[i] = hex[(Math.random() * 4) | 8];
    } else {
      chars[i] = hex[(Math.random() * 16) | 0];
    }
  }
  return chars.join("");
}

function generateUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUUID());
}

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => generateUUIDs(5));
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = useCallback(() => {
    setUuids(generateUUIDs(count));
    setCopiedIndex(null);
    setCopiedAll(false);
  }, [count]);

  const copySingle = useCallback(async (uuid: string, index: number) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch { }
  }, []);

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch { }
  }, [uuids]);

  return (
    <ToolLayout
      name={TOOL.name}
      description={TOOL.description}
      longDescription={TOOL.longDescription}
      category={TOOL.category}
      categorySlug={TOOL.categorySlug}
      breadcrumbs={TOOL.breadcrumbs}
      icon={TOOL.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Number of UUIDs: {count}
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>1</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Generate {count > 1 ? `${count} UUIDs` : "UUID"}
          </button>
          {uuids.length > 0 && (
            <button
              onClick={copyAll}
              className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {copiedAll ? "Copied All!" : "Copy All"}
            </button>
          )}
        </div>

        {uuids.length > 0 && (
          <div className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <code className="font-mono text-sm text-neutral-900 dark:text-white">{uuid}</code>
                <button
                  onClick={() => copySingle(uuid, index)}
                  className="ml-3 shrink-0 rounded-md px-3 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
                >
                  {copiedIndex === index ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
