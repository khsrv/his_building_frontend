"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  AppButton,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
  ShimmerBox,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { OverduePayment } from "@/modules/payments/domain/entities";
import { useOverduePaymentsQuery } from "@/modules/payments/presentation/hooks/use-overdue-payments.query";

// ─── Date formatter ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const [year, month, day] = iso.split("-");
    return `${day ?? ""}.${month ?? ""}.${year ?? ""}`;
  } catch {
    return iso;
  }
}

// ─── Amount formatter ────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const dangerStyle = { color: "#ef4444", fontWeight: 600 } as const;

const columns: readonly AppDataTableColumn<OverduePayment>[] = [
  {
    id: "due_date",
    header: "Дата просрочки",
    cell: (row) => (
      <span style={dangerStyle}>{formatDate(row.dueDate)}</span>
    ),
    sortAccessor: (row) => row.dueDate,
  },
  {
    id: "days_overdue",
    header: "Дней просрочено",
    cell: (row) => (
      <AppStatusBadge
        label={`${row.daysOverdue} дн.`}
        tone="danger"
      />
    ),
    sortAccessor: (row) => row.daysOverdue,
    align: "center",
    exportAccessor: (row) => row.daysOverdue,
  },
  {
    id: "client",
    header: "Клиент",
    cell: (row) => (
      <Box>
        <div style={{ fontWeight: 500 }}>{row.clientName}</div>
        <a
          href={`tel:${row.clientPhone}`}
          style={{ fontSize: 12, color: "rgb(var(--primary))", textDecoration: "none" }}
        >
          {row.clientPhone}
        </a>
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
    id: "remaining_amount",
    header: "Сумма долга",
    cell: (row) => (
      <span style={dangerStyle}>
        {formatAmount(row.remainingAmount, row.currency)}
      </span>
    ),
    sortAccessor: (row) => row.remainingAmount,
    align: "right",
    exportAccessor: (row) => row.remainingAmount,
  },
  {
    id: "action",
    header: "Действие",
    cell: (row) => (
      <a href={`tel:${row.clientPhone}`} style={{ textDecoration: "none" }}>
        <AppButton label="Позвонить" variant="outline" size="sm" />
      </a>
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverduePaymentsPage() {
  const { data, isLoading, isError, refetch } = useOverduePaymentsQuery();

  const totalCount = data?.length ?? 0;
  const totalAmount = data?.reduce((sum, p) => sum + p.remainingAmount, 0) ?? 0;

  // Compute the most common currency for display (fallback to USD)
  const dominantCurrency =
    data && data.length > 0 ? (data[0]?.currency ?? "USD") : "USD";

  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Просроченные платежи"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "payments", label: "Платежи", href: routes.payments },
          { id: "overdue", label: "Просроченные платежи" },
        ]}
      />

      {/* KPI Summary */}
      {!isLoading && data ? (
        <AppKpiGrid
          columns={2}
          items={[
            {
              title: "Всего просроченных",
              value: (
                <Typography variant="h5" fontWeight={700} color="error">
                  {totalCount}
                </Typography>
              ),
              deltaTone: "danger",
            },
            {
              title: "Общая сумма долга",
              value: (
                <Typography variant="h5" fontWeight={700} color="error">
                  {formatAmount(totalAmount, dominantCurrency)}
                </Typography>
              ),
              deltaTone: "danger",
            },
          ]}
        />
      ) : null}

      {/* Content */}
      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <ShimmerBox style={{ height: 100, borderRadius: 12 }} />
          <ShimmerBox style={{ height: 400, borderRadius: 12 }} />
        </Box>
      ) : isError ? (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки просроченных платежей"
          description="Не удалось загрузить данные. Попробуйте ещё раз."
          actionLabel="Повторить"
          onAction={() => void refetch()}
        />
      ) : !data || data.length === 0 ? (
        <AppStatePanel
          tone="empty"
          title="Просроченных платежей нет"
          description="Все платежи в порядке. Просроченных задолженностей не найдено."
        />
      ) : (
        <AppDataTable<OverduePayment>
          data={data}
          columns={columns}
          rowKey={(row) => row.id}
          title="Просроченные платежи"
          searchPlaceholder="Поиск по клиенту, квартире или сделке..."
          enableExport
          enableSettings
          fileNameBase="overdue-payments"
        />
      )}
    </main>
  );
}
