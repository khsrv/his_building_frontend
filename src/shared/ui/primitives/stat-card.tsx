import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";
import { AppStatusBadge, type AppStatusTone } from "@/shared/ui/primitives/status-badge";

export interface AppStatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: AppStatusTone;
  icon?: ReactNode;
  hint?: string;
}

interface AppKpiGridProps {
  items: readonly AppStatCardProps[];
  columns?: 2 | 3 | 4;
}

const columnsClassMap: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
};

export function AppStatCard({
  title,
  value,
  delta,
  deltaTone = "muted",
  icon,
  hint,
  className,
  ...rest
}: AppStatCardProps) {
  return (
    <article
      className={cn("rounded-xl border border-border bg-card p-3 shadow-sm", className)}
      {...rest}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="text-lg font-semibold text-foreground">{value}</div>
        </div>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>

      {delta || hint ? (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {delta ? <AppStatusBadge label={delta} tone={deltaTone} /> : null}
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

export function AppKpiGrid({ items, columns = 4 }: AppKpiGridProps) {
  return (
    <div className={cn("grid gap-3", columnsClassMap[columns])}>
      {items.map((item) => (
        <AppStatCard key={item.title} {...item} />
      ))}
    </div>
  );
}
