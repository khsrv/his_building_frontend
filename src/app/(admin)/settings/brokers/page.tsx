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
import { useI18n } from "@/shared/providers/locale-provider";

export default function BrokersPage() {
  const { locale, t } = useI18n();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [commissionPct, setCommissionPct] = useState("");
  const [notes, setNotes] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [dealsBrokerId, setDealsBrokerId] = useState<string | null>(null);
  const [dealsBrokerName, setDealsBrokerName] = useState("");

  const brokersQuery = useBrokersQuery();
  const createMutation = useCreateBrokerMutation();
  const deleteMutation = useDeleteBrokerMutation();
  const dealsQuery = useBrokerDealsQuery(dealsBrokerId ?? "");

  const localeCode =
    locale === "en" ? "en-US" : locale === "uz" ? "uz-UZ" : locale === "tg" ? "tg-TJ" : "ru-RU";

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
      {
        onSuccess: () => {
          setDrawerOpen(false);
          resetForm();
        },
      },
    );
  }

  const baseColumns: readonly AppDataTableColumn<Broker>[] = [
    {
      id: "fullName",
      header: t("settings.brokers.columns.fullName"),
      cell: (row) => row.fullName,
      sortAccessor: (row) => row.fullName,
      searchAccessor: (row) => row.fullName,
    },
    {
      id: "phone",
      header: t("settings.brokers.columns.phone"),
      cell: (row) => row.phone ?? t("settings.brokers.common.dash"),
    },
    {
      id: "email",
      header: t("settings.brokers.columns.email"),
      cell: (row) => row.email ?? t("settings.brokers.common.dash"),
    },
    {
      id: "companyName",
      header: t("settings.brokers.columns.company"),
      cell: (row) => row.companyName ?? t("settings.brokers.common.dash"),
      searchAccessor: (row) => row.companyName ?? "",
    },
    {
      id: "commissionPct",
      header: t("settings.brokers.columns.commissionPct"),
      cell: (row) => (row.commissionPct !== null ? `${row.commissionPct}%` : t("settings.brokers.common.dash")),
      sortAccessor: (row) => row.commissionPct ?? 0,
      align: "right",
    },
  ];

  const dealColumns: readonly AppDataTableColumn<BrokerDeal>[] = [
    {
      id: "dealNumber",
      header: t("settings.brokers.deals.columns.dealNumber"),
      cell: (row) => row.dealNumber,
      sortAccessor: (row) => row.dealNumber,
    },
    {
      id: "clientName",
      header: t("settings.brokers.deals.columns.clientName"),
      cell: (row) => row.clientName,
    },
    {
      id: "commissionPct",
      header: t("settings.brokers.deals.columns.commissionPct"),
      cell: (row) => `${row.commissionPct}%`,
      align: "right",
    },
    {
      id: "dealAmount",
      header: t("settings.brokers.deals.columns.dealAmount"),
      cell: (row) => row.dealAmount.toLocaleString(localeCode),
      sortAccessor: (row) => row.dealAmount,
      align: "right",
    },
    {
      id: "createdAt",
      header: t("settings.brokers.deals.columns.createdAt"),
      cell: (row) => new Date(row.createdAt).toLocaleDateString(localeCode),
      sortAccessor: (row) => row.createdAt,
    },
  ];

  const columnsWithActions: readonly AppDataTableColumn<Broker>[] = [
    ...baseColumns,
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <AppActionMenu
          triggerLabel={t("actionMenu.trigger")}
          groups={[
            {
              id: "main",
              items: [
                {
                  id: "deals",
                  label: t("settings.brokers.actions.deals"),
                  onClick: () => {
                    setDealsBrokerId(row.id);
                    setDealsBrokerName(row.fullName);
                  },
                },
                { id: "delete", label: t("actionMenu.delete"), destructive: true, onClick: () => setDeleteId(row.id) },
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
        title={t("settings.brokers.title")}
        subtitle={t("settings.brokers.subtitle")}
        breadcrumbs={[
          { id: "home", label: t("nav.dashboard"), href: routes.dashboard },
          { id: "settings", label: t("nav.settings"), href: routes.settings },
          { id: "brokers", label: t("settings.brokers.title") },
        ]}
        actions={
          <AppButton
            label={t("settings.brokers.addButton")}
            variant="primary"
            onClick={() => {
              resetForm();
              setDrawerOpen(true);
            }}
          />
        }
      />

      {brokersQuery.isLoading ? (
        <ShimmerBox className="h-64" />
      ) : brokersQuery.isError ? (
        <AppStatePanel
          tone="error"
          title={t("settings.brokers.error.title")}
          description={t("settings.brokers.error.description")}
        />
      ) : (
        <AppDataTable<Broker>
          title={t("settings.brokers.tableTitle")}
          data={brokers}
          columns={columnsWithActions}
          rowKey={(row) => row.id}
          searchPlaceholder={t("settings.brokers.searchPlaceholder")}
          enableExport={false}
        />
      )}

      <AppDrawerForm
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          resetForm();
        }}
        title={t("settings.brokers.create.title")}
        onSave={handleSave}
        saveLabel={t("settings.brokers.create.save")}
        isSaving={createMutation.isPending}
      >
        <div className="space-y-4">
          <AppInput
            id="broker-name"
            label={t("settings.brokers.fields.fullName")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <AppInput
            id="broker-phone"
            label={t("settings.brokers.fields.phone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("settings.brokers.placeholders.phone")}
          />
          <AppInput
            id="broker-email"
            label={t("settings.brokers.fields.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AppInput
            id="broker-company"
            label={t("settings.brokers.fields.company")}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <AppInput
            id="broker-commission"
            label={t("settings.brokers.fields.commissionPct")}
            type="number"
            value={commissionPct}
            onChange={(e) => setCommissionPct(e.target.value)}
            placeholder={t("settings.brokers.placeholders.commissionPct")}
          />
          <AppInput
            id="broker-notes"
            label={t("settings.brokers.fields.notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </AppDrawerForm>

      <AppDrawerForm
        open={dealsBrokerId !== null}
        onClose={() => setDealsBrokerId(null)}
        title={t("settings.brokers.deals.title", { name: dealsBrokerName })}
        onSave={() => setDealsBrokerId(null)}
        saveLabel={t("settings.brokers.deals.close")}
      >
        <div className="space-y-4">
          {dealsQuery.isLoading ? (
            <ShimmerBox className="h-48" />
          ) : dealsQuery.isError ? (
            <AppStatePanel
              tone="error"
              title={t("settings.brokers.deals.error.title")}
              description={t("settings.brokers.deals.error.description")}
            />
          ) : deals.length === 0 ? (
            <AppStatePanel
              tone="empty"
              title={t("settings.brokers.deals.empty.title")}
              description={t("settings.brokers.deals.empty.description")}
            />
          ) : (
            <AppDataTable<BrokerDeal>
              title={t("settings.brokers.deals.tableTitle")}
              data={deals}
              columns={dealColumns}
              rowKey={(row) => row.id}
              enableExport={false}
            />
          )}
        </div>
      </AppDrawerForm>

      <ConfirmDialog
        open={deleteId !== null}
        title={t("settings.brokers.delete.title")}
        message={t("settings.brokers.delete.message")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
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
