"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import {
  AppButton,
  AppDataTable,
  type AppDataTableColumn,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
  ShimmerBox,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { UpcomingPayment, SchedulePaymentStatus } from "@/modules/payments/domain/entities";
import { useUpcomingPaymentsQuery } from "@/modules/payments/presentation/hooks/use-upcoming-payments.query";
import { usePropertiesFilterQuery } from "@/modules/payments/presentation/hooks/use-properties-filter.query";

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<SchedulePaymentStatus, string> = {
  pending: "Ожидается",
  upcoming: "Скоро",
  paid: "Оплачен",
  partially_paid: "Частично",
  overdue: "Просрочен",
};

const STATUS_TONE: Record<SchedulePaymentStatus, AppStatusTone> = {
  pending: "info",
  upcoming: "warning",
  paid: "success",
  partially_paid: "warning",
  overdue: "danger",
};

// ─── Date formatter ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const [year, month, day] = iso.split("-");
    return `${day ?? ""}.${month ?? ""}.${year ?? ""}`;
  } catch {
    return iso;
  }
}

function isOverdue(status: SchedulePaymentStatus): boolean {
  return status === "overdue";
}

// ─── Amount formatter ────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

// ─── Month/Year options ──────────────────────────────────────────────────────

const MONTH_OPTIONS = [
  { value: "1", label: "Январь" },
  { value: "2", label: "Февраль" },
  { value: "3", label: "Март" },
  { value: "4", label: "Апрель" },
  { value: "5", label: "Май" },
  { value: "6", label: "Июнь" },
  { value: "7", label: "Июль" },
  { value: "8", label: "Август" },
  { value: "9", label: "Сентябрь" },
  { value: "10", label: "Октябрь" },
  { value: "11", label: "Ноябрь" },
  { value: "12", label: "Декабрь" },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => {
  const y = CURRENT_YEAR - 1 + i;
  return { value: String(y), label: String(y) };
});

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Все статусы" },
  { value: "pending", label: "Ожидается" },
  { value: "upcoming", label: "Скоро" },
  { value: "paid", label: "Оплачен" },
  { value: "partially_paid", label: "Частично оплачен" },
  { value: "overdue", label: "Просрочен" },
] as const;

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<UpcomingPayment>[] = [
  {
    id: "due_date",
    header: "Дата",
    cell: (row) => (
      <span style={{ color: isOverdue(row.status) ? "var(--color-danger, #ef4444)" : undefined, fontWeight: isOverdue(row.status) ? 600 : undefined }}>
        {formatDate(row.dueDate)}
      </span>
    ),
    sortAccessor: (row) => row.dueDate,
  },
  {
    id: "client",
    header: "Клиент",
    cell: (row) => (
      <Box>
        <div style={{ fontWeight: 500 }}>{row.clientName}</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground, #64748b)" }}>
          {row.clientPhone}
        </div>
      </Box>
    ),
    sortAccessor: (row) => row.clientName,
    searchAccessor: (row) => `${row.clientName} ${row.clientPhone}`,
  },
  {
    id: "unit",
    header: "Квартира / Объект",
    cell: (row) => (
      <Box>
        <div style={{ fontWeight: 500 }}>№{row.unitNumber}</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground, #64748b)" }}>
          {row.propertyName}
        </div>
      </Box>
    ),
    sortAccessor: (row) => row.unitNumber,
    searchAccessor: (row) => `${row.unitNumber} ${row.propertyName}`,
  },
  {
    id: "deal",
    header: "Сделка",
    cell: (row) => (
      <Link
        href={routes.dealDetail(row.dealId)}
        style={{ color: "rgb(var(--primary))", textDecoration: "none", fontWeight: 500 }}
      >
        {row.dealNumber}
      </Link>
    ),
    sortAccessor: (row) => row.dealNumber,
    searchAccessor: (row) => row.dealNumber,
  },
  {
    id: "planned_amount",
    header: "Плановая сумма",
    cell: (row) => formatAmount(row.plannedAmount, row.currency),
    sortAccessor: (row) => row.plannedAmount,
    align: "right",
    exportAccessor: (row) => row.plannedAmount,
  },
  {
    id: "paid_amount",
    header: "Оплачено",
    cell: (row) => formatAmount(row.paidAmount, row.currency),
    sortAccessor: (row) => row.paidAmount,
    align: "right",
    exportAccessor: (row) => row.paidAmount,
  },
  {
    id: "remaining_amount",
    header: "Остаток",
    cell: (row) => formatAmount(row.remainingAmount, row.currency),
    sortAccessor: (row) => row.remainingAmount,
    align: "right",
    exportAccessor: (row) => row.remainingAmount,
  },
  {
    id: "status",
    header: "Статус",
    cell: (row) => (
      <AppStatusBadge
        label={STATUS_LABEL[row.status]}
        tone={STATUS_TONE[row.status]}
      />
    ),
    sortAccessor: (row) => row.status,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [propertyId, setPropertyId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const resolvedPropertyId: string | undefined = propertyId || undefined;
  const resolvedStatus: string | undefined = statusFilter || undefined;

  const { data, isLoading, isError, refetch } = useUpcomingPaymentsQuery({
    month: Number(month),
    year: Number(year),
    propertyId: resolvedPropertyId,
    status: resolvedStatus,
  });

  const { data: properties } = usePropertiesFilterQuery();

  const propertyOptions = [
    { value: "", label: "Все объекты" },
    ...(properties ?? []).map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Ближайшие платежи"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "payments", label: "Платежи", href: routes.payments },
          { id: "upcoming", label: "Ближайшие платежи" },
        ]}
        actions={
          <Link href={routes.paymentsOverdue} style={{ textDecoration: "none" }}>
            <AppButton label="Просроченные" variant="outline" size="md" />
          </Link>
        }
      />

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "flex-end",
        }}
      >
        <Box sx={{ minWidth: 140 }}>
          <AppSelect
            id="month-filter"
            label="Месяц"
            options={MONTH_OPTIONS}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </Box>
        <Box sx={{ minWidth: 110 }}>
          <AppSelect
            id="year-filter"
            label="Год"
            options={YEAR_OPTIONS}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </Box>
        <Box sx={{ minWidth: 200 }}>
          <AppSelect
            id="property-filter"
            label="Объект"
            options={propertyOptions}
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          />
        </Box>
        <Box sx={{ minWidth: 200 }}>
          <AppSelect
            id="status-filter"
            label="Статус"
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </Box>
      </Box>

      {/* Content */}
      {isLoading ? (
        <ShimmerBox style={{ height: 400, borderRadius: 12 }} />
      ) : isError ? (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки платежей"
          description="Не удалось загрузить данные о ближайших платежах"
          actionLabel="Повторить"
          onAction={() => void refetch()}
        />
      ) : !data || data.length === 0 ? (
        <AppStatePanel
          tone="empty"
          title="Нет платежей"
          description="За выбранный период платежи не найдены"
        />
      ) : (
        <AppDataTable<UpcomingPayment>
          data={data}
          columns={columns}
          rowKey={(row) => row.id}
          title="Ближайшие платежи"
          searchPlaceholder="Поиск по клиенту, квартире или сделке..."
          enableExport
          enableSettings
          fileNameBase="upcoming-payments"
        />
      )}
    </main>
  );
}
