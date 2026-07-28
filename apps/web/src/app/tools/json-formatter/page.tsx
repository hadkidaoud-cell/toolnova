"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";

const TOOL = {
  slug: "json-formatter",
  name: "JSON Formatter",
  description: "Format, validate, and minify your JSON data with an interactive tree viewer.",
  longDescription:
    "Our JSON Formatter and Validator helps you format, validate, and minify JSON data. It includes a collapsible tree view that lets you explore the structure of your JSON, making it easy to debug and understand complex data. Simply paste your JSON and click Format to see it beautifully structured.",
  category: "Developer Tools",
  categorySlug: "developer",
  icon: "{",
  breadcrumbs: [
    { label: "Developer Tools", href: "/category/developer" },
    { label: "JSON Formatter", href: "/tools/json-formatter" },
  ],
};

const RELATED_TOOLS = [
  { slug: "xml-formatter", name: "XML Formatter", description: "Format and validate XML data", icon: ">" },
  { slug: "html-formatter", name: "HTML Formatter", description: "Format and beautify HTML code", icon: "<" },
  { slug: "css-minifier", name: "CSS Minifier", description: "Minify and compress CSS", icon: "#" },
];

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
    question: "Is there a size limit?",
    answer: "You can validate and format up to 1MB of JSON text at a time. For larger files, we recommend splitting them into smaller chunks.",
  },
];

const ARTICLE = {
  title: "Understanding JSON Structure",
  content:
    "JSON is the most widely used data format for APIs and configuration files. It supports primitive types like strings, numbers, booleans, and null, as well as complex types like objects (key-value pairs) and arrays (ordered lists). Properly formatted JSON is essential for debugging API responses and maintaining configuration files. Our tool helps you quickly validate and format JSON to ensure it's error-free and readable.",
};

function JsonNode({ data, indent = 0 }: { data: unknown; indent?: number }) {
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
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<unknown | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const formattedJson = useMemo(() => {
    if (parsed === null) return "";
    return JSON.stringify(parsed, null, 2);
  }, [parsed]);

  const minifiedJson = useMemo(() => {
    if (parsed === null) return "";
    return JSON.stringify(parsed);
  }, [parsed]);

  const formatJson = useCallback(() => {
    setError("");
    setParsed(null);
    try {
      const trimmed = input.trim();
      if (!trimmed) { setError("Please enter JSON to format"); return; }
      const p = JSON.parse(trimmed);
      setParsed(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [input]);

  const minifyJson = useCallback(() => {
    formatJson();
  }, [formatJson]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, []);

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
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Enter JSON
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste your JSON here, e.g. {"key": "value"}'
            rows={8}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={formatJson}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Format
          </button>
          <button
            onClick={minifyJson}
            className="rounded-lg bg-neutral-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:bg-neutral-500 dark:hover:bg-neutral-400"
          >
            Minify
          </button>
          <button
            onClick={() => copyToClipboard(formattedJson)}
            disabled={!parsed}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {parsed && (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Formatted JSON</h3>
              <pre className="overflow-x-auto rounded-lg border border-neutral-300 bg-neutral-50 p-4 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800">
                {formattedJson}
              </pre>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Tree View</h3>
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
