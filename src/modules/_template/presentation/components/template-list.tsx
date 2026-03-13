"use client";

import { useTemplateItemsQuery } from "@/modules/_template/presentation/hooks/use-template-items.query";
import { PageState } from "@/shared/ui/feedback/page-state";

export function TemplateList() {
  const { data = [], isLoading, error } = useTemplateItemsQuery();

  return (
    <section className="rounded border bg-card p-4">
      <h2 className="mb-4 text-lg font-medium">Template Module</h2>

      <PageState isLoading={isLoading} error={error} isEmpty={data.length === 0}>
        <ul className="space-y-2">
          {data.map((item) => (
            <li className="rounded border bg-background p-3" key={item.id}>
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.createdAtIso}</div>
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
