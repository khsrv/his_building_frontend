"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AppPageHeader,
  AppKpiGrid,
  AppChartWidget,
  AppSelect,
  AppDataTable,
  ShimmerBox,
  AppStatePanel,
  AppCurrencyDisplay,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { AppStatCardProps } from "@/shared/ui";
import type { AppChartDataPoint, AppChartSeries } from "@/shared/ui/primitives/chart-widget";
import type { AppDataTableColumn } from "@/shared/ui/primitives/data-table/types";
import type { ManagerKpiItem } from "@/modules/dashboard/domain/dashboard";
import { useDashboardSummaryQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-summary-query";
import { useDashboardSalesQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-sales-query";
import { useDashboardManagerKpiQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-manager-kpi-query";
import { useDashboardPropertiesQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-properties-query";
import { usePipelineBoardQuery } from "@/modules/clients/presentation/hooks/use-pipeline-board-query";

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getSixMonthsAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return formatDate(d);
}

// ─── Currency formatter ───────────────────────────────────────────────────────

function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }
  return String(value);
}

// ─── Manager KPI table columns ────────────────────────────────────────────────

const MANAGER_COLUMNS: readonly AppDataTableColumn<ManagerKpiItem>[] = [
  {
    id: "managerName",
    header: "Менеджер",
    cell: (row) => row.managerName,
    searchAccessor: (row) => row.managerName,
    sortAccessor: (row) => row.managerName,
  },
  {
    id: "dealsCount",
    header: "Сделок",
    cell: (row) => row.dealsCount,
    sortAccessor: (row) => row.dealsCount,
    align: "right",
  },
  {
    id: "totalRevenue",
    header: "Выручка",
    cell: (row) => (
      <AppCurrencyDisplay amount={row.totalRevenue} currency="USD" size="sm" />
    ),
    sortAccessor: (row) => row.totalRevenue,
    align: "right",
  },
  {
    id: "conversionRate",
    header: "Конверсия",
    cell: (row) => `${row.conversionRate.toFixed(1)}%`,
    sortAccessor: (row) => row.conversionRate,
    align: "right",
  },
];

// ─── Sales chart series ────────────────────────────────────────────────────────

const SALES_SERIES: readonly AppChartSeries[] = [
  { key: "amount", label: "Выручка", color: "#3B82F6" },
];

// ─── Pie chart series ────────────────────────────────────────────────────────

const UNIT_STATUS_SERIES: readonly AppChartSeries[] = [
  { key: "value", label: "Квартиры", color: "#10B981" },
];

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  full_payment: "Полная оплата",
  installment: "Рассрочка",
  mortgage: "Ипотека",
  barter: "Бартер",
  combined: "Комбинированная",
};

// ─── Funnel component ────────────────────────────────────────────────────────

