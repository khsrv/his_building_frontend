"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useMaterialsListQuery } from "@/modules/warehouse/presentation/hooks/use-materials-list-query";
import { CreateMaterialDrawer } from "@/modules/warehouse/presentation/components/create-material-drawer";
import type { Material, MaterialUnit } from "@/modules/warehouse/domain/warehouse";

const UNIT_LABEL: Record<MaterialUnit, string> = {
  tonne: "Тонна",
  m3: "м³",
  m2: "м²",
  piece: "Штука",
  package: "Упаковка",
  kg: "кг",
  litre: "Литр",
  meter: "Метр",
};

const columns: readonly AppDataTableColumn<Material>[] = [
  {
    id: "name",
    header: "Название",
    cell: (row) => (
      <Box sx={{ color: row.currentStock < row.minStock ? "error.main" : "text.primary" }}>
        {row.name}
      </Box>
    ),
    sortAccessor: (row) => row.name,
    searchAccessor: (row) => row.name,
  },
  {
    id: "unit",
    header: "Ед. изм.",
    cell: (row) => UNIT_LABEL[row.unit],
    sortAccessor: (row) => row.unit,
  },
  {
    id: "currentStock",
    header: "Остаток",
    cell: (row) => (
      <Box
        sx={{
          fontWeight: row.currentStock < row.minStock ? 700 : 400,
          color: row.currentStock < row.minStock ? "error.main" : "text.primary",
        }}
      >
        {row.currentStock.toLocaleString("ru-RU")}
      </Box>
    ),
    sortAccessor: (row) => row.currentStock,
    align: "right",
  },
  {
    id: "minStock",
    header: "Мин. остаток",
    cell: (row) => row.minStock.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.minStock,
    align: "right",
  },
  {
    id: "stockStatus",
    header: "Статус остатка",
    cell: (row) =>
      row.currentStock < row.minStock ? (
        <AppStatusBadge label="Мало на складе" tone="danger" />
      ) : (
        <AppStatusBadge label="В норме" tone="success" />
      ),
  },
  {
    id: "createdAt",
    header: "Дата создания",
    cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.createdAt,
  },
];

export default function WarehouseMaterialsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isError, error } = useMaterialsListQuery({
    page: 1,
    limit: 200,
  });

  const materials = data?.items ?? [];
  const lowStockCount = materials.filter((m) => m.currentStock < m.minStock).length;

  if (isError) {
    return (
      <main className="p-4 md:p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description={
            error instanceof Error ? error.message : "Не удалось загрузить список материалов"
          }
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Материалы"
            subtitle={
              lowStockCount > 0
                ? `${data?.total ?? 0} материалов — ${lowStockCount} с низким остатком`
                : `${data?.total ?? 0} материалов`
            }
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "warehouse", label: "Склад", href: routes.warehouse },
              { id: "materials", label: "Материалы" },
            ]}
            actions={
              <AppButton
                label="Добавить материал"
                variant="primary"
                size="md"
                onClick={() => setDrawerOpen(true)}
              />
            }
          />
        }
        content={
          <AppDataTable<Material>
            data={materials}
            columns={columns}
            rowKey={(row) => row.id}
            title="Материалы"
            searchPlaceholder="Поиск по названию..."
            enableExport
            enableSettings
          />
        }
      />

      <CreateMaterialDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </main>
  );
}
