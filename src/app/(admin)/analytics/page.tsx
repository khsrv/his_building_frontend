"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  type AppChartDataPoint,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatePanel,
} from "@/shared/ui";

const AppChartWidget = dynamic(
  () => import("@/shared/ui/primitives/chart-widget").then((m) => ({ default: m.AppChartWidget })),
  { ssr: false },
);
import { routes } from "@/shared/constants/routes";
import { useDashboardSummaryQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-summary-query";
import { useDashboardSalesQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-sales-query";
import { useDashboardManagerKpiQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-manager-kpi-query";
import type { ManagerKpiItem } from "@/modules/dashboard/domain/dashboard";
import { useI18n } from "@/shared/providers/locale-provider";

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

export default function AnalyticsPage() {
  const { locale, t } = useI18n();
  const from = useMemo(() => sixMonthsAgo(), []);
  const to = useMemo(() => formatDate(new Date()), []);

  const summaryQuery = useDashboardSummaryQuery();
  const salesQuery = useDashboardSalesQuery(from, to);
  const managerQuery = useDashboardManagerKpiQuery();

  const managerColumns: readonly AppDataTableColumn<ManagerKpiItem>[] = [
    {
      id: "managerName",
      header: t("analytics.common.manager"),
      cell: (row) => row.managerName,
      sortAccessor: (row) => row.managerName,
      searchAccessor: (row) => row.managerName,
    },
    {
      id: "dealsCount",
      header: t("analytics.common.deals"),
      cell: (row) => row.dealsCount,
      sortAccessor: (row) => row.dealsCount,
      align: "right",
    },
    {
      id: "totalAmount",
      header: t("analytics.common.amount"),
      cell: (row) => row.totalAmount.toLocaleString(locale === "en" ? "en-US" : "ru-RU"),
      sortAccessor: (row) => row.totalAmount,
      align: "right",
    },
  ];

  if (summaryQuery.isError || salesQuery.isError || managerQuery.isError) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader
          title={t("analytics.page.title")}
          breadcrumbs={[
            { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
            { id: "analytics", label: t("analytics.page.title") },
          ]}
        />
        <AppStatePanel
          tone="error"
          title={t("analytics.page.errorTitle")}
          description={t("analytics.page.errorDescription")}
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
        title={t("analytics.page.title")}
        subtitle={t("analytics.page.subtitle")}
        breadcrumbs={[
          { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
          { id: "analytics", label: t("analytics.page.title") },
        ]}
      />

      <AppKpiGrid
        columns={4}
        items={[
          {
            title: t("analytics.page.kpi.revenue"),
            value: (summary?.totalRevenue ?? 0).toLocaleString(locale === "en" ? "en-US" : "ru-RU"),
          },
          {
            title: t("analytics.page.kpi.receivables"),
            value: (summary?.totalDebt ?? 0).toLocaleString(locale === "en" ? "en-US" : "ru-RU"),
            deltaTone: "warning",
          },
          { title: t("analytics.page.kpi.activeDeals"), value: summary?.activeDeals ?? 0, deltaTone: "info" },
          { title: t("analytics.page.kpi.overdue"), value: summary?.overdueCount ?? 0, deltaTone: "danger" },
        ]}
      />

      <AppChartWidget
        type="bar"
        title={t("analytics.page.salesByMonth")}
        data={monthlyData}
        series={[
          { key: "count", label: t("analytics.common.deals"), color: "#2563EB" },
          { key: "amount", label: t("analytics.common.amount"), color: "#16A34A" },
        ]}
        height={320}
        loading={summaryQuery.isLoading || salesQuery.isLoading}
      />

      <AppChartWidget
        type="doughnut"
        title={t("analytics.page.paymentTypes")}
        data={paymentTypeData}
        series={[{ key: "value", label: t("analytics.common.deals") }]}
        height={280}
        loading={salesQuery.isLoading}
      />

      <AppDataTable<ManagerKpiItem>
        data={managerQuery.data ?? []}
        columns={managerColumns}
        rowKey={(row) => row.managerId}
        title={t("analytics.page.managersKpi")}
        searchPlaceholder={t("analytics.page.searchByManager")}
        enableSettings={false}
      />
    </main>
  );
}
