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
import { useSupplierBalancesQuery } from "@/modules/warehouse/presentation/hooks/use-supplier-balances-query";
import { CreateSupplierDrawer } from "@/modules/warehouse/presentation/components/create-supplier-drawer";
import { SupplierDetailDialog } from "@/modules/warehouse/presentation/components/supplier-detail-dialog";
import type { Supplier, SupplierBalance } from "@/modules/warehouse/domain/warehouse";

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

const balanceColumns: readonly AppDataTableColumn<SupplierBalance>[] = [
  {
    id: "supplierName",
    header: "Поставщик",
    cell: (row) => row.supplierName,
    sortAccessor: (row) => row.supplierName,
    searchAccessor: (row) => row.supplierName,
  },
  {
    id: "totalPurchases",
    header: "Закупки",
    cell: (row) => row.totalPurchases.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.totalPurchases,
    align: "right",
  },
  {
    id: "totalPaid",
    header: "Оплачено",
    cell: (row) => row.totalPaid.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.totalPaid,
    align: "right",
  },
  {
    id: "balance",
    header: "Остаток долга",
    cell: (row) => row.balance.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.balance,
    align: "right",
  },
];

export default function WarehouseSuppliersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data, isError, error } = useSuppliersListQuery({
    page: 1,
    limit: 100,
  });
  const balancesQuery = useSupplierBalancesQuery();

  const suppliers = data?.items ?? [];
  const balances = balancesQuery.data ?? [];

  if (isError) {
    return (
      <main className="p-4 md:p-6">
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
    <main className="space-y-6 p-4 md:p-6">
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
          <div className="space-y-6">
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

            {balancesQuery.isError ? (
              <AppStatePanel
                tone="error"
                title="Ошибка загрузки сводных балансов"
                description="Не удалось загрузить данные endpoint /api/v1/supplier-balances"
              />
            ) : (
              <AppDataTable<SupplierBalance>
                data={balances}
                columns={balanceColumns}
                rowKey={(row) => row.supplierId}
                title="Сводные балансы поставщиков"
                searchPlaceholder="Поиск по поставщику..."
                enableSettings={false}
                enableExport
              />
            )}
          </div>
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
