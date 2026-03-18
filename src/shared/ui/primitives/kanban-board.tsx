"use client";

import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";

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
  emptyLabel,
  className,
}: AppKanbanBoardProps<T>) {
  const { t } = useI18n();
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
    <div
      className={cn(
        "flex min-h-[400px] items-start gap-3 overflow-x-auto pb-2",
        className,
      )}
      style={{ touchAction: "manipulation" }}
    >
      {columns.map((column) => {
        const columnCards = getColumnCards(column.id);
        const isOver = overColumnId === column.id;
        const isOverLimit =
          column.limit !== undefined && columnCards.length >= column.limit;

        return (
          <div
            className="w-[280px] min-w-[260px] max-w-[300px] shrink-0"
            key={column.id}
            onDragLeave={() => setOverColumnId(null)}
            onDragOver={(e) => handleColumnDragOver(e, column.id)}
            onDrop={(e) => handleColumnDrop(e, column.id)}
          >
            <div
              className={cn(
                "min-h-[300px] rounded-xl border-2 p-2.5 transition-all duration-150",
                isOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card",
              )}
            >
              {/* Column header */}
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {column.color ? (
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                  ) : null}
                  <span className="text-sm font-semibold text-foreground">
                    {column.label}
                  </span>
                </div>
                <span
                  className={cn(
                    "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-[11px] font-medium",
                    isOverLimit
                      ? "bg-danger/15 text-danger"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {columnCards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {columnCards.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    {emptyLabel ?? t("kanban.empty")}
                  </p>
                ) : (
                  columnCards.map((card) => {
                    const isDragging = card.id === draggingId;
                    return (
                      <div
                        className={cn(
                          "transition-all duration-150",
                          isDragging && "scale-95 opacity-40",
                          onCardClick ? "cursor-pointer" : "cursor-grab",
                        )}
                        draggable
                        key={card.id}
                        onClick={() => !isDragging && onCardClick?.(card)}
                        onDragEnd={handleDragEnd}
                        onDragStart={(e) => handleDragStart(e, card)}
                      >
                        {renderCard(card, isDragging)}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
