"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import {
  AppKanbanBoard,
  type AppKanbanCard,
  type AppKanbanColumn,
  AppPageHeader,
  AppStatusBadge,
  AppStatePanel,
  AppSelect,
  ShimmerBox,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { usePipelineBoardQuery } from "@/modules/clients/presentation/hooks/use-pipeline-board-query";
import { useMoveClientStageMutation } from "@/modules/clients/presentation/hooks/use-move-client-stage-mutation";
import { useUsersListQuery } from "@/modules/admin/presentation/hooks/use-users-list-query";
import type { Client, ClientSource, PipelineBoardParams } from "@/modules/clients/domain/client";

// ─── Source helpers ──────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<ClientSource, string> = {
  website: "Сайт",
  phone: "Телефон",
  walk_in: "Визит",
  referral: "Рекомендация",
  broker: "Брокер",
  social_media: "Соцсети",
  advertising: "Реклама",
  other: "Другое",
};

const SOURCE_OPTIONS = [
  { value: "", label: "Все источники" },
  { value: "website", label: "Сайт" },
  { value: "phone", label: "Телефон" },
  { value: "walk_in", label: "Визит" },
  { value: "referral", label: "Рекомендация" },
  { value: "broker", label: "Брокер" },
  { value: "social_media", label: "Соцсети" },
  { value: "advertising", label: "Реклама" },
  { value: "other", label: "Другое" },
];

// ─── Client Kanban Card ───────────────────────────────────────────────────────

interface ClientKanbanCard extends AppKanbanCard {
  client: Client;
}

function ClientCard({ card }: { card: ClientKanbanCard; isDragging: boolean }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 1.5,
        p: 1.5,
        boxShadow: 1,
      }}
    >
      <Typography variant="body2" fontWeight={600} noWrap>
        {card.client.fullName}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {card.client.phone}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
        <AppStatusBadge label={SOURCE_LABEL[card.client.source]} tone="muted" />
        {card.client.managerName ? (
          <Typography variant="caption" color="text.secondary">
            {card.client.managerName}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const router = useRouter();
  const [filterSource, setFilterSource] = useState<string>("");
  const [filterManager, setFilterManager] = useState<string>("");

  const usersQuery = useUsersListQuery({ limit: 100 });
  const managerOptions = useMemo(() => {
    const base = [{ value: "", label: "Все менеджеры" }];
    if (!usersQuery.data) return base;
    return [
      ...base,
      ...usersQuery.data.items
        .filter((u) => ["manager", "sales_head", "company_admin"].includes(u.role))
        .map((u) => ({ value: u.id, label: u.fullName })),
    ];
  }, [usersQuery.data]);

  const boardParams: PipelineBoardParams = {
    ...(filterSource ? { source: filterSource as ClientSource } : {}),
    ...(filterManager ? { managerId: filterManager } : {}),
  };

  const { data: stages, isLoading, isError, error } = usePipelineBoardQuery(boardParams);
  const moveStage = useMoveClientStageMutation(boardParams);

  const columns: readonly AppKanbanColumn[] = (stages ?? []).map((stage) => ({
    id: stage.id,
    label: stage.name,
    color: stage.color,
  }));

  const cards: readonly ClientKanbanCard[] = (stages ?? []).flatMap((stage) =>
    stage.clients.map(
      (client): ClientKanbanCard => ({
        id: client.id,
        columnId: stage.id,
        client,
      }),
    ),
  );

  const handleCardMove = useCallback(
    (cardId: string, _fromColumnId: string, toColumnId: string) => {
      moveStage.mutate({ clientId: cardId, stageId: toColumnId });
    },
    [moveStage],
  );

  if (isError) {
    return (
      <main className="p-6">
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description={
            error instanceof Error ? error.message : "Не удалось загрузить данные воронки"
          }
        />
      </main>
    );
  }

  return (
    <main className="space-y-4 p-6">
      <AppPageHeader
        title="Воронка продаж"
        subtitle="Канбан-доска по этапам"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "pipeline", label: "Воронка" },
        ]}
      />

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", maxWidth: 600 }}>
        <Box sx={{ flex: "1 1 180px" }}>
          <AppSelect
            id="pipeline-source"
            label="Источник"
            options={SOURCE_OPTIONS}
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
          />
        </Box>
        <Box sx={{ flex: "1 1 180px" }}>
          <AppSelect
            id="pipeline-manager"
            label="Менеджер"
            options={managerOptions}
            value={filterManager}
            onChange={(e) => setFilterManager(e.target.value)}
          />
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <ShimmerBox key={i} style={{ height: 400, width: 280 }} />
          ))}
        </Box>
      ) : (
        <AppKanbanBoard<ClientKanbanCard>
          columns={columns}
          cards={cards}
          onCardMove={handleCardMove}
          renderCard={(card, isDragging) => (
            <ClientCard card={card} isDragging={isDragging} />
          )}
          onCardClick={(card) => router.push(routes.clientDetail(card.client.id))}
          emptyLabel="Нет клиентов"
        />
      )}
    </main>
  );
}
