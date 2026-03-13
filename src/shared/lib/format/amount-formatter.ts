import { resolveIntlLocale } from "@/shared/lib/format/intl-locale";

export function formatAmount(value: number, currencyCode: string, locale?: string) {
  const resolvedLocale = resolveIntlLocale(locale);

  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTransactionAmount(
  value: number,
  isIncome: boolean,
  currencyCode: string,
  locale?: string,
) {
  const prefix = isIncome ? "+" : "-";
  return `${prefix}${formatAmount(Math.abs(value), currencyCode, locale)}`;
}
