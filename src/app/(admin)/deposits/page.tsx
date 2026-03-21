"use client";

import { useMemo, useState } from "react";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useDepositsListQuery } from "@/modules/deposits/presentation/hooks/use-deposits-list-query";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import { CreateDepositDrawer } from "@/modules/deposits/presentation/components/create-deposit-drawer";
import { ReturnDepositDialog } from "@/modules/deposits/presentation/components/return-deposit-dialog";
import { ApplyDepositDialog } from "@/modules/deposits/presentation/components/apply-deposit-dialog";
import type { Deposit, DepositStatus, DepositsListParams } from "@/modules/deposits/domain/deposit";

// ─── Status helpers ───────────────────────────────────────────────────────────

const DEPOSIT_STATUS_LABEL: Record<DepositStatus, string> = {
  active: "Активен",
  applied: "Зачтён",
  returned: "Возвращён",
};

const DEPOSIT_STATUS_TONE: Record<DepositStatus, AppStatusTone> = {
  active: "warning",
  applied: "success",
  returned: "muted",
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Все статусы" },
  { value: "active", label: "Активные" },
  { value: "applied", label: "Зачтённые" },
  { value: "returned", label: "Возвращённые" },
] as const;

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency}`;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "…";
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DepositsPage() {
  // Filters
  const [statusFilter, setStatusFilter] = useState<DepositStatus | "">("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryParams = useMemo<DepositsListParams>(() => {
    const p: DepositsListParams = { limit: 200 };
    if (statusFilter) p.status = statusFilter;
    if (propertyFilter) p.propertyId = propertyFilter;
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo) p.dateTo = dateTo;
    return p;
  }, [statusFilter, propertyFilter, dateFrom, dateTo]);

  const { data: result, error } = useDepositsListQuery(queryParams);
  const deposits = result?.items ?? [];

  const { data: propertiesResult } = usePropertiesListQuery();
  const properties = propertiesResult?.items ?? [];
  const propertyNameMap = new Map<string, string>(
    properties.map((p) => [p.id, p.name] as [string, string]),
  );

  const propertyFilterOptions = [
    { value: "", label: "Все объекты" },
    ...properties.map((p) => ({ value: p.id, label: p.name })),
  ];

  // Drawers/dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<Deposit | null>(null);
  const [applyTarget, setApplyTarget] = useState<Deposit | null>(null);

  // KPIs
  const activeDeposits = deposits.filter((d) => d.status === "active");
  const appliedDeposits = deposits.filter((d) => d.status === "applied");
  const returnedDeposits = deposits.filter((d) => d.status === "returned");
  const activeTotal = activeDeposits.reduce((s, d) => s + d.amount, 0);

  // ─── Columns ────────────────────────────────────────────────────────────────
  const columns: readonly AppDataTableColumn<Deposit>[] = [
    {
      id: "createdAt",
      header: "Дата",
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      sortAccessor: (row) => row.createdAt,
    },
    {
      id: "depositorName",
      header: "Вноситель",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.depositorName}</p>
          {row.depositorPhone ? (
            <p className="text-xs text-muted-foreground">{row.depositorPhone}</p>
          ) : null}
        </div>
      ),
      sortAccessor: (row) => row.depositorName,
      searchAccessor: (row) => `${row.depositorName} ${row.depositorPhone ?? ""}`,
    },
    {
      id: "amount",
      header: "Сумма",
      cell: (row) => (
        <span className="font-medium">{formatMoney(row.amount, row.currency)}</span>
      ),
      sortAccessor: (row) => row.amount,
      align: "right",
    },
    {
      id: "status",
      header: "Статус",
      cell: (row) => (
        <AppStatusBadge
          label={DEPOSIT_STATUS_LABEL[row.status]}
          tone={DEPOSIT_STATUS_TONE[row.status]}
        />
      ),
      sortAccessor: (row) => row.status,
    },
    {
      id: "propertyId",
      header: "Объект",
      cell: (row) =>
        row.propertyId ? (propertyNameMap.get(row.propertyId) ?? "—") : "—",
      sortAccessor: (row) =>
        row.propertyId ? (propertyNameMap.get(row.propertyId) ?? "") : "",
    },
    {
      id: "notes",
      header: "Заметки",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.notes ? truncate(row.notes, 40) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row) =>
        row.status === "active" ? (
          <div className="flex gap-1">
            <AppButton
              label="Зачесть"
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setApplyTarget(row);
              }}
            />
            <AppButton
              label="Вернуть"
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setReturnTarget(row);
              }}
            />
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <main className="space-y-6 p-4 md:p-6">
        <AppCrudPageScaffold
          header={
            <AppPageHeader
              title="Залоги"
              subtitle={`${deposits.length} записей`}
              breadcrumbs={[
                { id: "dashboard", label: "Панель", href: routes.dashboard },
                { id: "finance", label: "Финансы", href: routes.finance },
                { id: "deposits", label: "Залоги" },
              ]}
              actions={
                <AppButton
                  label="+ Принять залог"
                  variant="primary"
                  size="md"
                  onClick={() => setCreateOpen(true)}
                />
              }
            />
          }
          filters={
            <>
              <AppKpiGrid
                columns={4}
                items={[
                  { title: "Активных", value: activeDeposits.length, deltaTone: "warning" },
                  {
                    title: "Сумма активных",
                    value: activeTotal > 0 ? formatMoney(activeTotal, "UZS") : "0",
                    deltaTone: "warning",
                  },
                  { title: "Зачтённых", value: appliedDeposits.length, deltaTone: "success" },
                  { title: "Возвращённых", value: returnedDeposits.length, deltaTone: "default" },
                ]}
              />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <AppSelect
                  id="deposit-status-filter"
                  label="Статус"
                  options={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DepositStatus | "")}
                />
                <AppSelect
                  id="deposit-property-filter"
                  label="Объект"
                  options={propertyFilterOptions}
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                />
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Дата от
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Дата до
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </>
          }
          content={
            error ? (
              <AppStatePanel
                tone="error"
                title="Ошибка загрузки залогов"
                description={
                  error instanceof Error ? error.message : "Попробуйте обновить страницу"
                }
              />
            ) : (
              <AppDataTable<Deposit>
                data={deposits}
                columns={columns}
                rowKey={(row) => row.id}
                title="Залоги"
                searchPlaceholder="Поиск по имени вносителя..."
                enableExport
                enableSettings
              />
            )
          }
        />
      </main>

      <CreateDepositDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {returnTarget !== null ? (
        <ReturnDepositDialog
          open
          deposit={returnTarget}
          onClose={() => setReturnTarget(null)}
        />
      ) : null}

      {applyTarget !== null ? (
        <ApplyDepositDialog
          open
          deposit={applyTarget}
          onClose={() => setApplyTarget(null)}
        />
      ) : null}
    </>
  );
}
