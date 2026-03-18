"use client";

import { useRouter } from "next/navigation";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { CURRENCY_CONFIG } from "@/shared/types/enums";
import type { Deal } from "@/shared/types/entities";
import type { DealStage, PaymentType } from "@/shared/types/enums";

// ─── Stage helpers ───────────────────────────────────────────────────────────

const DEAL_STAGE_LABEL: Record<DealStage, string> = {
  new_lead: "Новый лид",
  processing: "Обработка",
  meeting: "Встреча",
  interested: "Заинтересован",
  booking: "Бронь",
  deal_formation: "Оформление",
  payment: "Оплата",
  completed: "Завершена",
  rejected: "Отказ",
  deferred: "Отложена",
};

const DEAL_STAGE_TONE: Record<DealStage, AppStatusTone> = {
  new_lead: "info",
  processing: "default",
  meeting: "default",
  interested: "warning",
  booking: "warning",
  deal_formation: "info",
  payment: "success",
  completed: "success",
  rejected: "danger",
  deferred: "muted",
};

const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  full_payment: "Полная оплата",
  installment: "Рассрочка",
  mortgage: "Ипотека",
  barter: "Бартер",
  combined: "Комбинированная",
};

// ─── Format helpers ──────────────────────────────────────────────────────────

function formatMoney(amount: number, currencyCode: keyof typeof CURRENCY_CONFIG): string {
  const config = CURRENCY_CONFIG[currencyCode];
  return `${amount.toLocaleString("ru-RU")} ${config.symbol}`;
}

// ─── Mock data (replace with API hook) ───────────────────────────────────────

