import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";

export interface PageHeaderCrumb {
  id: string;
  label: string;
  href?: string;
}

interface AppPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: readonly PageHeaderCrumb[];
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 6l6 6l-6 6" />
    </svg>
  );
}

export function AppPageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  meta,
  className,
}: AppPageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {breadcrumbs.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm"
        >
          {breadcrumbs.map((crumb, index) => (
            <span className="inline-flex items-center gap-1.5" key={crumb.id}>
              {index > 0 ? <ChevronRightIcon /> : null}
              {crumb.href ? (
                <Link className="transition-colors hover:text-foreground" href={crumb.href}>
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="break-words text-xl font-semibold leading-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          {meta ? <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div> : null}
        </div>

        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
