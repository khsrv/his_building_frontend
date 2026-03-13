import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";

export type CardVariant =
  | "elevated"
  | "outlined"
  | "tonal"
  | "interactive"
  | "status-info"
  | "status-success"
  | "status-warning"
  | "status-error";

export type CardDensity = "dense" | "regular";

interface AppCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  variant?: CardVariant;
  density?: CardDensity;
  leading?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}

const variantClass: Record<CardVariant, string> = {
  elevated: "bg-card shadow-sm",
  outlined: "border border-border bg-card",
  tonal: "bg-muted",
  interactive: "bg-card shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
  "status-info": "bg-info/10 border border-info/30",
  "status-success": "bg-success/10 border border-success/30",
  "status-warning": "bg-warning/15 border border-warning/35",
  "status-error": "bg-danger/10 border border-danger/30",
};

const densityClass: Record<CardDensity, string> = {
  dense: "p-3",
  regular: "p-4",
};

export function AppCard({
  variant = "elevated",
  density = "regular",
  leading,
  title,
  subtitle,
  trailing,
  children,
  className,
  ...rest
}: AppCardProps) {
  return (
    <div className={cn("rounded-xl", variantClass[variant], densityClass[density], className)} {...rest}>
      <div className="flex items-start gap-3">
        {leading ? <div className="pt-0.5">{leading}</div> : null}

        <div className="min-w-0 flex-1 space-y-1">
          {title ? <div className="text-sm font-semibold text-foreground">{title}</div> : null}
          {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
          {children ? <div className="pt-2">{children}</div> : null}
        </div>

        {trailing ? <div>{trailing}</div> : null}
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, children, className }: SectionCardProps) {
  return (
    <AppCard className={className} subtitle={subtitle} title={title} variant="outlined">
      {children}
    </AppCard>
  );
}
