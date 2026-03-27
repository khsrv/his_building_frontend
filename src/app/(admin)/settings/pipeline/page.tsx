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
import { useI18n } from "@/shared/providers/locale-provider";
import { routes } from "@/shared/constants/routes";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PipelineSettingsPage() {
  const { t } = useI18n();
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
    {
      id: "order",
      header: t("settings.pipeline.columns.order"),
      cell: (row) => row.sortOrder,
      sortAccessor: (row) => row.sortOrder,
      align: "center",
    },
    {
      id: "name",
      header: t("settings.pipeline.columns.name"),
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
      header: t("settings.pipeline.columns.slug"),
      cell: (row) => <code className="text-xs text-muted-foreground">{row.slug}</code>,
    },
    {
      id: "clientsCount",
      header: t("settings.pipeline.columns.clientsCount"),
      cell: (row) => row.clientsCount,
      sortAccessor: (row) => row.clientsCount,
      align: "right",
    },
    {
      id: "flags",
      header: t("settings.pipeline.columns.flags"),
      cell: (row) => (
        <span className="flex gap-1">
          {row.isDefault ? <AppStatusBadge label={t("settings.pipeline.flags.default")} tone="info" /> : null}
          {row.isFinal ? <AppStatusBadge label={t("settings.pipeline.flags.final")} tone="success" /> : null}
        </span>
      ),
    },
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
                { id: "edit", label: t("actionMenu.edit"), onClick: () => openEdit(row) },
                { id: "delete", label: t("actionMenu.delete"), destructive: true, onClick: () => setDeleteId(row.id) },
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
        label={t("settings.pipeline.form.name")}
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        required
      />
      {createOpen ? (
        <AppInput
          id="stage-slug"
          label={t("settings.pipeline.form.slug")}
          value={formSlug}
          onChange={(e) => setFormSlug(e.target.value)}
          required
          placeholder={t("settings.pipeline.form.slugPlaceholder")}
        />
      ) : null}
      <AppInput
        id="stage-color"
        label={t("settings.pipeline.form.color")}
        type="color"
        value={formColor}
        onChange={(e) => setFormColor(e.target.value)}
      />
      <AppInput
        id="stage-order"
        label={t("settings.pipeline.form.order")}
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
        {t("settings.pipeline.form.isFinal")}
      </label>
      {createOpen ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formIsDefault}
            onChange={(e) => setFormIsDefault(e.target.checked)}
          />
          {t("settings.pipeline.form.isDefault")}
        </label>
      ) : null}
    </div>
  );

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title={t("settings.pipeline.title")}
        subtitle={t("settings.pipeline.subtitle")}
        breadcrumbs={[
          { id: "home", label: t("nav.dashboard"), href: routes.dashboard },
          { id: "settings", label: t("nav.settings"), href: routes.settings },
          { id: "pipeline", label: t("settings.pipeline.title") },
        ]}
        actions={
          <AppButton label={t("settings.pipeline.addButton")} variant="primary" onClick={openCreate} />
        }
      />

      {stagesQuery.isLoading ? (
        <ShimmerBox className="h-64" />
      ) : stagesQuery.isError ? (
        <AppStatePanel
          tone="error"
          title={t("settings.pipeline.error.title")}
          description={t("settings.pipeline.error.description")}
        />
      ) : (
        <AppDataTable<PipelineStageDetail>
          title={t("settings.pipeline.tableTitle")}
          data={stages}
          columns={columnsWithActions}
          rowKey={(row) => row.id}
          searchPlaceholder={t("settings.pipeline.searchPlaceholder")}
          enableExport={false}
        />
      )}

      {/* Create drawer */}
      <AppDrawerForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t("settings.pipeline.create.title")}
        onSave={handleCreate}
        saveLabel={t("settings.pipeline.create.save")}
        isSaving={createMutation.isPending}
      >
        {formFields}
      </AppDrawerForm>

      {/* Edit drawer */}
      <AppDrawerForm
        open={editStage !== null}
        onClose={() => { setEditStage(null); resetForm(); }}
        title={t("settings.pipeline.edit.title")}
        onSave={handleUpdate}
        saveLabel={t("common.save")}
        isSaving={updateMutation.isPending}
      >
        {formFields}
      </AppDrawerForm>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title={t("settings.pipeline.delete.title")}
        message={t("settings.pipeline.delete.message")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </main>
  );
}
