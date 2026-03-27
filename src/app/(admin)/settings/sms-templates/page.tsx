"use client";

import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  AppButton,
  AppDataTable,
  AppDrawerForm,
  AppInput,
  AppPageHeader,
  AppStatePanel,
  AppStatusBadge,
  AppTabs,
} from "@/shared/ui";
import type { AppDataTableColumn, AppActionMenuGroup } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useSmsTemplatesQuery } from "@/modules/contracts/presentation/hooks/use-sms-templates-query";
import { useCreateSmsTemplateMutation } from "@/modules/contracts/presentation/hooks/use-create-sms-template-mutation";
import { useSmsLogsQuery } from "@/modules/contracts/presentation/hooks/use-sms-logs-query";
import { useSendSmsMutation } from "@/modules/contracts/presentation/hooks/use-send-sms-mutation";
import { useBulkSendSmsMutation } from "@/modules/contracts/presentation/hooks/use-bulk-send-sms-mutation";
import type { SmsTemplate, SmsLog } from "@/modules/contracts/domain/contract";
import { useI18n } from "@/shared/providers/locale-provider";

// ─── SMS Template form state ──────────────────────────────────────────────────

interface SmsTemplateFormState {
  name: string;
  eventType: string;
  body: string;
  daysBefore: string;
}

const EMPTY_SMS_FORM: SmsTemplateFormState = {
  name: "",
  eventType: "",
  body: "",
  daysBefore: "",
};

// ─── Send SMS form state ──────────────────────────────────────────────────────

interface SendSmsFormState {
  phone: string;
  message: string;
  templateId: string;
}

const EMPTY_SEND_FORM: SendSmsFormState = {
  phone: "",
  message: "",
  templateId: "",
};

// ─── SMS Logs status filter options ──────────────────────────────────────────

// ─── Templates Tab ────────────────────────────────────────────────────────────

