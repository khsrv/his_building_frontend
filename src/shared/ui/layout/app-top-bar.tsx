"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";

export type AppTopBarMenuItemTone = "default" | "primary" | "danger";

export interface AppTopBarMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  tone?: AppTopBarMenuItemTone;
}

export interface AppTopBarAction {
  id: string;
  icon: ReactNode;
  label?: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  title?: string;
  menuItems?: readonly AppTopBarMenuItem[];
}

export interface AppTopBarProfile {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  online?: boolean;
  onClick?: () => void;
  menuItems?: readonly AppTopBarMenuItem[];
}

interface AppTopBarProps {
  leftSlot?: ReactNode;
  actions?: readonly AppTopBarAction[];
  profile?: AppTopBarProfile;
  className?: string;
}

function initials(name: string) {
  const chunks = name
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (chunks.length === 0) {
    return "U";
  }

  return chunks.map((item) => item[0]?.toUpperCase() ?? "").join("");
}

function ActionContent({ action }: { action: AppTopBarAction }) {
  return (
    <>
      <span className="inline-flex h-5 w-5 items-center justify-center">{action.icon}</span>
      {action.label ? <span className="text-sm font-medium">{action.label}</span> : null}
    </>
  );
}

function getMenuItemClassName(item: AppTopBarMenuItem) {
  if (item.tone === "danger") {
    return "bg-rose-100/80 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25";
  }

  if (item.tone === "primary" || item.active) {
    return "bg-primary/15 text-primary hover:bg-primary/20";
  }

  return "text-foreground hover:bg-muted";
}

function MenuItem({
  item,
  onSelect,
}: {
  item: AppTopBarMenuItem;
  onSelect: () => void;
}) {
  const itemClassName = cn(
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
    getMenuItemClassName(item),
  );

  if (item.href) {
    return (
      <Link
        className={itemClassName}
        href={item.href}
        onClick={() => {
          item.onClick?.();
          onSelect();
        }}
      >
        {item.icon ? (
          <span className="inline-flex h-6 w-6 items-center justify-center">
            {item.icon}
          </span>
        ) : null}
        <span className="text-sm">{item.label}</span>
      </Link>
    );
  }

  return (
    <button
      className={itemClassName}
      onClick={() => {
        item.onClick?.();
        onSelect();
      }}
      type="button"
    >
      {item.icon ? (
        <span className="inline-flex h-6 w-6 items-center justify-center">
          {item.icon}
        </span>
      ) : null}
      <span className="text-sm">{item.label}</span>
    </button>
  );
}

export function AppTopBar({ leftSlot, actions = [], profile, className }: AppTopBarProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current?.contains(target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openMenuId]);

  return (
    <header className={cn("rounded-2xl border border-border bg-card p-3 shadow-sm", className)} ref={rootRef}>
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="mr-auto flex items-center gap-2">{leftSlot}</div>

        <div className="flex items-center gap-1.5">
          {actions.map((action) => {
            const hasMenu = Boolean(action.menuItems && action.menuItems.length > 0);
            const menuOpen = openMenuId === action.id;
            const buttonClass = cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-muted-foreground transition-colors",
              action.active
                ? "bg-primary/12 text-primary"
                : "hover:bg-muted hover:text-foreground",
              hasMenu && "bg-muted hover:bg-muted",
              !action.label && "w-11 px-0",
            );

            if (hasMenu) {
              return (
                <div className="relative" key={action.id}>
                  <button
                    className={buttonClass}
                    onClick={() => setOpenMenuId((current) => (current === action.id ? null : action.id))}
                    title={action.title}
                    type="button"
                  >
                    <ActionContent action={action} />
                  </button>

                  {menuOpen ? (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                      <div className="space-y-1">
                        {action.menuItems?.map((item) => {
                          return (
                            <MenuItem
                              item={item}
                              key={item.id}
                              onSelect={() => setOpenMenuId(null)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            }

            if (action.href) {
              return (
                <Link className={buttonClass} href={action.href} key={action.id} title={action.title}>
                  <ActionContent action={action} />
                </Link>
              );
            }

            return (
              <button
                className={buttonClass}
                key={action.id}
                onClick={action.onClick}
                title={action.title}
                type="button"
              >
                <ActionContent action={action} />
              </button>
            );
          })}

          {profile ? (
            <div className="relative">
              <button
                className={cn(
                  "inline-flex h-11 items-center gap-3 rounded-xl px-2.5 transition-colors hover:bg-muted",
                  openMenuId === "profile" && "bg-muted",
                )}
                onClick={() => {
                  const hasMenu = Boolean(profile.menuItems && profile.menuItems.length > 0);
                  if (hasMenu) {
                    setOpenMenuId((current) => (current === "profile" ? null : "profile"));
                    return;
                  }

                  profile.onClick?.();
                }}
                type="button"
              >
                <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-foreground">
                  {profile.avatarUrl ? (
                    <Image
                      alt={profile.name}
                      className="h-full w-full object-cover"
                      height={44}
                      src={profile.avatarUrl}
                      width={44}
                    />
                  ) : (
                    initials(profile.name)
                  )}
                  {profile.online ? (
                    <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border border-card bg-success" />
                  ) : null}
                </span>

                <span className="hidden min-w-0 text-left md:block">
                  <span className="block truncate text-sm font-semibold text-foreground">{profile.name}</span>
                  {profile.subtitle ? <span className="block truncate text-xs text-muted-foreground">{profile.subtitle}</span> : null}
                </span>
              </button>

              {openMenuId === "profile" && profile.menuItems && profile.menuItems.length > 0 ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                  <div className="space-y-2">
                    {profile.menuItems.map((item) => (
                      <MenuItem
                        item={item}
                        key={item.id}
                        onSelect={() => setOpenMenuId(null)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
