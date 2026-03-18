"use client";

import { useDealsListQuery } from "@/modules/deals/presentation/hooks/use-deals-list-query";
import { AppStatePanel } from "@/shared/ui";

export function DealsList() {
  const { data = [], isLoading, error } = useDealsListQuery();

  if (isLoading) {
    return (
      <section className="space-y-2">
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <AppStatePanel
        tone="error"
        title="Ошибка загрузки сделок"
        description={error instanceof Error ? error.message : "Попробуйте обновить страницу"}
      />
    );
  }

  if (data.length === 0) {
    return (
      <AppStatePanel
        tone="empty"
        title="Сделок нет"
        description="Создайте первую сделку"
      />
    );
  }

  return (
    <section className="space-y-2">
      <ul className="space-y-2">
        {data.map((deal) => (
          <li className="rounded border border-border p-3" key={deal.id}>
            <p className="font-medium">{deal.dealNumber} — {deal.clientName}</p>
            <p className="text-xs text-muted-foreground">{deal.createdAt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
