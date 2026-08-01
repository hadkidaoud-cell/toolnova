import { describe, it, expect } from "vitest";
import { parseInBase, convertBase } from "@/lib/number-base";

describe("parseInBase", () => {
  it("parses decimal", () => {
    expect(parseInBase("255", 10)).toBe(255n);
    expect(parseInBase("0", 10)).toBe(0n);
  });

  it("parses binary regardless of leading 0b", () => {
    expect(parseInBase("1010", 2)).toBe(10n);
    expect(parseInBase("0b1010", 2)).toBe(10n);
  });

  it("parses octal regardless of leading 0o", () => {
    expect(parseInBase("17", 8)).toBe(15n);
    expect(parseInBase("0o17", 8)).toBe(15n);
  });

  it("parses hexadecimal with optional 0x prefix and case", () => {
    expect(parseInBase("ff", 16)).toBe(255n);
    expect(parseInBase("0xFF", 16)).toBe(255n);
    expect(parseInBase("ABC", 16)).toBe(2748n);
  });

  it("trims surrounding whitespace", () => {
    expect(parseInBase("  255  ", 10)).toBe(255n);
  });

  it("handles very large numbers without precision loss", () => {
    expect(parseInBase("18446744073709551616", 10)).toBe(18446744073709551616n);
  });

  it("rejects digits outside the base", () => {
    expect(() => parseInBase("2", 2)).toThrow();
    expect(() => parseInBase("9", 8)).toThrow();
    expect(() => parseInBase("G", 16)).toThrow();
    expect(() => parseInBase("ff", 10)).toThrow();
  });

  it("rejects empty input", () => {
    expect(() => parseInBase("", 10)).toThrow();
    expect(() => parseInBase("   ", 10)).toThrow();
  });
});

describe("convertBase", () => {
  it("converts between bases", () => {
    expect(convertBase("1010", 2, 16)).toBe("A");
    expect(convertBase("255", 10, 16)).toBe("FF");
    expect(convertBase("FF", 16, 2)).toBe("11111111");
    expect(convertBase("17", 8, 10)).toBe("15");
  });

  it("keeps huge values exact across bases", () => {
    expect(convertBase("18446744073709551616", 10, 16)).toBe("10000000000000000");
  });
});
