import { describe, it, expect } from "vitest";
import {
  parseCsv,
  stringifyCsv,
  parseJson,
  stringifyJson,
  parseYaml,
  stringifyYaml,
  stringifyXml,
  parseXml,
  convertData,
  countRows,
  xmlNodeToValue,
} from "@/lib/data-formats";
import { formatFileSize, dataUrlSize } from "@/lib/image-utils";
import { detectImageFormat } from "@/lib/webp";
import { wrapText, hexToRgb, getPreset, THUMBNAIL_PRESETS } from "@/lib/thumbnail";

describe("formatFileSize", () => {
  it("formats bytes, KB, and MB", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(5242880)).toBe("5.00 MB");
  });
});

describe("dataUrlSize", () => {
  it("estimates byte size from a base64 data URL", () => {
    expect(dataUrlSize("data:image/png;base64,AAAA")).toBe(3);
  });
});

describe("detectImageFormat", () => {
  it("detects formats by mime type and extension", () => {
    expect(detectImageFormat("photo.PNG", "image/png")).toBe("png");
    expect(detectImageFormat("photo.jpg", "image/jpeg")).toBe("jpeg");
    expect(detectImageFormat("anim.webp", "image/webp")).toBe("webp");
    expect(detectImageFormat("anim.gif", "image/gif")).toBe("gif");
    expect(detectImageFormat("raw.bmp", "image/bmp")).toBe("bmp");
    expect(detectImageFormat("file.unknown", "application/octet-stream")).toBe("other");
  });
});

describe("parseCsv", () => {
  it("parses a simple CSV into records", () => {
    const res = parseCsv("name,age\nAli,30\nSara,27");
    expect(res).toEqual({
      ok: true,
      data: [
        { name: "Ali", age: "30" },
        { name: "Sara", age: "27" },
      ],
    });
  });

  it("handles quoted fields with commas and escaped quotes", () => {
    const res = parseCsv('name,note\nAli,"Hello, world"\nSara,"said ""hi"""');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data[0]).toEqual({ name: "Ali", note: "Hello, world" });
      expect(res.data[1]).toEqual({ name: "Sara", note: 'said "hi"' });
    }
  });

  it("handles CRLF line endings", () => {
    const res = parseCsv("a,b\r\n1,2\r\n3,4");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.length).toBe(2);
  });

  it("parses TSV with a tab delimiter", () => {
    const res = parseCsv("name\tage\nAli\t30", "\t");
    expect(res).toEqual({ ok: true, data: [{ name: "Ali", age: "30" }] });
  });

  it("rejects empty or header-less input", () => {
    expect(parseCsv("").ok).toBe(false);
    expect(parseCsv("  \n\n").ok).toBe(false);
    expect(parseCsv(",").ok).toBe(false);
    expect(parseCsv("a,\n1,2").ok).toBe(false);
  });
});

describe("stringifyCsv", () => {
  it("serializes an array of objects", () => {
    const res = stringifyCsv([{ name: "Ali", age: 30 }, { name: "Sara", age: 27 }]);
    expect(res).toEqual({ ok: true, data: "name,age\nAli,30\nSara,27" });
  });

  it("quotes fields containing commas or quotes", () => {
    const res = stringifyCsv([{ note: 'say "hi", please' }]);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data).toBe('note\n"say ""hi"", please"');
  });

  it("rejects non-tabular data", () => {
    expect(stringifyCsv({ name: "Ali" }).ok).toBe(false);
    expect(stringifyCsv("plain").ok).toBe(false);
  });
});

describe("json helpers", () => {
  it("parses and stringifies JSON", () => {
    expect(parseJson("")).toEqual({ ok: false, error: "emptyInput" });
    expect(parseJson("{bad")).toEqual({ ok: false, error: "invalidJson" });
    const parsed = parseJson('{"a":1}');
    expect(parsed).toEqual({ ok: true, data: { a: 1 } });
    const str = stringifyJson({ a: 1 });
    expect(str).toEqual({ ok: true, data: '{\n  "a": 1\n}' });
  });
});

describe("yaml helpers", () => {
  it("parses and stringifies YAML", () => {
    const parsed = parseYaml("a: 1\nb: true\n");
    expect(parsed).toEqual({ ok: true, data: { a: 1, b: true } });
    expect(parseYaml(":\n- broken").ok).toBe(false);
    const str = stringifyYaml({ a: 1 });
    expect(str.ok).toBe(true);
    if (str.ok) expect(str.data.trim()).toBe("a: 1");
  });
});

describe("xml helpers", () => {
  it("serializes objects and arrays to XML", () => {
    const res = stringifyXml({ users: [{ name: "Ali" }, { name: "Sara" }] });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data).toContain("<?xml version=\"1.0\"");
      expect(res.data).toContain("<users>");
      expect(res.data).toContain("<name>Ali</name>");
      expect(res.data).toContain("</users>");
    }
  });

  it("escapes special characters in values", () => {
    const res = stringifyXml({ title: "a & b < c" });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data).toContain("<title>a &amp; b &lt; c</title>");
  });

  it("rejects invalid root names", () => {
    expect(stringifyXml({ a: 1 }, "bad name").ok).toBe(false);
  });

  it("parses XML via an injected parser", () => {
    const fakeParser = () => ({
      root: {
        tag: "root",
        text: "",
        children: [
          { tag: "item", text: "", children: [{ tag: "name", text: "Ali", children: [] }] },
          { tag: "item", text: "", children: [{ tag: "name", text: "Sara", children: [] }] },
        ],
      },
      hasError: false,
    });
    const res = parseXml("<root>ignored</root>", fakeParser);
    expect(res).toEqual({ ok: true, data: { item: [{ name: "Ali" }, { name: "Sara" }] } });
  });

  it("fails gracefully when DOMParser is unavailable (node env)", () => {
    expect(parseXml("<root><a>1</a></root>").ok).toBe(false);
  });
});

