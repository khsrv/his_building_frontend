"use client";

import { useMemo, useState } from "react";
import { Box, Stack } from "@mui/material";
import {
  AppButton,
  AppDataTable,
  type AppDataTableColumn,
  AppDrawerForm,
  AppInput,
  AppKpiGrid,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useTransactionsQuery } from "@/modules/finance/presentation/hooks/use-transactions-query";
import { useCreateTransactionMutation } from "@/modules/finance/presentation/hooks/use-create-transaction-mutation";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { useExpenseCategoriesQuery } from "@/modules/finance/presentation/hooks/use-expense-categories-query";
import type {
  Transaction,
  TransactionType,
  TransactionListParams,
} from "@/modules/finance/domain/finance";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "Все типы" },
  { value: "income", label: "Доход" },
  { value: "expense", label: "Расход" },
  { value: "transfer", label: "Перевод" },
] as const;

const TRANSACTION_TYPE_OPTIONS = [
  { value: "income" as TransactionType, label: "Доход" },
  { value: "expense" as TransactionType, label: "Расход" },
  { value: "transfer" as TransactionType, label: "Перевод" },
] as const;

const CURRENCY_OPTIONS = [
  { value: "TJS", label: "TJS — Сомони" },
  { value: "USD", label: "USD — Доллар" },
  { value: "RUB", label: "RUB — Рубль" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string, type: TransactionType): string {
  const sign = type === "income" ? "+" : type === "expense" ? "−" : "";
  return `${sign}${amount.toLocaleString("ru-RU")} ${currency}`;
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
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
        label={TRANSACTION_TYPE_LABEL[row.type]}
        tone={TRANSACTION_TYPE_TONE[row.type]}
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
    id: "accountName",
    header: "Счёт",
    cell: (row) =>
      row.toAccountName
        ? `${row.accountName} → ${row.toAccountName}`
        : row.accountName,
    searchAccessor: (row) => row.accountName,
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
  {
    id: "createdByName",
    header: "Кто создал",
    cell: (row) => row.createdByName,
  },
];

// ─── Form state ───────────────────────────────────────────────────────────────

interface CreateFormState {
  type: TransactionType;
  amount: string;
  currency: string;
  accountId: string;
  toAccountId: string;
  categoryId: string;
  description: string;
  transactionDate: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const INITIAL_FORM: CreateFormState = {
  type: "income",
  amount: "",
  currency: "TJS",
  accountId: "",
  toAccountId: "",
  categoryId: "",
  description: "",
  transactionDate: todayIso(),
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceLedgerPage() {
  // Filters
  const [filterType, setFilterType] = useState<string>("");
  const [filterAccountId, setFilterAccountId] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  const params: TransactionListParams = {
    limit: 100,
    ...(filterType ? { type: filterType as TransactionType } : {}),
    ...(filterAccountId ? { accountId: filterAccountId } : {}),
    ...(filterDateFrom ? { dateFrom: filterDateFrom } : {}),
    ...(filterDateTo ? { dateTo: filterDateTo } : {}),
  };

  const { data: rawTransactions, isLoading, isError } = useTransactionsQuery(params);
  const { data: accounts } = useAccountsQuery();
  const { data: categories } = useExpenseCategoriesQuery();
  const createMutation = useCreateTransactionMutation();

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
      toAccountName: tx.toAccountId ? (accountNameMap.get(tx.toAccountId) ?? tx.toAccountName) : tx.toAccountName,
      categoryName: tx.categoryId ? (categoryNameMap.get(tx.categoryId) ?? tx.categoryName) : tx.categoryName,
    }));
  }, [rawTransactions, accountNameMap, categoryNameMap]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);

  // KPI summary
  const income = (transactions ?? [])
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = (transactions ?? [])
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  const accountOptions = [
    { value: "", label: "Все счета" },
    ...(accounts ?? []).map((a) => ({ value: a.id, label: a.name })),
  ];

  const accountSelectOptions = (accounts ?? []).map((a) => ({ value: a.id, label: a.name }));
  const categorySelectOptions = (categories ?? []).map((c) => ({ value: c.id, label: c.name }));

  function handleOpen() {
    setForm(INITIAL_FORM);
    setDrawerOpen(true);
  }

  function handleClose() {
    setDrawerOpen(false);
  }

  function handleSave() {
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) return;
    if (!form.accountId) return;
    if (!form.description.trim()) return;

    const txInput: import("@/modules/finance/domain/finance").CreateTransactionInput = {
      type: form.type,
      amount,
      currency: form.currency,
      accountId: form.accountId,
      description: form.description.trim(),
      transactionDate: form.transactionDate,
    };
    if (form.type === "transfer" && form.toAccountId) {
      txInput.toAccountId = form.toAccountId;
    }
    if ((form.type === "expense" || form.type === "income") && form.categoryId) {
      txInput.categoryId = form.categoryId;
    }

    createMutation.mutate(
      txInput,
      {
        onSuccess: () => {
          setDrawerOpen(false);
          setForm(INITIAL_FORM);
        },
      },
    );
  }

  const isSaveDisabled =
    !form.amount ||
    isNaN(parseFloat(form.amount)) ||
    parseFloat(form.amount) <= 0 ||
    !form.accountId ||
    !form.description.trim() ||
    createMutation.isPending;

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Журнал операций"
        {...(transactions ? { subtitle: `${transactions.length} записей` } : {})}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "finance", label: "Финансы", href: routes.finance },
          { id: "ledger", label: "Журнал" },
        ]}
        actions={<AppButton label="Новая операция" variant="primary" size="md" onClick={handleOpen} />}
      />

      {/* KPI summary */}
      <AppKpiGrid
        columns={3}
        items={[
          { title: "Доходы (период)", value: `${income.toLocaleString("ru-RU")} сум`, deltaTone: "success" },
          { title: "Расходы (период)", value: `${expense.toLocaleString("ru-RU")} сум`, deltaTone: "danger" },
          {
            title: "Баланс (период)",
            value: `${balance.toLocaleString("ru-RU")} сум`,
            deltaTone: balance >= 0 ? "success" : "danger",
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
        <Box sx={{ minWidth: 180 }}>
          <AppSelect
            label="Счёт"
            id="filter-account"
            options={accountOptions}
            value={filterAccountId}
            onChange={(e) => setFilterAccountId(e.target.value)}
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

      {/* Error */}
      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить список операций. Попробуйте обновить страницу."
        />
      )}

      {/* Loading */}
      {isLoading && (
        <AppStatePanel tone="empty" title="Загрузка..." description="Загружаем список операций." />
      )}

      {/* Table */}
      {!isError && !isLoading && (
        <AppDataTable<Transaction>
          data={transactions ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          title="Операции"
          searchPlaceholder="Поиск по описанию, счёту, категории..."
          enableExport
          enableSettings
        />
      )}

      {/* Create drawer */}
      <AppDrawerForm
        open={drawerOpen}
        title="Новая операция"
        subtitle="Заполните данные операции"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending}
        saveDisabled={isSaveDisabled}
        onClose={handleClose}
        onSave={handleSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppSelect
            label="Тип операции *"
            id="tx-type"
            options={TRANSACTION_TYPE_OPTIONS}
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, type: e.target.value as TransactionType }))
            }
          />
          <AppInput
            label="Сумма *"
            type="number"
            value={form.amount}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, amount: v }))}
            placeholder="0.00"
          />
          <AppSelect
            label="Валюта *"
            id="tx-currency"
            options={CURRENCY_OPTIONS}
            value={form.currency}
            onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
          />
          <AppSelect
            label="Счёт *"
            id="tx-account"
            options={accountSelectOptions}
            value={form.accountId}
            onChange={(e) => setForm((prev) => ({ ...prev, accountId: e.target.value }))}
          />

          {/* Transfer: destination account */}
          {form.type === "transfer" && (
            <AppSelect
              label="Счёт получателя *"
              id="tx-to-account"
              options={accountSelectOptions}
              value={form.toAccountId}
              onChange={(e) => setForm((prev) => ({ ...prev, toAccountId: e.target.value }))}
            />
          )}

          {/* Income / Expense: category */}
          {(form.type === "income" || form.type === "expense") &&
            categorySelectOptions.length > 0 && (
              <AppSelect
                label="Категория"
                id="tx-category"
                options={[{ value: "", label: "Без категории" }, ...categorySelectOptions]}
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              />
            )}

          <AppInput
            label="Описание *"
            value={form.description}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, description: v }))}
            placeholder="Описание операции"
          />
          <AppInput
            label="Дата операции *"
            type="date"
            value={form.transactionDate}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, transactionDate: v }))}
          />
        </Box>
      </AppDrawerForm>
    </main>
  );
}
