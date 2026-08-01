import { describe, it, expect } from "vitest";
import { renderInline, mdToHtml } from "@/lib/markdown";

describe("renderInline", () => {
  it("escapes HTML special characters", () => {
    expect(renderInline("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("renders bold, italic, inline code and links", () => {
    expect(renderInline("**bold**")).toBe("<strong>bold</strong>");
    expect(renderInline("*em*")).toBe("<em>em</em>");
    expect(renderInline("`code`")).toBe("<code>code</code>");
    expect(renderInline("[site](https://example.com)")).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a>',
    );
  });

  it("combines inline styles", () => {
    expect(renderInline("**a** and *b*")).toBe("<strong>a</strong> and <em>b</em>");
  });

  it("keeps code content escaped", () => {
    expect(renderInline("`a<b`")).toBe("<code>a&lt;b</code>");
  });
});

describe("mdToHtml", () => {
  it("renders an empty string to empty output", () => {
    expect(mdToHtml("")).toBe("");
  });

  it("renders headings with their level", () => {
    expect(mdToHtml("# Hello")).toBe("<h1>Hello</h1>");
    expect(mdToHtml("## Sub")).toBe("<h2>Sub</h2>");
    expect(mdToHtml("# **Hi**")).toBe("<h1><strong>Hi</strong></h1>");
  });

  it("renders paragraphs", () => {
    expect(mdToHtml("plain")).toBe("<p>plain</p>");
    expect(mdToHtml("**bold**")).toBe("<p><strong>bold</strong></p>");
  });

  it("renders unordered and ordered lists", () => {
    expect(mdToHtml("- a\n- b")).toBe("<ul>\n<li>a</li>\n<li>b</li>\n</ul>");
    expect(mdToHtml("* x\n* y")).toBe("<ul>\n<li>x</li>\n<li>y</li>\n</ul>");
    expect(mdToHtml("1. a\n2. b")).toBe("<ol>\n<li>a</li>\n<li>b</li>\n</ol>");
  });

  it("renders blockquotes and horizontal rules", () => {
    expect(mdToHtml("> quote")).toBe("<blockquote><p>quote</p></blockquote>");
    expect(mdToHtml("---")).toBe("<hr />");
  });

  it("renders fenced code blocks without inline processing", () => {
    expect(mdToHtml("```\nconst x = 1;\n```")).toBe("<pre><code>const x = 1;</code></pre>");
    expect(mdToHtml("```\n<b>raw</b>\n```")).toBe("<pre><code>&lt;b&gt;raw&lt;/b&gt;</code></pre>");
  });

  it("escapes dangerous HTML in text", () => {
    expect(mdToHtml("<script>alert('x')</script>")).toBe("<p>&lt;script&gt;alert('x')&lt;/script&gt;</p>");
  });

  it("handles a mixed document", () => {
    const md = "# Title\n\nSome *text*.\n\n- item 1\n- item 2";
    expect(mdToHtml(md)).toBe(
      "<h1>Title</h1>\n<p>Some <em>text</em>.</p>\n<ul>\n<li>item 1</li>\n<li>item 2</li>\n</ul>",
    );
  });
});