describe("xmlNodeToValue", () => {
  it("maps element trees to plain objects", () => {
    const node = {
      tag: "person",
      text: "",
      children: [
        { tag: "name", text: "Ali", children: [] },
        { tag: "age", text: "30", children: [] },
      ],
    };
    expect(xmlNodeToValue(node)).toEqual({ name: "Ali", age: 30 });
  });

  it("groups repeated siblings into arrays", () => {
    const node = {
      tag: "root",
      text: "",
      children: [
        { tag: "tag", text: "a", children: [] },
        { tag: "tag", text: "b", children: [] },
      ],
    };
    expect(xmlNodeToValue(node)).toEqual({ tag: ["a", "b"] });
  });

  it("coerces booleans and numbers from text", () => {
    expect(xmlNodeToValue({ tag: "x", text: "true", children: [] })).toBe(true);
    expect(xmlNodeToValue({ tag: "x", text: "42", children: [] })).toBe(42);
    expect(xmlNodeToValue({ tag: "x", text: "abc", children: [] })).toBe("abc");
  });
});

describe("convertData", () => {
  it("converts JSON to CSV", () => {
    const res = convertData("json", "csv", '[{"name":"Ali","age":30}]');
    expect(res).toEqual({ ok: true, data: "name,age\nAli,30" });
  });

  it("converts CSV to JSON", () => {
    const res = convertData("csv", "json", "name,age\nAli,30");
    expect(res).toEqual({ ok: true, data: '[\n  {\n    "name": "Ali",\n    "age": "30"\n  }\n]' });
  });

  it("converts JSON to YAML and back", () => {
    const yaml = convertData("json", "yaml", '[{"a":1},{"a":2}]');
    expect(yaml.ok).toBe(true);
    if (yaml.ok) {
      expect(yaml.data.trim()).toBe("- a: 1\n- a: 2");
      const back = convertData("yaml", "json", yaml.data);
      expect(back).toEqual({ ok: true, data: '[\n  {\n    "a": 1\n  },\n  {\n    "a": 2\n  }\n]' });
    }
  });

  it("converts TSV to CSV", () => {
    const res = convertData("tsv", "csv", "name\tage\nAli\t30");
    expect(res).toEqual({ ok: true, data: "name,age\nAli,30" });
  });

  it("converts JSON to XML and TSV rejects non-tabular data", () => {
    const xml = convertData("json", "xml", '{"name":"Ali","age":30}');
    expect(xml.ok).toBe(true);
    if (xml.ok) expect(xml.data).toContain("<name>Ali</name>");
    const bad = convertData("json", "tsv", '{"name":"Ali"}');
    expect(bad).toEqual({ ok: false, error: "notTabular" });
  });

  it("propagates parse errors", () => {
    expect(convertData("json", "csv", "not json")).toEqual({ ok: false, error: "invalidJson" });
    expect(convertData("yaml", "json", "a: [broken")).toEqual({ ok: false, error: "invalidYaml" });
  });
});

describe("countRows", () => {
  it("counts arrays, objects, and scalars", () => {
    expect(countRows([1, 2, 3])).toBe(3);
    expect(countRows({ a: 1, b: 2 })).toBe(2);
    expect(countRows("x")).toBe(1);
  });
});

describe("wrapText", () => {
  it("wraps words into lines under the char budget", () => {
    const lines = wrapText("one two three four five six", 10, 2);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("one two");
    expect(lines[1]).toContain("three");
    expect(lines[1]).toMatch(/\.\.\.$/);
  });

  it("returns empty for blank input", () => {
    expect(wrapText("   ", 10, 3)).toEqual([]);
  });

  it("keeps short text on one line", () => {
    expect(wrapText("hello world", 30, 3)).toEqual(["hello world"]);
  });

  it("does not exceed maxLines", () => {
    const lines = wrapText("a b c d e f g h", 1, 3);
    expect(lines.length).toBeLessThanOrEqual(3);
  });
});

describe("hexToRgb", () => {
  it("parses 6-digit hex", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("parses 3-digit hex and falls back on garbage", () => {
    expect(hexToRgb("#0f0")).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb("nope")).toEqual({ r: 17, g: 24, b: 39 });
  });
});

describe("getPreset", () => {
  it("returns the matching preset or the first as fallback", () => {
    expect(getPreset("youtube")).toEqual(THUMBNAIL_PRESETS[0]);
    expect(getPreset("story")).toEqual(expect.objectContaining({ id: "story", width: 1080, height: 1920 }));
    expect(getPreset("unknown")).toBe(THUMBNAIL_PRESETS[0]);
  });
});
