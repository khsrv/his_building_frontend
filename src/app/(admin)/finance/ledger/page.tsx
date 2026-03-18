"use client";

import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { FinanceEntry } from "@/shared/types/entities";
import { CURRENCY_CONFIG } from "@/shared/types/enums";

// ─── Type helpers ───────────────────────────────────────────────────────────

const ENTRY_TYPE_LABEL: Record<FinanceEntry["type"], string> = {
  income: "Доход",
  expense: "Расход",
  transfer: "Перевод",
};

const ENTRY_TYPE_TONE: Record<FinanceEntry["type"], AppStatusTone> = {
  income: "success",
  expense: "danger",
  transfer: "info",
};

// ─── Mock data ──────────────────────────────────────────────────────────────
// TODO: replace with real API hook (e.g. useFinanceLedgerQuery)

const MOCK_ENTRIES: readonly FinanceEntry[] = [
  {
    id: "fe1",
    tenantId: "t1",
    date: "2026-03-15",
    type: "income",
    category: "Продажа квартиры",
    amount: 350_000,
    currency: "TJS",
    accountId: "a1",
    accountName: "Основной счёт",
    description: "Оплата по договору №12",
    relatedDealId: "d1",
    createdBy: "Иванов А.",
  },
  {
    id: "fe2",
    tenantId: "t1",
    date: "2026-03-14",
    type: "expense",
    category: "Материалы",
    amount: 45_000,
    currency: "TJS",
    accountId: "a1",
    accountName: "Основной счёт",
    description: "Закупка арматуры",
    relatedDealId: null,
    createdBy: "Петров Б.",
  },
  {
    id: "fe3",
    tenantId: "t1",
    date: "2026-03-13",
    type: "expense",
    category: "Зарплата",
    amount: 120_000,
    currency: "TJS",
    accountId: "a1",
    accountName: "Основной счёт",
    description: "ЗП строителей за февраль",
    relatedDealId: null,
    createdBy: "Иванов А.",
  },
  {
    id: "fe4",
    tenantId: "t1",
    date: "2026-03-12",
    type: "income",
    category: "Рассрочка",
    amount: 50_000,
    currency: "TJS",
    accountId: "a2",
    accountName: "Касса",
    description: "Рассрочка #2 по договору №8",
    relatedDealId: "d2",
    createdBy: "Сидоров В.",
  },
  {
    id: "fe5",
    tenantId: "t1",
    date: "2026-03-10",
    type: "transfer",
    category: "Перевод",
    amount: 200_000,
    currency: "TJS",
    accountId: "a1",
    accountName: "Основной счёт",
    description: "Перевод из кассы на расчётный счёт",
    relatedDealId: null,
    createdBy: "Иванов А.",
  },
  {
    id: "fe6",
    tenantId: "t1",
    date: "2026-03-08",
    type: "expense",
    category: "Маркетинг",
    amount: 15_000,
    currency: "TJS",
    accountId: "a2",
    accountName: "Касса",
    description: "Рекламная кампания в соцсетях",
    relatedDealId: null,
    createdBy: "Петров Б.",
  },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: FinanceEntry["currency"]): string {
  const cfg = CURRENCY_CONFIG[currency];
  return `${amount.toLocaleString("ru-RU")} ${cfg.symbol}`;
}

// ─── Columns ────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<FinanceEntry>[] = [
  {
    id: "date",
    header: "Дата",
    cell: (row) => row.date,
    sortAccessor: (row) => row.date,
  },
  {
    id: "type",
    header: "Тип",
    cell: (row) => (
      <AppStatusBadge
        label={ENTRY_TYPE_LABEL[row.type]}
        tone={ENTRY_TYPE_TONE[row.type]}
      />
    ),
    sortAccessor: (row) => row.type,
  },
  {
    id: "category",
    header: "Категория",
    cell: (row) => row.category,
    searchAccessor: (row) => row.category,
  },
  {
    id: "amount",
    header: "Сумма",
    cell: (row) => formatAmount(row.amount, row.currency),
    sortAccessor: (row) => row.amount,
    align: "right",
  },
  {
    id: "accountName",
    header: "Счёт",
    cell: (row) => row.accountName,
    searchAccessor: (row) => row.accountName,
  },
  {
    id: "description",
    header: "Описание",
    cell: (row) => row.description,
    searchAccessor: (row) => row.description,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function FinanceLedgerPage() {
  // TODO: replace with real API hook
  const data = MOCK_ENTRIES;

  const income = data
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const expense = data
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = income - expense;

  return (
    <main className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Журнал операций"
            subtitle={`${data.length} записей`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "finance", label: "Финансы", href: routes.finance },
              { id: "ledger", label: "Журнал" },
            ]}
            actions={
              <AppButton label="Новая операция" variant="primary" size="md" />
            }
          />
        }
        filters={
          <AppKpiGrid
            columns={3}
            items={[
              { title: "Доходы", value: `${income.toLocaleString("ru-RU")} SM`, deltaTone: "success" },
              { title: "Расходы", value: `${expense.toLocaleString("ru-RU")} SM`, deltaTone: "danger" },
              { title: "Баланс", value: `${balance.toLocaleString("ru-RU")} SM`, deltaTone: balance >= 0 ? "success" : "danger" },
            ]}
          />
        }
        content={
          <AppDataTable<FinanceEntry>
            data={data}
            columns={columns}
            rowKey={(row) => row.id}
            title="Операции"
            searchPlaceholder="Поиск по категории, счёту или описанию..."
            enableExport
            enableSettings
          />
        }
      />
    </main>
  );
}
