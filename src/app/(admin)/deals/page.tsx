"use client";

import { useRouter } from "next/navigation";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { IconDeals, IconCategory } from "@/shared/ui/icons/kpi-icons";
import { routes } from "@/shared/constants/routes";
import { useEnrichedDealsListQuery } from "@/modules/deals/presentation/hooks/use-enriched-deals-list-query";
import { usePropertyContext } from "@/shared/providers/property-provider";
import type { Deal, DealStatus, DealPaymentType } from "@/modules/deals/domain/deal";

// ─── Status helpers ───────────────────────────────────────────────────────────

const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  draft: "Черновик",
  active: "Активная",
  completed: "Завершена",
  cancelled: "Отменена",
};

const DEAL_STATUS_TONE: Record<DealStatus, AppStatusTone> = {
  draft: "muted",
  active: "info",
  completed: "success",
  cancelled: "danger",
};

const PAYMENT_TYPE_LABEL: Record<DealPaymentType, string> = {
  full_payment: "Полная оплата",
  installment: "Рассрочка",
  mortgage: "Ипотека",
  barter: "Бартер",
  combined: "Комбинированная",
};

function formatMoney(amount: number, currency: string): string {
  return (
    new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) +
    " " +
    currency
  );
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<Deal>[] = [
  {
    id: "dealNumber",
    header: "Номер",
    cell: (row) => (
      <span className="font-mono text-sm font-medium text-primary">{row.dealNumber}</span>
    ),
    sortAccessor: (row) => row.dealNumber,
    searchAccessor: (row) => row.dealNumber,
  },
  {
    id: "clientName",
    header: "Клиент",
    cell: (row) => (
      <div>
        <p className="text-sm font-medium text-foreground">{row.clientName}</p>
        <p className="text-xs text-muted-foreground">{row.clientPhone}</p>
      </div>
    ),
    sortAccessor: (row) => row.clientName,
    searchAccessor: (row) => `${row.clientName} ${row.clientPhone}`,
  },
  {
    id: "unitNumber",
    header: "Квартира",
    cell: (row) => row.unitNumber,
    searchAccessor: (row) => row.unitNumber,
  },
  {
    id: "propertyName",
    header: "Объект",
    cell: (row) => row.propertyName,
    sortAccessor: (row) => row.propertyName,
    searchAccessor: (row) => row.propertyName,
  },
  {
    id: "totalAmount",
    header: "Сумма",
    cell: (row) => formatMoney(row.totalAmount, row.currency),
    sortAccessor: (row) => row.totalAmount,
    align: "right",
  },
  {
    id: "paymentType",
    header: "Тип оплаты",
    cell: (row) => (
      <span className="flex flex-wrap items-center gap-1">
        {PAYMENT_TYPE_LABEL[row.paymentType]}
        {row.paymentType === "barter" ? (
          <AppStatusBadge label="Обмен" tone="warning" />
        ) : null}
      </span>
    ),
    sortAccessor: (row) => row.paymentType,
  },
  {
    id: "status",
    header: "Статус",
    cell: (row) => (
      <AppStatusBadge
        label={DEAL_STATUS_LABEL[row.status]}
        tone={DEAL_STATUS_TONE[row.status]}
      />
    ),
    sortAccessor: (row) => row.status,
  },
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
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DealsPage() {
  const router = useRouter();
  const { currentPropertyId } = usePropertyContext();

  const { data = [], error } = useEnrichedDealsListQuery(
    currentPropertyId ? { propertyId: currentPropertyId, limit: 200 } : { limit: 200 },
  );

  const activeCount = data.filter((d) => d.status === "active").length;
  const draftCount = data.filter((d) => d.status === "draft").length;
  const completedCount = data.filter((d) => d.status === "completed").length;
  const cancelledCount = data.filter((d) => d.status === "cancelled").length;

  return (
    <>
      <main className="space-y-6 p-4 md:p-6">
        <AppCrudPageScaffold
          header={
            <AppPageHeader
              title="Сделки"
              subtitle={`${data.length} сделок`}
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
                { title: "Активных", value: activeCount, deltaTone: "info", icon: <IconDeals /> },
                { title: "Черновиков", value: draftCount, deltaTone: "default", icon: <IconCategory /> },
                { title: "Завершённых", value: completedCount, deltaTone: "success", icon: <IconCategory /> },
                { title: "Отменённых", value: cancelledCount, deltaTone: "danger", icon: <IconCategory /> },
              ]}
            />
          }
          content={
            error ? (
              <AppStatePanel
                tone="error"
                title="Ошибка загрузки сделок"
                description={error instanceof Error ? error.message : "Попробуйте обновить страницу"}
              />
            ) : (
              <AppDataTable<Deal>
                data={data}
                columns={columns}
                rowKey={(row) => row.id}
                title="Сделки"
                searchPlaceholder="Поиск по номеру, клиенту, квартире..."
                enableExport
                enableSettings
                onRowClick={(row) => router.push(routes.dealDetail(row.id))}
              />
            )
          }
        />
      </main>
    </>
  );
}
