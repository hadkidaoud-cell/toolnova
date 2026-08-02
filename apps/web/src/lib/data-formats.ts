import { load as yamlLoad, dump as yamlDump } from "js-yaml";

export type FormatId = "json" | "csv" | "tsv" | "yaml" | "xml";

export type DataResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

export const FORMATS: FormatId[] = ["json", "csv", "tsv", "yaml", "xml"];

export const FORMAT_EXTENSION: Record<FormatId, string> = {
  json: "json",
  csv: "csv",
  tsv: "tsv",
  yaml: "yaml",
  xml: "xml",
};

type TabularRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmptyText(text: string): boolean {
  return text.trim() === "";
}

export function parseCsv(text: string, delimiter: "," | "\t" = ","): DataResult<TabularRecord[]> {
  if (isEmptyText(text)) return { ok: false, error: "emptyInput" };

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i] as string;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);

  if (rows.length === 0) return { ok: false, error: "invalidCsv" };

  const headers = rows[0]!.map((h) => h.trim());
  if (headers.some((h) => h === "")) return { ok: false, error: "invalidCsv" };

  const records = rows.slice(1).map((r) => {
    const record: TabularRecord = {};
    headers.forEach((h, i) => {
      record[h] = r[i] ?? "";
    });
    return record;
  });

  return { ok: true, data: records };
}

function escapeCell(value: unknown, delimiter: string): string {
  const str = value === null || value === undefined ? "" : String(value);
  const needsQuote = /[",\n\r\t]/.test(str) || str.includes(delimiter);
  return needsQuote ? `"${str.replace(/"/g, '""')}"` : str;
}

function recordsToTabular(data: unknown): { records: TabularRecord[]; headers: string[] } | null {
  if (!Array.isArray(data) || data.some((item) => !isPlainObject(item))) return null;
  const records = data as TabularRecord[];
  const headers = Array.from(
    new Set(records.flatMap((item) => Object.keys(item).filter((k) => !k.startsWith("__"))))
  );
  return { records, headers };
}

export function stringifyCsv(data: unknown, delimiter: "," | "\t" = ","): DataResult<string> {
  const tabular = recordsToTabular(data);
  if (!tabular) return { ok: false, error: "notTabular" };
  const { records, headers } = tabular;
  const lines = [headers.map((h) => escapeCell(h, delimiter)).join(delimiter)];
  records.forEach((item) => {
    lines.push(headers.map((h) => escapeCell(item[h], delimiter)).join(delimiter));
  });
  return { ok: true, data: lines.join("\n") };
}

export function parseJson(text: string): DataResult {
  if (isEmptyText(text)) return { ok: false, error: "emptyInput" };
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, error: "invalidJson" };
  }
}

export function stringifyJson(data: unknown): DataResult<string> {
  try {
    return { ok: true, data: JSON.stringify(data, null, 2) };
  } catch {
    return { ok: false, error: "invalidJson" };
  }
}

export function parseYaml(text: string): DataResult {
  if (isEmptyText(text)) return { ok: false, error: "emptyInput" };
  try {
    const data = yamlLoad(text);
    return { ok: true, data: data === undefined ? null : data };
  } catch {
    return { ok: false, error: "invalidYaml" };
  }
}

export function stringifyYaml(data: unknown): DataResult<string> {
  try {
    return { ok: true, data: yamlDump(data, { lineWidth: 120 }) };
  } catch {
    return { ok: false, error: "invalidYaml" };
  }
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidXmlTag(tag: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_.-]*$/.test(tag);
}

