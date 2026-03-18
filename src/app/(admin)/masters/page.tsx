"use client";

import { useState } from "react";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useMastersListQuery } from "@/modules/masters/presentation/hooks/use-masters-list-query";
import { CreateMasterDrawer } from "@/modules/masters/presentation/components/create-master-drawer";
import type { Master, MasterType } from "@/modules/masters/domain/master";

const MASTER_TYPE_LABEL: Record<MasterType, string> = {
  individual: "Индивидуал",
  brigade: "Бригада",
};

const MASTER_TYPE_TONE: Record<MasterType, AppStatusTone> = {
  individual: "info",
  brigade: "default",
};

const columns: readonly AppDataTableColumn<Master>[] = [
  {
    id: "name",
    header: "Имя",
    cell: (row) => row.name,
    sortAccessor: (row) => row.name,
    searchAccessor: (row) => row.name,
  },
  {
    id: "type",
    header: "Тип",
    cell: (row) => (
      <AppStatusBadge
        label={MASTER_TYPE_LABEL[row.type]}
        tone={MASTER_TYPE_TONE[row.type]}
      />
    ),
    sortAccessor: (row) => row.type,
  },
  {
    id: "phone",
    header: "Телефон",
    cell: (row) => row.phone ?? "—",
    searchAccessor: (row) => row.phone,
  },
  {
    id: "specialization",
    header: "Специализация",
    cell: (row) => row.specialization ?? "—",
    searchAccessor: (row) => row.specialization,
  },
  {
    id: "dailyRate",
    header: "Ставка/день",
    cell: (row) =>
      row.dailyRate !== null ? `${row.dailyRate.toLocaleString("ru-RU")} TJS` : "—",
    sortAccessor: (row) => row.dailyRate ?? 0,
    align: "right",
  },
  {
    id: "createdAt",
    header: "Дата создания",
    cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.createdAt,
  },
];

export default function MastersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isError, error } = useMastersListQuery({ page: 1, limit: 100 });

  const masters = data?.items ?? [];

  if (isError) {
    return (
      <main className="p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description={
            error instanceof Error ? error.message : "Не удалось загрузить список мастеров"
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
            title="Подрядчики"
            subtitle={`${data?.total ?? 0} мастеров`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "masters", label: "Подрядчики" },
            ]}
            actions={
              <AppButton
                label="Добавить мастера"
                variant="primary"
                size="md"
                onClick={() => setDrawerOpen(true)}
              />
            }
          />
        }
        content={
          <AppDataTable<Master>
            data={masters}
            columns={columns}
            rowKey={(row) => row.id}
            title="Подрядчики"
            searchPlaceholder="Поиск по имени, телефону, специализации..."
            enableExport
            enableSettings
          />
        }
      />

      <CreateMasterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </main>
  );
}
