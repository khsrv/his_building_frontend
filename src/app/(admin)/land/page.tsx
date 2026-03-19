"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppPageHeader,
  AppDataTable,
  AppDrawerForm,
  AppButton,
  AppInput,
  AppStatusBadge,
  AppActionMenu,
  ConfirmDialog,
  ShimmerBox,
  AppStatePanel,
  type AppDataTableColumn,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { LandPlot } from "@/modules/land/domain/land";
import { useLandPlotsQuery } from "@/modules/land/presentation/hooks/use-land-plots-query";
import { useCreateLandPlotMutation } from "@/modules/land/presentation/hooks/use-create-land-plot-mutation";
import { useUpdateLandPlotMutation } from "@/modules/land/presentation/hooks/use-update-land-plot-mutation";
import { useDeleteLandPlotMutation } from "@/modules/land/presentation/hooks/use-delete-land-plot-mutation";

// ─── Columns ────────────────────────────────────────────────────────────────

const BASE_COLUMNS: readonly AppDataTableColumn<LandPlot>[] = [
  {
    id: "address",
    header: "Адрес",
    cell: (row) => row.address,
    sortAccessor: (row) => row.address,
    searchAccessor: (row) => row.address,
  },
  {
    id: "cadastralNumber",
    header: "Кадастровый №",
    cell: (row) => row.cadastralNumber ?? "—",
    searchAccessor: (row) => row.cadastralNumber ?? "",
  },
  {
    id: "areaSqm",
    header: "Площадь (м\u00B2)",
    cell: (row) => (row.areaSqm !== null ? row.areaSqm.toLocaleString("ru-RU") : "—"),
    sortAccessor: (row) => row.areaSqm ?? 0,
    align: "right",
  },
  {
    id: "propertyName",
    header: "Объект",
    cell: (row) => row.propertyName ?? "—",
    sortAccessor: (row) => row.propertyName ?? "",
  },
  {
    id: "status",
    header: "Статус",
    cell: (row) => <AppStatusBadge label={row.status} tone="default" />,
    sortAccessor: (row) => row.status,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LandPlotsPage() {
  const router = useRouter();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<LandPlot | null>(null);
  const [address, setAddress] = useState("");
  const [cadastralNumber, setCadastralNumber] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [notes, setNotes] = useState("");

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries & mutations
  const plotsQuery = useLandPlotsQuery();
  const createMutation = useCreateLandPlotMutation();
  const updateMutation = useUpdateLandPlotMutation();
  const deleteMutation = useDeleteLandPlotMutation();

  const plots = plotsQuery.data ?? [];

  function resetForm() {
    setAddress("");
    setCadastralNumber("");
    setAreaSqm("");
    setPropertyId("");
    setNotes("");
    setEditingPlot(null);
  }

  function openCreate() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEdit(plot: LandPlot) {
    setEditingPlot(plot);
    setAddress(plot.address);
    setCadastralNumber(plot.cadastralNumber ?? "");
    setAreaSqm(plot.areaSqm !== null ? String(plot.areaSqm) : "");
    setNotes(plot.notes ?? "");
    setDrawerOpen(true);
  }

  function handleSave() {
    if (!address) return;

    if (editingPlot) {
      updateMutation.mutate(
        {
          id: editingPlot.id,
          input: {
            address,
            cadastralNumber: cadastralNumber || undefined,
            areaSqm: areaSqm ? Number(areaSqm) : undefined,
            notes: notes || undefined,
          },
        },
        { onSuccess: () => { setDrawerOpen(false); resetForm(); } },
      );
    } else {
      createMutation.mutate(
        {
          address,
          cadastralNumber: cadastralNumber || undefined,
          areaSqm: areaSqm ? Number(areaSqm) : undefined,
          propertyId: propertyId || undefined,
          notes: notes || undefined,
        },
        { onSuccess: () => { setDrawerOpen(false); resetForm(); } },
      );
    }
  }

  const columnsWithActions: readonly AppDataTableColumn<LandPlot>[] = [
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
                { id: "edit", label: "Редактировать", onClick: () => openEdit(row) },
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
        title="Земельные участки"
        subtitle="Управление земельными участками"
        breadcrumbs={[
          { id: "home", label: "Панель", href: routes.dashboard },
          { id: "land", label: "Земельные участки" },
        ]}
        actions={
          <AppButton label="Добавить участок" variant="primary" onClick={openCreate} />
        }
      />

      {plotsQuery.isLoading ? (
        <ShimmerBox className="h-64" />
      ) : plotsQuery.isError ? (
        <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить участки" />
      ) : (
        <AppDataTable<LandPlot>
          title="Земельные участки"
          data={plots}
          columns={columnsWithActions}
          rowKey={(row) => row.id}
          searchPlaceholder="Поиск по адресу или кадастровому номеру..."
          onRowClick={(row) => router.push(routes.landDetail(row.id))}
          enableExport
        />
      )}

      {/* Create / Edit drawer */}
      <AppDrawerForm
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); resetForm(); }}
        title={editingPlot ? "Редактировать участок" : "Новый участок"}
        onSave={handleSave}
        saveLabel={editingPlot ? "Сохранить" : "Создать"}
        isSaving={createMutation.isPending || updateMutation.isPending}
      >
        <div className="space-y-4">
          <AppInput
            id="land-address"
            label="Адрес"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="г. Душанбе, ул. Рудаки 100"
          />
          <AppInput
            id="land-cadastral"
            label="Кадастровый номер"
            value={cadastralNumber}
            onChange={(e) => setCadastralNumber(e.target.value)}
            placeholder="01:01:0001:001"
          />
          <AppInput
            id="land-area"
            label="Площадь (м\u00B2)"
            type="number"
            value={areaSqm}
            onChange={(e) => setAreaSqm(e.target.value)}
            placeholder="4500"
          />
          {!editingPlot && (
            <AppInput
              id="land-property"
              label="ID объекта"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="ID объекта (необязательно)"
            />
          )}
          <AppInput
            id="land-notes"
            label="Примечания"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Дополнительная информация"
          />
        </div>
      </AppDrawerForm>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить участок"
        message="Вы уверены, что хотите удалить этот земельный участок? Это действие необратимо."
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
