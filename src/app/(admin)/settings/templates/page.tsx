"use client";

import { useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, TextField, Typography } from "@mui/material";
import {
  AppButton,
  AppDataTable,
  AppDrawerForm,
  AppInput,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
  ConfirmDialog,
} from "@/shared/ui";
import type { AppDataTableColumn, AppActionMenuGroup } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useContractTemplatesQuery } from "@/modules/contracts/presentation/hooks/use-contract-templates-query";
import { useCreateContractTemplateMutation } from "@/modules/contracts/presentation/hooks/use-create-contract-template-mutation";
import { useUpdateContractTemplateMutation } from "@/modules/contracts/presentation/hooks/use-update-contract-template-mutation";
import { useDeleteContractTemplateMutation } from "@/modules/contracts/presentation/hooks/use-delete-contract-template-mutation";
import type { ContractTemplate } from "@/modules/contracts/domain/contract";
import { useI18n } from "@/shared/providers/locale-provider";

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Form state ───────────────────────────────────────────────────────────────

interface TemplateFormState {
  name: string;
  templateType: string;
  body: string;
}

const EMPTY_FORM: TemplateFormState = {
  name: "",
  templateType: "",
  body: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsTemplatesPage() {
  const { locale, t } = useI18n();
  const { data: templates, isLoading, isError } = useContractTemplatesQuery();
  const createMutation = useCreateContractTemplateMutation();
  const updateMutation = useUpdateContractTemplateMutation();
  const deleteMutation = useDeleteContractTemplateMutation();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<ContractTemplate | null>(null);

  // Preview modal state
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  function handleOpenCreate() {
    setEditingTemplate(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function handleOpenEdit(template: ContractTemplate) {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      templateType: template.templateType,
      body: template.body,
    });
    setDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setEditingTemplate(null);
  }

  function handleSave() {
    if (!form.name.trim() || !form.templateType.trim() || !form.body.trim()) return;

    if (editingTemplate) {
      updateMutation.mutate(
        {
          id: editingTemplate.id,
          input: {
            name: form.name.trim(),
            body: form.body.trim(),
          },
        },
        {
          onSuccess: () => {
            handleCloseDrawer();
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          name: form.name.trim(),
          templateType: form.templateType.trim(),
          body: form.body.trim(),
        },
        {
          onSuccess: () => {
            handleCloseDrawer();
          },
        },
      );
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }

  function handlePreviewTemplate(template: ContractTemplate) {
    setPreviewHtml(template.body);
    setPreviewOpen(true);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveDisabled =
    !form.name.trim() || !form.templateType.trim() || !form.body.trim() || isSaving;

  // ─── Table columns ──────────────────────────────────────────────────────────

  const columns: readonly AppDataTableColumn<ContractTemplate>[] = [
    {
      id: "name",
      header: t("settings.templates.columns.name"),
      cell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.name}
        </Typography>
      ),
      sortAccessor: (row) => row.name,
      searchAccessor: (row) => row.name,
    },
    {
      id: "templateType",
      header: t("settings.templates.columns.type"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.templateType}
        </Typography>
      ),
      sortAccessor: (row) => row.templateType,
    },
    {
      id: "isActive",
      header: t("settings.templates.columns.status"),
      cell: (row) => (
        <AppStatusBadge
          label={row.isActive ? t("settings.templates.status.active") : t("settings.templates.status.inactive")}
          tone={row.isActive ? "success" : "muted"}
        />
      ),
    },
    {
      id: "createdAt",
      header: t("settings.templates.columns.createdAt"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(row.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "ru-RU")}
        </Typography>
      ),
      sortAccessor: (row) => row.createdAt,
    },
  ];

  function rowActions(row: ContractTemplate): readonly AppActionMenuGroup[] {
    return [
      {
        id: "actions",
        items: [
          {
            id: "preview",
            label: t("settings.templates.actions.preview"),
            onClick: () => handlePreviewTemplate(row),
          },
          {
            id: "edit",
            label: t("settings.templates.actions.edit"),
            onClick: () => handleOpenEdit(row),
          },
          {
            id: "delete",
            label: t("settings.templates.actions.delete"),
            destructive: true,
            onClick: () => setDeleteTarget(row),
          },
        ],
      },
    ];
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title={t("settings.templates.title")}
        {...(templates ? { subtitle: t("settings.templates.subtitle", { count: templates.length }) } : {})}
        breadcrumbs={[
          { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
          { id: "settings", label: t("nav.settings"), href: routes.settings },
          { id: "templates", label: t("settings.templates.title") },
        ]}
        actions={
          <AppButton
            label={t("settings.templates.createButton")}
            variant="primary"
            size="md"
            onClick={handleOpenCreate}
          />
        }
      />

      {/* Error */}
      {isError && (
        <AppStatePanel
          tone="error"
          title={t("settings.templates.error.title")}
          description={t("settings.templates.error.description")}
        />
      )}

      {/* Empty */}
      {!isLoading && !isError && templates?.length === 0 && (
        <AppStatePanel
          tone="empty"
          title={t("settings.templates.empty.title")}
          description={t("settings.templates.empty.description")}
        />
      )}

      {/* Table */}
      {!isError && (
        <AppDataTable
          data={templates ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          rowActions={rowActions}
          rowActionsTriggerLabel={t("actionMenu.trigger")}
          searchPlaceholder={t("settings.templates.searchPlaceholder")}
          addAction={{ label: t("settings.templates.createButton"), onClick: handleOpenCreate }}
          storageKey="contract-templates-table"
        />
      )}

      {/* Create / Edit drawer */}
      <AppDrawerForm
        open={drawerOpen}
        title={editingTemplate ? t("settings.templates.drawer.editTitle") : t("settings.templates.drawer.createTitle")}
        subtitle={
          editingTemplate
            ? t("settings.templates.drawer.editSubtitle")
            : t("settings.templates.drawer.createSubtitle")
        }
        saveLabel={editingTemplate ? t("common.save") : t("settings.templates.drawer.create")}
        cancelLabel={t("common.cancel")}
        isSaving={isSaving}
        saveDisabled={saveDisabled}
        onClose={handleCloseDrawer}
        onSave={handleSave}
        widthClassName="w-[min(680px,100vw)]"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput
            label={t("settings.templates.fields.name")}
            value={form.name}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, name: v }))}
            placeholder={t("settings.templates.placeholders.name")}
          />
          <AppInput
            label={t("settings.templates.fields.type")}
            value={form.templateType}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, templateType: v }))}
            placeholder={t("settings.templates.placeholders.type")}
            disabled={Boolean(editingTemplate)}
          />
          <TextField
            label={t("settings.templates.fields.body")}
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            multiline
            minRows={10}
            fullWidth
            variant="outlined"
            size="small"
            helperText={t("settings.templates.placeholders.note")}
          />
        </Box>
      </AppDrawerForm>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("settings.templates.confirmDelete.title")}
        message={t("settings.templates.confirmDelete.message", { name: deleteTarget?.name ?? "" })}
        confirmText={t("settings.templates.actions.delete")}
        cancelText={t("common.cancel")}
        destructive
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Preview modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {t("settings.templates.preview.title")}
            <IconButton
              onClick={() => setPreviewOpen(false)}
              size="small"
              aria-label={t("settings.templates.preview.close")}
            >
              <svg
                aria-hidden
                fill="none"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="20"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            id="contract-preview-content"
            sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, minHeight: 300 }}
            dangerouslySetInnerHTML={{ __html: previewHtml ?? "" }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <AppButton
              label={t("settings.templates.preview.downloadPdf")}
              variant="primary"
              size="md"
              onClick={async () => {
                try {
                  const { default: jsPDF } = await import("jspdf");
                  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

                  // Try to load Cyrillic font
                  try {
                    const { TIKTOK_SANS_BASE64 } = await import("@/shared/lib/pdf-font");
                    doc.addFileToVFS("TikTokSans.ttf", TIKTOK_SANS_BASE64);
                    doc.addFont("TikTokSans.ttf", "TikTokSans", "normal");
                    doc.setFont("TikTokSans");
                  } catch {
                    // Font not available — use default
                  }

                  // Render text from the preview HTML
                  const el = document.getElementById("contract-preview-content");
                  const text = el?.innerText ?? previewHtml ?? "";
                  const lines = doc.splitTextToSize(text, 170);
                  doc.setFontSize(11);
                  doc.text(lines as string[], 20, 20);
                  doc.save("contract.pdf");
                } catch {
                  // Fallback: download HTML as file
                  const blob = new Blob([previewHtml ?? ""], { type: "text/html" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "contract.html";
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </main>
  );
}
