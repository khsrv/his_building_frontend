"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";

export type AppNotificationType = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  type?: AppNotificationType;
  createdAt: string;
  read?: boolean;
  href?: string;
  action?: { label: string; onClick: () => void };
}

interface AppNotificationCenterProps {
  notifications: readonly AppNotification[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onDismiss?: (id: string) => void;
  maxVisible?: number;
  className?: string;
}

const typeChipClass: Record<AppNotificationType, string> = {
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-danger/15 text-danger",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "< 1m";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export function AppNotificationCenter({
  notifications,
  onRead,
  onReadAll,
  onDismiss,
  maxVisible = 20,
  className,
}: AppNotificationCenterProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = notifications.slice(0, maxVisible);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleNotificationClick = useCallback(
    (n: AppNotification) => {
      if (!n.read) onRead(n.id);
      if (n.href) window.open(n.href, "_self");
    },
    [onRead],
  );

  return (
    <div className={cn("relative inline-flex", className)} ref={containerRef}>
      {/* Bell button */}
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={handleToggle}
        title={t("notification.bell")}
        type="button"
      >
        <svg
          className="h-5 w-5"
          fill={unreadCount > 0 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {/* Dropdown */}
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 flex max-h-[520px] w-[360px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2.5">
            <span className="text-sm font-bold text-foreground">
              {t("notification.title")}
              {unreadCount > 0 ? (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </span>
            {unreadCount > 0 ? (
              <button
                className="text-xs text-primary hover:underline"
                onClick={onReadAll}
                type="button"
              >
                {t("notification.readAll")}
              </button>
            ) : null}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {visible.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("notification.empty")}
              </p>
            ) : (
              visible.map((n, idx) => (
                <div key={n.id}>
                  <div
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-muted/50",
                      !n.read && "bg-primary/5",
                    )}
                    onClick={() => handleNotificationClick(n)}
                  >
                    {/* Unread dot */}
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        n.read ? "bg-transparent" : "bg-primary",
                      )}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "flex-1 truncate text-sm",
                            n.read ? "font-normal text-foreground" : "font-semibold text-foreground",
                          )}
                        >
                          {n.title}
                        </span>
                        {n.type ? (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                              typeChipClass[n.type],
                            )}
                          >
                            {n.type}
                          </span>
                        ) : null}
                      </div>
                      {n.body ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {n.body}
                        </p>
                      ) : null}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground/60">
                          {timeAgo(n.createdAt)}
                        </span>
                        {n.action ? (
                          <button
                            className="text-xs text-primary hover:underline"
                            onClick={(e) => { e.stopPropagation(); n.action!.onClick(); }}
                            type="button"
                          >
                            {n.action.label}
                          </button>
                        ) : null}
                        {onDismiss ? (
                          <button
                            className="ml-auto text-xs text-muted-foreground hover:text-danger"
                            onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
                            type="button"
                          >
                            ✕
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {idx < visible.length - 1 ? (
                    <div className="border-b border-border" />
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