function ConversionFunnel({ stages }: { stages: readonly { name: string; count: number; color: string }[] }) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-foreground">Воронка конверсии</p>
      {stages.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Нет данных</p>
      ) : (
        <div className="space-y-2">
          {stages.map((stage, i) => {
            const widthPct = Math.max((stage.count / maxCount) * 100, 12);
            return (
              <div key={stage.name} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">
                  {stage.name}
                </span>
                <div className="relative flex-1">
                  <div
                    className="flex h-8 items-center justify-end rounded-md px-2 text-xs font-semibold text-white transition-all"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: stage.color || `hsl(${210 - i * 30}, 70%, 50%)`,
                    }}
                  >
                    {stage.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ShimmerBox key={i} className="h-24" />
      ))}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const dateFrom = useMemo(() => getSixMonthsAgo(), []);
  const dateTo = useMemo(() => formatDate(new Date()), []);

  const activePropertyId = selectedPropertyId !== "" ? selectedPropertyId : undefined;

  const propertiesQuery = useDashboardPropertiesQuery();
  const summaryQuery = useDashboardSummaryQuery(activePropertyId);
  const salesQuery = useDashboardSalesQuery(dateFrom, dateTo, activePropertyId);
  const managerKpiQuery = useDashboardManagerKpiQuery();
  const pipelineQuery = usePipelineBoardQuery();

  // ─── Property filter options ──────────────────────────────────────────────

  const propertyOptions = useMemo(() => {
    const base = [{ value: "", label: "Все объекты" }];
    if (!propertiesQuery.data) return base;
    return [
      ...base,
      ...propertiesQuery.data.map((p) => ({ value: p.id, label: p.name })),
    ];
  }, [propertiesQuery.data]);

  // ─── KPI data ─────────────────────────────────────────────────────────────

  const summary = summaryQuery.data;

  const primaryKpiItems: readonly AppStatCardProps[] = useMemo(() => {
    const items: AppStatCardProps[] = [
      {
        title: "Всего квартир",
        value: summary?.units.total ?? "—",
        hint: "По всем объектам",
      },
      {
        title: "Свободных",
        value: summary?.units.available ?? "—",
        deltaTone: "success" as const,
        ...(summary ? { delta: `${summary.units.available} доступно` } : {}),
      },
      {
        title: "Активных сделок",
        value: summary?.deals.active ?? "—",
        deltaTone: "info" as const,
        ...(summary ? { delta: `Завершено: ${summary.deals.completed}` } : {}),
      },
      {
        title: "Просроченных платежей",
        value: summary?.payments.overdueCount ?? "—",
        deltaTone: "danger" as const,
        ...(summary?.payments.overdueCount ? { delta: "Требует внимания" } : {}),
      },
    ];
    return items;
  }, [summary]);

  const secondaryKpiItems: readonly AppStatCardProps[] = useMemo(() => {
    const fmt = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "USD" });
    const items: AppStatCardProps[] = [
      {
        title: "Выручка всего",
        value: summary ? fmt.format(summary.revenue.total) : "—",
        hint: "С начала работы",
      },
      {
        title: "Выручка за месяц",
        value: summary ? fmt.format(summary.revenue.thisMonth) : "—",
        deltaTone: "success" as const,
      },
      {
        title: "Дебиторка",
        value: summary ? fmt.format(summary.receivables.total) : "—",
        deltaTone: "warning" as const,
        ...(summary?.receivables.total ? { delta: "Ожидает погашения" } : {}),
      },
      {
        title: "Забронировано",
        value: summary?.units.booked ?? "—",
        hint: `Резерв: ${summary?.units.reserved ?? "—"}`,
      },
    ];
    return items;
  }, [summary]);

  // ─── Sales chart data ─────────────────────────────────────────────────────

  const salesChartData: readonly AppChartDataPoint[] = useMemo(() => {
    if (!salesQuery.data) return [];
    return salesQuery.data.map((item) => ({
      label: item.month,
      amount: item.totalAmount,
    }));
  }, [salesQuery.data]);

  // ─── Unit status pie chart data ──────────────────────────────────────────

  const unitStatusPieData: readonly AppChartDataPoint[] = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Свободно", value: summary.units.available },
      { label: "Забронировано", value: summary.units.booked },
      { label: "Резерв", value: summary.units.reserved },
      { label: "Продано", value: summary.units.sold },
    ].filter((d) => d.value > 0);
  }, [summary]);

  const unitStatusSeries: readonly AppChartSeries[] = useMemo(() => [
    { key: "value", label: "Квартиры" },
  ], []);

  // ─── Funnel data from pipeline board ────────────────────────────────────

  const funnelStages = useMemo(() => {
    if (!pipelineQuery.data) return [];
    return pipelineQuery.data
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((stage) => ({
        name: stage.name,
        count: stage.clients.length,
        color: stage.color,
      }));
  }, [pipelineQuery.data]);

  // ─── Manager KPI table data ───────────────────────────────────────────────

  const managerKpiData: readonly ManagerKpiItem[] = managerKpiQuery.data ?? [];

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AppPageHeader
          title="Панель управления"
          subtitle="Обзор ключевых показателей Hisob Building"
        />

        <div className="flex items-end gap-2">
          <div className="w-full sm:w-64">
            <AppSelect
              id="property-filter"
              label="Объект"
              value={selectedPropertyId}
              options={propertyOptions}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            />
          </div>
          {activePropertyId ? (
            <Link
              href={routes.dashboardPropertyAnalytics(activePropertyId)}
              className="mb-1 shrink-0 text-xs font-medium text-primary hover:underline"
            >
              Подробнее &rarr;
            </Link>
          ) : null}
        </div>
      </div>

      {/* Primary KPI row */}
      {summaryQuery.isLoading ? (
        <KpiSkeleton />
      ) : summaryQuery.isError ? (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить данные сводки. Попробуйте обновить страницу."
        />
      ) : (
        <AppKpiGrid items={primaryKpiItems} columns={4} />
      )}

      {/* Secondary KPI row */}
      {summaryQuery.isLoading ? (
        <KpiSkeleton />
      ) : summaryQuery.isError ? null : (
        <AppKpiGrid items={secondaryKpiItems} columns={4} />
      )}

      {/* Sales chart */}
      <div className="grid grid-cols-1 gap-4">
        {salesQuery.isLoading ? (
          <ShimmerBox className="h-72 rounded-xl" />
        ) : salesQuery.isError ? (
          <AppStatePanel
            tone="error"
            title="Ошибка графика"
            description="Не удалось загрузить данные продаж."
          />
        ) : (
          <AppChartWidget
            type="bar"
            title="Выручка по месяцам"
            data={salesChartData}
            series={SALES_SERIES}
            height={280}
            formatValue={formatCurrencyShort}
          />
        )}
      </div>

      {/* Pie chart (unit statuses) + Funnel (pipeline conversion) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {summaryQuery.isLoading ? (
          <ShimmerBox className="h-72 rounded-xl" />
        ) : unitStatusPieData.length > 0 ? (
          <AppChartWidget
            type="doughnut"
            title="Квартиры по статусу"
            data={unitStatusPieData}
            series={unitStatusSeries}
            height={280}
            showLegend
          />
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">Квартиры по статусу</p>
            <p className="py-12 text-center text-sm text-muted-foreground">Нет данных</p>
          </div>
        )}

        {pipelineQuery.isLoading ? (
          <ShimmerBox className="h-72 rounded-xl" />
        ) : (
          <ConversionFunnel stages={funnelStages} />
        )}
      </div>

      {/* Manager KPI table */}
      <div>
        {managerKpiQuery.isLoading ? (
          <ShimmerBox className="h-64 rounded-xl" />
        ) : managerKpiQuery.isError ? (
          <AppStatePanel
            tone="error"
            title="Ошибка загрузки"
            description="Не удалось загрузить KPI менеджеров."
          />
        ) : (
          <AppDataTable
            title="KPI менеджеров"
            data={managerKpiData}
            columns={MANAGER_COLUMNS}
            rowKey={(row) => row.managerId}
            searchPlaceholder="Поиск по менеджеру..."
          />
        )}
      </div>
    </main>
  );
}
