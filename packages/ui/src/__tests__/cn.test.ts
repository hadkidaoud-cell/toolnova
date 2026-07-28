import { describe, it, expect } from "vitest";
import { cn } from "../utils/classnames";

describe("cn", () => {
  it("should join class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should filter out falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("should return empty string for no truthy values", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("should handle a single class", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("should return empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});
