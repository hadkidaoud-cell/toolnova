import { describe, it, expect } from "vitest";
import { md5 } from "@/lib/md5";

describe("md5", () => {
  it("returns the RFC 1321 test suite vectors", () => {
    expect(md5("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(md5("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
    expect(md5("message digest")).toBe("f96b697d7cb7938d525a2f31aaf161d0");
    expect(md5("abcdefghijklmnopqrstuvwxyz")).toBe("c3fcd3d76192e4007dfb496cca67e13b");
    expect(md5("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")).toBe(
      "d174ab98d277d9f5a5611c2c9f419d9f",
    );
    expect(md5("12345678901234567890123456789012345678901234567890123456789012345678901234567890")).toBe(
      "57edf4a22be3c955ac49da2e2107b67a",
    );
  });

  it("matches the well-known fox vector", () => {
    expect(md5("The quick brown fox jumps over the lazy dog")).toBe("9e107d9d372bb6826bd81d3542a419d6");
  });

  it("hashes UTF-8 multibyte input correctly", () => {
    expect(md5("مرحبا")).toBe("9530db02d3c8217be00c1aa98ec51861");
    expect(md5("héllo wörld")).toBe("ed0c22cc110ede12327851863c078138");
    expect(md5("中文測試")).toBe("f0bdbd759b79510bd10ff82995ac456b");
    expect(md5("😀 emoji + café")).toBe("4c27bcd3a44b2f1194eac77c50c87566");
  });
});
