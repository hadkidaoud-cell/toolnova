"use client";

import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Code } from "lucide-react";

const RELATED_SLUGS = ["css-minifier", "javascript-formatter", "json-formatter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "css-minifier": "{}",
  "javascript-formatter": "JS",
  "json-formatter": "{}",
};

const LONG_DESCRIPTION =
  "Our HTML Formatter beautifies and minifies HTML code in your browser. Paste messy markup and get clean, indented output instantly — or compress it for production. No sign-up, no uploads, no limits.";

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function tagName(tag: string): string {
  return (tag.match(/^<\/?([a-zA-Z][\w-]*)/) ?? [])[1] ?? "";
}

function formatHtml(input: string): string {
  let depth = 0;
  const out: string[] = [];
  const prepared = input
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/\s+/g, " "))
    .replace(/\r\n?/g, "\n")
    .replace(/>\s+</g, ">\n<");
  for (const raw of prepared.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const closesBefore = line.startsWith("</") ? 1 : 0;
    const indentDepth = Math.max(0, depth - closesBefore);
    out.push("  ".repeat(indentDepth) + line);
    const opens = (line.match(/<[a-zA-Z][\w-]*[^>]*?>/g) ?? []).filter((t) => {
      const name = tagName(t);
      return !t.startsWith("</") && !/\/>$/.test(t) && !VOID_TAGS.has(name) && name !== "!DOCTYPE";
    }).length;
    const closes = (line.match(/<\//g) ?? []).length;
    depth = Math.max(0, depth - closes + opens);
  }
  return out.join("\n");
}

function minifyHtml(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/>\s+</g, "><")
    .trim();
}

const FAQ = [
  {
    question: "Does the formatter handle self-closing and void tags?",
    answer: "Yes. Void tags like <img>, <br>, and <input> do not increase indentation, and self-closing tags are handled correctly.",
  },
  {
    question: "Can I minify HTML?",
    answer: "Yes — switch to Minify mode to strip comments and collapse whitespace for smaller payloads.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. Everything runs locally in your browser.",
  },
];

const ARTICLE = {
  title: "Clean Markup, Every Time",
  content:
    "Readable HTML is easier to maintain, debug, and hand off. Whether you are un-minifying a production snippet or tidying generated markup, a fast formatter saves minutes every day. And when it is time to ship, one click turns your beautified code into a compact version with no comments and no wasted bytes.",
};

export default function HtmlFormatterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["html-formatter"];
  const hf = t.htmlFormatter;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <Code className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/html-formatter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [mode, setMode] = useState<"format" | "minify">("format");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);

  const run = useCallback(() => {
    setError(false);
    const trimmed = input.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    setOutput(mode === "format" ? formatHtml(trimmed) : minifyHtml(trimmed));
  }, [input, mode]);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "format" ? "formatted.html" : "minified.html";
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
          {(["format", "minify"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                mode === m
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {hf[m]}
            </button>
          ))}
        </div>

        <div>
          <label className={labelCls}>{hf.inputPlaceholder}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            dir="ltr"
            placeholder={'<div class="box"><p>Hello</p></div>'}
            className={areaCls}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={run}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {hf.formatButton}
          </button>
          {output && (
            <button
              onClick={download}
              className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {hf.download}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {hf.invalidHtml}
          </div>
        )}

        <div>
          <label className={labelCls}>{hf.resultPlaceholder}</label>
          <textarea
            value={output}
            readOnly
            rows={8}
            dir="ltr"
            placeholder={hf.resultPlaceholder}
            className={areaCls}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
