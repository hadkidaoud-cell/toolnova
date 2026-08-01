import { describe, it, expect } from "vitest";
import { computeDiff, computeAge } from "@/lib/date-math";

describe("computeDiff", () => {
  it("returns zero for identical dates", () => {
    expect(computeDiff("2024-01-01", "2024-01-01")).toEqual({
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      valid: true,
    });
  });

  it("computes a full calendar year span", () => {
    expect(computeDiff("2024-01-01", "2024-12-31")).toEqual({
      years: 0,
      months: 11,
      days: 30,
      totalDays: 365,
      totalWeeks: 52,
      valid: true,
    });
  });

  it("borrows a day across a leap-year February", () => {
    expect(computeDiff("2024-01-31", "2024-03-01")).toEqual({
      years: 0,
      months: 1,
      days: 1,
      totalDays: 30,
      totalWeeks: 4,
      valid: true,
    });
  });

  it("borrows a day across a non-leap February", () => {
    expect(computeDiff("2023-01-31", "2023-03-01")).toEqual({
      years: 0,
      months: 1,
      days: 1,
      totalDays: 29,
      totalWeeks: 4,
      valid: true,
    });
  });

  it("does not overstate months for a sub-month span", () => {
    expect(computeDiff("2024-01-15", "2024-02-10").years).toBe(0);
    expect(computeDiff("2024-01-15", "2024-02-10").months).toBe(0);
    expect(computeDiff("2024-01-15", "2024-02-10").days).toBe(26);
  });

  it("handles a year boundary", () => {
    expect(computeDiff("2023-12-31", "2024-01-01").days).toBe(1);
    expect(computeDiff("2023-12-31", "2024-01-01").years).toBe(0);
    expect(computeDiff("2023-12-31", "2024-01-01").months).toBe(0);
  });

  it("decomposes a multi-year span", () => {
    expect(computeDiff("2000-01-01", "2026-08-01")).toMatchObject({
      years: 26,
      months: 7,
      days: 0,
      valid: true,
    });
  });

  it("flags reversed ranges as invalid", () => {
    expect(computeDiff("2024-05-01", "2024-01-01").valid).toBe(false);
  });

  it("flags missing dates as invalid", () => {
    expect(computeDiff("", "2024-01-01").valid).toBe(false);
    expect(computeDiff("2024-01-01", "").valid).toBe(false);
  });
});

describe("computeAge", () => {
  it("computes age in years, months and days", () => {
    expect(computeAge("1990-01-10", "2026-08-01")).toMatchObject({
      years: 36,
      months: 6,
      days: 22,
      totalDays: 13352,
      totalWeeks: 1907,
      valid: true,
    });
  });

  it("counts down to the next birthday within the same year", () => {
    expect(computeAge("1990-12-25", "2026-08-01")).toMatchObject({
      years: 35,
      months: 7,
      days: 7,
      nextBirthdayDays: 146,
      valid: true,
    });
  });

  it("counts down to a next birthday in the following year", () => {
    expect(computeAge("1990-01-10", "2026-08-01").nextBirthdayDays).toBe(162);
  });

  it("treats leap-day births as having their birthday on Feb 28 in common years", () => {
    expect(computeAge("2000-02-29", "2026-02-28")).toMatchObject({
      years: 26,
      months: 0,
      days: 0,
      valid: true,
    });
  });

  it("flags a birth date after the reference date as invalid", () => {
    expect(computeAge("2026-08-02", "2026-08-01").valid).toBe(false);
    expect(computeAge("", "2026-08-01").valid).toBe(false);
  });
});
