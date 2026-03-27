"use client";

import { useState } from "react";
import { Box, Chip, Collapse, Stack, Tooltip, Typography } from "@mui/material";
import {
  AppDataTable,
  type AppDataTableColumn,
  AppInput,
  AppPageHeader,
  AppSelect,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
  ShimmerBox,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useAuditLogsQuery } from "@/modules/audit/presentation/hooks/use-audit-logs-query";
import type { AuditLog, AuditLogListParams } from "@/modules/audit/domain/audit";

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "Все события" },
  { value: "user.login", label: "Вход в систему" },
  { value: "user.logout", label: "Выход из системы" },
  { value: "user.created", label: "Создан пользователь" },
  { value: "user.updated", label: "Обновлён пользователь" },
  { value: "payment.created", label: "Создан платёж" },
  { value: "payment_deleted", label: "Удалён платёж" },
  { value: "payment_edited", label: "Изменён платёж" },
  { value: "payment.confirmed", label: "Подтверждён платёж" },
  { value: "payment.rejected", label: "Отклонён платёж" },
  { value: "deal.created", label: "Создана сделка" },
  { value: "deal.activated", label: "Активирована сделка" },
  { value: "deal.completed", label: "Завершена сделка" },
  { value: "deal.cancelled", label: "Отменена сделка" },
] as const;

const ENTITY_TYPE_OPTIONS = [
  { value: "", label: "Все объекты" },
  { value: "payment", label: "Платёж" },
  { value: "deal", label: "Сделка" },
  { value: "user", label: "Пользователь" },
  { value: "client", label: "Клиент" },
  { value: "unit", label: "Квартира" },
  { value: "transaction", label: "Транзакция" },
] as const;

function eventTypeTone(eventType: string): AppStatusTone {
  if (eventType.includes("delete") || eventType.includes("cancel") || eventType.includes("reject")) return "danger";
  if (eventType.includes("created") || eventType.includes("confirmed") || eventType.includes("activated")) return "success";
  if (eventType.includes("updated") || eventType.includes("edited") || eventType.includes("completed")) return "warning";
  return "muted";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function JsonChips({ data }: { data: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) return <Typography variant="body2" color="text.secondary">—</Typography>;
  const entries = Object.entries(data).slice(0, 4);
  const extra = Object.keys(data).length - entries.length;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {entries.map(([k, v]) => (
        <Tooltip key={k} title={`${k}: ${String(v)}`}>
          <Chip
            label={`${k}: ${String(v).substring(0, 20)}${String(v).length > 20 ? "…" : ""}`}
            size="small"
            variant="outlined"
            sx={{ maxWidth: 200, fontSize: "0.7rem" }}
          />
        </Tooltip>
      ))}
      {extra > 0 && <Chip label={`+${extra}`} size="small" sx={{ fontSize: "0.7rem" }} />}
    </Box>
  );
}

// ─── Expandable detail row ────────────────────────────────────────────────────

