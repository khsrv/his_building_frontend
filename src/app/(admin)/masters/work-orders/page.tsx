"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  type AppActionMenuGroup,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useWorkOrdersListQuery } from "@/modules/masters/presentation/hooks/use-work-orders-list-query";
import { useMastersListQuery } from "@/modules/masters/presentation/hooks/use-masters-list-query";
import { useStartWorkOrderMutation, useAcceptWorkOrderMutation } from "@/modules/masters/presentation/hooks/use-work-order-actions-mutation";
import { CreateWorkOrderDrawer } from "@/modules/masters/presentation/components/create-work-order-drawer";
import { CompleteWorkOrderDrawer } from "@/modules/masters/presentation/components/complete-work-order-drawer";
import type { WorkOrder, WorkOrderStatus } from "@/modules/masters/domain/master";

const STATUS_LABEL: Record<WorkOrderStatus, string> = {
  draft: "Черновик",
  in_progress: "В работе",
  completed: "Завершён",
  accepted: "Принят",
};

const STATUS_TONE: Record<WorkOrderStatus, AppStatusTone> = {
  draft: "muted",
  in_progress: "info",
  completed: "warning",
  accepted: "success",
};

const STATUS_FILTER_OPTIONS = [
  { label: "Все статусы", value: "" },
  { label: "Черновик", value: "draft" },
  { label: "В работе", value: "in_progress" },
  { label: "Завершён", value: "completed" },
  { label: "Принят", value: "accepted" },
];

export default function WorkOrdersPage() {
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMasterId, setFilterMasterId] = useState("");

  const mastersQuery = useMastersListQuery({ limit: 100 });
  const startMutation = useStartWorkOrderMutation();
  const acceptMutation = useAcceptWorkOrderMutation();

  const workOrdersParams: {
    page: number;
    limit: number;
    status?: WorkOrderStatus;
    masterId?: string;
  } = {
    page: 1,
    limit: 200,
    ...(filterStatus ? { status: filterStatus as WorkOrderStatus } : {}),
    ...(filterMasterId ? { masterId: filterMasterId } : {}),
  };

  const { data, isError, error } = useWorkOrdersListQuery(workOrdersParams);

  const workOrders = data?.items ?? [];

  const masterFilterOptions = [
    { label: "Все мастера", value: "" },
    ...(mastersQuery.data?.items ?? []).map((m) => ({
      label: m.name,
      value: m.id,
    })),
  ];

  const getRowActions = (row: WorkOrder): readonly AppActionMenuGroup[] => {
    const items = [];

    if (row.status === "draft") {
      items.push({
        id: "start",
        label: "Начать работу",
        onClick: () => startMutation.mutate(row.id),
      });
    }

    if (row.status === "in_progress") {
      items.push({
        id: "complete",
        label: "Завершить",
        onClick: () => setCompleteTarget(row.id),
      });
    }

    if (row.status === "completed") {
      items.push({
        id: "accept",
        label: "Принять",
        onClick: () => acceptMutation.mutate(row.id),
      });
    }

    return items.length > 0
      ? [{ id: "actions", items }]
      : [];
  };

  const columns: readonly AppDataTableColumn<WorkOrder>[] = [
    {
      id: "id",
      header: "ID",
      cell: (row) => row.id.slice(0, 8).toUpperCase(),
      sortAccessor: (row) => row.id,
    },
    {
      id: "masterName",
      header: "Мастер",
      cell: (row) => row.masterName,
      sortAccessor: (row) => row.masterName,
      searchAccessor: (row) => row.masterName,
    },
    {
      id: "propertyName",
      header: "Объект",
      cell: (row) => row.propertyName,
      sortAccessor: (row) => row.propertyName,
      searchAccessor: (row) => row.propertyName,
    },
    {
      id: "description",
      header: "Описание",
      cell: (row) => row.description,
      searchAccessor: (row) => row.description,
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
    {
      id: "plannedAmount",
      header: "Плановая сумма",
      cell: (row) => `${row.plannedAmount.toLocaleString("ru-RU")} TJS`,
      sortAccessor: (row) => row.plannedAmount,
      align: "right",
    },
    {
      id: "actualAmount",
      header: "Фактическая сумма",
      cell: (row) =>
        row.actualAmount !== null
          ? `${row.actualAmount.toLocaleString("ru-RU")} TJS`
          : "—",
      sortAccessor: (row) => row.actualAmount ?? 0,
      align: "right",
    },
    {
      id: "plannedStartDate",
      header: "Дата начала",
      cell: (row) => new Date(row.plannedStartDate).toLocaleDateString("ru-RU"),
      sortAccessor: (row) => row.plannedStartDate,
    },
  ];

  if (isError) {
    return (
      <main className="p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description={
            error instanceof Error ? error.message : "Не удалось загрузить список нарядов"
          }
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Наряды"
            subtitle={`${data?.total ?? 0} нарядов`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "masters", label: "Подрядчики", href: routes.masters },
              { id: "work-orders", label: "Наряды" },
            ]}
            actions={
              <AppButton
                label="Создать наряд"
                variant="primary"
                size="md"
                onClick={() => setCreateDrawerOpen(true)}
              />
            }
          />
        }
        filters={
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <AppSelect
              id="filter-status"
              label="Статус"
              options={STATUS_FILTER_OPTIONS}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
            <AppSelect
              id="filter-master"
              label="Мастер"
              options={masterFilterOptions}
              value={filterMasterId}
              onChange={(e) => setFilterMasterId(e.target.value)}
            />
          </Stack>
        }
        content={
          <AppDataTable<WorkOrder>
            data={workOrders}
            columns={columns}
            rowKey={(row) => row.id}
            title="Наряды"
            searchPlaceholder="Поиск по мастеру, объекту или описанию..."
            enableExport
            enableSettings
            rowActions={getRowActions}
            rowActionsTriggerLabel="Действия"
          />
        }
      />

      <CreateWorkOrderDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
      />

      {completeTarget ? (
        <CompleteWorkOrderDrawer
          open={Boolean(completeTarget)}
          workOrderId={completeTarget}
          onClose={() => setCompleteTarget(null)}
        />
      ) : null}
    </main>
  );
}
