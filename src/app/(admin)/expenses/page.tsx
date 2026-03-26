"use client";

import { useCallback, useMemo, useState } from "react";
import { Box, Chip, Divider, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import {
  AppActionMenu,
  AppButton,
  AppDataTable,
  type AppDataTableColumn,
  AppDateRangePicker,
  type AppDateRangeValue,
  AppDrawerForm,
  AppInput,
  AppKpiGrid,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  ConfirmDialog,
} from "@/shared/ui";
import { IconExpense, IconCategory } from "@/shared/ui/icons/kpi-icons";
import { routes } from "@/shared/constants/routes";
import { useTransactionsQuery } from "@/modules/finance/presentation/hooks/use-transactions-query";
import { useCreateTransactionMutation } from "@/modules/finance/presentation/hooks/use-create-transaction-mutation";
import { useUpdateTransactionMutation } from "@/modules/finance/presentation/hooks/use-update-transaction-mutation";
import { useDeleteTransactionMutation } from "@/modules/finance/presentation/hooks/use-delete-transaction-mutation";
import { useStornoTransactionMutation } from "@/modules/finance/presentation/hooks/use-storno-transaction-mutation";
import { useAccountsQuery } from "@/modules/finance/presentation/hooks/use-accounts-query";
import { useExpenseCategoriesQuery } from "@/modules/finance/presentation/hooks/use-expense-categories-query";
import { useCreateExpenseCategoryMutation } from "@/modules/finance/presentation/hooks/use-create-expense-category-mutation";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import { useCurrencyOptions } from "@/modules/finance/presentation/hooks/use-currency-options";
import { useCurrenciesQuery } from "@/modules/finance/presentation/hooks/use-currencies-query";
import { usePropertyContext } from "@/shared/providers/property-provider";
import type {
  Transaction,
  TransactionListParams,
  CreateTransactionInput,
} from "@/modules/finance/domain/finance";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const parts = iso.slice(0, 10).split("-");
  if (parts.length < 3) return iso.slice(0, 10);
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

function dateToIso(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function isWithin30Days(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < THIRTY_DAYS_MS;
}

// ─── Form state ──────────────────────────────────────────────────────────────

interface ExpenseFormState {
  amount: string;
  currency: string;
  categoryId: string;
  accountId: string;
  propertyId: string;
  description: string;
  transactionDate: string;
}

// ─── Category breakdown row ──────────────────────────────────────────────────

interface CategoryBreakdownRow {
  readonly id: string;
  readonly name: string;
  readonly amount: number;
  readonly count: number;
  readonly percent: number;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const currencyOptions = useCurrencyOptions();
  const { currentPropertyId, hasProperty } = usePropertyContext();
  const { data: currencies } = useCurrenciesQuery();
  const primaryCurrency = currencies?.find((c) => c.isPrimary)?.code ?? "USD";

  // Date range — default last 30 days
  const [dateRange, setDateRange] = useState<AppDateRangeValue>(() => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return { startDate: monthAgo, endDate: today };
  });

  // Filters — propertyId comes from global context
  const filterPropertyId = currentPropertyId;
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const [filterSubcategoryId, setFilterSubcategoryId] = useState<string>("");
  const [filterAccountId, setFilterAccountId] = useState<string>("");

  // Query params — propertyId sent to API for server-side filtering
  const params: TransactionListParams = {
    type: "expense",
    limit: 200,
    ...(filterPropertyId ? { propertyId: filterPropertyId } : {}),
    ...(filterAccountId ? { accountId: filterAccountId } : {}),
    ...(dateRange.startDate ? { dateFrom: dateToIso(dateRange.startDate) } : {}),
    ...(dateRange.endDate ? { dateTo: dateToIso(dateRange.endDate) } : {}),
  };

  // Queries
  const { data: rawTransactions, isLoading, isError } = useTransactionsQuery(params);
  const { data: accounts } = useAccountsQuery(currentPropertyId || undefined);
  const { data: categories } = useExpenseCategoriesQuery();
  const { data: properties } = usePropertiesListQuery();
  const createMutation = useCreateTransactionMutation();
  const updateMutation = useUpdateTransactionMutation();
  const deleteMutation = useDeleteTransactionMutation();
  const stornoMutation = useStornoTransactionMutation();
  const createCategoryMutation = useCreateExpenseCategoryMutation();

  // Lookup maps
  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of accounts ?? []) map.set(a.id, a.name);
    return map;
  }, [accounts]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories ?? []) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const accountPropertyMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of accounts ?? []) {
      if (a.propertyId) map.set(a.id, a.propertyId);
    }
    return map;
  }, [accounts]);

  const propertyItems = useMemo(() => properties?.items ?? [], [properties]);
  const propertyNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of propertyItems) map.set(p.id, p.name);
    return map;
  }, [propertyItems]);

  // Parent/sub categories
  const parentCategories = useMemo(
    () => (categories ?? []).filter((c) => !c.parentId),
    [categories],
  );
  const subcategories = useMemo(
    () => (filterCategoryId ? (categories ?? []).filter((c) => c.parentId === filterCategoryId) : []),
    [categories, filterCategoryId],
  );
  const categoryParentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories ?? []) {
      if (c.parentId) map.set(c.id, c.parentId);
    }
    return map;
  }, [categories]);

  // Enrich transactions
  const transactions = useMemo(() => {
    if (!rawTransactions) return undefined;
    return rawTransactions.map((tx) => ({
      ...tx,
      accountName: accountNameMap.get(tx.accountId) ?? tx.accountName,
      categoryName: tx.categoryId ? (categoryNameMap.get(tx.categoryId) ?? tx.categoryName) : tx.categoryName,
    }));
  }, [rawTransactions, accountNameMap, categoryNameMap]);

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    if (!transactions) return undefined;
    let result = transactions;

    if (filterCategoryId) {
      const childIds = new Set((categories ?? []).filter((c) => c.parentId === filterCategoryId).map((c) => c.id));
      result = result.filter((tx) => tx.categoryId === filterCategoryId || childIds.has(tx.categoryId ?? ""));
    }
    if (filterSubcategoryId) {
      result = result.filter((tx) => tx.categoryId === filterSubcategoryId);
    }
    return result;
  }, [transactions, filterCategoryId, filterSubcategoryId, categories, accountPropertyMap]);

  const count = filteredTransactions?.length ?? 0;
  const totalExpense = (filteredTransactions ?? []).reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categoryBreakdown: CategoryBreakdownRow[] = useMemo(() => {
    const txs = filteredTransactions ?? [];
    if (txs.length === 0) return [];

    const sumMap = new Map<string, { amount: number; count: number }>();

    for (const tx of txs) {
      const catId = tx.categoryId ?? "";
      const resolvedId = filterCategoryId ? catId : (categoryParentMap.get(catId) ?? catId);
      const existing = sumMap.get(resolvedId) ?? { amount: 0, count: 0 };
      sumMap.set(resolvedId, { amount: existing.amount + tx.amount, count: existing.count + 1 });
    }

    const total = txs.reduce((s, t) => s + t.amount, 0);
    return Array.from(sumMap.entries())
      .map(([id, { amount, count: cnt }]) => ({
        id,
        name: categoryNameMap.get(id) ?? "Без категории",
        amount,
        count: cnt,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, filterCategoryId, categoryNameMap, categoryParentMap]);

  // Select options
  const categoryFilterOptions = [{ value: "", label: "Все категории" }, ...parentCategories.map((c) => ({ value: c.id, label: c.name }))];
  const subcategoryFilterOptions = [{ value: "", label: "Все подкатегории" }, ...subcategories.map((c) => ({ value: c.id, label: c.name }))];
  const accountFilterOptions = [{ value: "", label: "Все счета" }, ...(accounts ?? []).map((a) => ({ value: a.id, label: a.name }))];
  const accountSelectOptions = (accounts ?? []).map((a) => ({ value: a.id, label: a.name }));
  const allCategorySelectOptions = (categories ?? []).map((c) => ({ value: c.id, label: c.name }));
  const propertySelectOptions = propertyItems.map((p) => ({ value: p.id, label: p.name }));

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const initialForm: ExpenseFormState = {
    amount: "", currency: primaryCurrency, categoryId: "", accountId: "",
    propertyId: currentPropertyId, description: "", transactionDate: todayIso(),
  };
  const [form, setForm] = useState<ExpenseFormState>(initialForm);

  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  function handleOpen() {
    setForm({ ...initialForm, propertyId: currentPropertyId, transactionDate: todayIso() });
    setDrawerOpen(true);
  }

  function handleSave() {
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0 || !form.accountId || !form.description.trim() || !form.propertyId) return;

    const txInput: CreateTransactionInput = {
      type: "expense", amount, currency: form.currency, accountId: form.accountId,
      description: form.description.trim(), transactionDate: form.transactionDate,
      propertyId: form.propertyId,
      ...(form.categoryId ? { categoryId: form.categoryId } : {}),
    };

    createMutation.mutate(txInput, { onSuccess: () => { setDrawerOpen(false); setForm(initialForm); } });
  }

  function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-zA-Zа-яА-ЯёЁ0-9-]/g, "") || `cat-${Date.now()}`;
    createCategoryMutation.mutate(
      { name, slug, ...(filterCategoryId ? { parentId: filterCategoryId } : {}) },
      { onSuccess: () => { setCategoryDrawerOpen(false); setNewCategoryName(""); } },
    );
  }

  const isSaveDisabled = !form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0 || !form.accountId || !form.propertyId || !form.description.trim() || createMutation.isPending;

  // ── Edit state ──────────────────────────────────────────────────────────
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ amount: "", description: "", categoryId: "" });

  // ── Delete confirm state ────────────────────────────────────────────────
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // ── Storno state ────────────────────────────────────────────────────────
  const [stornoDrawerOpen, setStornoDrawerOpen] = useState(false);
  const [stornoTx, setStornoTx] = useState<Transaction | null>(null);
  const [stornoReason, setStornoReason] = useState("");

  const handleEditOpen = useCallback((tx: Transaction) => {
    setEditingTx(tx);
    setEditForm({ amount: String(tx.amount), description: tx.description, categoryId: tx.categoryId ?? "" });
    setEditDrawerOpen(true);
  }, []);

  const handleEditSave = useCallback(() => {
    if (!editingTx) return;
    const amount = parseFloat(editForm.amount);
    if (isNaN(amount) || amount <= 0) return;
    updateMutation.mutate(
      { id: editingTx.id, input: { amount, description: editForm.description.trim() || undefined, ...(editForm.categoryId ? { categoryId: editForm.categoryId } : {}) } },
      { onSuccess: () => { setEditDrawerOpen(false); setEditingTx(null); } },
    );
  }, [editingTx, editForm, updateMutation]);

  const handleDeleteOpen = useCallback((tx: Transaction) => {
    setDeletingTx(tx);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingTx) return;
    deleteMutation.mutate(deletingTx.id, {
      onSuccess: () => { setDeleteConfirmOpen(false); setDeletingTx(null); },
    });
  }, [deletingTx, deleteMutation]);

  const handleStornoOpen = useCallback((tx: Transaction) => {
    setStornoTx(tx);
    setStornoReason("");
    setStornoDrawerOpen(true);
  }, []);

  const handleStornoSave = useCallback(() => {
    if (!stornoTx || !stornoReason.trim()) return;
    stornoMutation.mutate(
      { id: stornoTx.id, input: { reason: stornoReason.trim() } },
      { onSuccess: () => { setStornoDrawerOpen(false); setStornoTx(null); } },
    );
  }, [stornoTx, stornoReason, stornoMutation]);

  // Table columns
  const columns: readonly AppDataTableColumn<Transaction>[] = useMemo(() => [
    { id: "transactionDate", header: "Дата", cell: (row: Transaction) => formatDate(row.transactionDate), sortAccessor: (row: Transaction) => row.transactionDate },
    { id: "description", header: "Описание", cell: (row: Transaction) => row.description, searchAccessor: (row: Transaction) => row.description },
    { id: "categoryName", header: "Категория", cell: (row: Transaction) => row.categoryName ?? "—", searchAccessor: (row: Transaction) => row.categoryName ?? "" },
    { id: "accountName", header: "Счёт", cell: (row: Transaction) => row.accountName, searchAccessor: (row: Transaction) => row.accountName },
    {
      id: "amount", header: "Сумма", align: "right" as const, sortAccessor: (row: Transaction) => row.amount,
      cell: (row: Transaction) => <span style={{ color: "var(--color-danger, #dc2626)", fontWeight: 600 }}>{formatMoney(row.amount, row.currency)}</span>,
    },
    {
      id: "actions", header: "",
      cell: (row: Transaction) => {
        const editable = isWithin30Days(row.createdAt);
        return (
          <AppActionMenu
            triggerLabel="Действия"
            align="right"
            groups={[
              ...(editable
                ? [{
                    id: "edit",
                    items: [
                      { id: "edit", label: "Редактировать", onClick: () => handleEditOpen(row) },
                      { id: "delete", label: "Удалить", destructive: true, onClick: () => handleDeleteOpen(row) },
                    ],
                  }]
                : []),
              // TODO: раскомментировать когда понадобится сторно
              // {
              //   id: "storno",
              //   items: [
              //     { id: "storno", label: "Сторно", onClick: () => handleStornoOpen(row) },
              //   ],
              // },
            ]}
          />
        );
      },
    },
  ], [handleEditOpen, handleDeleteOpen, handleStornoOpen]);

  // Colors for category progress bars
  const BAR_COLORS = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"];

  return (
    <main className="space-y-6 p-4 md:p-6">
      {/* Header with date picker */}
      <AppPageHeader
        title="Расходы"
        {...(filteredTransactions ? { subtitle: `${count} записей` } : {})}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "expenses", label: "Расходы" },
        ]}
        actions={
          <Stack direction="row" spacing={2} alignItems="center">
            <AppDateRangePicker
              value={dateRange}
              onApply={setDateRange}
              onClear={() => setDateRange({ startDate: null, endDate: null })}
            />
            <AppButton label="Добавить расход" variant="primary" size="md" onClick={handleOpen} />
          </Stack>
        }
      />

      {/* KPI cards */}
      <AppKpiGrid
        columns={2}
        items={[
          { title: "Расходы за период", value: formatMoney(totalExpense, primaryCurrency), deltaTone: "danger", icon: <IconExpense /> },
          { title: "Записей", value: `${count}`, icon: <IconCategory /> },
        ]}
      />

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
        <Box sx={{ minWidth: 180 }}>
          <AppSelect label="Категория" id="filter-category" options={categoryFilterOptions} value={filterCategoryId} onChange={(e) => { setFilterCategoryId(e.target.value); setFilterSubcategoryId(""); }} />
        </Box>
        {filterCategoryId && subcategories.length > 0 && (
          <Box sx={{ minWidth: 180 }}>
            <AppSelect label="Подкатегория" id="filter-subcategory" options={subcategoryFilterOptions} value={filterSubcategoryId} onChange={(e) => setFilterSubcategoryId(e.target.value)} />
          </Box>
        )}
        <Box sx={{ minWidth: 180 }}>
          <AppSelect label="Счёт" id="filter-account" options={accountFilterOptions} value={filterAccountId} onChange={(e) => setFilterAccountId(e.target.value)} />
        </Box>
      </Stack>

      {/* Error / Loading */}
      {isError && <AppStatePanel tone="error" title="Ошибка загрузки" description="Не удалось загрузить список расходов." />}
      {isLoading && <AppStatePanel tone="empty" title="Загрузка..." description="Загружаем список расходов." />}

      {/* Main content */}
      {!isError && !isLoading && (
        <Stack spacing={4}>
          {/* Category breakdown — horizontal bar chart style */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {filterCategoryId ? `Подкатегории: ${categoryNameMap.get(filterCategoryId) ?? ""}` : "Расходы по категориям"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatMoney(totalExpense, primaryCurrency)} за выбранный период
                </Typography>
              </Box>
              <AppButton
                label={filterCategoryId ? "+ Подкатегория" : "+ Категория"}
                variant="outline"
                size="sm"
                onClick={() => { setNewCategoryName(""); setCategoryDrawerOpen(true); }}
              />
            </Box>

            {categoryBreakdown.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                Нет расходов за выбранный период
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {categoryBreakdown.map((item, idx) => (
                  <Box
                    key={item.id}
                    onClick={() => { if (!filterCategoryId) { setFilterCategoryId(item.id); setFilterSubcategoryId(""); } }}
                    sx={{
                      ...(!filterCategoryId ? { cursor: "pointer", "&:hover .cat-bar": { opacity: 0.85 } } : {}),
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                        <Chip label={`${item.count}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: "error.main" }}>
                        {formatMoney(item.amount, primaryCurrency)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          className="cat-bar"
                          variant="determinate"
                          value={item.percent}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "grey.100",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              bgcolor: BAR_COLORS[idx % BAR_COLORS.length],
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, textAlign: "right" }}>
                        {item.percent}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          {/* Expenses table */}
          <AppDataTable<Transaction>
            data={filteredTransactions ?? []}
            columns={columns}
            rowKey={(row) => row.id}
            title="История расходов"
            searchPlaceholder="Поиск по описанию, категории, счёту..."
            enableExport
            enableSettings
          />
        </Stack>
      )}

      {/* Add expense drawer */}
      <AppDrawerForm
        open={drawerOpen}
        title="Новый расход"
        subtitle="Заполните данные расхода"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending}
        saveDisabled={isSaveDisabled}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput label="Сумма *" type="number" value={form.amount} onChangeValue={(v) => setForm((prev) => ({ ...prev, amount: v }))} placeholder="0.00" />
          <AppSelect label="Валюта *" id="expense-currency" options={currencyOptions} value={form.currency} onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))} />
          <AppSelect label="Категория *" id="expense-category" options={allCategorySelectOptions} value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))} />
          <AppSelect label="Счёт *" id="expense-account" options={accountSelectOptions} value={form.accountId} onChange={(e) => setForm((prev) => ({ ...prev, accountId: e.target.value }))} />
          {hasProperty ? (
            <AppInput label="Объект *" value={propertyItems.find((p) => p.id === form.propertyId)?.name ?? ""} disabled />
          ) : (
            <AppSelect label="Объект *" id="expense-property" options={propertySelectOptions} value={form.propertyId} onChange={(e) => setForm((prev) => ({ ...prev, propertyId: e.target.value }))} />
          )}
          <AppInput label="Описание *" value={form.description} onChangeValue={(v) => setForm((prev) => ({ ...prev, description: v }))} placeholder="Описание расхода" />
          <AppInput label="Дата *" type="date" value={form.transactionDate} onChangeValue={(v) => setForm((prev) => ({ ...prev, transactionDate: v }))} />
        </Box>
      </AppDrawerForm>

      {/* Create category drawer */}
      <AppDrawerForm
        open={categoryDrawerOpen}
        title={filterCategoryId ? "Новая подкатегория" : "Новая категория расходов"}
        subtitle={filterCategoryId ? `Подкатегория для: ${categoryNameMap.get(filterCategoryId) ?? ""}` : "Создайте новую категорию расходов"}
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createCategoryMutation.isPending}
        saveDisabled={!newCategoryName.trim() || createCategoryMutation.isPending}
        onClose={() => setCategoryDrawerOpen(false)}
        onSave={handleCreateCategory}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput label="Название *" value={newCategoryName} onChangeValue={setNewCategoryName} placeholder={filterCategoryId ? "Название подкатегории" : "Название категории"} />
        </Box>
      </AppDrawerForm>

      {/* Edit expense drawer */}
      <AppDrawerForm
        open={editDrawerOpen}
        title="Редактировать расход"
        subtitle={editingTx ? `${editingTx.description} — ${formatDate(editingTx.transactionDate)}` : ""}
        saveLabel="Сохранить"
        cancelLabel="Отмена"
        isSaving={updateMutation.isPending}
        saveDisabled={!editForm.amount || isNaN(parseFloat(editForm.amount)) || parseFloat(editForm.amount) <= 0 || updateMutation.isPending}
        onClose={() => { setEditDrawerOpen(false); setEditingTx(null); }}
        onSave={handleEditSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput label="Сумма *" type="number" value={editForm.amount} onChangeValue={(v) => setEditForm((prev) => ({ ...prev, amount: v }))} placeholder="0.00" />
          <AppInput label="Описание" value={editForm.description} onChangeValue={(v) => setEditForm((prev) => ({ ...prev, description: v }))} placeholder="Описание расхода" />
          {allCategorySelectOptions.length > 0 && (
            <AppSelect label="Категория" id="edit-expense-category" options={[{ value: "", label: "Без категории" }, ...allCategorySelectOptions]} value={editForm.categoryId} onChange={(e) => setEditForm((prev) => ({ ...prev, categoryId: e.target.value }))} />
          )}
        </Box>
      </AppDrawerForm>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Удалить расход?"
        message={deletingTx ? `${formatMoney(deletingTx.amount, deletingTx.currency)} — ${deletingTx.description}. Баланс счёта будет автоматически откатан.` : ""}
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={handleDeleteConfirm}
        onClose={() => { setDeleteConfirmOpen(false); setDeletingTx(null); }}
      />

      {/* Storno drawer */}
      <AppDrawerForm
        open={stornoDrawerOpen}
        title="Сторно расхода"
        subtitle={stornoTx ? `${formatMoney(stornoTx.amount, stornoTx.currency)} — ${stornoTx.description}` : ""}
        saveLabel="Выполнить сторно"
        cancelLabel="Отмена"
        isSaving={stornoMutation.isPending}
        saveDisabled={!stornoReason.trim() || stornoMutation.isPending}
        onClose={() => { setStornoDrawerOpen(false); setStornoTx(null); }}
        onSave={handleStornoSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput label="Причина сторно *" value={stornoReason} onChangeValue={setStornoReason} placeholder="Укажите причину сторнирования" />
          {stornoTx && (
            <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1.5, fontSize: 14 }}>
              <p><strong>Сумма:</strong> {formatMoney(stornoTx.amount, stornoTx.currency)}</p>
              <p><strong>Описание:</strong> {stornoTx.description}</p>
              <p><strong>Дата:</strong> {formatDate(stornoTx.transactionDate)}</p>
              <p style={{ marginTop: 8, color: "var(--color-warning, #d97706)", fontSize: 13 }}>
                Будет создана обратная операция (доход) с пометкой [СТОРНО].
              </p>
            </Box>
          )}
        </Box>
      </AppDrawerForm>
    </main>
  );
}
