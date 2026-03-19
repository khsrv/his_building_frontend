"use client";

import { useState } from "react";
import {
  AppPageHeader,
  AppDataTable,
  AppButton,
  AppSelect,
  AppStatusBadge,
  AppActionMenu,
  ConfirmDialog,
  ShimmerBox,
  AppStatePanel,
  type AppDataTableColumn,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { Invoice } from "@/modules/advanced/domain/advanced";
import { useInvoicesQuery } from "@/modules/advanced/presentation/hooks/use-invoices-query";
import { useMarkInvoicePaidMutation } from "@/modules/advanced/presentation/hooks/use-mark-invoice-paid-mutation";

// ─── Status helpers ─────────────────────────────────────────────────────────

const STATUS_TONE: Record<string, AppStatusTone> = {
  pending: "warning",
  paid: "success",
  overdue: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Ожидает",
  paid: "Оплачен",
  overdue: "Просрочен",
};

// ─── Columns ────────────────────────────────────────────────────────────────

const BASE_COLUMNS: readonly AppDataTableColumn<Invoice>[] = [
  {
    id: "amount",
    header: "Сумма",
    cell: (row) => row.amount.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.amount,
    align: "right",
  },
  {
    id: "currency",
    header: "Валюта",
    cell: (row) => <span className="font-mono">{row.currency}</span>,
  },
  {
    id: "status",
    header: "Статус",
    cell: (row) => (
      <AppStatusBadge
        label={STATUS_LABEL[row.status] ?? row.status}
        tone={STATUS_TONE[row.status] ?? "default"}
      />
    ),
    sortAccessor: (row) => row.status,
  },
  {
    id: "period",
    header: "Период",
    cell: (row) =>
      `${new Date(row.periodStart).toLocaleDateString("ru-RU")} — ${new Date(row.periodEnd).toLocaleDateString("ru-RU")}`,
    sortAccessor: (row) => row.periodStart,
  },
  {
    id: "paidAt",
    header: "Оплачено",
    cell: (row) => (row.paidAt ? new Date(row.paidAt).toLocaleDateString("ru-RU") : "—"),
    sortAccessor: (row) => row.paidAt ?? "",
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [payId, setPayId] = useState<string | null>(null);

  const invoicesQuery = useInvoicesQuery(statusFilter || undefined);
  const markPaidMutation = useMarkInvoicePaidMutation();

  const invoices = invoicesQuery.data ?? [];

  const columnsWithActions: readonly AppDataTableColumn<Invoice>[] = [
    ...BASE_COLUMNS,
    {
      id: "actions",
      header: "",
      cell: (row) =>
        row.status !== "paid" ? (
          <AppActionMenu
            triggerLabel="Действия"
            groups={[
              {
                id: "main",
                items: [
                  { id: "pay", label: "Оплатить", onClick: () => setPayId(row.id) },
                ],
              },
            ]}
          />
        ) : null,
      align: "right",
    },
  ];

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Биллинг"
        subtitle="Счета и оплата подписки"
        breadcrumbs={[
          { id: "home", label: "Панель", href: routes.dashboard },
          { id: "settings", label: "Настройки", href: routes.settings },
          { id: "invoices", label: "Биллинг" },
        ]}
      />

      {/* Status filter */}
      <div className="max-w-xs">
        <AppSelect
          id="status-filter"
          label="Фильтр по статусу"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "Все" },
            { value: "pending", label: "Ожидает" },
            { value: "paid", label: "Оплачен" },
            { value: "overdue", label: "Просрочен" },
          ]}
        />
      </div>

      {invoicesQuery.isLoading ? (
        <ShimmerBox className="h-64" />
      ) : invoicesQuery.isError ? (
        <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить счета" />
      ) : (
        <AppDataTable<Invoice>
          title="Счета"
          data={invoices}
          columns={columnsWithActions}
          rowKey={(row) => row.id}
          enableExport={false}
        />
      )}

      {/* Pay confirmation */}
      <ConfirmDialog
        open={payId !== null}
        title="Оплатить счёт"
        message="Подтвердите оплату этого счёта."
        confirmText="Оплатить"
        cancelText="Отмена"
        onConfirm={() => {
          if (payId) {
            markPaidMutation.mutate(payId, {
              onSuccess: () => setPayId(null),
            });
          }
        }}
        onClose={() => setPayId(null)}
      />
    </main>
  );
}
