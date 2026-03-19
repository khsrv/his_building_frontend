"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AppButton,
  AppChartWidget,
  type AppChartDataPoint,
  AppKpiGrid,
  AppPageHeader,
  AppStatePanel,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useCashFlowReportQuery } from "@/modules/finance/presentation/hooks/use-cash-flow-report-query";
import { useReceivablesReportQuery } from "@/modules/finance/presentation/hooks/use-receivables-report-query";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return formatDate(d);
}

export default function AnalyticsReportsPage() {
  const router = useRouter();
  const from = useMemo(() => monthAgo(), []);
  const to = useMemo(() => formatDate(new Date()), []);

  const cashFlowQuery = useCashFlowReportQuery({ from, to });
  const receivablesQuery = useReceivablesReportQuery();

  if (cashFlowQuery.isError || receivablesQuery.isError) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader
          title="Отчёты"
          breadcrumbs={[
            { id: "dashboard", label: "Панель", href: routes.dashboard },
            { id: "analytics", label: "Аналитика", href: routes.analytics },
            { id: "reports", label: "Отчёты" },
          ]}
        />
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки отчётов"
          description="Не удалось загрузить отчеты аналитики."
        />
      </main>
    );
  }

  const cashFlowChart: AppChartDataPoint[] = (cashFlowQuery.data?.items ?? []).map((item) => ({
    label: item.date,
    income: item.income,
    expense: item.expense,
    balance: item.balance,
  }));

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Отчёты"
        subtitle="Краткая аналитика по финансовым отчетам"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "analytics", label: "Аналитика", href: routes.analytics },
          { id: "reports", label: "Отчёты" },
        ]}
        actions={
          <AppButton
            label="Открыть фин. отчеты"
            variant="primary"
            onClick={() => router.push(routes.financeReports)}
          />
        }
      />

      <AppKpiGrid
        columns={2}
        items={[
          {
            title: "Общая дебиторка",
            value: (receivablesQuery.data?.total ?? 0).toLocaleString("ru-RU"),
            deltaTone: "warning",
          },
          {
            title: "Должников",
            value: `${receivablesQuery.data?.items.length ?? 0}`,
            deltaTone: "danger",
          },
        ]}
      />

      <AppChartWidget
        type="line"
        title="Движение денег (30 дней)"
        data={cashFlowChart}
        series={[
          { key: "income", label: "Доходы", color: "#16A34A" },
          { key: "expense", label: "Расходы", color: "#DC2626" },
          { key: "balance", label: "Баланс", color: "#2563EB" },
        ]}
        height={320}
        loading={cashFlowQuery.isLoading}
      />
    </main>
  );
}
