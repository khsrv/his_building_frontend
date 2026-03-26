"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Stack } from "@mui/material";
import {
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppSelect,
  AppInput,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { IconWallet, IconIncome, IconExpense, IconCategory } from "@/shared/ui/icons/kpi-icons";
import { routes } from "@/shared/constants/routes";
import { useAccountDetailQuery } from "@/modules/finance/presentation/hooks/use-account-detail-query";
import { useTransactionsQuery } from "@/modules/finance/presentation/hooks/use-transactions-query";
import { useExpenseCategoriesQuery } from "@/modules/finance/presentation/hooks/use-expense-categories-query";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import type {
  Transaction,
  TransactionType,
  TransactionListParams,
  AccountType,
} from "@/modules/finance/domain/finance";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank_account: "Банковский счёт",
  cash_register: "Касса",
  mobile_wallet: "Мобильный кошелёк",
};

const TYPE_LABELS: Record<TransactionType, string> = {
  income: "Доход",
  expense: "Расход",
  transfer: "Перевод",
};

const TYPE_TONES: Record<TransactionType, AppStatusTone> = {
  income: "success",
  expense: "danger",
  transfer: "info",
};

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "Все типы" },
  { value: "income", label: "Доход" },
  { value: "expense", label: "Расход" },
  { value: "transfer", label: "Перевод" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(
  amount: number,
  currency: string,
  type: TransactionType,
): string {
  const sign = type === "income" ? "+" : type === "expense" ? "−" : "";
  return `${sign}${amount.toLocaleString("ru-RU")} ${currency}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU");
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<Transaction>[] = [
  {
    id: "transactionDate",
    header: "Дата",
    cell: (row) => formatDate(row.transactionDate),
    sortAccessor: (row) => row.transactionDate,
  },
  {
    id: "type",
    header: "Тип",
    cell: (row) => (
      <AppStatusBadge
        label={TYPE_LABELS[row.type]}
        tone={TYPE_TONES[row.type]}
      />
    ),
    sortAccessor: (row) => row.type,
  },
  {
    id: "description",
    header: "Описание",
    cell: (row) => row.description,
    searchAccessor: (row) => row.description,
  },
  {
    id: "categoryName",
    header: "Категория",
    cell: (row) => row.categoryName ?? "—",
    searchAccessor: (row) => row.categoryName ?? "",
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
        {formatAmount(row.amount, row.currency, row.type)}
      </span>
    ),
    sortAccessor: (row) => row.amount,
    align: "right",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Filters
  const [filterType, setFilterType] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  // Queries
  const {
    data: account,
    isLoading: isAccountLoading,
    isError: isAccountError,
  } = useAccountDetailQuery(id);

  const txParams: TransactionListParams = {
    accountId: id,
    limit: 200,
    ...(filterType ? { type: filterType as TransactionType } : {}),
    ...(filterDateFrom ? { dateFrom: filterDateFrom } : {}),
    ...(filterDateTo ? { dateTo: filterDateTo } : {}),
  };

  const {
    data: rawTransactions,
    isLoading: isTxLoading,
    isError: isTxError,
  } = useTransactionsQuery(txParams);

  const { data: categories } = useExpenseCategoriesQuery();
  const { data: accounts } = useAccountsQuery();

  // Build lookup maps for name resolution
  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of accounts ?? []) {
      map.set(a.id, a.name);
    }
    return map;
  }, [accounts]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories ?? []) {
      map.set(c.id, c.name);
    }
    return map;
  }, [categories]);

  // Enrich transactions with resolved names
  const transactions = useMemo(() => {
    if (!rawTransactions) return undefined;
    return rawTransactions.map((tx) => ({
      ...tx,
      accountName: accountNameMap.get(tx.accountId) ?? tx.accountName,
      toAccountName: tx.toAccountId
        ? (accountNameMap.get(tx.toAccountId) ?? tx.toAccountName)
        : tx.toAccountName,
      categoryName: tx.categoryId
        ? (categoryNameMap.get(tx.categoryId) ?? tx.categoryName)
        : tx.categoryName,
    }));
  }, [rawTransactions, accountNameMap, categoryNameMap]);

  // KPI calculations
  const income = (transactions ?? [])
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = (transactions ?? [])
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCount = (transactions ?? []).length;

  const isLoading = isAccountLoading || isTxLoading;
  const isError = isAccountError || isTxError;

  const accountTypeLabel = account
    ? ACCOUNT_TYPE_LABELS[account.type]
    : "";

  // ─── Loading / Error ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppStatePanel
          tone="empty"
          title="Загрузка..."
          description="Загружаем данные счёта."
        />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить данные счёта. Попробуйте обновить страницу."
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <AppPageHeader
        title={account?.name ?? "Счёт"}
        subtitle={
          accountTypeLabel +
          (account?.description ? ` · ${account.description}` : "")
        }
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "finance", label: "Финансы", href: routes.finance },
          { id: "accounts", label: "Счета", href: routes.financeAccounts },
          { id: "detail", label: account?.name ?? "Счёт" },
        ]}
      />

      {/* KPI Cards */}
      <AppKpiGrid
        columns={4}
        items={[
          {
            title: "Текущий баланс",
            value: `${(account?.balance ?? 0).toLocaleString("ru-RU")} ${account?.currency ?? ""}`,
            icon: <IconWallet />,
          },
          {
            title: "Доходы за период",
            value: `${income.toLocaleString("ru-RU")} ${account?.currency ?? ""}`,
            deltaTone: "success",
            icon: <IconIncome />,
          },
          {
            title: "Расходы за период",
            value: `${expense.toLocaleString("ru-RU")} ${account?.currency ?? ""}`,
            deltaTone: "danger",
            icon: <IconExpense />,
          },
          {
            title: "Операций",
            value: String(totalCount),
            icon: <IconCategory />,
          },
        ]}
      />

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
        <Box sx={{ minWidth: 160 }}>
          <AppSelect
            label="Тип"
            id="filter-type"
            options={TYPE_FILTER_OPTIONS}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
        </Box>
        <Box sx={{ minWidth: 160 }}>
          <AppInput
            label="Дата от"
            type="date"
            value={filterDateFrom}
            onChangeValue={setFilterDateFrom}
          />
        </Box>
        <Box sx={{ minWidth: 160 }}>
          <AppInput
            label="Дата до"
            type="date"
            value={filterDateTo}
            onChangeValue={setFilterDateTo}
          />
        </Box>
      </Stack>

      {/* Transactions Table */}
      <AppDataTable<Transaction>
        data={transactions ?? []}
        columns={columns}
        rowKey={(row) => row.id}
        title="Операции по счёту"
        searchPlaceholder="Поиск по описанию, категории..."
        enableExport
        enableSettings
      />
    </main>
  );
}
