"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  AppPageHeader,
  AppButton,
  AppStatusBadge,
  AppTabs,
  AppDataTable,
  AppDrawerForm,
  AppInput,
  AppSelect,
  AppActionMenu,
  ConfirmDialog,
  ShimmerBox,
  AppStatePanel,
  type AppDataTableColumn,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { LandPlot, LandOwner } from "@/modules/land/domain/land";
import { useLandPlotDetailQuery } from "@/modules/land/presentation/hooks/use-land-plot-detail-query";
import { useUpdateLandPlotMutation } from "@/modules/land/presentation/hooks/use-update-land-plot-mutation";
import { useLandOwnersQuery } from "@/modules/land/presentation/hooks/use-land-owners-query";
import { useAddLandOwnerMutation } from "@/modules/land/presentation/hooks/use-add-land-owner-mutation";
import { useDeleteLandOwnerMutation } from "@/modules/land/presentation/hooks/use-delete-land-owner-mutation";

// ─── Owner columns ──────────────────────────────────────────────────────────

const OWNER_BASE_COLUMNS: readonly AppDataTableColumn<LandOwner>[] = [
  {
    id: "fullName",
    header: "ФИО",
    cell: (row) => row.fullName,
    searchAccessor: (row) => row.fullName,
    sortAccessor: (row) => row.fullName,
  },
  {
    id: "phone",
    header: "Телефон",
    cell: (row) => row.phone ?? "—",
  },
  {
    id: "dealType",
    header: "Тип сделки",
    cell: (row) => row.dealType,
    sortAccessor: (row) => row.dealType,
  },
  {
    id: "moneyAmount",
    header: "Сумма",
    cell: (row) =>
      row.moneyAmount !== null
        ? `${row.moneyAmount.toLocaleString("ru-RU")} ${row.moneyCurrency ?? ""}`
        : "—",
    sortAccessor: (row) => row.moneyAmount ?? 0,
    align: "right",
  },
];

// ─── Info row helper ────────────────────────────────────────────────────────

function InfoRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LandPlotDetailPage() {
  const params = useParams();
  const plotId = params.id as string;

  // Edit drawer state
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editAddress, setEditAddress] = useState("");
  const [editCadastral, setEditCadastral] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Owner drawer state
  const [ownerDrawerOpen, setOwnerDrawerOpen] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPassport, setOwnerPassport] = useState("");
  const [ownerDealType, setOwnerDealType] = useState("monetary");
  const [ownerAmount, setOwnerAmount] = useState("");
  const [ownerCurrency, setOwnerCurrency] = useState("TJS");
  const [ownerNotes, setOwnerNotes] = useState("");

  // Delete owner state
  const [deleteOwnerId, setDeleteOwnerId] = useState<string | null>(null);

  // Queries & mutations
  const plotQuery = useLandPlotDetailQuery(plotId);
  const updateMutation = useUpdateLandPlotMutation();
  const ownersQuery = useLandOwnersQuery(plotId);
  const addOwnerMutation = useAddLandOwnerMutation(plotId);
  const deleteOwnerMutation = useDeleteLandOwnerMutation(plotId);

  const plot: LandPlot | undefined = plotQuery.data;
  const owners = ownersQuery.data ?? [];

  function openEditDrawer() {
    if (!plot) return;
    setEditAddress(plot.address);
    setEditCadastral(plot.cadastralNumber ?? "");
    setEditArea(plot.areaSqm !== null ? String(plot.areaSqm) : "");
    setEditNotes(plot.notes ?? "");
    setEditDrawerOpen(true);
  }

  function handleEditSave() {
    if (!editAddress) return;
    updateMutation.mutate(
      {
        id: plotId,
        input: {
          address: editAddress,
          cadastralNumber: editCadastral || undefined,
          areaSqm: editArea ? Number(editArea) : undefined,
          notes: editNotes || undefined,
        },
      },
      { onSuccess: () => setEditDrawerOpen(false) },
    );
  }

  function resetOwnerForm() {
    setOwnerName("");
    setOwnerPhone("");
    setOwnerPassport("");
    setOwnerDealType("monetary");
    setOwnerAmount("");
    setOwnerCurrency("TJS");
    setOwnerNotes("");
  }

  function handleAddOwner() {
    if (!ownerName) return;
    addOwnerMutation.mutate(
      {
        fullName: ownerName,
        phone: ownerPhone || undefined,
        passportData: ownerPassport || undefined,
        dealType: ownerDealType,
        moneyAmount: ownerAmount ? Number(ownerAmount) : undefined,
        moneyCurrency: ownerCurrency || undefined,
        notes: ownerNotes || undefined,
      },
      { onSuccess: () => { setOwnerDrawerOpen(false); resetOwnerForm(); } },
    );
  }

  const ownerColumnsWithActions: readonly AppDataTableColumn<LandOwner>[] = [
    ...OWNER_BASE_COLUMNS,
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
                { id: "delete", label: "Удалить", destructive: true, onClick: () => setDeleteOwnerId(row.id) },
              ],
            },
          ]}
        />
      ),
      align: "right",
    },
  ];

  if (plotQuery.isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <ShimmerBox className="h-16" />
        <ShimmerBox className="h-64" />
      </div>
    );
  }

  if (plotQuery.isError || !plot) {
    return (
      <div className="p-4 md:p-6">
        <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить данные участка" />
      </div>
    );
  }

  const ownersTab = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AppButton
          label="Добавить владельца"
          variant="primary"
          onClick={() => { resetOwnerForm(); setOwnerDrawerOpen(true); }}
        />
      </div>

      {ownersQuery.isLoading ? (
        <ShimmerBox className="h-48" />
      ) : ownersQuery.isError ? (
        <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить владельцев" />
      ) : (
        <AppDataTable<LandOwner>
          title="Владельцы"
          data={owners}
          columns={ownerColumnsWithActions}
          rowKey={(row) => row.id}
          enableExport={false}
        />
      )}
    </div>
  );

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title={`Участок — ${plot.address}`}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "land", label: "Земельные участки", href: routes.land },
          { id: "detail", label: plot.address },
        ]}
        actions={
          <AppButton label="Редактировать" variant="outline" onClick={openEditDrawer} />
        }
      />

      {/* Info card */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Информация об участке</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Адрес" value={plot.address} />
          <InfoRow label="Кадастровый номер" value={plot.cadastralNumber ?? "—"} />
          <InfoRow label="Площадь (м\u00B2)" value={plot.areaSqm !== null ? plot.areaSqm.toLocaleString("ru-RU") : "—"} />
          <div>
            <p className="text-xs text-muted-foreground">Статус</p>
            <div className="mt-0.5">
              <AppStatusBadge label={plot.status} tone="default" />
            </div>
          </div>
          <InfoRow label="Объект" value={plot.propertyName ?? "—"} />
          <InfoRow label="Примечания" value={plot.notes ?? "—"} />
        </div>
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={[
          { id: "owners", title: "Владельцы", content: ownersTab },
        ]}
      />

      {/* Edit drawer */}
      <AppDrawerForm
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        title="Редактировать участок"
        onSave={handleEditSave}
        saveLabel="Сохранить"
        isSaving={updateMutation.isPending}
      >
        <div className="space-y-4">
          <AppInput
            id="edit-address"
            label="Адрес"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            required
          />
          <AppInput
            id="edit-cadastral"
            label="Кадастровый номер"
            value={editCadastral}
            onChange={(e) => setEditCadastral(e.target.value)}
          />
          <AppInput
            id="edit-area"
            label="Площадь (м\u00B2)"
            type="number"
            value={editArea}
            onChange={(e) => setEditArea(e.target.value)}
          />
          <AppInput
            id="edit-notes"
            label="Примечания"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
          />
        </div>
      </AppDrawerForm>

      {/* Add owner drawer */}
      <AppDrawerForm
        open={ownerDrawerOpen}
        onClose={() => { setOwnerDrawerOpen(false); resetOwnerForm(); }}
        title="Новый владелец"
        onSave={handleAddOwner}
        saveLabel="Добавить"
        isSaving={addOwnerMutation.isPending}
      >
        <div className="space-y-4">
          <AppInput
            id="owner-name"
            label="ФИО"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
          <AppInput
            id="owner-phone"
            label="Телефон"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            placeholder="+992 XXX XX XX"
          />
          <AppInput
            id="owner-passport"
            label="Паспортные данные"
            value={ownerPassport}
            onChange={(e) => setOwnerPassport(e.target.value)}
          />
          <AppSelect
            id="owner-deal-type"
            label="Тип сделки"
            value={ownerDealType}
            onChange={(e) => setOwnerDealType(e.target.value)}
            options={[
              { value: "monetary", label: "Денежная" },
              { value: "barter", label: "Бартер" },
              { value: "combined", label: "Комбинированная" },
            ]}
          />
          <AppInput
            id="owner-amount"
            label="Сумма"
            type="number"
            value={ownerAmount}
            onChange={(e) => setOwnerAmount(e.target.value)}
          />
          <AppInput
            id="owner-currency"
            label="Валюта"
            value={ownerCurrency}
            onChange={(e) => setOwnerCurrency(e.target.value)}
            placeholder="TJS, USD"
          />
          <AppInput
            id="owner-notes"
            label="Примечания"
            value={ownerNotes}
            onChange={(e) => setOwnerNotes(e.target.value)}
          />
        </div>
      </AppDrawerForm>

      {/* Delete owner confirmation */}
      <ConfirmDialog
        open={deleteOwnerId !== null}
        title="Удалить владельца"
        message="Вы уверены, что хотите удалить этого владельца? Это действие необратимо."
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={() => {
          if (deleteOwnerId) {
            deleteOwnerMutation.mutate(deleteOwnerId, {
              onSuccess: () => setDeleteOwnerId(null),
            });
          }
        }}
        onClose={() => setDeleteOwnerId(null)}
      />
    </main>
  );
}
