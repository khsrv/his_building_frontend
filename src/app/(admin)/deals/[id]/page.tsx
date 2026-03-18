"use client";

import { useParams } from "next/navigation";
import {
  AppPageHeader,
  AppButton,
  AppStatCard,
  AppStatusBadge,
  AppPaymentTimeline,
  AppCountdownBadge,
  type AppPaymentInstallment,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_INSTALLMENTS: readonly AppPaymentInstallment[] = [
  {
    id: "p-1",
    label: "Первоначальный взнос",
    dueDate: "2025-01-15",
    amount: 90000,
    currency: "USD",
    status: "paid",
    note: "Оплачено 14.01.2025",
  },
  {
    id: "p-2",
    label: "Платёж 2",
    dueDate: "2025-03-15",
    amount: 72000,
    currency: "USD",
    status: "paid",
    note: "Оплачено 15.03.2025",
  },
  {
    id: "p-3",
    label: "Платёж 3",
    dueDate: "2025-05-15",
    amount: 72000,
    currency: "USD",
    status: "paid",
    note: "Оплачено 10.05.2025",
  },
  {
    id: "p-4",
    label: "Платёж 4",
    dueDate: new Date().toISOString().slice(0, 10),
    amount: 72000,
    currency: "USD",
    status: "today",
  },
  {
    id: "p-5",
    label: "Платёж 5",
    dueDate: "2025-09-15",
    amount: 72000,
    currency: "USD",
    status: "upcoming",
  },
  {
    id: "p-6",
    label: "Финальный платёж",
    dueDate: "2025-11-15",
    amount: 72000,
    currency: "USD",
    status: "upcoming",
  },
];

// Booking countdown: 2 hours from now
const bookingExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DealDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={`Сделка #D-${id.padStart(4, "0")}`}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "deals", label: "Сделки", href: routes.deals },
          { id: "detail", label: `D-${id.padStart(4, "0")}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <AppButton label="Печать договора" variant="outline" />
            <AppButton label="Изменить статус" variant="primary" />
          </div>
        }
      />

      {/* Deal info card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Информация о сделке
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Клиент</p>
            <p className="text-sm font-medium text-foreground">Рахимов Фаррух</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Квартира</p>
            <p className="text-sm font-medium text-foreground">Кв. 42, 3-этаж, 3к, 95 м²</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ЖК</p>
            <p className="text-sm font-medium text-foreground">ЖК &quot;Сомон&quot;</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Этап</p>
            <div className="mt-0.5">
              <AppStatusBadge label="Договор" tone="success" />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Тип оплаты</p>
            <p className="text-sm font-medium text-foreground">Рассрочка (6 платежей)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Номер договора</p>
            <p className="text-sm font-medium text-foreground">ДКП-2025/0042</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Менеджер</p>
            <p className="text-sm font-medium text-foreground">Саидов Алишер</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <AppStatCard
          title="Общая сумма"
          value="450 000 USD"
        />
        <AppStatCard
          title="Оплачено"
          value="234 000 USD"
          delta="52%"
          deltaTone="success"
        />
        <AppStatCard
          title="Остаток"
          value="216 000 USD"
          delta="3 платежа"
          deltaTone="warning"
        />
      </div>

      {/* Booking countdown */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Таймер бронирования:</span>
        <AppCountdownBadge
          expiresAt={bookingExpiry}
          variant="chip"
          label="Бронь истекает"
        />
      </div>

      {/* Payment timeline */}
      <AppPaymentTimeline
        title="График платежей"
        installments={MOCK_INSTALLMENTS}
        showProgress
      />
    </div>
  );
}
