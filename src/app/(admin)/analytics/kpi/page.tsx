"use client";

import { AppDataTable, type AppDataTableColumn, AppKpiGrid, AppPageHeader, AppStatePanel } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useDashboardSummaryQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-summary-query";
import { useDashboardManagerKpiQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-manager-kpi-query";
import type { ManagerKpiItem } from "@/modules/dashboard/domain/dashboard";
import { useI18n } from "@/shared/providers/locale-provider";

export default function AnalyticsKpiPage() {
  const { locale, t } = useI18n();
  const summaryQuery = useDashboardSummaryQuery();
  const managerQuery = useDashboardManagerKpiQuery();
  const columns: readonly AppDataTableColumn<ManagerKpiItem>[] = [
    {
      id: "managerName",
      header: t("analytics.common.manager"),
      cell: (row) => row.managerName,
      searchAccessor: (row) => row.managerName,
      sortAccessor: (row) => row.managerName,
    },
    {
      id: "dealsCount",
      header: t("analytics.common.deals"),
      cell: (row) => row.dealsCount,
      sortAccessor: (row) => row.dealsCount,
      align: "right",
    },
    {
      id: "clientCount",
      header: t("analytics.kpi.clients"),
      cell: (row) => row.clientCount,
      sortAccessor: (row) => row.clientCount,
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

  if (summaryQuery.isError || managerQuery.isError) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader
          title={t("analytics.kpi.title")}
          breadcrumbs={[
            { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
            { id: "analytics", label: t("analytics.page.title"), href: routes.analytics },
            { id: "kpi", label: t("analytics.kpi.title") },
          ]}
        />
        <AppStatePanel
          tone="error"
          title={t("analytics.kpi.errorTitle")}
          description={t("analytics.kpi.errorDescription")}
        />
      </main>
    );
  }

  const summary = summaryQuery.data;
  const managers = managerQuery.data ?? [];

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title={t("analytics.kpi.title")}
        subtitle={t("analytics.kpi.subtitle")}
        breadcrumbs={[
          { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
          { id: "analytics", label: t("analytics.page.title"), href: routes.analytics },
          { id: "kpi", label: t("analytics.kpi.title") },
        ]}
      />

      <AppKpiGrid
        columns={4}
        items={[
          { title: t("analytics.kpi.totalClients"), value: summary?.totalClients ?? 0, deltaTone: "info" },
          { title: t("analytics.page.kpi.activeDeals"), value: summary?.activeDeals ?? 0, deltaTone: "success" },
          {
            title: t("analytics.reports.balance"),
            value: (summary?.accountBalance ?? 0).toLocaleString(locale === "en" ? "en-US" : "ru-RU"),
          },
          { title: t("analytics.kpi.overdue"), value: summary?.overdueCount ?? 0, deltaTone: "danger" },
        ]}
      />

      <AppDataTable<ManagerKpiItem>
        data={managers}
        columns={columns}
        rowKey={(row) => row.managerId}
        title={t("analytics.kpi.byManagers")}
        searchPlaceholder={t("analytics.page.searchByManager")}
      />
    </main>
  );
}
