"use client";

import {
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppPageHeader,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { FinanceAccount } from "@/shared/types/entities";
import { CURRENCY_CONFIG } from "@/shared/types/enums";

// ─── Helpers ────────────────────────────────────────────────────────────────

const ACCOUNT_TYPE_LABEL: Record<FinanceAccount["type"], string> = {
  bank: "Банковский",
  cash: "Наличные",
};

const ACCOUNT_TYPE_TONE: Record<FinanceAccount["type"], AppStatusTone> = {
  bank: "info",
  cash: "warning",
};

function formatBalance(balance: number, currency: FinanceAccount["currency"]): string {
  const cfg = CURRENCY_CONFIG[currency];
  return `${balance.toLocaleString("ru-RU")} ${cfg.symbol}`;
}

// ─── Mock data ──────────────────────────────────────────────────────────────
// TODO: replace with real API hook (e.g. useFinanceAccountsQuery)

const MOCK_ACCOUNTS: readonly FinanceAccount[] = [
  {
    id: "a1",
    tenantId: "t1",
    name: "Основной расчётный счёт",
    type: "bank",
    currency: "TJS",
    balance: 2_450_000,
    isActive: true,
  },
  {
    id: "a2",
    tenantId: "t1",
    name: "Касса офис",
    type: "cash",
    currency: "TJS",
    balance: 85_000,
    isActive: true,
  },
  {
    id: "a3",
    tenantId: "t1",
    name: "Валютный счёт USD",
    type: "bank",
    currency: "USD",
    balance: 120_000,
    isActive: true,
  },
  {
    id: "a4",
    tenantId: "t1",
    name: "Старый расчётный счёт",
    type: "bank",
    currency: "TJS",
    balance: 0,
    isActive: false,
  },
] as const;

// ─── Columns ────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<FinanceAccount>[] = [
  {
    id: "name",
    header: "Название",
    cell: (row) => row.name,
    sortAccessor: (row) => row.name,
    searchAccessor: (row) => row.name,
  },
  {
    id: "type",
    header: "Тип",
    cell: (row) => (
      <AppStatusBadge
        label={ACCOUNT_TYPE_LABEL[row.type]}
        tone={ACCOUNT_TYPE_TONE[row.type]}
      />
    ),
    sortAccessor: (row) => row.type,
  },
  {
    id: "currency",
    header: "Валюта",
    cell: (row) => CURRENCY_CONFIG[row.currency].label,
    sortAccessor: (row) => row.currency,
  },
  {
    id: "balance",
    header: "Баланс",
    cell: (row) => formatBalance(row.balance, row.currency),
    sortAccessor: (row) => row.balance,
    align: "right",
  },
  {
    id: "isActive",
    header: "Активен",
    cell: (row) => (
      <AppStatusBadge
        label={row.isActive ? "Да" : "Нет"}
        tone={row.isActive ? "success" : "muted"}
      />
    ),
    sortAccessor: (row) => (row.isActive ? 1 : 0),
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function FinanceAccountsPage() {
  // TODO: replace with real API hook
  const data = MOCK_ACCOUNTS;

  return (
    <main className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Счета"
            subtitle={`${data.length} счетов`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "finance", label: "Финансы", href: routes.finance },
              { id: "accounts", label: "Счета" },
            ]}
          />
        }
        content={
          <AppDataTable<FinanceAccount>
            data={data}
            columns={columns}
            rowKey={(row) => row.id}
            title="Счета"
            searchPlaceholder="Поиск по названию..."
            enableSettings
          />
        }
      />
    </main>
  );
}
