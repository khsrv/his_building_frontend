"use client";

import { useState } from "react";
import {
  AppPageHeader,
  AppDataTable,
  AppDrawerForm,
  AppButton,
  AppInput,
  AppActionMenu,
  ConfirmDialog,
  ShimmerBox,
  AppStatePanel,
  type AppDataTableColumn,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { Broker, BrokerDeal } from "@/modules/advanced/domain/advanced";
import { useBrokersQuery } from "@/modules/advanced/presentation/hooks/use-brokers-query";
import { useCreateBrokerMutation } from "@/modules/advanced/presentation/hooks/use-create-broker-mutation";
import { useDeleteBrokerMutation } from "@/modules/advanced/presentation/hooks/use-delete-broker-mutation";
import { useBrokerDealsQuery } from "@/modules/advanced/presentation/hooks/use-broker-deals-query";

// ─── Broker columns ─────────────────────────────────────────────────────────

const BASE_COLUMNS: readonly AppDataTableColumn<Broker>[] = [
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
    cell: (row) => row.phone ?? "—",
  },
  {
    id: "email",
    header: "Email",
    cell: (row) => row.email ?? "—",
  },
  {
    id: "companyName",
    header: "Компания",
    cell: (row) => row.companyName ?? "—",
    searchAccessor: (row) => row.companyName ?? "",
  },
  {
    id: "commissionPct",
    header: "Комиссия (%)",
    cell: (row) => (row.commissionPct !== null ? `${row.commissionPct}%` : "—"),
    sortAccessor: (row) => row.commissionPct ?? 0,
    align: "right",
  },
];

// ─── Deal columns ───────────────────────────────────────────────────────────

const DEAL_COLUMNS: readonly AppDataTableColumn<BrokerDeal>[] = [
  {
    id: "dealNumber",
    header: "Номер сделки",
    cell: (row) => row.dealNumber,
    sortAccessor: (row) => row.dealNumber,
  },
  {
    id: "clientName",
    header: "Клиент",
    cell: (row) => row.clientName,
  },
  {
    id: "commissionPct",
    header: "Комиссия (%)",
    cell: (row) => `${row.commissionPct}%`,
    align: "right",
  },
  {
    id: "dealAmount",
    header: "Сумма сделки",
    cell: (row) => row.dealAmount.toLocaleString("ru-RU"),
    sortAccessor: (row) => row.dealAmount,
    align: "right",
  },
  {
    id: "createdAt",
    header: "Дата",
    cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.createdAt,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BrokersPage() {
  // Create drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [commissionPct, setCommissionPct] = useState("");
  const [notes, setNotes] = useState("");

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Deals drawer
  const [dealsBrokerId, setDealsBrokerId] = useState<string | null>(null);
  const [dealsBrokerName, setDealsBrokerName] = useState("");

  // Queries & mutations
  const brokersQuery = useBrokersQuery();
  const createMutation = useCreateBrokerMutation();
  const deleteMutation = useDeleteBrokerMutation();
  const dealsQuery = useBrokerDealsQuery(dealsBrokerId ?? "");

  const brokers = brokersQuery.data ?? [];
  const deals = dealsQuery.data ?? [];

  function resetForm() {
    setFullName("");
    setPhone("");
    setEmail("");
    setCompanyName("");
    setCommissionPct("");
    setNotes("");
  }

  function handleSave() {
    if (!fullName) return;
    createMutation.mutate(
      {
        fullName,
        phone: phone || undefined,
        email: email || undefined,
        companyName: companyName || undefined,
        commissionPct: commissionPct ? Number(commissionPct) : undefined,
        notes: notes || undefined,
      },
      { onSuccess: () => { setDrawerOpen(false); resetForm(); } },
    );
  }

  const columnsWithActions: readonly AppDataTableColumn<Broker>[] = [
    ...BASE_COLUMNS,
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <AppActionMenu
          triggerLabel="Действия"
          groups={[
            {
              id: "main",
              items: [
                {
                  id: "deals",
                  label: "Сделки брокера",
                  onClick: () => {
                    setDealsBrokerId(row.id);
                    setDealsBrokerName(row.fullName);
                  },
                },
                { id: "delete", label: "Удалить", destructive: true, onClick: () => setDeleteId(row.id) },
              ],
            },
          ]}
        />
      ),
      align: "right",
    },
  ];

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Брокеры"
        subtitle="Управление брокерами и их сделками"
        breadcrumbs={[
          { id: "home", label: "Панель", href: routes.dashboard },
          { id: "settings", label: "Настройки", href: routes.settings },
          { id: "brokers", label: "Брокеры" },
        ]}
        actions={
          <AppButton
            label="Добавить брокера"
            variant="primary"
            onClick={() => { resetForm(); setDrawerOpen(true); }}
          />
        }
      />

      {brokersQuery.isLoading ? (
        <ShimmerBox className="h-64" />
      ) : brokersQuery.isError ? (
        <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить брокеров" />
      ) : (
        <AppDataTable<Broker>
          title="Брокеры"
          data={brokers}
          columns={columnsWithActions}
          rowKey={(row) => row.id}
          searchPlaceholder="Поиск по имени или компании..."
          enableExport={false}
        />
      )}

      {/* Create broker drawer */}
      <AppDrawerForm
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); resetForm(); }}
        title="Новый брокер"
        onSave={handleSave}
        saveLabel="Создать"
        isSaving={createMutation.isPending}
      >
        <div className="space-y-4">
          <AppInput
            id="broker-name"
            label="ФИО"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <AppInput
            id="broker-phone"
            label="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+992 XXX XX XX"
          />
          <AppInput
            id="broker-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AppInput
            id="broker-company"
            label="Компания"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <AppInput
            id="broker-commission"
            label="Комиссия (%)"
            type="number"
            value={commissionPct}
            onChange={(e) => setCommissionPct(e.target.value)}
            placeholder="2.5"
          />
          <AppInput
            id="broker-notes"
            label="Примечания"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </AppDrawerForm>

      {/* Broker deals drawer */}
      <AppDrawerForm
        open={dealsBrokerId !== null}
        onClose={() => setDealsBrokerId(null)}
        title={`Сделки брокера — ${dealsBrokerName}`}
        onSave={() => setDealsBrokerId(null)}
        saveLabel="Закрыть"
      >
        <div className="space-y-4">
          {dealsQuery.isLoading ? (
            <ShimmerBox className="h-48" />
          ) : dealsQuery.isError ? (
            <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить сделки" />
          ) : deals.length === 0 ? (
            <AppStatePanel tone="empty" title="Нет сделок" description="У этого брокера пока нет сделок" />
          ) : (
            <AppDataTable<BrokerDeal>
              title="Сделки"
              data={deals}
              columns={DEAL_COLUMNS}
              rowKey={(row) => row.id}
              enableExport={false}
            />
          )}
        </div>
      </AppDrawerForm>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить брокера"
        message="Вы уверены, что хотите удалить этого брокера? Это действие необратимо."
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
        onClose={() => setDeleteId(null)}
      />
    </main>
  );
}
