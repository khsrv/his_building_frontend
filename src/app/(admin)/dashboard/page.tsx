"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AppPageHeader,
  AppCrudPageScaffold,
  AppStatCard,
  AppStatusBadge,
  AppChartWidget,
} from "@/shared/ui";
import type { AppChartDataPoint, AppChartSeries } from "@/shared/ui/primitives/chart-widget";
import { routes } from "@/shared/constants/routes";

// ─── Mock KPI data ─────────────────────────────────────────────────────────────
// TODO: replace with real API hooks when backend is ready

const KPI = {
  buildings: 6,
  activeDealCount: 23,
  monthRevenue: 1_250_000,
  overduePayments: 4,
  freeUnits: 47,
  clients: 134,
  conversionRate: 32,
  avgDealCycle: 18,
} as const;

// ─── Chart mock data ───────────────────────────────────────────────────────────

const SALES_CHART_DATA: AppChartDataPoint[] = [
  { label: "Янв", bookings: 5, sales: 3 },
  { label: "Фев", bookings: 8, sales: 6 },
  { label: "Мар", bookings: 12, sales: 9 },
  { label: "Апр", bookings: 10, sales: 7 },
  { label: "Май", bookings: 15, sales: 11 },
  { label: "Июн", bookings: 18, sales: 14 },
];

const SALES_SERIES: AppChartSeries[] = [
  { key: "bookings", label: "Бронирования", color: "#F59E0B" },
  { key: "sales", label: "Продажи", color: "#10B981" },
];

const REVENUE_CHART_DATA: AppChartDataPoint[] = [
  { label: "Янв", revenue: 180_000 },
  { label: "Фев", revenue: 220_000 },
  { label: "Мар", revenue: 310_000 },
  { label: "Апр", revenue: 270_000 },
  { label: "Май", revenue: 350_000 },
  { label: "Июн", revenue: 420_000 },
];

const REVENUE_SERIES: AppChartSeries[] = [
  { key: "revenue", label: "Доход (SM)", color: "#3B82F6" },
];

const DEAL_STAGE_DATA: AppChartDataPoint[] = [
  { label: "Новый лид", value: 15 },
  { label: "В обработке", value: 8 },
  { label: "Бронь", value: 12 },
  { label: "Оформление", value: 6 },
  { label: "Оплата", value: 10 },
  { label: "Завершено", value: 23 },
];

const DEAL_STAGE_SERIES: AppChartSeries[] = [
  { key: "value", label: "Сделки" },
];

const UNIT_STATUS_DATA: AppChartDataPoint[] = [
  { label: "Свободна", value: 47 },
  { label: "Бронь", value: 12 },
  { label: "Продана", value: 38 },
  { label: "Резерв", value: 5 },
];

const UNIT_STATUS_SERIES: AppChartSeries[] = [
  { key: "value", label: "Квартиры" },
];

// ─── Recent activity mock ──────────────────────────────────────────────────────

interface RecentActivity {
  readonly id: string;
  readonly type: "deal" | "payment" | "client";
  readonly text: string;
  readonly time: string;
}

const RECENT_ACTIVITY: readonly RecentActivity[] = [
  { id: "1", type: "deal", text: "Новая сделка: кв. 42, ЖК Сомон — Рахимов Ф.", time: "10 мин назад" },
  { id: "2", type: "payment", text: "Оплата 150 000 SM по сделке #D-0023", time: "25 мин назад" },
  { id: "3", type: "client", text: "Новый клиент: Каримова Н. (источник: сайт)", time: "1 час назад" },
  { id: "4", type: "deal", text: "Бронь истекла: кв. 15, ЖК Дусти", time: "2 часа назад" },
  { id: "5", type: "payment", text: "Просрочен платёж по сделке #D-0019", time: "3 часа назад" },
  { id: "6", type: "deal", text: "Сделка #D-0021 переведена в этап «Оплата»", time: "5 часов назад" },
];

const ACTIVITY_TONE_MAP: Record<RecentActivity["type"], "info" | "success" | "warning"> = {
  deal: "info",
  payment: "success",
  client: "warning",
};

const ACTIVITY_LABEL_MAP: Record<RecentActivity["type"], string> = {
  deal: "Сделка",
  payment: "Платёж",
  client: "Клиент",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const formatCurrency = useMemo(
    () => (value: number) => `${(value / 1000).toFixed(0)}k`,
    [],
  );

  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Панель управления"
        subtitle="Обзор ключевых показателей Hisob Building"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AppStatCard
          title="Объекты"
          value={KPI.buildings}
          delta="+1 за месяц"
          deltaTone="success"
          hint="Активных"
          onClick={() => router.push(routes.buildings)}
          className="cursor-pointer transition-shadow hover:shadow-md"
        />
        <AppStatCard
          title="Активные сделки"
          value={KPI.activeDealCount}
          delta="+5 за неделю"
          deltaTone="success"
          onClick={() => router.push(routes.deals)}
          className="cursor-pointer transition-shadow hover:shadow-md"
        />
        <AppStatCard
          title="Доход за месяц"
          value={`${KPI.monthRevenue.toLocaleString("ru-RU")} SM`}
          delta="+18%"
          deltaTone="success"
          onClick={() => router.push(routes.financeLedger)}
          className="cursor-pointer transition-shadow hover:shadow-md"
        />
        <AppStatCard
          title="Просрочено платежей"
          value={KPI.overduePayments}
          delta="Требует внимания"
          deltaTone="danger"
          onClick={() => router.push(routes.payments)}
          className="cursor-pointer transition-shadow hover:shadow-md"
        />
      </div>

      {/* Secondary KPI */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AppStatCard title="Свободных квартир" value={KPI.freeUnits} hint="По всем объектам" />
        <AppStatCard title="Клиентов" value={KPI.clients} delta="+12 за месяц" deltaTone="info" />
        <AppStatCard title="Конверсия" value={`${KPI.conversionRate}%`} hint="Лид → сделка" />
        <AppStatCard title="Цикл сделки" value={`${KPI.avgDealCycle} дн.`} hint="Среднее" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AppChartWidget
          type="bar"
          title="Бронирования и продажи"
          data={SALES_CHART_DATA}
          series={SALES_SERIES}
          height={280}
        />
        <AppChartWidget
          type="area"
          title="Доход по месяцам"
          data={REVENUE_CHART_DATA}
          series={REVENUE_SERIES}
          height={280}
          formatValue={formatCurrency}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AppChartWidget
          type="bar"
          title="Воронка сделок"
          data={DEAL_STAGE_DATA}
          series={DEAL_STAGE_SERIES}
          height={260}
        />
        <AppChartWidget
          type="doughnut"
          title="Статусы квартир"
          data={UNIT_STATUS_DATA}
          series={UNIT_STATUS_SERIES}
          height={260}
        />
      </div>

      {/* Recent Activity */}
      <AppCrudPageScaffold
        header={
          <h2 className="text-lg font-semibold text-foreground">Последняя активность</h2>
        }
        content={
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {RECENT_ACTIVITY.map((item) => (
              <div className="flex items-center gap-3 px-4 py-3" key={item.id}>
                <AppStatusBadge label={ACTIVITY_LABEL_MAP[item.type]} tone={ACTIVITY_TONE_MAP[item.type]} />
                <p className="flex-1 text-sm text-foreground">{item.text}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        }
      />
    </main>
  );
}
