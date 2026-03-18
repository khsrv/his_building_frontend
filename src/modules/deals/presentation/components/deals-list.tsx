"use client";

import { useDealsQuery } from "@/modules/deals/presentation/hooks/use-deals.query";
import { PageState } from "@/shared/ui/feedback/page-state";

export function DealsList() {
  const { data = [], isLoading, error } = useDealsQuery();

  return (
    <section className="space-y-2">
      <PageState isEmpty={data.length === 0} isLoading={isLoading} error={error}>
        <ul className="space-y-2">
          {data.map((item) => (
            <li className="rounded border border-border p-3" key={item.id}>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.createdAtIso}</p>
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