function AuditDetailPanel({ log }: { log: AuditLog }) {
  const hasOld = log.oldValue && Object.keys(log.oldValue).length > 0;
  const hasNew = log.newValue && Object.keys(log.newValue).length > 0;
  const hasMeta = log.metadata && Object.keys(log.metadata).length > 0;

  if (!hasOld && !hasNew && !hasMeta) return null;

  return (
    <Stack direction="row" spacing={3} sx={{ px: 2, py: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
      {hasOld && (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Было</Typography>
          <JsonChips data={log.oldValue} />
        </Box>
      )}
      {hasNew && (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Стало</Typography>
          <JsonChips data={log.newValue} />
        </Box>
      )}
      {hasMeta && (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Мета</Typography>
          <JsonChips data={log.metadata} />
        </Box>
      )}
    </Stack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const [eventType, setEventType] = useState("");
  const [entityType, setEntityType] = useState("");
  const [actorId, setActorId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const params: AuditLogListParams = {
    ...(eventType ? { eventType } : {}),
    ...(entityType ? { entityType } : {}),
    ...(actorId.trim() ? { actorId: actorId.trim() } : {}),
    ...(from ? { from: new Date(from + "T00:00:00").toISOString() } : {}),
    ...(to ? { to: new Date(to + "T23:59:59").toISOString() } : {}),
    limit: 100,
  };

  const { data, isLoading, isError } = useAuditLogsQuery(params);
  const logs = data?.items ?? [];

  // ─── Columns ────────────────────────────────────────────────────────────────

  const columns: readonly AppDataTableColumn<AuditLog>[] = [
    {
      id: "createdAt",
      header: "Дата / Время",
      cell: (row) => (
        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
          {formatDate(row.createdAt)}
        </Typography>
      ),
      sortAccessor: (row) => row.createdAt,
    },
    {
      id: "eventType",
      header: "Событие",
      cell: (row) => (
        <AppStatusBadge
          label={row.eventType}
          tone={eventTypeTone(row.eventType)}
        />
      ),
      searchAccessor: (row) => row.eventType,
      sortAccessor: (row) => row.eventType,
    },
    {
      id: "actor",
      header: "Кто совершил",
      cell: (row) => (
        <Typography variant="body2" color={row.actorUserId ? "text.primary" : "text.secondary"}>
          {row.actorUserId ?? "Система"}
        </Typography>
      ),
      searchAccessor: (row) => row.actorUserId ?? "",
    },
    {
      id: "entity",
      header: "Объект",
      cell: (row) => {
        if (!row.entityType && !row.entityId) return <Typography variant="body2" color="text.secondary">—</Typography>;
        return (
          <Typography variant="body2">
            {row.entityType ?? ""}
            {row.entityType && row.entityId && " · "}
            <Typography component="span" variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
              {row.entityId ?? ""}
            </Typography>
          </Typography>
        );
      },
      searchAccessor: (row) => `${row.entityType ?? ""} ${row.entityId ?? ""}`,
    },
    {
      id: "changes",
      header: "Изменения",
      cell: (row) => {
        const hasChanges = (row.oldValue && Object.keys(row.oldValue).length > 0)
          || (row.newValue && Object.keys(row.newValue).length > 0);
        if (!hasChanges) return <Typography variant="body2" color="text.secondary">—</Typography>;
        const isExpanded = expandedId === row.id;
        return (
          <Box
            component="button"
            onClick={() => setExpandedId(isExpanded ? null : row.id)}
            sx={{
              background: "none", border: "none", cursor: "pointer", p: 0,
              color: "primary.main", fontSize: "0.8rem", textDecoration: "underline",
            }}
          >
            {isExpanded ? "Скрыть" : "Показать"}
          </Box>
        );
      },
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Журнал аудита"
        subtitle="Все операции в системе — кто, что и когда сделал"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "settings", label: "Настройки", href: routes.settings },
          { id: "audit-log", label: "Журнал аудита" },
        ]}
      />

      {/* Filters */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr 1fr" },
          gap: 2,
        }}
      >
        <AppSelect
          id="audit-event-type"
          label="Тип события"
          options={EVENT_TYPE_OPTIONS as unknown as { value: string; label: string }[]}
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        />
        <AppSelect
          id="audit-entity-type"
          label="Тип объекта"
          options={ENTITY_TYPE_OPTIONS as unknown as { value: string; label: string }[]}
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
        />
        <AppInput
          label="ID пользователя"
          value={actorId}
          onChangeValue={setActorId}
          placeholder="UUID пользователя"
        />
        <AppInput
          label="С даты"
          type="date"
          value={from}
          onChangeValue={setFrom}
        />
        <AppInput
          label="По дату"
          type="date"
          value={to}
          onChangeValue={setTo}
        />
      </Box>

      {/* Table */}
      {isLoading && (
        <div className="space-y-3">
          <ShimmerBox className="h-12 w-full" />
          <ShimmerBox className="h-80 w-full" />
        </div>
      )}

      {isError && (
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось получить журнал аудита. Попробуйте обновить страницу."
        />
      )}

      {!isLoading && !isError && logs.length === 0 && (
        <AppStatePanel
          tone="empty"
          title="Нет записей"
          description="По выбранным фильтрам записи не найдены."
        />
      )}

      {!isLoading && !isError && logs.length > 0 && (
        <Box>
          <AppDataTable
            columns={columns}
            data={logs as AuditLog[]}
            rowKey={(row) => row.id}
            searchPlaceholder="Поиск по событию, пользователю, объекту..."
            enableSettings
            storageKey="audit-log-table"
          />

          {/* Expandable detail panels rendered outside the table */}
          {logs.map((log) => (
            <Collapse key={log.id} in={expandedId === log.id} unmountOnExit>
              <AuditDetailPanel log={log} />
            </Collapse>
          ))}
        </Box>
      )}

      {data && (
        <Typography variant="caption" color="text.secondary">
          Показано {logs.length} из {data.total} записей
        </Typography>
      )}
    </main>
  );
}
