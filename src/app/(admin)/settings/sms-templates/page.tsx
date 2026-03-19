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

const SMS_STATUS_OPTIONS = [
  { value: "", label: "Все статусы" },
  { value: "sent", label: "Отправлен" },
  { value: "delivered", label: "Доставлен" },
  { value: "failed", label: "Ошибка" },
  { value: "pending", label: "Ожидание" },
] as const;

// ─── Templates Tab ────────────────────────────────────────────────────────────

function SmsTemplatesTab() {
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
      header: "Название",
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
      header: "Тип события",
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.eventType}
        </Typography>
      ),
      sortAccessor: (row) => row.eventType,
    },
    {
      id: "body",
      header: "Тело",
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
      header: "Дней до",
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.daysBefore !== null ? row.daysBefore : "—"}
        </Typography>
      ),
    },
    {
      id: "isActive",
      header: "Статус",
      cell: (row) => (
        <AppStatusBadge
          label={row.isActive ? "Активен" : "Неактивен"}
          tone={row.isActive ? "success" : "muted"}
        />
      ),
    },
  ];

  function rowActions(row: SmsTemplate): readonly AppActionMenuGroup[] {
    return [
      {
        id: "actions",
        items: [
          {
            id: "view",
            label: "Просмотр",
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
          title="Ошибка загрузки"
          description="Не удалось загрузить SMS-шаблоны. Попробуйте обновить страницу."
        />
      )}

      {!isLoading && !isError && templates?.length === 0 && (
        <AppStatePanel
          tone="empty"
          title="SMS-шаблоны не найдены"
          description="Создайте первый SMS-шаблон для автоматической отправки сообщений."
        />
      )}

      {!isError && (
        <AppDataTable
          data={templates ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          rowActions={rowActions}
          rowActionsTriggerLabel="Действия"
          searchPlaceholder="Поиск по названию..."
          addAction={{ label: "Создать шаблон", onClick: handleOpen }}
          storageKey="sms-templates-table"
        />
      )}

      <AppDrawerForm
        open={drawerOpen}
        title="Создать SMS-шаблон"
        subtitle="Заполните данные нового шаблона"
        saveLabel="Создать"
        cancelLabel="Отмена"
        isSaving={createMutation.isPending}
        saveDisabled={saveDisabled}
        onClose={handleClose}
        onSave={handleSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppInput
            label="Название *"
            value={form.name}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, name: v }))}
            placeholder="Напоминание о платеже"
          />
          <AppInput
            label="Тип события *"
            value={form.eventType}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, eventType: v }))}
            placeholder="e.g. payment_due, deal_signed"
          />
          <TextField
            label="Текст сообщения *"
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            multiline
            minRows={4}
            fullWidth
            variant="outlined"
            size="small"
            helperText="Используйте {{client_name}}, {{deal_number}}, {{amount}}, {{date}}"
          />
          <AppInput
            label="Дней до события"
            type="number"
            value={form.daysBefore}
            onChangeValue={(v) => setForm((prev) => ({ ...prev, daysBefore: v }))}
            placeholder="Необязательно (например: 3)"
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
      header: "Телефон",
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
      header: "Сообщение",
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
      header: "Статус",
      cell: (row) => {
        const tone =
          row.status === "delivered"
            ? "success"
            : row.status === "failed"
              ? "danger"
              : row.status === "sent"
                ? "info"
                : "muted";
        return <AppStatusBadge label={row.status} tone={tone} />;
      },
      sortAccessor: (row) => row.status,
    },
    {
      id: "clientName",
      header: "Клиент",
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.clientName ?? "—"}
        </Typography>
      ),
      searchAccessor: (row) => row.clientName,
    },
    {
      id: "createdAt",
      header: "Дата",
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(row.createdAt).toLocaleString("ru-RU")}
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
          {SMS_STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        <AppButton
          label="Отправить SMS"
          variant="primary"
          size="md"
          onClick={handleOpenSendModal}
        />
        <AppButton
          label="Массовая рассылка"
          variant="secondary"
          size="md"
          onClick={() => { setBulkForm(EMPTY_BULK_FORM); setBulkModalOpen(true); }}
        />
      </Box>

      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить логи SMS. Попробуйте обновить страницу."
        />
      )}

      {!isLoading && !isError && logs.length === 0 && (
        <AppStatePanel
          tone="empty"
          title="Логи не найдены"
          description="SMS-сообщения ещё не отправлялись или не соответствуют выбранному фильтру."
        />
      )}

      {!isError && (
        <AppDataTable
          data={logs}
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Поиск по телефону..."
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
            Отправить SMS
            <IconButton
              onClick={() => setSendModalOpen(false)}
              size="small"
              aria-label="Закрыть"
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
              label="Телефон *"
              value={sendForm.phone}
              onChangeValue={(v) => setSendForm((prev) => ({ ...prev, phone: v }))}
              placeholder="+992 900 000000"
            />
            <TextField
              label="Сообщение *"
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
                  Шаблон (необязательно)
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
                  <MenuItem value="">Без шаблона</MenuItem>
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
                label="Отмена"
                variant="secondary"
                onClick={() => setSendModalOpen(false)}
              />
              <AppButton
                label="Отправить"
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
            Массовая рассылка SMS
            <IconButton
              onClick={() => setBulkModalOpen(false)}
              size="small"
              aria-label="Закрыть"
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
              label="Телефоны (по одному на строку) *"
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
              helperText={`${bulkForm.phones.split("\n").filter((p) => p.trim()).length} номеров`}
            />
            <TextField
              label="Сообщение *"
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
                  Шаблон (необязательно)
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
                  <MenuItem value="">Без шаблона</MenuItem>
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
                label="Отмена"
                variant="secondary"
                onClick={() => setBulkModalOpen(false)}
              />
              <AppButton
                label="Отправить всем"
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
  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="SMS-шаблоны"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "settings", label: "Настройки", href: routes.settings },
          { id: "sms-templates", label: "SMS-шаблоны" },
        ]}
      />

      <AppTabs
        tabs={[
          {
            id: "templates",
            title: "Шаблоны",
            content: <SmsTemplatesTab />,
          },
          {
            id: "logs",
            title: "Логи",
            content: <SmsLogsTab />,
          },
        ]}
      />
    </main>
  );
}
