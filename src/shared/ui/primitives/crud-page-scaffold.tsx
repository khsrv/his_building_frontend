import type { ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";

interface AppCrudPageScaffoldProps {
  header?: ReactNode;
  filters?: ReactNode;
  bulkActions?: ReactNode;
  content: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AppCrudPageScaffold({
  header,
  filters,
  bulkActions,
  content,
  sidebar,
  footer,
  className,
}: AppCrudPageScaffoldProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {header}
      {filters}
      {bulkActions}

      <div className={cn("grid gap-4", sidebar ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "grid-cols-1")}>
        <div className="min-w-0">{content}</div>
        {sidebar ? <aside className="min-w-0">{sidebar}</aside> : null}
      </div>

      {footer}
    </section>
  );
}