function SmsTemplatesTab() {
  const { t } = useI18n();
  const { data: templates, isLoading, isError } = useSmsTemplatesQuery();
  const createMutation = useCreateSmsTemplateMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<SmsTemplateFormState>(EMPTY_SMS_FORM);

  function handleOpen() {
    setForm(EMPTY_SMS_FORM);
    setDrawerOpen(true);
  }

  function handleClose() {
    setDrawerOpen(false);
  }

  function handleSave() {
    if (!form.name.trim() || !form.eventType.trim() || !form.body.trim()) return;

    const daysBefore = form.daysBefore ? parseInt(form.daysBefore, 10) : undefined;

    createMutation.mutate(
      {
        name: form.name.trim(),
        eventType: form.eventType.trim(),
        body: form.body.trim(),
        ...(daysBefore !== undefined && !isNaN(daysBefore) ? { daysBefore } : {}),
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  }

  const saveDisabled =
    !form.name.trim() ||
    !form.eventType.trim() ||
    !form.body.trim() ||
    createMutation.isPending;

  const columns: readonly AppDataTableColumn<SmsTemplate>[] = [
    {
      id: "name",
      header: t("settings.smsTemplates.columns.name"),
      cell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.name}
        </Typography>
      ),
      sortAccessor: (row) => row.name,
      searchAccessor: (row) => row.name,
    },
    {
      id: "eventType",
      header: t("settings.smsTemplates.columns.eventType"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.eventType}
        </Typography>
      ),
      sortAccessor: (row) => row.eventType,
    },
    {
      id: "body",
      header: t("settings.smsTemplates.columns.body"),
      cell: (row) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.body}
        </Typography>
      ),
    },
    {
      id: "daysBefore",
      header: t("settings.smsTemplates.columns.daysBefore"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.daysBefore !== null ? row.daysBefore : t("settings.smsTemplates.common.dash")}
        </Typography>
      ),
    },
    {
      id: "isActive",
      header: t("settings.smsTemplates.columns.status"),
      cell: (row) => (
        <AppStatusBadge
          label={row.isActive ? t("settings.smsTemplates.status.active") : t("settings.smsTemplates.status.inactive")}
          tone={row.isActive ? "success" : "muted"}
        />
      ),
    },
  ];

  function rowActions(row: SmsTemplate): readonly AppActionMenuGroup[] {
    void row;
    return [
      {
        id: "actions",
        items: [
          {
            id: "view",
            label: t("settings.smsTemplates.actions.view"),
            onClick: () => {
              // view-only - could open detail drawer in future
            },
          },
        ],
      },
    ];
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {isError && (
        <AppStatePanel
          tone="error"
          title={t("settings.smsTemplates.error.title")}
          description={t("settings.smsTemplates.error.description")}
        />
      )}

      {!isLoading && !isError && templates?.length === 0 && (
        <AppStatePanel
          tone="empty"
          title={t("settings.smsTemplates.empty.title")}
          description={t("settings.smsTemplates.empty.description")}
        />
      )}

      {!isError && (
        <AppDataTable
          data={templates ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          rowActions={rowActions}
          rowActionsTriggerLabel={t("actionMenu.trigger")}
          searchPlaceholder={t("settings.smsTemplates.searchPlaceholder")}
          addAction={{ label: t("settings.smsTemplates.createButton"), onClick: handleOpen }}
          storageKey="sms-templates-table"
        />
      )}

      <AppDrawerForm
        open={drawerOpen}
        title={t("settings.smsTemplates.drawer.title")}
        subtitle={t("settings.smsTemplates.drawer.subtitle")}
        saveLabel={t("settings.smsTemplates.drawer.create")}
        cancelLabel={t("common.cancel")}
        isSaving={createMutation.isPending}
        saveDisabled={saveDisabled}
        onClose={handleClose}
        onSave={handleSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput
            label={t("settings.smsTemplates.fields.name")}
            value={form.name}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, name: v }))}
            placeholder={t("settings.smsTemplates.placeholders.name")}
          />
          <AppInput
            label={t("settings.smsTemplates.fields.eventType")}
            value={form.eventType}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, eventType: v }))}
            placeholder={t("settings.smsTemplates.placeholders.eventType")}
          />
          <TextField
            label={t("settings.smsTemplates.fields.message")}
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            multiline
            minRows={4}
            fullWidth
            variant="outlined"
            size="small"
            helperText={t("settings.smsTemplates.placeholders.variables")}
          />
          <AppInput
            label={t("settings.smsTemplates.fields.daysBefore")}
            type="number"
            value={form.daysBefore}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, daysBefore: v }))}
            placeholder={t("settings.smsTemplates.placeholders.daysBefore")}
          />
        </Box>
      </AppDrawerForm>
    </Box>
  );
}

// ─── SMS Logs Tab ─────────────────────────────────────────────────────────────

interface BulkSendFormState {
  phones: string;
  message: string;
  templateId: string;
}

const EMPTY_BULK_FORM: BulkSendFormState = {
  phones: "",
  message: "",
  templateId: "",
};

