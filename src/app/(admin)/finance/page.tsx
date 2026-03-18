"use client";

import Link from "next/link";
import { Box, Stack } from "@mui/material";
import {
  AppButton,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { useTransactionsQuery } from "@/modules/finance/presentation/hooks/use-transactions-query";
import { usePayableRemindersQuery } from "@/modules/finance/presentation/hooks/use-payable-reminders-query";
import type { Transaction, TransactionType } from "@/modules/finance/domain/finance";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  income: "Доход",
  expense: "Расход",
  transfer: "Перевод",
};

const TRANSACTION_TYPE_TONE: Record<TransactionType, AppStatusTone> = {
  income: "success",
  expense: "danger",
  transfer: "info",
};

function isOverdue(dueDate: string, status: string): boolean {
  return status === "pending" && new Date(dueDate) < new Date();
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

const recentColumns: readonly AppDataTableColumn<Transaction>[] = [
  {
    id: "transactionDate",
    header: "Дата",
    cell: (row) => row.transactionDate.slice(0, 10),
    sortAccessor: (row) => row.transactionDate,
  },
  {
    id: "type",
    header: "Тип",
    cell: (row) => (
      <AppStatusBadge
        label={TRANSACTION_TYPE_LABEL[row.type]}
        tone={TRANSACTION_TYPE_TONE[row.type]}
      />
    ),
  },
  {
    id: "description",
    header: "Описание",
    cell: (row) => row.description,
    searchAccessor: (row) => row.description,
  },
  {
    id: "amount",
    header: "Сумма",
    cell: (row) => (
      <span
        style={{
          color:
            row.type === "income"
              ? "var(--color-success, #16a34a)"
              : row.type === "expense"
                ? "var(--color-danger, #dc2626)"
                : undefined,
          fontWeight: 600,
        }}
      >
        {formatMoney(row.amount, row.currency)}
      </span>
    ),
    sortAccessor: (row) => row.amount,
    align: "right",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const { data: accounts } = useAccountsQuery();
  const { data: transactions, isLoading: txLoading } = useTransactionsQuery({ limit: 5 });
  const { data: reminders } = usePayableRemindersQuery({ status: "pending" });

  // Compute totals per currency
  const balanceByCurrency = (accounts ?? []).reduce<Record<string, number>>((acc, acct) => {
    const prev = acc[acct.currency] ?? 0;
    return { ...acc, [acct.currency]: prev + acct.balance };
  }, {});

  // Overdue reminders count
  const overdueCount = (reminders ?? []).filter((r) => isOverdue(r.dueDate, r.status)).length;

  const summaryItems = [
    ...Object.entries(balanceByCurrency).map(([currency, total]) => ({
      title: `Баланс ${currency}`,
      value: formatMoney(total, currency),
      deltaTone: "success" as const,
    })),
    {
      title: "Просроченных платежей",
      value: `${overdueCount}`,
      deltaTone: overdueCount > 0 ? ("danger" as const) : ("muted" as const),
    },
  ];

  const recentTransactions = (transactions ?? []).slice(0, 5);

  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Финансы"
        subtitle="Обзор финансовых показателей"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "finance", label: "Финансы" },
        ]}
      />

      {/* Summary KPIs */}
      <AppKpiGrid
        columns={summaryItems.length >= 4 ? 4 : summaryItems.length >= 3 ? 3 : 2}
        items={summaryItems}
      />

      {/* Quick links */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
        <Link href={routes.financeAccounts} passHref>
          <AppButton label="Счета" variant="secondary" size="md" />
        </Link>
        <Link href={routes.financeLedger} passHref>
          <AppButton label="Журнал операций" variant="secondary" size="md" />
        </Link>
        <Link href={routes.financeReports} passHref>
          <AppButton label="Отчёты" variant="secondary" size="md" />
        </Link>
        <Link href={routes.financePayableReminders} passHref>
          <AppButton
            label={overdueCount > 0 ? `Напоминалки (${overdueCount} просрочено)` : "Напоминалки"}
            variant={overdueCount > 0 ? "primary" : "secondary"}
            size="md"
          />
        </Link>
      </Stack>

      {/* Recent transactions */}
      <Box>
        {txLoading && (
          <AppStatePanel tone="empty" title="Загрузка..." description="Загружаем последние операции." />
        )}
        {!txLoading && recentTransactions.length === 0 && (
          <AppStatePanel
            tone="empty"
            title="Нет операций"
            description="Операции ещё не добавлены."
          />
        )}
        {!txLoading && recentTransactions.length > 0 && (
          <AppDataTable<Transaction>
            data={recentTransactions}
            columns={recentColumns}
            rowKey={(row) => row.id}
            title="Последние операции"
            initialPageSize={5}
          />
        )}
      </Box>
    </main>
  );
}
