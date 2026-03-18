"use client";

import {
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppPageHeader,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { ExchangeRate } from "@/shared/types/entities";

// ─── Mock data ──────────────────────────────────────────────────────────────
// TODO: replace with real API hook (e.g. useExchangeRatesQuery)

const MOCK_RATES: readonly ExchangeRate[] = [
  { id: "r1", tenantId: "t1", date: "2026-03-17", fromCurrency: "USD", toCurrency: "TJS", rate: 10.92 },
  { id: "r2", tenantId: "t1", date: "2026-03-17", fromCurrency: "EUR", toCurrency: "TJS", rate: 11.85 },
  { id: "r3", tenantId: "t1", date: "2026-03-17", fromCurrency: "RUB", toCurrency: "TJS", rate: 0.122 },
  { id: "r4", tenantId: "t1", date: "2026-03-17", fromCurrency: "USD", toCurrency: "RUB", rate: 89.5 },
  { id: "r5", tenantId: "t1", date: "2026-03-17", fromCurrency: "EUR", toCurrency: "USD", rate: 1.085 },
  { id: "r6", tenantId: "t1", date: "2026-03-16", fromCurrency: "USD", toCurrency: "TJS", rate: 10.90 },
  { id: "r7", tenantId: "t1", date: "2026-03-16", fromCurrency: "EUR", toCurrency: "TJS", rate: 11.82 },
  { id: "r8", tenantId: "t1", date: "2026-03-16", fromCurrency: "RUB", toCurrency: "TJS", rate: 0.121 },
] as const;

// ─── Columns ────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<ExchangeRate>[] = [
  {
    id: "date",
    header: "Дата",
    cell: (row) => row.date,
    sortAccessor: (row) => row.date,
  },
  {
    id: "pair",
    header: "Пара",
    cell: (row) => `${row.fromCurrency} / ${row.toCurrency}`,
    sortAccessor: (row) => `${row.fromCurrency}/${row.toCurrency}`,
    searchAccessor: (row) => `${row.fromCurrency} ${row.toCurrency}`,
  },
  {
    id: "rate",
    header: "Курс",
    cell: (row) => row.rate.toFixed(4),
    sortAccessor: (row) => row.rate,
    align: "right",
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ExchangeRatesPage() {
  // TODO: replace with real API hook
  const data = MOCK_RATES;

  return (
    <main className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Курсы валют"
            subtitle="TJS / USD / RUB / EUR"
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "finance", label: "Финансы", href: routes.finance },
              { id: "exchange-rates", label: "Курсы валют" },
            ]}
          />
        }
        content={
          <AppDataTable<ExchangeRate>
            data={data}
            columns={columns}
            rowKey={(row) => row.id}
            title="Курсы валют"
            searchPlaceholder="Поиск по валюте..."
            enableSettings
          />
        }
      />
    </main>
  );
}
