"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  AppButton,
  type AppChartDataPoint,
  AppKpiGrid,
  AppPageHeader,
  AppStatePanel,
} from "@/shared/ui";

const AppChartWidget = dynamic(
  () => import("@/shared/ui/primitives/chart-widget").then((m) => ({ default: m.AppChartWidget })),
  { ssr: false },
);
import { routes } from "@/shared/constants/routes";
import { useCashFlowReportQuery } from "@/modules/finance/presentation/hooks/use-cash-flow-report-query";
import { useReceivablesReportQuery } from "@/modules/finance/presentation/hooks/use-receivables-report-query";
import { useI18n } from "@/shared/providers/locale-provider";

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
  const { locale, t } = useI18n();
  const router = useRouter();
  const from = useMemo(() => monthAgo(), []);
  const to = useMemo(() => formatDate(new Date()), []);

  const cashFlowQuery = useCashFlowReportQuery({ from, to });
  const receivablesQuery = useReceivablesReportQuery();

  if (cashFlowQuery.isError || receivablesQuery.isError) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader
          title={t("analytics.reports.title")}
          breadcrumbs={[
            { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
            { id: "analytics", label: t("analytics.page.title"), href: routes.analytics },
            { id: "reports", label: t("analytics.reports.title") },
          ]}
        />
        <AppStatePanel
          tone="error"
          title={t("analytics.reports.errorTitle")}
          description={t("analytics.reports.errorDescription")}
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
        title={t("analytics.reports.title")}
        subtitle={t("analytics.reports.subtitle")}
        breadcrumbs={[
          { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
          { id: "analytics", label: t("analytics.page.title"), href: routes.analytics },
          { id: "reports", label: t("analytics.reports.title") },
        ]}
        actions={
          <AppButton
            label={t("analytics.reports.openFinance")}
            variant="primary"
            onClick={() => router.push(routes.financeReports)}
          />
        }
      />

      <AppKpiGrid
        columns={2}
        items={[
          {
            title: t("analytics.reports.totalReceivables"),
            value: (receivablesQuery.data?.total ?? 0).toLocaleString(locale === "en" ? "en-US" : "ru-RU"),
            deltaTone: "warning",
          },
          {
            title: t("analytics.reports.debtors"),
            value: `${receivablesQuery.data?.items.length ?? 0}`,
            deltaTone: "danger",
          },
        ]}
      />

      <AppChartWidget
        type="line"
        title={t("analytics.reports.cashFlow30")}
        data={cashFlowChart}
        series={[
          { key: "income", label: t("analytics.reports.income"), color: "#16A34A" },
          { key: "expense", label: t("analytics.reports.expense"), color: "#DC2626" },
          { key: "balance", label: t("analytics.reports.balance"), color: "#2563EB" },
        ]}
        height={320}
        loading={cashFlowQuery.isLoading}
      />
    </main>
  );
}