function jsonToXmlNodes(value: unknown, nodeName: string, depth: number): string[] {
  const indent = "  ".repeat(depth);
  const lines: string[] = [];
  const appendScalar = (node: string, scalar: unknown) => {
    lines.push(`${indent}<${node}>${xmlEscape(String(scalar))}</${node}>`);
  };

  if (value === null || value === undefined) {
    lines.push(`${indent}<${nodeName} />`);
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      lines.push(`${indent}<${nodeName} />`);
    } else {
      value.forEach((item) => {
        if (isPlainObject(item)) {
          lines.push(`${indent}<${nodeName}>`);
          Object.entries(item).forEach(([key, child]) => {
            if (isValidXmlTag(key)) jsonToXmlNodes(child, key, depth + 1).forEach((l) => lines.push(l));
          });
          lines.push(`${indent}</${nodeName}>`);
        } else {
          appendScalar(nodeName, item);
        }
      });
    }
  } else if (isPlainObject(value)) {
    if (Object.keys(value).length === 0) {
      lines.push(`${indent}<${nodeName} />`);
    } else {
      lines.push(`${indent}<${nodeName}>`);
      Object.entries(value).forEach(([key, child]) => {
        if (isValidXmlTag(key)) jsonToXmlNodes(child, key, depth + 1).forEach((l) => lines.push(l));
      });
      lines.push(`${indent}</${nodeName}>`);
    }
  } else {
    appendScalar(nodeName, value);
  }
  return lines;
}

export function stringifyXml(data: unknown, rootName = "root"): DataResult<string> {
  if (!isValidXmlTag(rootName)) return { ok: false, error: "invalidXml" };
  const body = jsonToXmlNodes(data, rootName, 0);
  return { ok: true, data: `<?xml version="1.0" encoding="UTF-8"?>\n${body.join("\n")}` };
}

type XmlNode = { tag: string; text: string; children: XmlNode[] };

export type XmlParser = (xml: string) => { root: XmlNode | null; hasError: boolean };

export function defaultXmlParser(xml: string): { root: XmlNode | null; hasError: boolean } {
  const domParser = globalThis.DOMParser;
  if (!domParser) return { root: null, hasError: true };
  const doc = new domParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return { root: null, hasError: true };
  const root = doc.documentElement;
  if (!root) return { root: null, hasError: true };
  return { root: elementToNode(root), hasError: false };
}

function elementToNode(element: Element): XmlNode {
  const children: XmlNode[] = [];
  element.childNodes.forEach((node) => {
    if (node.nodeType === 1) children.push(elementToNode(node as Element));
  });
  const text = Array.from(element.childNodes)
    .filter((node) => node.nodeType === 3 || node.nodeType === 4)
    .map((node) => node.nodeValue ?? "")
    .join("")
    .trim();
  return { tag: element.tagName, text, children };
}

function groupChildren(children: XmlNode[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  children.forEach((child) => {
    if (child.tag in result) {
      const existing = result[child.tag];
      if (Array.isArray(existing)) {
        existing.push(xmlNodeToValue(child));
      } else {
        result[child.tag] = [existing, xmlNodeToValue(child)];
      }
    } else {
      result[child.tag] = xmlNodeToValue(child);
    }
  });
  return result;
}

export function xmlNodeToValue(node: XmlNode): unknown {
  if (node.children.length > 0) return groupChildren(node.children);
  if (node.text !== "") {
    const parsed = coerceScalar(node.text);
    return parsed;
  }
  return "";
}

function coerceScalar(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  return text;
}

export function parseXml(text: string, parser: XmlParser = defaultXmlParser): DataResult {
  if (isEmptyText(text)) return { ok: false, error: "emptyInput" };
  const { root, hasError } = parser(text);
  if (!root || hasError) return { ok: false, error: "invalidXml" };
  return { ok: true, data: groupChildren(root.children) };
}

export function parseData(from: FormatId, text: string): DataResult {
  switch (from) {
    case "json":
      return parseJson(text);
    case "csv":
      return parseCsv(text, ",");
    case "tsv":
      return parseCsv(text, "\t");
    case "yaml":
      return parseYaml(text);
    case "xml":
      return parseXml(text);
  }
}

export function serializeData(to: FormatId, data: unknown): DataResult<string> {
  switch (to) {
    case "json":
      return stringifyJson(data);
    case "csv":
      return stringifyCsv(data, ",");
    case "tsv":
      return stringifyCsv(data, "\t");
    case "yaml":
      return stringifyYaml(data);
    case "xml":
      return stringifyXml(data);
  }
}

export function convertData(from: FormatId, to: FormatId, text: string): DataResult<string> {
  const parsed = parseData(from, text);
  if (!parsed.ok) return parsed;
  return serializeData(to, parsed.data);
}

export function countRows(data: unknown): number {
  if (Array.isArray(data)) return data.length;
  if (isPlainObject(data)) return Object.keys(data).length;
  return 1;
}
