"use client";

import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { Badge, Box, Paper, Stack, Typography } from "@mui/material";
import { cn } from "@/shared/lib/ui/cn";

export interface AppKanbanCard {
  id: string;
  columnId: string;
  [key: string]: unknown;
}

export interface AppKanbanColumn {
  id: string;
  label: string;
  color?: string;
  limit?: number;
}

interface AppKanbanBoardProps<T extends AppKanbanCard> {
  columns: readonly AppKanbanColumn[];
  cards: readonly T[];
  onCardMove: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  renderCard: (card: T, isDragging: boolean) => ReactNode;
  onCardClick?: (card: T) => void;
  emptyLabel?: string;
  className?: string;
}

export function AppKanbanBoard<T extends AppKanbanCard>({
  columns,
  cards,
  onCardMove,
  renderCard,
  onCardClick,
  emptyLabel = "Нет карточек",
  className,
}: AppKanbanBoardProps<T>) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const dragFromColumnId = useRef<string | null>(null);

  const getColumnCards = (columnId: string) =>
    cards.filter((c) => c.columnId === columnId);

  const handleDragStart = useCallback((e: DragEvent, card: T) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("cardId", card.id);
    setDraggingId(card.id);
    dragFromColumnId.current = card.columnId;
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setOverColumnId(null);
    dragFromColumnId.current = null;
  }, []);

  const handleColumnDragOver = useCallback((e: DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverColumnId(columnId);
  }, []);

  const handleColumnDrop = useCallback(
    (e: DragEvent, toColumnId: string) => {
      e.preventDefault();
      const cardId = e.dataTransfer.getData("cardId");
      const fromColumnId = dragFromColumnId.current;
      if (cardId && fromColumnId && fromColumnId !== toColumnId) {
        onCardMove(cardId, fromColumnId, toColumnId);
      }
      setDraggingId(null);
      setOverColumnId(null);
      dragFromColumnId.current = null;
    },
    [onCardMove],
  );

  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        gap: 1.5,
        overflowX: "auto",
        pb: 1,
        alignItems: "flex-start",
        minHeight: 400,
      }}
    >
      {columns.map((column) => {
        const columnCards = getColumnCards(column.id);
        const isOver = overColumnId === column.id;
        const isOverLimit = column.limit !== undefined && columnCards.length >= column.limit;

        return (
          <Box
            key={column.id}
            onDragLeave={() => setOverColumnId(null)}
            onDragOver={(e) => handleColumnDragOver(e, column.id)}
            onDrop={(e) => handleColumnDrop(e, column.id)}
            sx={{ minWidth: 260, maxWidth: 300, flexShrink: 0, width: 280 }}
          >
            <Paper
              sx={{
                p: 1.25,
                height: "100%",
                minHeight: 300,
                bgcolor: isOver ? "action.hover" : "background.paper",
                border: "2px solid",
                borderColor: isOver ? "primary.main" : "divider",
                transition: "all 160ms ease",
                borderRadius: 2,
              }}
              variant="outlined"
            >
              {/* Column header */}
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1.25 }}
              >
                <Stack alignItems="center" direction="row" gap={1}>
                  {column.color ? (
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: column.color,
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                  <Typography sx={{ fontWeight: 600, fontSize: 13 }} variant="subtitle2">
                    {column.label}
                  </Typography>
                </Stack>
                <Badge
                  badgeContent={columnCards.length}
                  color={isOverLimit ? "error" : "default"}
                  sx={{
                    "& .MuiBadge-badge": { fontSize: 11, height: 18, minWidth: 18 },
                  }}
                />
              </Stack>

              {/* Cards */}
              <Stack gap={1}>
                {columnCards.length === 0 ? (
                  <Typography
                    color="text.disabled"
                    sx={{ py: 3, textAlign: "center", fontSize: 12 }}
                    variant="body2"
                  >
                    {emptyLabel}
                  </Typography>
                ) : (
                  columnCards.map((card) => {
                    const isDragging = card.id === draggingId;
                    return (
                      <Box
                        className={cn(
                          "transition-all duration-150",
                          isDragging && "opacity-40 scale-95",
                        )}
                        draggable
                        key={card.id}
                        onClick={() => !isDragging && onCardClick?.(card)}
                        onDragEnd={handleDragEnd}
                        onDragStart={(e) => handleDragStart(e, card)}
                        sx={{ cursor: onCardClick ? "pointer" : "grab" }}
                      >
                        {renderCard(card, isDragging)}
                      </Box>
                    );
                  })
                )}
              </Stack>
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
}
