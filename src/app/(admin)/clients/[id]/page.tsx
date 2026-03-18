"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Box, Grid, Typography } from "@mui/material";
import {
  AppPageHeader,
  AppStatusBadge,
  AppDataTable,
  AppCommentThread,
  AppTabs,
  AppButton,
  AppSelect,
  AppStatePanel,
  ShimmerBox,
  type AppDataTableColumn,
  type AppComment,
  type AppStatusTone,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useClientDetailQuery } from "@/modules/clients/presentation/hooks/use-client-detail-query";
import { useClientInteractionsQuery } from "@/modules/clients/presentation/hooks/use-client-interactions-query";
import { useAssignManagerMutation } from "@/modules/clients/presentation/hooks/use-assign-manager-mutation";
import { EditClientDrawer } from "@/modules/clients/presentation/components/edit-client-drawer";
import { AddInteractionDrawer } from "@/modules/clients/presentation/components/add-interaction-drawer";
import { useDealsListQuery } from "@/modules/deals/presentation/hooks/use-deals-list-query";
import { useUsersListQuery } from "@/modules/admin/presentation/hooks/use-users-list-query";
import type { Interaction, ClientSource } from "@/modules/clients/domain/client";
import type { Deal } from "@/modules/deals/domain/deal";

// ─── Source helpers ──────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<ClientSource, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  website: "Сайт",
  referral: "Рекомендация",
  direct: "Прямой",
  other: "Другое",
};

const INTERACTION_TYPE_LABEL: Record<Interaction["type"], string> = {
  call: "Звонок",
  meeting: "Встреча",
  message: "Сообщение",
  email: "Email",
  other: "Другое",
};

const DEAL_STATUS_LABEL: Record<Deal["status"], string> = {
  draft: "Черновик",
  active: "Активная",
  completed: "Завершена",
  cancelled: "Отменена",
};

const DEAL_STATUS_TONE: Record<Deal["status"], AppStatusTone> = {
  draft: "muted",
  active: "success",
  completed: "info",
  cancelled: "danger",
};

const DEAL_COLUMNS: readonly AppDataTableColumn<Deal>[] = [
  {
    id: "dealNumber",
    header: "Номер сделки",
    cell: (row) => row.dealNumber,
    sortAccessor: (row) => row.dealNumber,
  },
  {
    id: "unit",
    header: "Квартира / Объект",
    cell: (row) => `${row.unitNumber} — ${row.propertyName}`,
  },
  {
    id: "status",
    header: "Статус",
    cell: (row) => (
      <AppStatusBadge label={DEAL_STATUS_LABEL[row.status]} tone={DEAL_STATUS_TONE[row.status]} />
    ),
    sortAccessor: (row) => row.status,
  },
  {
    id: "totalAmount",
    header: "Сумма",
    cell: (row) =>
      row.totalAmount.toLocaleString("ru-RU") + " " + row.currency,
    align: "right",
  },
  {
    id: "createdAt",
    header: "Дата",
    cell: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
    sortAccessor: (row) => row.createdAt,
  },
];

// ─── Info Tab ─────────────────────────────────────────────────────────────────

interface InfoTabProps {
  clientId: string;
}

