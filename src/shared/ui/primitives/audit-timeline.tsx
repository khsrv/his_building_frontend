import type { ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";

export interface AuditTimelineItem {
  id: string;
  title: string;
  actor: string;
  at: string;
  description?: string;
  meta?: ReactNode;
}

interface AppAuditTimelineProps {
  items: readonly AuditTimelineItem[];
  className?: string;
}

export function AppAuditTimeline({ items, className }: AppAuditTimelineProps) {
  return (
    <ol className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <li className="relative rounded-xl border border-border bg-card p-4 shadow-sm" key={item.id}>
          <span className="absolute -left-[9px] top-7 h-4 w-4 rounded-full border border-border bg-background" />
          {index < items.length - 1 ? (
            <span className="absolute -left-[2px] top-11 h-[calc(100%+8px)] w-[2px] bg-border" />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground">{item.title}</p>
            <time className="text-xs text-muted-foreground">{item.at}</time>
          </div>
          <p className="pt-1 text-sm text-muted-foreground">{item.actor}</p>
          {item.description ? <p className="pt-2 text-sm text-foreground">{item.description}</p> : null}
          {item.meta ? <div className="pt-2">{item.meta}</div> : null}
        </li>
      ))}
    </ol>
  );
}