const MOCK_DEALS: readonly Deal[] = [
  {
    id: "d1",
    tenantId: "t1",
    clientId: "c1",
    clientName: "Рахимов Фаррух С.",
    unitId: "u1",
    unitLabel: "Блок А, кв. 45",
    buildingName: "ЖК Сомон",
    stage: "payment",
    paymentType: "installment",
    totalAmount: 450000,
    paidAmount: 180000,
    currency: "TJS",
    managerId: "m1",
    managerName: "Шарипов А.",
    contractNumber: "D-2025-001",
    bookingExpiresAt: null,
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "d2",
    tenantId: "t1",
    clientId: "c2",
    clientName: "Каримова Нигина А.",
    unitId: "u2",
    unitLabel: "Блок Б, кв. 12",
    buildingName: "ЖК Дусти",
    stage: "booking",
    paymentType: "mortgage",
    totalAmount: 85000,
    paidAmount: 8500,
    currency: "USD",
    managerId: "m2",
    managerName: "Назаров Д.",
    contractNumber: null,
    bookingExpiresAt: "2026-03-25T23:59:59Z",
    createdAt: "2026-01-20T14:30:00Z",
  },
  {
    id: "d3",
    tenantId: "t1",
    clientId: "c3",
    clientName: "Саидов Бехруз Р.",
    unitId: "u3",
    unitLabel: "Блок А, кв. 78",
    buildingName: "ЖК Пойтахт",
    stage: "completed",
    paymentType: "full_payment",
    totalAmount: 620000,
    paidAmount: 620000,
    currency: "TJS",
    managerId: "m1",
    managerName: "Шарипов А.",
    contractNumber: "D-2025-042",
    bookingExpiresAt: null,
    createdAt: "2025-08-10T09:15:00Z",
  },
  {
    id: "d4",
    tenantId: "t1",
    clientId: "c4",
    clientName: "Назарова Мадина Х.",
    unitId: "u4",
    unitLabel: "Блок В, кв. 33",
    buildingName: "ЖК Сомон",
    stage: "deal_formation",
    paymentType: "installment",
    totalAmount: 380000,
    paidAmount: 0,
    currency: "TJS",
    managerId: "m3",
    managerName: "Ализода М.",
    contractNumber: null,
    bookingExpiresAt: null,
    createdAt: "2026-02-25T11:00:00Z",
  },
  {
    id: "d5",
    tenantId: "t1",
    clientId: "c5",
    clientName: "Ашуров Далер К.",
    unitId: "u5",
    unitLabel: "Блок А, кв. 5",
    buildingName: "ЖК Навруз",
    stage: "new_lead",
    paymentType: "full_payment",
    totalAmount: 290000,
    paidAmount: 0,
    currency: "TJS",
    managerId: "m2",
    managerName: "Назаров Д.",
    contractNumber: null,
    bookingExpiresAt: null,
    createdAt: "2026-03-12T16:45:00Z",
  },
  {
    id: "d6",
    tenantId: "t1",
    clientId: "c6",
    clientName: "Джураева Фируза А.",
    unitId: "u6",
    unitLabel: "Блок Б, кв. 101",
    buildingName: "ЖК Истиклол",
    stage: "rejected",
    paymentType: "combined",
    totalAmount: 520000,
    paidAmount: 52000,
    currency: "TJS",
    managerId: "m1",
    managerName: "Шарипов А.",
    contractNumber: "D-2026-003",
    bookingExpiresAt: null,
    createdAt: "2026-01-05T08:20:00Z",
  },
] as const;

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<Deal>[] = [
  {
    id: "clientName",
    header: "Клиент",
    cell: (row) => row.clientName,
    sortAccessor: (row) => row.clientName,
    searchAccessor: (row) => row.clientName,
  },
  {
    id: "unitLabel",
    header: "Квартира",
    cell: (row) => row.unitLabel,
    searchAccessor: (row) => row.unitLabel,
  },
  {
    id: "buildingName",
    header: "Объект",
    cell: (row) => row.buildingName,
    sortAccessor: (row) => row.buildingName,
    searchAccessor: (row) => row.buildingName,
  },
  {
    id: "stage",
    header: "Этап",
    cell: (row) => (
      <AppStatusBadge
        label={DEAL_STAGE_LABEL[row.stage]}
        tone={DEAL_STAGE_TONE[row.stage]}
      />
    ),
    sortAccessor: (row) => row.stage,
  },
  {
    id: "paymentType",
    header: "Тип оплаты",
    cell: (row) => PAYMENT_TYPE_LABEL[row.paymentType],
    sortAccessor: (row) => row.paymentType,
  },
  {
    id: "totalAmount",
    header: "Сумма",
    cell: (row) => formatMoney(row.totalAmount, row.currency),
    sortAccessor: (row) => row.totalAmount,
    align: "right",
  },
  {
    id: "paidAmount",
    header: "Оплачено",
    cell: (row) => formatMoney(row.paidAmount, row.currency),
    sortAccessor: (row) => row.paidAmount,
    align: "right",
  },
  {
    id: "managerName",
    header: "Менеджер",
    cell: (row) => row.managerName,
    sortAccessor: (row) => row.managerName,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DealsPage() {
  const router = useRouter();

  // TODO: replace with real API hook (e.g. useDealsListQuery)
  const data = MOCK_DEALS;

  const totalDeals = data.length;
  const inProgress = data.filter((d) =>
    ["processing", "meeting", "interested", "booking", "deal_formation"].includes(d.stage),
  ).length;
  const inPayment = data.filter((d) => d.stage === "payment").length;
  const completed = data.filter((d) => d.stage === "completed").length;

  return (
    <main className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Сделки"
            subtitle={`${totalDeals} сделок`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "deals", label: "Сделки" },
            ]}
            actions={
              <AppButton
                label="Новая сделка"
                variant="primary"
                size="md"
                onClick={() => router.push(routes.dealCreate)}
              />
            }
          />
        }
        filters={
          <AppKpiGrid
            columns={4}
            items={[
              { title: "Всего сделок", value: totalDeals },
              { title: "В работе", value: inProgress, deltaTone: "warning" },
              { title: "Оплата", value: inPayment, deltaTone: "info" },
              { title: "Завершённых", value: completed, deltaTone: "success" },
            ]}
          />
        }
        content={
          <AppDataTable<Deal>
            data={data}
            columns={columns}
            rowKey={(row) => row.id}
            title="Сделки"
            searchPlaceholder="Поиск по клиенту, квартире или объекту..."
            enableExport
            enableSettings
            onRowClick={(row) => router.push(routes.dealDetail(row.id))}
          />
        }
      />
    </main>
  );
}
