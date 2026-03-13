"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { prefsKeys } from "@/shared/constants/prefs-keys";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";

export interface AppSidebarItem {
  id: string;
  label: string;
  href?: string;
  icon: ReactNode;
  children?: readonly AppSidebarItem[];
}

interface AppSidebarProps {
  brandIcon: ReactNode;
  brandLabel: string;
  items: readonly AppSidebarItem[];
  activeItemId?: string;
  footer?: ReactNode;
  className?: string;
}

function ChevronRightIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn("h-4 w-4 transition-transform", open && "rotate-90")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 6l6 6l-6 6" />
    </svg>
  );
}

function DotIcon() {
  return <span className="inline-flex h-2 w-2 rounded-full bg-muted-foreground/70" />;
}

function ToggleSidebarIcon({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M8 6l6 6l-6 6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M16 6l-6 6l6 6" />
    </svg>
  );
}

function collectParentIds(items: readonly AppSidebarItem[], activeId: string | undefined) {
  if (!activeId) {
    return [] as string[];
  }

  const result: string[] = [];

  const walk = (nodes: readonly AppSidebarItem[], parents: readonly string[]) => {
    nodes.forEach((node) => {
      if (node.id === activeId) {
        result.push(...parents);
      }

      if (node.children && node.children.length > 0) {
        walk(node.children, [...parents, node.id]);
      }
    });
  };

  walk(items, []);

  return result;
}

function hasActiveDescendant(item: AppSidebarItem, activeId: string | undefined): boolean {
  if (item.id === activeId) {
    return true;
  }

  return (item.children ?? []).some((child) => hasActiveDescendant(child, activeId));
}

export function AppSidebar({
  brandIcon,
  brandLabel,
  items,
  activeItemId,
  footer,
  className,
}: AppSidebarProps) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeParents = useMemo(() => collectParentIds(items, activeItemId), [activeItemId, items]);

  const [compact, setCompact] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      return window.localStorage.getItem(prefsKeys.sidebarCompact) === "true";
    } catch {
      return false;
    }
  });
  const [manualExpandedIds, setManualExpandedIds] = useState<Set<string>>(() => new Set());
  const [flyoutParentId, setFlyoutParentId] = useState<string | null>(null);

  const expandedIds = useMemo(() => {
    const next = new Set(manualExpandedIds);
    activeParents.forEach((id) => next.add(id));
    return next;
  }, [activeParents, manualExpandedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(prefsKeys.sidebarCompact, compact ? "true" : "false");
    } catch {
      // Ignore storage access issues.
    }
  }, [compact]);

  useEffect(() => {
    if (!compact || !flyoutParentId) {
      return;
    }

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current?.contains(target)) {
        setFlyoutParentId(null);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [compact, flyoutParentId]);

  const toggleExpanded = (id: string) => {
    setManualExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const widthClassName = compact ? "w-[86px]" : "w-[300px]";

  return (
    <aside
      className={cn(
        "relative hidden h-screen shrink-0 flex-col border-r border-border bg-card md:flex",
        widthClassName,
        className,
      )}
      ref={rootRef}
    >
      <div className="flex items-center justify-between px-3 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/35 text-primary">
            {brandIcon}
          </span>

          {!compact ? <span className="truncate text-xl font-semibold text-foreground">{brandLabel}</span> : null}
        </div>

        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => {
            setCompact((current) => {
              const next = !current;
              if (!next) {
                setFlyoutParentId(null);
              }
              return next;
            });
          }}
          title={compact ? t("sidebar.expand") : t("sidebar.collapse")}
          type="button"
        >
          <ToggleSidebarIcon compact={compact} />
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {items.map((item) => {
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isActive = hasActiveDescendant(item, activeItemId);
          const isExpanded = expandedIds.has(item.id);
          const showFlyout = compact && hasChildren && flyoutParentId === item.id;

          return (
            <div className="relative" key={item.id}>
              {hasChildren ? (
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                    compact && "justify-center px-2",
                  )}
                  onClick={() => {
                    if (compact) {
                      setFlyoutParentId((current) => (current === item.id ? null : item.id));
                      return;
                    }

                    toggleExpanded(item.id);
                  }}
                  title={compact ? item.label : undefined}
                  type="button"
                >
                  <span className={cn("inline-flex h-5 w-5 shrink-0 items-center justify-center", !compact && "opacity-90")}>
                    {item.icon}
                  </span>

                  {!compact ? <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span> : null}

                  {!compact ? <ChevronRightIcon open={isExpanded} /> : null}
                </button>
              ) : item.href ? (
                <Link
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                    compact && "justify-center px-2",
                  )}
                  href={item.href}
                  title={compact ? item.label : undefined}
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                  {!compact ? <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span> : null}
                </Link>
              ) : (
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                    compact && "justify-center px-2",
                  )}
                  title={compact ? item.label : undefined}
                  type="button"
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                  {!compact ? <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span> : null}
                </button>
              )}

              {!compact && hasChildren && isExpanded ? (
                <div className="mt-1 space-y-0.5 pl-6">
                  {(item.children ?? []).map((child) => {
                    const childActive = hasActiveDescendant(child, activeItemId);
                    const childLabel = (
                      <>
                        <DotIcon />
                        <span className="truncate text-sm">{child.label}</span>
                      </>
                    );

                    if (child.href) {
                      return (
                        <Link
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
                            childActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                          href={child.href}
                          key={child.id}
                        >
                          {childLabel}
                        </Link>
                      );
                    }

                    return (
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-2",
                          childActive ? "bg-primary/15 text-primary" : "text-muted-foreground",
                        )}
                        key={child.id}
                      >
                        {childLabel}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {showFlyout ? (
                <div className="absolute left-[calc(100%+8px)] top-0 z-50 w-64 rounded-xl border border-border bg-card p-2 shadow-lg">
                  <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>

                  <div className="space-y-0.5">
                    {(item.children ?? []).map((child) => {
                      const childActive = hasActiveDescendant(child, activeItemId);

                      if (child.href) {
                        return (
                          <Link
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                              childActive ? "bg-primary/15 text-primary" : "text-foreground hover:bg-muted",
                            )}
                            href={child.href}
                            key={child.id}
                            onClick={() => setFlyoutParentId(null)}
                          >
                            <DotIcon />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      }

                      return (
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                            childActive ? "bg-primary/15 text-primary" : "text-foreground",
                          )}
                          key={child.id}
                        >
                          <DotIcon />
                          <span className="truncate">{child.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      {!compact && footer ? <div className="border-t border-border p-3">{footer}</div> : null}
    </aside>
  );
}
