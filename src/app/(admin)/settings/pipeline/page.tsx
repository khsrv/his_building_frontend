"use client";

import { useState } from "react";
import {
  AppPageHeader,
  AppDataTable,
  AppDrawerForm,
  AppButton,
  AppInput,
  AppStatusBadge,
  ConfirmDialog,
  ShimmerBox,
  AppStatePanel,
  AppActionMenu,
  type AppDataTableColumn,
} from "@/shared/ui";
import { usePipelineStagesDetailQuery } from "@/modules/clients/presentation/hooks/use-pipeline-stages-detail-query";
import { useCreatePipelineStageMutation } from "@/modules/clients/presentation/hooks/use-create-pipeline-stage-mutation";
import { useUpdatePipelineStageMutation } from "@/modules/clients/presentation/hooks/use-update-pipeline-stage-mutation";
import { useDeletePipelineStageMutation } from "@/modules/clients/presentation/hooks/use-delete-pipeline-stage-mutation";
import type { PipelineStageDetail } from "@/modules/clients/infrastructure/clients-repository";

// ─── Columns ─────────────────────────────────────────────────────────────────

const COLUMNS: readonly AppDataTableColumn<PipelineStageDetail>[] = [
  {
    id: "order",
    header: "#",
    cell: (row) => row.sortOrder,
    sortAccessor: (row) => row.sortOrder,
    align: "center",
  },
  {
    id: "name",
    header: "Название",
    cell: (row) => (
      <span className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: row.color || "#94a3b8" }}
        />
        {row.name}
      </span>
    ),
    searchAccessor: (row) => row.name,
    sortAccessor: (row) => row.name,
  },
  {
    id: "slug",
    header: "Slug",
    cell: (row) => <code className="text-xs text-muted-foreground">{row.slug}</code>,
  },
  {
    id: "clientsCount",
    header: "Клиентов",
    cell: (row) => row.clientsCount,
    sortAccessor: (row) => row.clientsCount,
    align: "right",
  },
  {
    id: "flags",
    header: "Флаги",
    cell: (row) => (
      <span className="flex gap-1">
        {row.isDefault ? <AppStatusBadge label="По умолчанию" tone="info" /> : null}
        {row.isFinal ? <AppStatusBadge label="Финальный" tone="success" /> : null}
      </span>
    ),
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PipelineSettingsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editStage, setEditStage] = useState<PipelineStageDetail | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formColor, setFormColor] = useState("#3B82F6");
  const [formOrder, setFormOrder] = useState("0");
  const [formIsFinal, setFormIsFinal] = useState(false);
  const [formIsDefault, setFormIsDefault] = useState(false);

  const stagesQuery = usePipelineStagesDetailQuery();
  const createMutation = useCreatePipelineStageMutation();
  const updateMutation = useUpdatePipelineStageMutation();
  const deleteMutation = useDeletePipelineStageMutation();

  const stages = stagesQuery.data ?? [];

  function resetForm() {
    setFormName("");
    setFormSlug("");
    setFormColor("#3B82F6");
    setFormOrder("0");
    setFormIsFinal(false);
    setFormIsDefault(false);
  }

  function openCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function openEdit(stage: PipelineStageDetail) {
    setFormName(stage.name);
    setFormSlug(stage.slug);
    setFormColor(stage.color);
    setFormOrder(String(stage.sortOrder));
    setFormIsFinal(stage.isFinal);
    setFormIsDefault(stage.isDefault);
    setEditStage(stage);
  }

  function handleCreate() {
    if (!formName || !formSlug) return;
    createMutation.mutate(
      {
        name: formName,
        slug: formSlug,
        color: formColor,
        sortOrder: Number(formOrder) || 0,
        isFinal: formIsFinal,
        isDefault: formIsDefault,
      },
      { onSuccess: () => { setCreateOpen(false); resetForm(); } },
    );
  }

  function handleUpdate() {
    if (!editStage || !formName) return;
    updateMutation.mutate(
      {
        id: editStage.id,
        input: {
          name: formName,
          color: formColor,
          sortOrder: Number(formOrder) || 0,
          isFinal: formIsFinal,
        },
      },
      { onSuccess: () => { setEditStage(null); resetForm(); } },
    );
  }

  function handleDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  }

  const columnsWithActions: readonly AppDataTableColumn<PipelineStageDetail>[] = [
    ...COLUMNS,
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

  const formFields = (
    <div className="space-y-4">
      <AppInput
        id="stage-name"
        label="Название"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        required
      />
      {createOpen ? (
        <AppInput
          id="stage-slug"
          label="Slug"
          value={formSlug}
          onChange={(e) => setFormSlug(e.target.value)}
          required
          placeholder="e.g. new_lead, negotiation, won"
        />
      ) : null}
      <AppInput
        id="stage-color"
        label="Цвет"
        type="color"
        value={formColor}
        onChange={(e) => setFormColor(e.target.value)}
      />
      <AppInput
        id="stage-order"
        label="Порядок"
        type="number"
        value={formOrder}
        onChange={(e) => setFormOrder(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={formIsFinal}
          onChange={(e) => setFormIsFinal(e.target.checked)}
        />
        Финальный этап (сделка закрыта)
      </label>
      {createOpen ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formIsDefault}
            onChange={(e) => setFormIsDefault(e.target.checked)}
          />
          По умолчанию для новых клиентов
        </label>
      ) : null}
    </div>
  );

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Этапы воронки"
        subtitle="Настройка этапов CRM-воронки продаж"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "settings", label: "Настройки", href: "/settings" },
          { id: "pipeline", label: "Этапы воронки" },
        ]}
        actions={
          <AppButton label="Добавить этап" variant="primary" onClick={openCreate} />
        }
      />

      {stagesQuery.isLoading ? (
        <ShimmerBox className="h-64" />
      ) : stagesQuery.isError ? (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить этапы воронки"
        />
      ) : (
        <AppDataTable<PipelineStageDetail>
          title="Этапы"
          data={stages}
          columns={columnsWithActions}
          rowKey={(row) => row.id}
          searchPlaceholder="Поиск по названию..."
          enableExport={false}
        />
      )}

      {/* Create drawer */}
      <AppDrawerForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Новый этап"
        onSave={handleCreate}
        saveLabel="Создать"
        isSaving={createMutation.isPending}
      >
        {formFields}
      </AppDrawerForm>

      {/* Edit drawer */}
      <AppDrawerForm
        open={editStage !== null}
        onClose={() => { setEditStage(null); resetForm(); }}
        title="Редактировать этап"
        onSave={handleUpdate}
        saveLabel="Сохранить"
        isSaving={updateMutation.isPending}
      >
        {formFields}
      </AppDrawerForm>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить этап"
        message="Вы уверены, что хотите удалить этот этап воронки? Клиенты на этом этапе останутся без этапа."
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </main>
  );
}
