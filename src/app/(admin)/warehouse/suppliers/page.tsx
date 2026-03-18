"use client";

import { useState } from "react";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppPageHeader,
  AppStatePanel,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useSuppliersListQuery } from "@/modules/warehouse/presentation/hooks/use-suppliers-list-query";
import { CreateSupplierDrawer } from "@/modules/warehouse/presentation/components/create-supplier-drawer";
import { SupplierDetailDialog } from "@/modules/warehouse/presentation/components/supplier-detail-dialog";
import type { Supplier } from "@/modules/warehouse/domain/warehouse";

const columns: readonly AppDataTableColumn<Supplier>[] = [
  {
    id: "name",
    header: "Название",
    cell: (row) => row.name,
    sortAccessor: (row) => row.name,
    searchAccessor: (row) => row.name,
  },
  {
    id: "phone",
    header: "Телефон",
    cell: (row) => row.phone ?? "—",
    searchAccessor: (row) => row.phone,
  },
  {
    id: "email",
    header: "Email",
    cell: (row) => row.email ?? "—",
    searchAccessor: (row) => row.email,
  },
  {
    id: "address",
    header: "Адрес",
    cell: (row) => row.address ?? "—",
  },
  {
    id: "createdAt",
    header: "Дата создания",
    cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.createdAt,
  },
];

export default function WarehouseSuppliersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data, isError, error } = useSuppliersListQuery({
    page: 1,
    limit: 100,
  });

  const suppliers = data?.items ?? [];

  if (isError) {
    return (
      <main className="p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description={
            error instanceof Error ? error.message : "Не удалось загрузить список поставщиков"
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
            title="Поставщики"
            subtitle={`${data?.total ?? 0} поставщиков`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "warehouse", label: "Склад", href: routes.warehouse },
              { id: "suppliers", label: "Поставщики" },
            ]}
            actions={
              <AppButton
                label="Добавить поставщика"
                variant="primary"
                size="md"
                onClick={() => setDrawerOpen(true)}
              />
            }
          />
        }
        content={
          <AppDataTable<Supplier>
            data={suppliers}
            columns={columns}
            rowKey={(row) => row.id}
            title="Поставщики"
            searchPlaceholder="Поиск по названию, телефону, email..."
            enableExport
            enableSettings
            onRowClick={(row) => setSelectedSupplier(row)}
          />
        }
      />

      <CreateSupplierDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {selectedSupplier ? (
        <SupplierDetailDialog
          open={Boolean(selectedSupplier)}
          supplierId={selectedSupplier.id}
          supplierName={selectedSupplier.name}
          onClose={() => setSelectedSupplier(null)}
        />
      ) : null}
    </main>
  );
}
