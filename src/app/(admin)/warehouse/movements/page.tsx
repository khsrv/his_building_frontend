"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useStockMovementsListQuery } from "@/modules/warehouse/presentation/hooks/use-stock-movements-list-query";
import { useMaterialsListQuery } from "@/modules/warehouse/presentation/hooks/use-materials-list-query";
import { useSuppliersListQuery } from "@/modules/warehouse/presentation/hooks/use-suppliers-list-query";
import { CreateStockMovementDrawer } from "@/modules/warehouse/presentation/components/create-stock-movement-drawer";
import type { StockMovement, StockMovementType } from "@/modules/warehouse/domain/warehouse";
import { usePropertyContext } from "@/shared/providers/property-provider";

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

const MOVEMENT_TYPE_FILTER_OPTIONS = [
  { label: "Все типы", value: "" },
  { label: "Приход", value: "income" },
  { label: "Расход", value: "expense" },
  { label: "Списание", value: "write_off" },
  { label: "Возврат", value: "return" },
];

const columns: readonly AppDataTableColumn<StockMovement>[] = [
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
    searchAccessor: (row) => row.materialName,
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
    sortAccessor: (row) => row.type,
  },
  {
    id: "quantity",
    header: "Кол-во",
    cell: (row) => `${row.quantity.toLocaleString("ru-RU")} ${row.materialUnit}`,
    sortAccessor: (row) => row.quantity,
    align: "right",
  },
  {
    id: "unitPrice",
    header: "Цена/ед.",
    cell: (row) => (row.unitPrice !== null ? row.unitPrice.toLocaleString("ru-RU") : "—"),
    sortAccessor: (row) => row.unitPrice ?? 0,
    align: "right",
  },
  {
    id: "totalAmount",
    header: "Сумма",
    cell: (row) => (row.totalAmount !== null ? row.totalAmount.toLocaleString("ru-RU") : "—"),
    sortAccessor: (row) => row.totalAmount ?? 0,
    align: "right",
  },
  {
    id: "supplierName",
    header: "Поставщик",
    cell: (row) => row.supplierName ?? "—",
    searchAccessor: (row) => row.supplierName,
  },
  {
    id: "propertyName",
    header: "Объект",
    cell: (row) => row.propertyName ?? "—",
  },
  {
    id: "createdByName",
    header: "Кто создал",
    cell: (row) => row.createdByName,
  },
];

export default function WarehouseMovementsPage() {
  const { currentPropertyId } = usePropertyContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterMaterialId, setFilterMaterialId] = useState("");
  const [filterSupplierId, setFilterSupplierId] = useState("");
  const [filterType, setFilterType] = useState("");

  const materialsQuery = useMaterialsListQuery({ limit: 100 });
  const suppliersQuery = useSuppliersListQuery({ limit: 100 });

  const movementsParams: {
    page: number;
    limit: number;
    materialId?: string;
    supplierId?: string;
    type?: StockMovementType;
  } = {
    page: 1,
    limit: 200,
    ...(currentPropertyId ? { propertyId: currentPropertyId } : {}),
    ...(filterMaterialId ? { materialId: filterMaterialId } : {}),
    ...(filterSupplierId ? { supplierId: filterSupplierId } : {}),
    ...(filterType ? { type: filterType as StockMovementType } : {}),
  };

  const { data, isError, error } = useStockMovementsListQuery(movementsParams);

  const movements = data?.items ?? [];

  const materialFilterOptions = [
    { label: "Все материалы", value: "" },
    ...(materialsQuery.data?.items ?? []).map((m) => ({
      label: m.name,
      value: m.id,
    })),
  ];

  const supplierFilterOptions = [
    { label: "Все поставщики", value: "" },
    ...(suppliersQuery.data?.items ?? []).map((s) => ({
      label: s.name,
      value: s.id,
    })),
  ];

  if (isError) {
    return (
      <main className="p-4 md:p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description={
            error instanceof Error ? error.message : "Не удалось загрузить движение товаров"
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
            title="Движение товара"
            subtitle={`${data?.total ?? 0} записей`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "warehouse", label: "Склад", href: routes.warehouse },
              { id: "movements", label: "Движение товара" },
            ]}
            actions={
              <AppButton
                label="Добавить движение"
                variant="primary"
                size="md"
                onClick={() => setDrawerOpen(true)}
              />
            }
          />
        }
        filters={
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <AppSelect
              id="filter-material"
              label="Материал"
              options={materialFilterOptions}
              value={filterMaterialId}
              onChange={(e) => setFilterMaterialId(e.target.value)}
            />
            <AppSelect
              id="filter-supplier"
              label="Поставщик"
              options={supplierFilterOptions}
              value={filterSupplierId}
              onChange={(e) => setFilterSupplierId(e.target.value)}
            />
            <AppSelect
              id="filter-type"
              label="Тип"
              options={MOVEMENT_TYPE_FILTER_OPTIONS}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </Stack>
        }
        content={
          <AppDataTable<StockMovement>
            data={movements}
            columns={columns}
            rowKey={(row) => row.id}
            title="Движение товара"
            searchPlaceholder="Поиск по материалу или поставщику..."
            enableExport
            enableSettings
          />
        }
      />

      <CreateStockMovementDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </main>
  );
}
