"use client";

import { useMemo } from "react";
import {
  AppChartWidget,
  type AppChartDataPoint,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatePanel,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useDashboardSummaryQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-summary-query";
import { useDashboardSalesQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-sales-query";
import { useDashboardManagerKpiQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-manager-kpi-query";
import type { ManagerKpiItem } from "@/modules/dashboard/domain/dashboard";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sixMonthsAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return formatDate(d);
}

const managerColumns: readonly AppDataTableColumn<ManagerKpiItem>[] = [
  {
    id: "managerName",
    header: "Менеджер",
    cell: (row) => row.managerName,
    sortAccessor: (row) => row.managerName,
    searchAccessor: (row) => row.managerName,
  },
  {
    id: "dealsCount",
    header: "Сделок",
    cell: (row) => row.dealsCount,
    sortAccessor: (row) => row.dealsCount,
    align: "right",
  },
  {
    id: "totalAmount",
    header: "Сумма",
    cell: (row) => row.totalAmount.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.totalAmount,
    align: "right",
  },
];

export default function AnalyticsPage() {
  const from = useMemo(() => sixMonthsAgo(), []);
  const to = useMemo(() => formatDate(new Date()), []);

  const summaryQuery = useDashboardSummaryQuery();
  const salesQuery = useDashboardSalesQuery(from, to);
  const managerQuery = useDashboardManagerKpiQuery();

  if (summaryQuery.isError || salesQuery.isError || managerQuery.isError) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader
          title="Аналитика"
          breadcrumbs={[
            { id: "dashboard", label: "Панель", href: routes.dashboard },
            { id: "analytics", label: "Аналитика" },
          ]}
        />
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки аналитики"
          description="Не удалось загрузить данные аналитики."
        />
      </main>
    );
  }

  const summary = summaryQuery.data;
  const sales = salesQuery.data;

  const monthlyData: AppChartDataPoint[] = (sales?.monthlySales ?? []).map((item) => ({
    label: item.month,
    count: item.count,
    amount: item.totalAmount,
  }));

  const paymentTypeData: AppChartDataPoint[] = (sales?.byPaymentType ?? []).map((item) => ({
    label: item.paymentType,
    value: item.count,
  }));

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Аналитика"
        subtitle="Сводная аналитика по продажам и менеджерам"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "analytics", label: "Аналитика" },
        ]}
      />

      <AppKpiGrid
        columns={4}
        items={[
          { title: "Выручка", value: (summary?.totalRevenue ?? 0).toLocaleString("ru-RU") },
          { title: "Дебиторка", value: (summary?.totalDebt ?? 0).toLocaleString("ru-RU"), deltaTone: "warning" },
          { title: "Активные сделки", value: summary?.activeDeals ?? 0, deltaTone: "info" },
          { title: "Просрочено", value: summary?.overdueCount ?? 0, deltaTone: "danger" },
        ]}
      />

      <AppChartWidget
        type="bar"
        title="Продажи по месяцам"
        data={monthlyData}
        series={[
          { key: "count", label: "Сделки", color: "#2563EB" },
          { key: "amount", label: "Сумма", color: "#16A34A" },
        ]}
        height={320}
        loading={summaryQuery.isLoading || salesQuery.isLoading}
      />

      <AppChartWidget
        type="doughnut"
        title="Типы оплаты"
        data={paymentTypeData}
        series={[{ key: "value", label: "Сделки" }]}
        height={280}
        loading={salesQuery.isLoading}
      />

      <AppDataTable<ManagerKpiItem>
        data={managerQuery.data ?? []}
        columns={managerColumns}
        rowKey={(row) => row.managerId}
        title="KPI менеджеров"
        searchPlaceholder="Поиск по менеджеру..."
        enableSettings={false}
      />
    </main>
  );
}
