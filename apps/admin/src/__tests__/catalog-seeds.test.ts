import { describe, expect, it } from "vitest";
import { CATEGORY_SEED, TOOL_SEED } from "@/lib/tool-seed";

const ALLOWED_BADGES = ["new", "ai", "popular", "recommended"];

describe("catalog seeds", () => {
  it("has categories and tools", () => {
    expect(CATEGORY_SEED.length).toBeGreaterThan(0);
    expect(TOOL_SEED.length).toBeGreaterThan(0);
  });

  it("has unique category slugs", () => {
    const slugs = CATEGORY_SEED.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique tool slugs", () => {
    const slugs = TOOL_SEED.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("references only known categories", () => {
    const categorySlugs = new Set(CATEGORY_SEED.map((c) => c.slug));
    for (const tool of TOOL_SEED) {
      expect(categorySlugs.has(tool.category), `unknown category for ${tool.slug}`).toBe(true);
    }
  });

  it("uses only valid badges", () => {
    for (const tool of TOOL_SEED) {
      for (const badge of tool.badges) {
        expect(ALLOWED_BADGES, `invalid badge "${badge}" on ${tool.slug}`).toContain(badge);
      }
    }
  });

  it("has positive time and uses for every tool", () => {
    for (const tool of TOOL_SEED) {
      expect(tool.time, tool.slug).toBeGreaterThan(0);
      expect(tool.uses, tool.slug).toBeGreaterThanOrEqual(0);
    }
  });

  it("keeps slugs URL-safe", () => {
    for (const tool of TOOL_SEED) {
      expect(tool.slug, tool.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
