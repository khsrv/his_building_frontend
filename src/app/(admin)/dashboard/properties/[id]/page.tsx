"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  AppPageHeader,
  AppKpiGrid,
  AppChartWidget,
  AppDataTable,
  ShimmerBox,
  AppStatePanel,
  AppCurrencyDisplay,
} from "@/shared/ui";
import type { AppStatCardProps } from "@/shared/ui";
import type { AppChartDataPoint, AppChartSeries } from "@/shared/ui/primitives/chart-widget";
import type { AppDataTableColumn } from "@/shared/ui/primitives/data-table/types";
import type { PaymentTypeBreakdown } from "@/modules/dashboard/domain/dashboard";
import { usePropertyAnalyticsQuery } from "@/modules/dashboard/presentation/hooks/use-property-analytics-query";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  full_payment: "Полная оплата",
  installment: "Рассрочка",
  mortgage: "Ипотека",
  barter: "Бартер",
  combined: "Комбинированная",
};

const SALES_SERIES: readonly AppChartSeries[] = [
  { key: "amount", label: "Выручка", color: "#3B82F6" },
];

const UNIT_STATUS_SERIES: readonly AppChartSeries[] = [
  { key: "value", label: "Квартиры" },
];

const PAYMENT_TYPE_SERIES: readonly AppChartSeries[] = [
  { key: "value", label: "Сделки" },
];

const PAYMENT_TYPE_COLUMNS: readonly AppDataTableColumn<PaymentTypeBreakdown>[] = [
  {
    id: "paymentType",
    header: "Тип оплаты",
    cell: (row) => PAYMENT_TYPE_LABELS[row.paymentType] ?? row.paymentType,
    sortAccessor: (row) => row.paymentType,
  },
  {
    id: "count",
    header: "Кол-во сделок",
    cell: (row) => row.count,
    sortAccessor: (row) => row.count,
    align: "right",
  },
  {
    id: "totalAmount",
    header: "Сумма",
    cell: (row) => <AppCurrencyDisplay amount={row.totalAmount} currency="USD" size="sm" />,
    sortAccessor: (row) => row.totalAmount,
    align: "right",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PropertyAnalyticsPage() {
  const params = useParams();
  const propertyId = typeof params.id === "string" ? params.id : "";

  const query = usePropertyAnalyticsQuery(propertyId);
  const data = query.data;

  // ─── KPI cards ─────────────────────────────────────────────────────────

  const primaryKpi: readonly AppStatCardProps[] = useMemo(() => {
    if (!data) return [];
    return [
      { title: "Всего квартир", value: data.units.total },
      { title: "Свободных", value: data.units.available, deltaTone: "success" as const },
      { title: "Активных сделок", value: data.deals.active, deltaTone: "info" as const },
      { title: "Просроченных", value: data.payments.overdueCount, deltaTone: "danger" as const },
    ];
  }, [data]);

  const secondaryKpi: readonly AppStatCardProps[] = useMemo(() => {
    if (!data) return [];
    const fmt = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "USD" });
    return [
      { title: "Выручка всего", value: fmt.format(data.revenue.total) },
      { title: "За месяц", value: fmt.format(data.revenue.thisMonth), deltaTone: "success" as const },
      { title: "Дебиторка", value: fmt.format(data.receivables.total), deltaTone: "warning" as const },
      { title: "Продано", value: data.units.sold, hint: `Забронировано: ${data.units.booked}` },
    ];
  }, [data]);

  // ─── Chart data ─────────────────────────────────────────────────────────

  const salesChartData: readonly AppChartDataPoint[] = useMemo(() => {
    if (!data) return [];
    return data.salesByMonth.map((item) => ({
      label: item.month,
      amount: item.totalAmount,
    }));
  }, [data]);

  const unitStatusPieData: readonly AppChartDataPoint[] = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Свободно", value: data.units.available },
      { label: "Забронировано", value: data.units.booked },
      { label: "Резерв", value: data.units.reserved },
      { label: "Продано", value: data.units.sold },
    ].filter((d) => d.value > 0);
  }, [data]);

  const paymentTypePieData: readonly AppChartDataPoint[] = useMemo(() => {
    if (!data) return [];
    return data.dealsByPaymentType.map((pt) => ({
      label: PAYMENT_TYPE_LABELS[pt.paymentType] ?? pt.paymentType,
      value: pt.count,
    }));
  }, [data]);

  // ─── Render ─────────────────────────────────────────────────────────────

  if (query.isLoading) {
    return (
      <main className="space-y-4 p-4 md:p-6">
        <ShimmerBox className="h-16" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerBox key={i} className="h-24" />
          ))}
        </div>
        <ShimmerBox className="h-72" />
      </main>
    );
  }

  if (query.isError || !data) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader
          title="Аналитика объекта"
          breadcrumbs={[
            { id: "home", label: "Панель", href: "/dashboard" },
            { id: "property", label: "Аналитика объекта" },
          ]}
        />
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить аналитику объекта."
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title={data.propertyName}
        subtitle="Аналитика объекта"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "property", label: data.propertyName },
        ]}
      />

      {/* Primary KPI */}
      <AppKpiGrid items={primaryKpi} columns={4} />

      {/* Secondary KPI */}
      <AppKpiGrid items={secondaryKpi} columns={4} />

      {/* Sales chart */}
      {salesChartData.length > 0 ? (
        <AppChartWidget
          type="bar"
          title="Выручка по месяцам"
          data={salesChartData}
          series={SALES_SERIES}
          height={280}
          formatValue={formatCurrencyShort}
        />
      ) : null}

      {/* Pie charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {unitStatusPieData.length > 0 ? (
          <AppChartWidget
            type="doughnut"
            title="Квартиры по статусу"
            data={unitStatusPieData}
            series={UNIT_STATUS_SERIES}
            height={280}
            showLegend
          />
        ) : null}

        {paymentTypePieData.length > 0 ? (
          <AppChartWidget
            type="pie"
            title="По типам оплаты"
            data={paymentTypePieData}
            series={PAYMENT_TYPE_SERIES}
            height={280}
            showLegend
          />
        ) : null}
      </div>

      {/* Payment type breakdown table */}
      {data.dealsByPaymentType.length > 0 ? (
        <AppDataTable
          title="Сделки по типам оплаты"
          data={data.dealsByPaymentType}
          columns={PAYMENT_TYPE_COLUMNS}
          rowKey={(row) => row.paymentType}
        />
      ) : null}
    </main>
  );
}
