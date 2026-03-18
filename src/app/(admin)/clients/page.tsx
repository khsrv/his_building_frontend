"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppButton,
  AppCrudPageScaffold,
  AppDataTable,
  type AppDataTableColumn,
  AppKpiGrid,
  AppPageHeader,
  AppStatusBadge,
  type AppStatusTone,
  AppStatePanel,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useClientsListQuery } from "@/modules/clients/presentation/hooks/use-clients-list-query";
import { CreateClientDrawer } from "@/modules/clients/presentation/components/create-client-drawer";
import type { Client, ClientSource } from "@/modules/clients/domain/client";

// ─── Source helpers ──────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<ClientSource, string> = {
  website: "Сайт",
  phone: "Телефон",
  walk_in: "Визит",
  referral: "Рекомендация",
  broker: "Брокер",
  social_media: "Соцсети",
  advertising: "Реклама",
  other: "Другое",
};

const SOURCE_TONE: Record<ClientSource, AppStatusTone> = {
  website: "info",
  phone: "default",
  walk_in: "success",
  referral: "warning",
  broker: "muted",
  social_media: "info",
  advertising: "default",
  other: "muted",
};

// ─── Columns ─────────────────────────────────────────────────────────────────

const columns: readonly AppDataTableColumn<Client>[] = [
  {
    id: "fullName",
    header: "ФИО",
    cell: (row) => row.fullName,
    sortAccessor: (row) => row.fullName,
    searchAccessor: (row) => row.fullName,
  },
  {
    id: "phone",
    header: "Телефон",
    cell: (row) => row.phone,
    searchAccessor: (row) => row.phone,
  },
  {
    id: "source",
    header: "Источник",
    cell: (row) => (
      <AppStatusBadge
        label={SOURCE_LABEL[row.source]}
        tone={SOURCE_TONE[row.source]}
      />
    ),
    sortAccessor: (row) => row.source,
  },
  {
    id: "managerName",
    header: "Менеджер",
    cell: (row) => row.managerName ?? "—",
    sortAccessor: (row) => row.managerName ?? "",
  },
  {
    id: "pipelineStageName",
    header: "Этап",
    cell: (row) =>
      row.pipelineStageName ? (
        <AppStatusBadge label={row.pipelineStageName} tone="info" />
      ) : (
        "—"
      ),
  },
  {
    id: "createdAt",
    header: "Дата создания",
    cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.createdAt,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, isError, error } = useClientsListQuery({ page: 1, limit: 100 });

  const clients = data?.items ?? [];
  const total = data?.total ?? 0;

  // Compute new-this-month count from loaded data
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const newThisMonth = clients.filter((c) => c.createdAt >= startOfMonth).length;

  if (isError) {
    return (
      <main className="p-6">
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
    <main className="space-y-6 p-6">
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
            columns={3}
            items={[
              { title: "Всего клиентов", value: total },
              { title: "Новые за месяц", value: newThisMonth, deltaTone: "info" },
              { title: "Загружено", value: clients.length, deltaTone: "success" },
            ]}
          />
        }
        content={
          <AppDataTable<Client>
            data={clients}
            columns={columns}
            rowKey={(row) => row.id}
            title="Клиенты"
            searchPlaceholder="Поиск по ФИО или телефону..."
            enableExport
            enableSettings
            onRowClick={(row) => router.push(routes.clientDetail(row.id))}
          />
        }
      />

      <CreateClientDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </main>
  );
}
