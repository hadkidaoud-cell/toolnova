import { describe, it, expect } from "vitest";
import { checkFeatureLimit, isFeatureKey, FEATURE_LIMITS } from "@/lib/plans";

describe("checkFeatureLimit", () => {
  it("allows values at or below the free image batch limit and blocks above", () => {
    expect(checkFeatureLimit("imageBatch", 3, "free").allowed).toBe(true);
    expect(checkFeatureLimit("imageBatch", 4, "free").allowed).toBe(false);
  });

  it("raises the image batch limit for pro", () => {
    expect(checkFeatureLimit("imageBatch", 50, "pro").allowed).toBe(true);
    expect(checkFeatureLimit("imageBatch", 51, "pro").allowed).toBe(false);
  });

  it("allows unlimited image batch for enterprise", () => {
    expect(checkFeatureLimit("imageBatch", 100000, "enterprise").allowed).toBe(true);
    expect(checkFeatureLimit("imageBatch", 4, "enterprise").limit).toBeNull();
  });

  it("enforces the free CSV row limit", () => {
    expect(checkFeatureLimit("csvRows", 1000, "free").allowed).toBe(true);
    expect(checkFeatureLimit("csvRows", 1001, "free").allowed).toBe(false);
  });

  it("enforces the free QR size limit", () => {
    expect(checkFeatureLimit("qrMaxSize", 300, "free").allowed).toBe(true);
    expect(checkFeatureLimit("qrMaxSize", 301, "free").allowed).toBe(false);
    expect(checkFeatureLimit("qrMaxSize", 800, "pro").allowed).toBe(true);
  });

  it("blocks SVG export on free and allows on paid plans", () => {
    expect(checkFeatureLimit("qrSvg", 1, "free").allowed).toBe(false);
    expect(checkFeatureLimit("qrSvg", 1, "pro").allowed).toBe(true);
    expect(checkFeatureLimit("qrSvg", 1, "enterprise").allowed).toBe(true);
  });

  it("limits free resume drafts to one", () => {
    expect(checkFeatureLimit("resumeDrafts", 1, "free").allowed).toBe(true);
    expect(checkFeatureLimit("resumeDrafts", 2, "free").allowed).toBe(false);
    expect(checkFeatureLimit("resumeDrafts", 25, "pro").allowed).toBe(true);
    expect(checkFeatureLimit("resumeDrafts", 100, "enterprise").allowed).toBe(true);
  });

  it("reports the plan and limit in the decision", () => {
    const decision = checkFeatureLimit("csvRows", 500, "free");
    expect(decision).toEqual({ allowed: true, limit: 1000, plan: "free" });
  });
});

describe("isFeatureKey", () => {
  it("accepts known features and rejects others", () => {
    expect(isFeatureKey("imageBatch")).toBe(true);
    expect(isFeatureKey("csvRows")).toBe(true);
    expect(isFeatureKey("nope")).toBe(false);
    expect(isFeatureKey(42)).toBe(false);
    expect(isFeatureKey(null)).toBe(false);
  });

  it("covers every key defined in FEATURE_LIMITS", () => {
    for (const key of Object.keys(FEATURE_LIMITS)) {
      expect(isFeatureKey(key)).toBe(true);
    }
  });
});
