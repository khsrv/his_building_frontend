"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppSelect,
  AppStatusBadge,
  type AppStatusTone,
  AppStatePanel,
  ShimmerBox,
} from "@/shared/ui";
import { IconClients, IconDeals, IconCoins, IconDebt } from "@/shared/ui/icons/kpi-icons";
import { routes } from "@/shared/constants/routes";
import { useClientsListQuery } from "@/modules/clients/presentation/hooks/use-clients-list-query";
import { fetchClientDetail } from "@/modules/clients/infrastructure/clients-repository";
import { clientKeys } from "@/modules/clients/presentation/query-keys";
import { CreateClientDrawer } from "@/modules/clients/presentation/components/create-client-drawer";
import type { Client, ClientSource } from "@/modules/clients/domain/client";
import { usePropertyContext } from "@/shared/providers/property-provider";

// ─── Source helpers ──────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<ClientSource, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  website: "Сайт",
  referral: "Рекомендация",
  direct: "Прямой",
  other: "Другое",
};

const SOURCE_TONE: Record<ClientSource, AppStatusTone> = {
  instagram: "info",
  facebook: "info",
  website: "default",
  referral: "warning",
  direct: "success",
  other: "muted",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtMoney(v: number): string {
  return v > 0 ? `$${v.toLocaleString("ru-RU")}` : "—";
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("with_deals");
  const { currentPropertyId } = usePropertyContext();

  const handleClientHover = useCallback(
    (row: Client) => {
      void queryClient.prefetchQuery({
        queryKey: clientKeys.detail(row.id),
        queryFn: () => fetchClientDetail(row.id),
        staleTime: 30_000,
      });
    },
    [queryClient],
  );

  const { data, isLoading, isError, error } = useClientsListQuery({
    page: 1,
    limit: 200,
    propertyId: currentPropertyId || undefined,
  });

  const allClients = data?.items ?? [];
  const total = data?.total ?? 0;

  // Client-side filter until backend supports has_deals
  const clients = filterType === "with_deals"
    ? allClients.filter((c) => c.dealsCount > 0)
    : filterType === "no_deals"
      ? allClients.filter((c) => c.dealsCount === 0)
      : allClients;

  const withDeals = allClients.filter((c) => c.dealsCount > 0).length;
  const totalDebt = allClients.reduce((sum, c) => sum + c.totalDebt, 0);
  const totalRevenue = allClients.reduce((sum, c) => sum + c.totalPaid, 0);

  // ─── Columns ──────────────────────────────────────────────────────

  const columns: readonly AppDataTableColumn<Client>[] = [
    {
      id: "fullName",
      header: "ФИО",
      cell: (row) => (
        <div>
          <span className="font-medium">{row.fullName}</span>
          <span className="block text-xs text-muted-foreground">{row.phone}</span>
        </div>
      ),
      sortAccessor: (row) => row.fullName,
      searchAccessor: (row) => `${row.fullName} ${row.phone}`,
    },
    {
      id: "dealsCount",
      header: "Сделки",
      cell: (row) => (
        <span className={row.dealsCount > 0 ? "font-semibold" : "text-muted-foreground"}>
          {row.dealsCount}
        </span>
      ),
      sortAccessor: (row) => row.dealsCount,
      align: "right",
    },
    {
      id: "totalAmount",
      header: "Сумма сделок",
      cell: (row) => (
        <span className="text-muted-foreground">{fmtMoney(row.totalAmount)}</span>
      ),
      sortAccessor: (row) => row.totalAmount,
      align: "right",
    },
    {
      id: "totalPaid",
      header: "Оплачено",
      cell: (row) => (
        <span className={row.totalPaid > 0 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
          {fmtMoney(row.totalPaid)}
        </span>
      ),
      sortAccessor: (row) => row.totalPaid,
      align: "right",
    },
    {
      id: "totalDebt",
      header: "Долг",
      cell: (row) => (
        <span className={row.totalDebt > 0 ? "text-red-600 font-semibold" : "text-muted-foreground"}>
          {fmtMoney(row.totalDebt)}
        </span>
      ),
      sortAccessor: (row) => row.totalDebt,
      align: "right",
    },
    {
      id: "createdAt",
      header: "Дата",
      cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
      sortAccessor: (row) => row.createdAt,
    },
  ];

  if (isError) {
    return (
      <main className="p-4 md:p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description={
            error instanceof Error ? error.message : "Не удалось загрузить список клиентов"
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
            title="Клиенты"
            subtitle={`${total} клиентов`}
            breadcrumbs={[
              { id: "dashboard", label: "Панель", href: routes.dashboard },
              { id: "clients", label: "Клиенты" },
            ]}
            actions={
              <AppButton
                label="Добавить клиента"
                variant="primary"
                size="md"
                onClick={() => setDrawerOpen(true)}
              />
            }
          />
        }
        filters={
          <AppKpiGrid
            columns={4}
            items={[
              { title: "Всего клиентов", value: total, icon: <IconClients /> },
              { title: "Со сделками", value: withDeals, icon: <IconDeals /> },
              { title: "Оплачено", value: fmtMoney(totalRevenue), icon: <IconCoins /> },
              { title: "Общий долг", value: fmtMoney(totalDebt), deltaTone: totalDebt > 0 ? "danger" : "success", icon: <IconDebt /> },
            ]}
          />
        }
        content={
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="w-48">
                <AppSelect
                  label="Тип клиента"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  options={[
                    { label: "Все клиенты", value: "" },
                    { label: "Со сделками", value: "with_deals" },
                    { label: "Без сделок", value: "no_deals" },
                  ]}
                />
              </div>
            </div>
            {isLoading ? (
              <ShimmerBox className="h-64 w-full rounded-xl" />
            ) : (
              <AppDataTable<Client>
                data={clients}
                columns={columns}
                rowKey={(row) => row.id}
                title="Клиенты"
                searchPlaceholder="Поиск по ФИО или телефону..."
                enableExport
                enableSettings
                onRowClick={(row) => router.push(routes.clientDetail(row.id))}
                onRowHover={handleClientHover}
              />
            )}
          </div>
        }
      />

      <CreateClientDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </main>
  );
}
