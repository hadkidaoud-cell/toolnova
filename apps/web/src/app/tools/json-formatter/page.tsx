"use client";

import React, { useState, useCallback, useMemo, useRef, ReactNode } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Code } from "lucide-react";

const RELATED_SLUGS = ["uuid-generator", "password-generator", "qr-code-generator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "uuid-generator": "U",
  "password-generator": "K",
  "qr-code-generator": "▦",
};

const LONG_DESCRIPTION =
  "Our JSON Formatter and Validator helps you format, validate, and minify JSON data. It includes a collapsible tree view that lets you explore the structure of your JSON, making it easy to debug and understand complex data. Simply paste your JSON and click Format to see it beautifully structured.";

const FAQ = [
  {
    question: "What is JSON?",
    answer: 'JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate. It is based on key-value pairs and ordered lists.',
  },
  {
    question: "Why format JSON?",
    answer: "Formatting JSON adds proper indentation and line breaks, making it much easier to read and debug. Minified JSON removes all unnecessary whitespace to reduce file size for production use.",
  },
  {
    question: "What makes JSON invalid?",
    answer: "Common issues include: trailing commas, missing quotes around keys, using single quotes instead of double quotes, unescaped control characters, and duplicate keys. Our validator will point out the exact error.",
  },
  {
    question: "Can I download formatted JSON?",
    answer: "Yes! After formatting, you can download the result as a .json file or copy it to your clipboard.",
  },
];

const ARTICLE = {
  title: "Understanding JSON Structure",
  content:
    "JSON is the most widely used data format for APIs and configuration files. It supports primitive types like strings, numbers, booleans, and null, as well as complex types like objects (key-value pairs) and arrays (ordered lists). Properly formatted JSON is essential for debugging API responses and maintaining configuration files. Our tool helps you quickly validate and format JSON to ensure it's error-free and readable.",
};

function JsonNode({ data, indent = 0 }: { data: unknown; indent?: number }): ReactNode {
  const [collapsed, setCollapsed] = useState(false);
  const isObject = data !== null && typeof data === "object";
  const isArray = Array.isArray(data);

  if (!isObject) {
    const value =
      typeof data === "string"
        ? `"${data}"`
        : data === null
          ? "null"
          : String(data);
    const color =
      typeof data === "string"
        ? "text-green-600 dark:text-green-400"
        : data === null
          ? "text-neutral-400"
          : typeof data === "boolean"
            ? "text-blue-600 dark:text-blue-400"
            : "text-purple-600 dark:text-purple-400";
    return <span className={color}>{value}</span>;
  }

  const entries = isArray ? (data as unknown[]).map((v, i) => [String(i), v] as const) : Object.entries(data as Record<string, unknown>);
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  return (
    <div className="leading-relaxed">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded text-xs text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      >
        {collapsed ? "+" : "-"}
      </button>
      <span className="text-neutral-700 dark:text-neutral-300">{openBracket}</span>
      {collapsed ? (
        <span className="text-neutral-400 text-sm">...{closeBracket}</span>
      ) : (
        <>
          <div className="border-l border-neutral-300 dark:border-neutral-600" style={{ paddingLeft: 16, marginLeft: 4 }}>
            {entries.map(([key, value], idx) => (
              <div key={key} className="mb-1">
                {!isArray && (
                  <span className="text-amber-600 dark:text-amber-400">"{key}"</span>
                )}
                {!isArray && <span className="text-neutral-500">: </span>}
                <JsonNode data={value} indent={indent + 1} />
                {idx < entries.length - 1 && <span className="text-neutral-400">,</span>}
              </div>
            ))}
          </div>
          <span className="text-neutral-700 dark:text-neutral-300">{closeBracket}</span>
        </>
      )}
    </div>
  );
}

export default function JsonFormatterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["json-formatter"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <Code className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/json-formatter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<unknown | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formattedJson = useMemo(() => {
    if (parsed === null) return "";
    return JSON.stringify(parsed, null, 2);
  }, [parsed]);

  const parseJson = useCallback((value: string) => {
    setError("");
    setErrorLine(null);
    setParsed(null);
    const trimmed = value.trim();
    if (!trimmed) { setError(t.jsonFormatter.enterJsonToFormat); return null; }
    try {
      const p = JSON.parse(trimmed);
      return p;
    } catch (e) {
      const msg = e instanceof Error ? e.message : t.jsonFormatter.invalidJson;
      const lineMatch = msg.match(/at position (\d+)/) || msg.match(/position (\d+)/);
      if (lineMatch && lineMatch[1]) {
        const pos = parseInt(lineMatch[1], 10);
        const lines = trimmed.substring(0, pos).split("\n");
        setErrorLine(lines.length);
      }
      setError(msg);
      return null;
    }
  }, [t]);

  const formatJson = useCallback(() => {
    const p = parseJson(input);
    if (p !== null) setParsed(p);
  }, [input, parseJson]);

  const minifyJson = useCallback(() => {
    const p = parseJson(input);
    if (p !== null) {
      setParsed(p);
    }
  }, [input, parseJson]);

  const validateJson = useCallback(() => {
    setParsed(null);
    try {
      JSON.parse(input.trim());
      setError(t.jsonFormatter.validJson);
      setTimeout(() => setError(""), 2000);
    } catch {
      setError(t.jsonFormatter.invalidJson);
    }
  }, [input, t]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, []);

  const downloadJson = useCallback(() => {
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [formattedJson]);

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
            {t.jsonFormatter.enterJson}
          </label>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.jsonFormatter.pasteHere}
            rows={8}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={formatJson}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            {t.jsonFormatter.format}
          </button>
          <button
            onClick={minifyJson}
            className="rounded-lg bg-neutral-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:bg-neutral-500 dark:hover:bg-neutral-400"
          >
            {t.jsonFormatter.minify}
          </button>
          <button
            onClick={validateJson}
            disabled={!input.trim()}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {t.jsonFormatter.validate}
          </button>
          <button
            onClick={() => copyToClipboard(formattedJson || input)}
            disabled={!input.trim()}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {copied ? t.common.copied : t.common.copy}
          </button>
          {parsed !== null && (
            <button
              onClick={downloadJson}
              className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {t.jsonFormatter.downloadJson}
            </button>
          )}
        </div>

        {error && (
          <div className={`rounded-lg border p-4 text-sm ${error === t.jsonFormatter.validJson ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400" : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
            {error}
            {errorLine !== null && (
              <span className="ml-2 font-mono text-xs opacity-75">{t.jsonFormatter.nearLine.replace("{line}", String(errorLine))}</span>
            )}
          </div>
        )}

        {parsed !== null && (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.jsonFormatter.formattedJson}</h3>
              <pre className="overflow-x-auto rounded-lg border border-neutral-300 bg-neutral-50 p-4 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800">
                {formattedJson}
              </pre>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.jsonFormatter.treeView}</h3>
              <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-600 dark:bg-neutral-800">
                <JsonNode data={parsed} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
