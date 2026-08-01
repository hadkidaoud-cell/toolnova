"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { FileCode2 } from "lucide-react";
import { mdToHtml } from "@/lib/markdown";

const RELATED_SLUGS = ["html-formatter", "javascript-formatter", "css-minifier"] as const;

const RELATED_ICONS: Record<string, string> = {
  "html-formatter": "<>",
  "javascript-formatter": "JS",
  "css-minifier": "#",
};

const LONG_DESCRIPTION =
  "Our Markdown to HTML converter transforms your Markdown into clean, semantic HTML instantly. It supports headings, bold and italic text, inline and block code, unordered and ordered lists, links, blockquotes, and horizontal rules. A live preview updates as you type, so you can check exactly how your content will render before copying the final HTML.";

const FAQ = [
  {
    question: "What Markdown syntax is supported?",
    answer: "Headings (# to ######), bold and italic, inline code and fenced code blocks, ordered and unordered lists, links, blockquotes, and horizontal rules.",
  },
  {
    question: "Is my content sent to a server?",
    answer: "No. Everything is converted locally in your browser, so your text never leaves your device.",
  },
  {
    question: "Can I use the preview in production?",
    answer: "The generated HTML is sanitized by escaping all raw HTML, so pasted content can't inject scripts into your page.",
  },
];

const ARTICLE = {
  title: "Why Markdown to HTML Matters",
  content:
    "Markdown lets writers focus on content instead of markup. Converting it to clean HTML makes it easy to publish articles, documentation, and blog posts anywhere. Our tool does the conversion instantly in your browser and gives you a live preview, so you always know what your readers will see.",
};

export default function MarkdownToHtmlPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["markdown-to-html"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <FileCode2 className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/markdown-to-html" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [md, setMd] = useState("# Hello, Markdown!\n\nThis is **bold** and *italic* text with `inline code`.\n\n- First item\n- Second item\n\n```js\nconsole.log('hi');\n```");
  const [tab, setTab] = useState<"html" | "preview">("html");
  const [copied, setCopied] = useState(false);

  const html = React.useMemo(() => (md ? mdToHtml(md) : ""), [md]);
  const u = t.markdownToHtml;

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

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
            {u.markdown}
          </label>
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            placeholder={u.mdPlaceholder}
            rows={10}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-neutral-300 p-0.5 dark:border-neutral-600">
            {(["html", "preview"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === key
                    ? "bg-brand-600 text-white"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
              >
                {key === "html" ? u.html : u.preview}
              </button>
            ))}
          </div>
          <button
            onClick={copyHtml}
            disabled={!html}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {copied ? t.common.copied : u.copyHtml}
          </button>
        </div>

        {tab === "html" ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {u.html}
            </label>
            <pre className="max-h-80 overflow-auto rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 font-mono text-xs leading-relaxed text-neutral-800 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200">
              {html || u.htmlPlaceholder}
            </pre>
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {u.livePreview}
            </label>
            <div
              className="min-h-40 max-h-96 overflow-auto rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white [&_pre]:my-2 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-neutral-100 [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs dark:[&_pre]:bg-neutral-800 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 dark:[&_code]:bg-neutral-800"
              dangerouslySetInnerHTML={{ __html: html || "<p></p>" }}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
