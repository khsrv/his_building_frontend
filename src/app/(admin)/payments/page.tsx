"use client";

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
import type { Payment } from "@/shared/types/entities";
import type { PaymentStatus } from "@/shared/types/enums";
import { CURRENCY_CONFIG } from "@/shared/types/enums";

// ─── Status helpers ──────────────────────────────────────────────────────────

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  planned: "Запланирован",
  paid: "Оплачен",
  overdue: "Просрочен",
  partially_paid: "Частично оплачен",
  cancelled: "Отменён",
};

const PAYMENT_STATUS_TONE: Record<PaymentStatus, AppStatusTone> = {
  planned: "info",
  paid: "success",
  overdue: "danger",
  partially_paid: "warning",
  cancelled: "muted",
};

// ─── Mock data ──────────────────────────────────────────────────────────────
// TODO: replace with real API hook (e.g. usePaymentsListQuery)

const MOCK_PAYMENTS: readonly Payment[] = [
  {
    id: "p1",
    dealId: "d1",
    tenantId: "t1",
    amount: 150_000,
    currency: "TJS",
    status: "paid",
    dueDate: "2025-06-01",
    paidDate: "2025-05-28",
    label: "Первоначальный взнос",
    receiptNumber: "REC-001",
  },
  {
    id: "p2",
    dealId: "d1",
    tenantId: "t1",
    amount: 50_000,
    currency: "TJS",
    status: "paid",
    dueDate: "2025-07-01",
    paidDate: "2025-07-01",
    label: "Рассрочка #1",
    receiptNumber: "REC-002",
  },
  {
    id: "p3",
    dealId: "d2",
    tenantId: "t1",
    amount: 25_000,
    currency: "USD",
    status: "overdue",
    dueDate: "2025-12-15",
    paidDate: null,
    label: "Рассрочка #3",
    receiptNumber: null,
  },
  {
    id: "p4",
    dealId: "d2",
    tenantId: "t1",
    amount: 25_000,
    currency: "USD",
    status: "planned",
    dueDate: "2026-03-15",
    paidDate: null,
    label: "Рассрочка #4",
    receiptNumber: null,
  },
  {
    id: "p5",
    dealId: "d3",
    tenantId: "t1",
    amount: 80_000,
    currency: "TJS",
    status: "partially_paid",
    dueDate: "2026-01-10",
    paidDate: null,
    label: "Рассрочка #2",
    receiptNumber: null,
  },
  {
    id: "p6",
    dealId: "d4",
    tenantId: "t1",
    amount: 200_000,
    currency: "TJS",
    status: "cancelled",
    dueDate: "2025-09-01",
    paidDate: null,
    label: "Полная оплата",
    receiptNumber: null,
  },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: Payment["currency"]): string {
  const cfg = CURRENCY_CONFIG[currency];
  return `${amount.toLocaleString("ru-RU")} ${cfg.symbol}`;
}

// ─── Columns ────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<Payment>[] = [
  {
    id: "label",
    header: "Назначение",
    cell: (row) => row.label ?? row.dealId,
    sortAccessor: (row) => row.label ?? row.dealId,
    searchAccessor: (row) => row.label ?? row.dealId,
  },
  {
    id: "amount",
    header: "Сумма",
    cell: (row) => formatAmount(row.amount, row.currency),
    sortAccessor: (row) => row.amount,
    align: "right",
  },
  {
    id: "status",
    header: "Статус",
    cell: (row) => (
      <AppStatusBadge
        label={PAYMENT_STATUS_LABEL[row.status]}
        tone={PAYMENT_STATUS_TONE[row.status]}
      />
    ),
    sortAccessor: (row) => row.status,
  },
  {
    id: "dueDate",
    header: "Дата оплаты",
    cell: (row) => row.dueDate,
    sortAccessor: (row) => row.dueDate,
  },
  {
    id: "paidDate",
    header: "Оплачено",
    cell: (row) => row.paidDate ?? "—",
    sortAccessor: (row) => row.paidDate ?? "",
  },
  {
    id: "receiptNumber",
    header: "Квитанция",
    cell: (row) => row.receiptNumber ?? "—",
    searchAccessor: (row) => row.receiptNumber,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  // TODO: replace with real API hook
  const data = MOCK_PAYMENTS;

  const total = data.length;
  const paid = data.filter((p) => p.status === "paid").length;
  const overdue = data.filter((p) => p.status === "overdue").length;
  const planned = data.filter((p) => p.status === "planned" || p.status === "partially_paid").length;

  return (
    <main className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Платежи"
            subtitle={`${total} платежей`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "payments", label: "Платежи" },
            ]}
            actions={
              <AppButton label="Принять платёж" variant="primary" size="md" />
            }
          />
        }
        filters={
          <AppKpiGrid
            columns={4}
            items={[
              { title: "Всего платежей", value: total },
              { title: "Оплачено", value: paid, deltaTone: "success" },
              { title: "Просрочено", value: overdue, deltaTone: "danger" },
              { title: "Ожидается", value: planned, deltaTone: "info" },
            ]}
          />
        }
        content={
          <AppDataTable<Payment>
            data={data}
            columns={columns}
            rowKey={(row) => row.id}
            title="Платежи"
            searchPlaceholder="Поиск по назначению или квитанции..."
            enableExport
            enableSettings
          />
        }
      />
    </main>
  );
}
