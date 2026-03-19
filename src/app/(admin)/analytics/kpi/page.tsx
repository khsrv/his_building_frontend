"use client";

import { AppDataTable, type AppDataTableColumn, AppKpiGrid, AppPageHeader, AppStatePanel } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useDashboardSummaryQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-summary-query";
import { useDashboardManagerKpiQuery } from "@/modules/dashboard/presentation/hooks/use-dashboard-manager-kpi-query";
import type { ManagerKpiItem } from "@/modules/dashboard/domain/dashboard";

const columns: readonly AppDataTableColumn<ManagerKpiItem>[] = [
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
    id: "clientCount",
    header: "Клиентов",
    cell: (row) => row.clientCount,
    sortAccessor: (row) => row.clientCount,
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

export default function AnalyticsKpiPage() {
  const summaryQuery = useDashboardSummaryQuery();
  const managerQuery = useDashboardManagerKpiQuery();

  if (summaryQuery.isError || managerQuery.isError) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader
          title="KPI"
          breadcrumbs={[
            { id: "dashboard", label: "Панель", href: routes.dashboard },
            { id: "analytics", label: "Аналитика", href: routes.analytics },
            { id: "kpi", label: "KPI" },
          ]}
        />
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки KPI"
          description="Не удалось загрузить KPI показатели."
        />
      </main>
    );
  }

  const summary = summaryQuery.data;
  const managers = managerQuery.data ?? [];

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="KPI"
        subtitle="Ключевые показатели команды"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "analytics", label: "Аналитика", href: routes.analytics },
          { id: "kpi", label: "KPI" },
        ]}
      />

      <AppKpiGrid
        columns={4}
        items={[
          { title: "Всего клиентов", value: summary?.totalClients ?? 0, deltaTone: "info" },
          { title: "Активные сделки", value: summary?.activeDeals ?? 0, deltaTone: "success" },
          { title: "Баланс", value: (summary?.accountBalance ?? 0).toLocaleString("ru-RU") },
          { title: "Просроченные", value: summary?.overdueCount ?? 0, deltaTone: "danger" },
        ]}
      />

      <AppDataTable<ManagerKpiItem>
        data={managers}
        columns={columns}
        rowKey={(row) => row.managerId}
        title="KPI по менеджерам"
        searchPlaceholder="Поиск по менеджеру..."
      />
    </main>
  );
}
