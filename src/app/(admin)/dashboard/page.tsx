"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import {
  AppButton,
  AppPageHeader,
  AppKpiGrid,
  AppChartWidget,
  AppSelect,
  AppStatePanel,
  AppDateRangePicker,
} from "@/shared/ui";
import type { AppStatCardProps, AppDateRangeValue } from "@/shared/ui";
import type { AppChartSeries } from "@/shared/ui/primitives/chart-widget";
import { routes } from "@/shared/constants/routes";
import { useFullDashboardQuery } from "@/modules/dashboard/presentation/hooks/use-full-dashboard-query";
import type { FullDashboardParams } from "@/modules/dashboard/domain/dashboard";
import { useDashboardPropertiesQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-properties-query";
import { useCreateExchangeRateMutation } from "@/modules/finance/presentation/hooks/use-create-exchange-rate-mutation";
import { useCancelReminderMutation } from "@/modules/finance/presentation/hooks/use-cancel-reminder-mutation";
import { usePropertyContext } from "@/shared/providers/property-provider";
import {
  IconIncome,
  IconExpense,
  IconProfit,
  IconDebt,
  IconBuilding,
  IconAvailable,
  IconDeals,
  IconOverdue,
} from "@/shared/ui/icons/kpi-icons";

// ─── Currency flags ─────────────────────────────────────────────────────────

const CURRENCY_META: Record<string, { flag: string }> = {
  USD: { flag: "🇺🇸" }, TJS: { flag: "🇹🇯" }, RUB: { flag: "🇷🇺" }, UZS: { flag: "🇺🇿" },
  EUR: { flag: "🇪🇺" }, GBP: { flag: "🇬🇧" }, CNY: { flag: "🇨🇳" }, KZT: { flag: "🇰🇿" },
  KGS: { flag: "🇰🇬" }, AED: { flag: "🇦🇪" }, TRY: { flag: "🇹🇷" },
};

function getCurrencyFlag(code: string): string {
  return CURRENCY_META[code]?.flag ?? "💱";
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMoney(amount: number, currency?: string): string {
  return `${amount.toLocaleString("ru-RU")}${currency ? ` ${currency}` : ""}`;
}

function formatDate(iso: string): string {
  const parts = iso.slice(0, 10).split("-");
  if (parts.length < 3) return iso;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function dateToIso(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(dueDate: string): boolean {
  return dueDate < todayIso();
}

const CATEGORY_COLORS = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"] as const;

function getDefaultDateRange(): AppDateRangeValue {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { startDate: start, endDate: end };
}

// ─── Section header with "See all" link ─────────────────────────────────────

function SectionHeader({ title, count, onClick }: { title: string; count?: number; onClick?: () => void }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        {count !== undefined && <Chip label={count} size="small" variant="outlined" sx={{ height: 22, fontSize: 12 }} />}
      </Box>
      {onClick && (
        <AppButton label="Все →" size="sm" variant="text" onClick={onClick} />
      )}
    </Box>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  // ── Filter state ──────────────────────────────────────────────────────────
  const { currentPropertyId: selectedPropertyId } = usePropertyContext();
  const [dateRange, setDateRange] = useState<AppDateRangeValue>(getDefaultDateRange);

  // ── Exchange rate edit state ───────────────────────────────────────────────
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState<string>("");
  const [editRateFromCurrency, setEditRateFromCurrency] = useState<string>("");
  const [editRateToCurrency, setEditRateToCurrency] = useState<string>("");

  // ── Donut chart toggle ────────────────────────────────────────────────────
  const [chartMode, setChartMode] = useState<"expense" | "income">("expense");

  // ── Data fetching ─────────────────────────────────────────────────────────
  const params = useMemo<FullDashboardParams>(
    () => ({
      propertyId: selectedPropertyId || undefined,
      dateFrom: dateToIso(dateRange.startDate),
      dateTo: dateToIso(dateRange.endDate),
    }),
    [selectedPropertyId, dateRange],
  );

  const { data: dashboard, isLoading, isError } = useFullDashboardQuery(params);
  const { data: properties } = useDashboardPropertiesQuery();
  const createRateMutation = useCreateExchangeRateMutation();
  const cancelReminderMutation = useCancelReminderMutation();


  // ── Exchange rate editing ─────────────────────────────────────────────────
  const startEditRate = useCallback((rate: { id: string; fromCurrency: string; toCurrency: string; rate: number }) => {
    setEditingRateId(rate.id);
    setEditRateValue(String(rate.rate));
    setEditRateFromCurrency(rate.fromCurrency);
    setEditRateToCurrency(rate.toCurrency);
  }, []);

  const handleSaveRate = useCallback(() => {
    const parsed = parseFloat(editRateValue);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    createRateMutation.mutate(
      { fromCurrency: editRateFromCurrency, toCurrency: editRateToCurrency, rate: parsed, effectiveDate: todayIso() },
      { onSuccess: () => { setEditingRateId(null); setEditRateValue(""); } },
    );
  }, [editRateValue, editRateFromCurrency, editRateToCurrency, createRateMutation]);

  // ── KPI Rows ──────────────────────────────────────────────────────────────
  const kpiRow1: readonly AppStatCardProps[] = useMemo(() => {
    const s = dashboard?.summary;
    return [
      { title: "Доход", value: s ? formatMoney(s.totalRevenue, "USD") : "—", deltaTone: "success" as const, icon: <IconIncome />, onClick: () => router.push(routes.financeLedger), style: { cursor: "pointer" } },
      { title: "Расход", value: s ? formatMoney(s.totalExpense, "USD") : "—", deltaTone: "danger" as const, icon: <IconExpense />, onClick: () => router.push(routes.expenses), style: { cursor: "pointer" } },
      { title: "Прибыль", value: s ? formatMoney(s.netProfit, "USD") : "—", deltaTone: s && s.netProfit >= 0 ? ("success" as const) : ("danger" as const), icon: <IconProfit />, onClick: () => router.push(routes.financeLedger), style: { cursor: "pointer" } },
      { title: "Дебиторка", value: s ? formatMoney(s.totalDebt, "USD") : "—", deltaTone: "warning" as const, icon: <IconDebt />, onClick: () => router.push(routes.paymentsOverdue), style: { cursor: "pointer" } },
    ];
  }, [dashboard?.summary, router]);

  const kpiRow2: readonly AppStatCardProps[] = useMemo(() => {
    const s = dashboard?.summary;
    const fmtArea = (area: number) => `${area.toLocaleString("ru-RU")} м²`;
    return [
      { title: "Всего квартир", value: s ? `${s.totalUnits} шт.` : "—", ...(s ? { hint: fmtArea(s.totalArea) } : {}), icon: <IconBuilding />, onClick: () => router.push(routes.buildings), style: { cursor: "pointer" } },
      { title: "Свободных", value: s ? `${s.availableUnits} шт.` : "—", ...(s ? { hint: fmtArea(s.availableArea) } : {}), deltaTone: "success" as const, icon: <IconAvailable />, onClick: () => router.push(routes.buildings), style: { cursor: "pointer" } },
      { title: "Все сделки", value: s ? `${s.totalDealsCount} шт.` : "—", ...(s ? { hint: fmtArea(s.totalDealsArea) } : {}), deltaTone: "info" as const, icon: <IconDeals />, onClick: () => router.push(routes.deals), style: { cursor: "pointer" } },
      { title: "Ср. цена за м²", value: s ? formatMoney(Math.round(s.averagePricePerSqm), "USD") : "—", deltaTone: "muted" as const, icon: <IconProfit />, onClick: () => router.push(routes.deals), style: { cursor: "pointer" } },
    ];
  }, [dashboard?.summary, router]);

  // ── Donut chart data ──────────────────────────────────────────────────────
  const donutData = useMemo(() => {
    if (chartMode === "expense") {
      return (dashboard?.expensesByCategory ?? []).map((item, idx) => ({
        label: item.categoryName,
        value: item.amount,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] as string,
      }));
    }
    return (dashboard?.incomeBySource ?? []).map((item, idx) => ({
      label: item.label,
      value: item.amount,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] as string,
    }));
  }, [dashboard, chartMode]);

  const donutSeries: readonly AppChartSeries[] = useMemo(
    () => [{ key: "value", label: chartMode === "expense" ? "Расход" : "Доход", color: "#f59e0b" }],
    [chartMode],
  );

  // ── Max amounts for progress bars ─────────────────────────────────────────
  const expenseMaxAmount = useMemo(() => Math.max(...(dashboard?.expensesByCategory ?? []).map((e) => e.amount), 1), [dashboard]);
  const incomeMaxAmount = useMemo(() => Math.max(...(dashboard?.incomeBySource ?? []).map((i) => i.amount), 1), [dashboard]);

  // ── Property name map ────────────────────────────────────────────────────
  const propertyNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of properties ?? []) {
      map.set(p.id, p.name);
    }
    return map;
  }, [properties]);

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader title="Панель управления" breadcrumbs={[{ id: "dashboard", label: "Панель" }]} />
        <AppStatePanel tone="empty" title="Загрузка..." description="Загружаем данные панели." />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader title="Панель управления" breadcrumbs={[{ id: "dashboard", label: "Панель" }]} />
        <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить данные панели." />
      </main>
    );
  }

  // ── Safe defaults ─────────────────────────────────────────────────────────
  const allAccounts = dashboard?.accounts ?? [];
  // Filter accounts: when a property is selected, show its accounts + global (null)
  const accounts = selectedPropertyId
    ? allAccounts.filter((a) => a.propertyId === selectedPropertyId || a.propertyId === null)
    : allAccounts;
  const expensesByCategory = dashboard?.expensesByCategory ?? [];
  const incomeBySource = dashboard?.incomeBySource ?? [];
  const upcomingPayments = dashboard?.upcomingPayments ?? [];
  const overduePayments = dashboard?.overduePayments ?? [];
  const pendingReminders = (dashboard?.pendingReminders ?? []).filter((r) => !isOverdue(r.dueDate) || r.dueDate >= todayIso().slice(0, 7));
  const exchangeRates = dashboard?.exchangeRates ?? [];

  return (
    <main className="space-y-5 p-4 md:p-6">
      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <AppPageHeader
        title="Панель управления"
        breadcrumbs={[{ id: "dashboard", label: "Панель" }]}
        actions={
          <AppDateRangePicker value={dateRange} onApply={setDateRange} />
        }
      />

      {/* ── 2. KPI Rows ────────────────────────────────────────────────────── */}
      <AppKpiGrid items={kpiRow1} columns={4} />
      <AppKpiGrid items={kpiRow2} columns={4} />

      {/* ── 3. Exchange Rates + Accounts + Reminders ───────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Exchange Rates */}
        <Paper sx={{ p: 3, cursor: "pointer" }} onClick={(e) => { if (!(e.target as HTMLElement).closest("input, button")) router.push(routes.financeCurrencies); }}>
          <SectionHeader title="Курсы валют" onClick={() => router.push(routes.financeCurrencies)} />
          {exchangeRates.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>Нет данных о курсах</Typography>
          ) : (
            exchangeRates
              .filter((r) => r.fromCurrency !== r.toCurrency)
              .filter((r, _i, arr) => {
                if (r.fromCurrency === "USD") return true;
                return !arr.some((o) => o.fromCurrency === r.toCurrency && o.toCurrency === r.fromCurrency);
              })
              .map((rate) => (
                <Box key={rate.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: "none" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 20, lineHeight: 1 }}>{getCurrencyFlag(rate.fromCurrency)}</Typography>
                    <Typography variant="body2" fontWeight={600}>{rate.fromCurrency}</Typography>
                    <Typography variant="body2" color="text.secondary">→</Typography>
                    <Typography sx={{ fontSize: 20, lineHeight: 1 }}>{getCurrencyFlag(rate.toCurrency)}</Typography>
                    <Typography variant="body2" fontWeight={600}>{rate.toCurrency}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }} onClick={(e) => e.stopPropagation()}>
                    {editingRateId === rate.id ? (
                      <>
                        <input type="number" value={editRateValue} onChange={(e) => setEditRateValue(e.target.value)} style={{ width: 90, padding: "4px 8px", border: "2px solid #F5B301", borderRadius: 8, fontSize: 15, fontWeight: 700, outline: "none" }} />
                        <AppButton label="OK" size="sm" variant="primary" onClick={handleSaveRate} />
                        <AppButton label="✕" size="sm" variant="text" onClick={() => setEditingRateId(null)} />
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" fontWeight={700} sx={{ minWidth: 60, textAlign: "right" }}>{rate.rate.toLocaleString("ru-RU")}</Typography>
                        <AppButton label="✎" size="sm" variant="text" onClick={() => startEditRate(rate)} />
                      </>
                    )}
                  </Box>
                </Box>
              ))
          )}
        </Paper>

        {/* Account Balances */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader title="Счета" onClick={() => router.push(routes.financeAccounts)} />
          {accounts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>Нет счетов</Typography>
          ) : (
            accounts.map((acc) => {
              const propName = acc.propertyId ? propertyNameMap.get(acc.propertyId) ?? null : null;
              return (
                <Box key={acc.id} onClick={() => router.push(routes.financeAccountDetail(acc.id))} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, px: 1, borderRadius: 1.5, cursor: "pointer", "&:hover": { bgcolor: "action.hover" }, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{acc.name}</Typography>
                      <Chip
                        label={propName ?? "Общий"}
                        size="small"
                        variant="outlined"
                        color={propName ? "primary" : "default"}
                        sx={{ height: 20, fontSize: 11 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">{acc.type === "cash_register" ? "Касса" : acc.type === "bank_account" ? "Банк" : "Кошелёк"}</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={700} sx={{ whiteSpace: "nowrap" }}>{formatMoney(acc.balance, acc.currency)}</Typography>
                </Box>
              );
            })
          )}
        </Paper>

        {/* Reminders */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader title="Напоминалки" count={pendingReminders.length} onClick={() => router.push(routes.financePayableReminders)} />
          {pendingReminders.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>Нет активных напоминаний</Typography>
          ) : (
            pendingReminders.slice(0, 5).map((item) => (
              <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>{item.payeeName}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {item.description} · до {formatDate(item.dueDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ whiteSpace: "nowrap" }}>{formatMoney(item.amount, item.currency)}</Typography>
                  <AppButton label="✕" size="sm" variant="text" onClick={() => cancelReminderMutation.mutate(item.id)} />
                </Box>
              </Box>
            ))
          )}
          <Box sx={{ mt: 2 }}>
            <AppButton label="+ Новая напоминалка" size="sm" variant="outline" onClick={() => router.push(routes.financePayableReminders)} />
          </Box>
        </Paper>
      </div>

      {/* ── 4. Expenses + Income + Donut Chart ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Expenses by category */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader title="Расходы по категориям" onClick={() => router.push(routes.expenses)} />
          {expensesByCategory.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>Нет данных</Typography>
          ) : (
            expensesByCategory.map((item, idx) => {
              const pct = Math.round((item.amount / expenseMaxAmount) * 100);
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              return (
                <Box key={item.categoryId} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{item.categoryName}</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatMoney(item.amount, "USD")}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, bgcolor: "grey.200", "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 } }} />
                </Box>
              );
            })
          )}
        </Paper>

        {/* Income by source */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader title="Источники дохода" onClick={() => router.push(routes.financeLedger)} />
          {incomeBySource.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>Нет данных</Typography>
          ) : (
            incomeBySource.map((item, idx) => {
              const pct = Math.round((item.amount / incomeMaxAmount) * 100);
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              return (
                <Box key={item.source} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatMoney(item.amount, "USD")}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, bgcolor: "grey.200", "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 } }} />
                </Box>
              );
            })
          )}
        </Paper>

        {/* Donut chart with toggle */}
        <Paper sx={{ p: 3, display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              {chartMode === "expense" ? "Расходы" : "Доходы"}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <AppButton label="Расход" size="sm" variant={chartMode === "expense" ? "primary" : "text"} onClick={() => setChartMode("expense")} />
              <AppButton label="Доход" size="sm" variant={chartMode === "income" ? "primary" : "text"} onClick={() => setChartMode("income")} />
            </Stack>
          </Box>
          {donutData.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>Нет данных</Typography>
          ) : (
            <Box sx={{ flex: 1, minHeight: 250 }}>
              <AppChartWidget
                type="doughnut"
                title=""
                data={donutData}
                series={donutSeries}
                height={250}
                showLegend={false}
              />
            </Box>
          )}
        </Paper>
      </div>

      {/* ── 5. Upcoming + Overdue (2 columns) ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Upcoming payments */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader title="Ближайшие платежи" count={upcomingPayments.length} onClick={() => router.push(routes.payments)} />
          {upcomingPayments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>Нет ближайших платежей</Typography>
          ) : (
            upcomingPayments.map((item) => (
              <Box key={item.id} onClick={() => router.push(routes.dealDetail(item.dealId))} sx={{ py: 1.5, borderBottom: "1px solid", borderColor: "divider", cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontWeight={600}>{item.clientName}</Typography>
                  <Typography variant="body2" fontWeight={700}>{formatMoney(item.amount, item.currency)}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {item.dealNumber} · кв. {item.unitNumber} · через {item.daysLeft ?? 0} дн.
                </Typography>
              </Box>
            ))
          )}
        </Paper>

        {/* Overdue payments */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader title="Просроченные" count={overduePayments.length} onClick={() => router.push(routes.paymentsOverdue)} />
          {overduePayments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>Нет просроченных платежей</Typography>
          ) : (
            overduePayments.map((item) => (
              <Box key={item.id} onClick={() => router.push(routes.dealDetail(item.dealId))} sx={{ py: 1.5, borderBottom: "1px solid", borderColor: "divider", cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontWeight={600}>{item.clientName}</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">{formatMoney(item.amount, item.currency)}</Typography>
                </Box>
                <Typography variant="caption" color="error.main">
                  {item.dealNumber} · кв. {item.unitNumber} · просрочено {item.daysOverdue ?? 0} дн.
                </Typography>
              </Box>
            ))
          )}
        </Paper>
      </div>
    </main>
  );
}