function SmsLogsTab() {
  const { locale, t } = useI18n();
  const { data: smsTemplates } = useSmsTemplatesQuery();
  const [statusFilter, setStatusFilter] = useState("");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendForm, setSendForm] = useState<SendSmsFormState>(EMPTY_SEND_FORM);
  const sendMutation = useSendSmsMutation();

  // Bulk send state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState<BulkSendFormState>(EMPTY_BULK_FORM);
  const bulkSendMutation = useBulkSendSmsMutation();

  const { data: logsResult, isLoading, isError } = useSmsLogsQuery(
    statusFilter ? { status: statusFilter } : undefined,
  );

  const logs = logsResult?.items ?? [];
  const statusOptions = [
    { value: "", label: t("settings.smsLogs.filters.allStatuses") },
    { value: "sent", label: t("settings.smsLogs.status.sent") },
    { value: "delivered", label: t("settings.smsLogs.status.delivered") },
    { value: "failed", label: t("settings.smsLogs.status.failed") },
    { value: "pending", label: t("settings.smsLogs.status.pending") },
  ] as const;

  function handleOpenSendModal() {
    setSendForm(EMPTY_SEND_FORM);
    setSendModalOpen(true);
  }

  function handleSend() {
    if (!sendForm.phone.trim() || !sendForm.message.trim()) return;

    sendMutation.mutate(
      {
        phone: sendForm.phone.trim(),
        message: sendForm.message.trim(),
        ...(sendForm.templateId ? { templateId: sendForm.templateId } : {}),
      },
      {
        onSuccess: () => {
          setSendModalOpen(false);
          setSendForm(EMPTY_SEND_FORM);
        },
      },
    );
  }

  function handleBulkSend() {
    const phones = bulkForm.phones
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (phones.length === 0 || !bulkForm.message.trim()) return;

    bulkSendMutation.mutate(
      {
        phones,
        message: bulkForm.message.trim(),
        ...(bulkForm.templateId ? { templateId: bulkForm.templateId } : {}),
      },
      {
        onSuccess: () => {
          setBulkModalOpen(false);
          setBulkForm(EMPTY_BULK_FORM);
        },
      },
    );
  }

  const columns: readonly AppDataTableColumn<SmsLog>[] = [
    {
      id: "phone",
      header: t("settings.smsLogs.columns.phone"),
      cell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.phone}
        </Typography>
      ),
      sortAccessor: (row) => row.phone,
      searchAccessor: (row) => row.phone,
    },
    {
      id: "message",
      header: t("settings.smsLogs.columns.message"),
      cell: (row) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 260,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.message}
        </Typography>
      ),
    },
    {
      id: "status",
      header: t("settings.smsLogs.columns.status"),
      cell: (row) => {
        const tone =
          row.status === "delivered"
            ? "success"
            : row.status === "failed"
              ? "danger"
              : row.status === "sent"
                ? "info"
                : "muted";
        const statusLabel =
          row.status === "sent"
            ? t("settings.smsLogs.status.sent")
            : row.status === "delivered"
              ? t("settings.smsLogs.status.delivered")
              : row.status === "failed"
                ? t("settings.smsLogs.status.failed")
                : t("settings.smsLogs.status.pending");
        return <AppStatusBadge label={statusLabel} tone={tone} />;
      },
      sortAccessor: (row) => row.status,
    },
    {
      id: "clientName",
      header: t("settings.smsLogs.columns.client"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.clientName ?? t("settings.smsTemplates.common.dash")}
        </Typography>
      ),
      searchAccessor: (row) => row.clientName,
    },
    {
      id: "createdAt",
      header: t("settings.smsLogs.columns.date"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(row.createdAt).toLocaleString(locale === "en" ? "en-US" : "ru-RU")}
        </Typography>
      ),
      sortAccessor: (row) => row.createdAt,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Toolbar */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 180 }}
        >
          {statusOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        <AppButton
          label={t("settings.smsLogs.sendButton")}
          variant="primary"
          size="md"
          onClick={handleOpenSendModal}
        />
        <AppButton
          label={t("settings.smsLogs.bulkButton")}
          variant="secondary"
          size="md"
          onClick={() => { setBulkForm(EMPTY_BULK_FORM); setBulkModalOpen(true); }}
        />
      </Box>

      {isError && (
        <AppStatePanel
          tone="error"
          title={t("settings.smsLogs.error.title")}
          description={t("settings.smsLogs.error.description")}
        />
      )}

      {!isLoading && !isError && logs.length === 0 && (
        <AppStatePanel
          tone="empty"
          title={t("settings.smsLogs.empty.title")}
          description={t("settings.smsLogs.empty.description")}
        />
      )}

      {!isError && (
        <AppDataTable
          data={logs}
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder={t("settings.smsLogs.searchPlaceholder")}
          storageKey="sms-logs-table"
        />
      )}

      {/* Send SMS modal */}
      <Dialog
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {t("settings.smsLogs.sendModal.title")}
            <IconButton
              onClick={() => setSendModalOpen(false)}
              size="small"
              aria-label={t("settings.smsLogs.common.close")}
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <AppInput
              label={t("settings.smsLogs.sendModal.phone")}
              value={sendForm.phone}
              onChangeValue={(v) => setSendForm((prev) => ({ ...prev, phone: v }))}
              placeholder="+992 900 000000"
            />
            <TextField
              label={t("settings.smsLogs.sendModal.message")}
              value={sendForm.message}
              onChange={(e) =>
                setSendForm((prev) => ({ ...prev, message: e.target.value }))
              }
              multiline
              minRows={3}
              fullWidth
              variant="outlined"
              size="small"
            />
            {smsTemplates && smsTemplates.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                  {t("settings.smsLogs.common.templateOptional")}
                </Typography>
                <Select
                  size="small"
                  value={sendForm.templateId}
                  onChange={(e) =>
                    setSendForm((prev) => ({ ...prev, templateId: e.target.value }))
                  }
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="">{t("settings.smsLogs.common.noTemplate")}</MenuItem>
                  {smsTemplates.map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
              <AppButton
                label={t("common.cancel")}
                variant="secondary"
                onClick={() => setSendModalOpen(false)}
              />
              <AppButton
                label={t("settings.smsLogs.common.send")}
                variant="primary"
                isLoading={sendMutation.isPending}
                disabled={
                  !sendForm.phone.trim() || !sendForm.message.trim() || sendMutation.isPending
                }
                onClick={handleSend}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Bulk send SMS modal */}
      <Dialog
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {t("settings.smsLogs.bulkModal.title")}
            <IconButton
              onClick={() => setBulkModalOpen(false)}
              size="small"
              aria-label={t("settings.smsLogs.common.close")}
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label={t("settings.smsLogs.bulkModal.phones")}
              value={bulkForm.phones}
              onChange={(e) =>
                setBulkForm((prev) => ({ ...prev, phones: e.target.value }))
              }
              multiline
              minRows={4}
              fullWidth
              variant="outlined"
              size="small"
              placeholder={"+992900000001\n+992900000002\n+992900000003"}
              helperText={t("settings.smsLogs.bulkModal.numbersCount", {
                count: bulkForm.phones.split("\n").filter((p) => p.trim()).length,
              })}
            />
            <TextField
              label={t("settings.smsLogs.sendModal.message")}
              value={bulkForm.message}
              onChange={(e) =>
                setBulkForm((prev) => ({ ...prev, message: e.target.value }))
              }
              multiline
              minRows={3}
              fullWidth
              variant="outlined"
              size="small"
            />
            {smsTemplates && smsTemplates.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                  {t("settings.smsLogs.common.templateOptional")}
                </Typography>
                <Select
                  size="small"
                  value={bulkForm.templateId}
                  onChange={(e) =>
                    setBulkForm((prev) => ({ ...prev, templateId: e.target.value }))
                  }
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="">{t("settings.smsLogs.common.noTemplate")}</MenuItem>
                  {smsTemplates.map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
              <AppButton
                label={t("common.cancel")}
                variant="secondary"
                onClick={() => setBulkModalOpen(false)}
              />
              <AppButton
                label={t("settings.smsLogs.bulkModal.sendAll")}
                variant="primary"
                isLoading={bulkSendMutation.isPending}
                disabled={
                  !bulkForm.phones.trim() || !bulkForm.message.trim() || bulkSendMutation.isPending
                }
                onClick={handleBulkSend}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsSmsTemplatesPage() {
  const { t } = useI18n();
  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title={t("settings.smsTemplates.pageTitle")}
        breadcrumbs={[
          { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
          { id: "settings", label: t("nav.settings"), href: routes.settings },
          { id: "sms-templates", label: t("settings.smsTemplates.pageTitle") },
        ]}
      />

      <AppTabs
        tabs={[
          {
            id: "templates",
            title: t("settings.smsTemplates.tabs.templates"),
            content: <SmsTemplatesTab />,
          },
          {
            id: "logs",
            title: t("settings.smsTemplates.tabs.logs"),
            content: <SmsLogsTab />,
          },
        ]}
      />
    </main>
  );
}
