"use client";

import { Box, Typography } from "@mui/material";
import {
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useMaterialsListQuery } from "@/modules/warehouse/presentation/hooks/use-materials-list-query";
import { useSuppliersListQuery } from "@/modules/warehouse/presentation/hooks/use-suppliers-list-query";
import { useStockMovementsListQuery } from "@/modules/warehouse/presentation/hooks/use-stock-movements-list-query";
import type { Material, StockMovement, StockMovementType } from "@/modules/warehouse/domain/warehouse";

const MOVEMENT_TYPE_LABEL: Record<StockMovementType, string> = {
  income: "Приход",
  expense: "Расход",
  write_off: "Списание",
  return: "Возврат",
};

const MOVEMENT_TYPE_TONE: Record<StockMovementType, AppStatusTone> = {
  income: "success",
  expense: "warning",
  write_off: "danger",
  return: "info",
};

const LOW_STOCK_COLUMNS: readonly AppDataTableColumn<Material>[] = [
  {
    id: "name",
    header: "Материал",
    cell: (row) => (
      <Box sx={{ color: "error.main", fontWeight: 500 }}>{row.name}</Box>
    ),
    sortAccessor: (row) => row.name,
  },
  {
    id: "currentStock",
    header: "Текущий остаток",
    cell: (row) => row.currentStock.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.currentStock,
    align: "right",
  },
  {
    id: "minStock",
    header: "Минимальный",
    cell: (row) => row.minStock.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.minStock,
    align: "right",
  },
];

const RECENT_MOVEMENT_COLUMNS: readonly AppDataTableColumn<StockMovement>[] = [
  {
    id: "createdAt",
    header: "Дата",
    cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.createdAt,
  },
  {
    id: "materialName",
    header: "Материал",
    cell: (row) => row.materialName,
    sortAccessor: (row) => row.materialName,
  },
  {
    id: "type",
    header: "Тип",
    cell: (row) => (
      <AppStatusBadge
        label={MOVEMENT_TYPE_LABEL[row.type]}
        tone={MOVEMENT_TYPE_TONE[row.type]}
      />
    ),
  },
  {
    id: "quantity",
    header: "Кол-во",
    cell: (row) => row.quantity.toLocaleString("ru-RU"),
    align: "right",
  },
];

export default function WarehouseOverviewPage() {
  const materialsQuery = useMaterialsListQuery({ limit: 200 });
  const suppliersQuery = useSuppliersListQuery({ limit: 100 });
  const recentMovementsQuery = useStockMovementsListQuery({ limit: 5 });

  const materials = materialsQuery.data?.items ?? [];
  const lowStockMaterials = materials.filter((m) => m.currentStock < m.minStock);
  const recentMovements = recentMovementsQuery.data?.items ?? [];
  const suppliersTotal = suppliersQuery.data?.total ?? 0;

  if (materialsQuery.isError) {
    return (
      <main className="p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить данные склада"
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <AppCrudPageScaffold
        header={
          <AppPageHeader
            title="Склад"
            subtitle="Обзор складских данных"
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "warehouse", label: "Склад" },
            ]}
          />
        }
        filters={
          <AppKpiGrid
            columns={4}
            items={[
              {
                title: "Всего материалов",
                value: materialsQuery.data?.total ?? 0,
              },
              {
                title: "Мало на складе",
                value: lowStockMaterials.length,
                deltaTone: lowStockMaterials.length > 0 ? "danger" : "success",
                delta: lowStockMaterials.length > 0 ? "Требует пополнения" : "Всё в порядке",
              },
              {
                title: "Поставщики",
                value: suppliersTotal,
              },
              {
                title: "Движений за сегодня",
                value: recentMovements.filter((m) => {
                  const today = new Date().toDateString();
                  return new Date(m.createdAt).toDateString() === today;
                }).length,
                deltaTone: "info",
              },
            ]}
          />
        }
        content={
          <div className="space-y-6">
            {lowStockMaterials.length > 0 ? (
              <div>
                <Typography gutterBottom sx={{ color: "error.main" }} variant="h6">
                  Материалы с низким остатком
                </Typography>
                <AppDataTable<Material>
                  data={lowStockMaterials}
                  columns={LOW_STOCK_COLUMNS}
                  rowKey={(row) => row.id}
                  title="Низкий остаток"
                  initialPageSize={5}
                  enableExport={false}
                  enableSettings={false}
                  enableSelection={false}
                />
              </div>
            ) : null}

            <div>
              <Typography gutterBottom variant="h6">
                Последние движения
              </Typography>
              <AppDataTable<StockMovement>
                data={recentMovements}
                columns={RECENT_MOVEMENT_COLUMNS}
                rowKey={(row) => row.id}
                title="Последние движения"
                initialPageSize={5}
                enableExport={false}
                enableSettings={false}
                enableSelection={false}
              />
            </div>
          </div>
        }
      />
    </main>
  );
}