function InfoTab({ clientId }: InfoTabProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const { data: client, isLoading, isError } = useClientDetailQuery(clientId);
  const usersQuery = useUsersListQuery({ limit: 100 });
  const assignManagerMutation = useAssignManagerMutation();

  const managerOptions = useMemo(() => {
    const base = [{ value: "", label: "Выберите менеджера" }];
    if (!usersQuery.data) return base;
    return [
      ...base,
      ...usersQuery.data.items
        .filter((u) => ["manager", "sales_head", "company_admin"].includes(u.role))
        .map((u) => ({ value: u.id, label: `${u.fullName} (${u.role})` })),
    ];
  }, [usersQuery.data]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <ShimmerBox style={{ height: 32 }} />
        <ShimmerBox style={{ height: 32 }} />
        <ShimmerBox style={{ height: 32 }} />
      </Box>
    );
  }

  if (isError || !client) {
    return (
      <AppStatePanel
        tone="error"
        title="Ошибка загрузки"
        description="Не удалось загрузить данные клиента"
      />
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <AppButton
          label="Редактировать"
          variant="secondary"
          size="sm"
          onClick={() => setEditOpen(true)}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Typography variant="caption" color="text.secondary">
            ФИО
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {client.fullName}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Телефон
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {client.phone}
          </Typography>
        </Grid>

        {client.extraPhone ? (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Доп. телефон
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {client.extraPhone}
            </Typography>
          </Grid>
        ) : null}

        {client.email ? (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {client.email}
            </Typography>
          </Grid>
        ) : null}

        {client.whatsapp ? (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Typography variant="caption" color="text.secondary">
              WhatsApp
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {client.whatsapp}
            </Typography>
          </Grid>
        ) : null}

        {client.telegram ? (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Telegram
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {client.telegram}
            </Typography>
          </Grid>
        ) : null}

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Источник
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {SOURCE_LABEL[client.source]}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Менеджер
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              {client.managerName ?? "Не назначен"}
            </Typography>
            <AppButton
              label="Сменить"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedManagerId(client.managerId ?? "");
                setManagerDialogOpen(true);
              }}
            />
          </Box>
        </Grid>

        {client.pipelineStageName ? (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Этап воронки
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {client.pipelineStageName}
            </Typography>
          </Grid>
        ) : null}

        {client.address ? (
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Адрес
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {client.address}
            </Typography>
          </Grid>
        ) : null}

        {client.notes ? (
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Заметки
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ whiteSpace: "pre-wrap" }}>
              {client.notes}
            </Typography>
          </Grid>
        ) : null}
      </Grid>

      <EditClientDrawer client={client} open={editOpen} onClose={() => setEditOpen(false)} />

      {/* Manager assignment dialog */}
      {managerDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Назначить менеджера</h3>
            <AppSelect
              id="assign-manager"
              label="Менеджер"
              options={managerOptions}
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <AppButton
                label="Отмена"
                variant="outline"
                onClick={() => setManagerDialogOpen(false)}
              />
              <AppButton
                label="Назначить"
                variant="primary"
                disabled={!selectedManagerId || assignManagerMutation.isPending}
                onClick={() => {
                  if (!selectedManagerId) return;
                  assignManagerMutation.mutate(
                    { clientId, managerId: selectedManagerId },
                    { onSuccess: () => setManagerDialogOpen(false) },
                  );
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// ─── Interactions Tab ─────────────────────────────────────────────────────────

interface InteractionsTabProps {
  clientId: string;
}

function InteractionsTab({ clientId }: InteractionsTabProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: interactions, isLoading } = useClientInteractionsQuery(clientId);

  const comments: readonly AppComment[] = (interactions ?? []).map(
    (interaction): AppComment => ({
      id: interaction.id,
      authorId: interaction.id, // no userId, use id as key
      authorName: interaction.createdByName,
      text: `[${INTERACTION_TYPE_LABEL[interaction.type]}] ${interaction.notes}${
        interaction.nextContactDate
          ? `\n\nСледующий контакт: ${new Date(interaction.nextContactDate).toLocaleDateString("ru-RU")}`
          : ""
      }`,
      createdAt: interaction.createdAt,
    }),
  );

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <AppButton
          label="Добавить взаимодействие"
          variant="primary"
          size="sm"
          onClick={() => setDrawerOpen(true)}
        />
      </Box>

      <AppCommentThread
        title="История взаимодействий"
        comments={comments}
        currentUserId="__readonly__"
        loading={isLoading}
        onSubmit={async () => {
          // Submission is done through the drawer, not inline
        }}
      />

      <AddInteractionDrawer
        clientId={clientId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

// ─── Deals Tab ────────────────────────────────────────────────────────────────

interface DealsTabProps {
  clientId: string;
}

function DealsTab({ clientId }: DealsTabProps) {
  const { data: deals, isLoading, isError } = useDealsListQuery({ clientId });

  if (isError) {
    return (
      <AppStatePanel
        tone="error"
        title="Ошибка загрузки"
        description="Не удалось загрузить сделки клиента"
      />
    );
  }

  return (
    <AppDataTable<Deal>
      title="Сделки клиента"
      data={deals ?? []}
      columns={DEAL_COLUMNS}
      rowKey={(row) => row.id}
      enableSelection={false}
      enableExport={false}
      enableSettings={false}
      initialPageSize={5}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const params = useParams();
  const id = params["id"] as string;

  const { data: client, isLoading } = useClientDetailQuery(id);

  return (
    <div className="space-y-6 p-6">
      <AppPageHeader
        title={isLoading ? "Загрузка..." : (client?.fullName ?? "Клиент")}
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "clients", label: "Клиенты", href: routes.clients },
          { id: "detail", label: client?.fullName ?? "..." },
        ]}
      />

      <AppTabs
        tabs={[
          {
            id: "info",
            title: "Информация",
            content: <InfoTab clientId={id} />,
          },
          {
            id: "interactions",
            title: "Взаимодействия",
            content: <InteractionsTab clientId={id} />,
          },
          {
            id: "deals",
            title: "Сделки",
            content: <DealsTab clientId={id} />,
          },
        ]}
      />
    </div>
  );
}
