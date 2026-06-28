import { describe, expect, it } from "vitest";
import {
  addDaysToDateString,
  formatDate,
  getTodayDateString,
} from "./utils";

describe("date utils", () => {
  it("getTodayDateString returns YYYY-MM-DD", () => {
    expect(getTodayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("addDaysToDateString shifts dates", () => {
    expect(addDaysToDateString("2026-06-01", 3)).toBe("2026-06-04");
  });

  it("formatDate renders Korean locale", () => {
    expect(formatDate("2026-06-01")).toContain("2026");
  });
});
