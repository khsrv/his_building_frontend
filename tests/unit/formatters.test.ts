import { describe, expect, it } from "vitest";
import { formatAmount, formatTransactionAmount } from "@/shared/lib/format/amount-formatter";
import { formatDateFull, formatTransactionDate } from "@/shared/lib/format/date-formatter";

describe("formatters", () => {
  it("formats amount with currency", () => {
    const output = formatAmount(1250, "USD", "en");
    expect(output).toContain("$");
  });

  it("formats transaction amount sign", () => {
    const income = formatTransactionAmount(120, true, "USD", "en");
    const expense = formatTransactionAmount(120, false, "USD", "en");

    expect(income.startsWith("+")).toBe(true);
    expect(expense.startsWith("-")).toBe(true);
  });

  it("formats full date", () => {
    const output = formatDateFull(new Date("2026-03-11T10:00:00.000Z"), "ru");
    expect(output.length).toBeGreaterThan(4);
  });

  it("formats transaction date shortcut", () => {
    const output = formatTransactionDate(new Date(), "en");
    expect(output.toLowerCase()).toContain("today");
  });
});
