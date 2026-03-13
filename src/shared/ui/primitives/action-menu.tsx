"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";

export interface AppActionMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
  keepOpen?: boolean;
  onClick?: () => void;
}

export interface AppActionMenuGroup {
  id: string;
  items: readonly AppActionMenuItem[];
}

interface AppActionMenuProps {
  triggerLabel: string;
  groups: readonly AppActionMenuGroup[];
  triggerIcon?: ReactNode;
  align?: "left" | "right";
  withBackdrop?: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  menuClassName?: string;
  onSelectItem?: (item: AppActionMenuItem) => void;
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn("h-5 w-5 transition-transform", open && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6l6-6" />
    </svg>
  );
}

export function AppActionMenu({
  triggerLabel,
  groups,
  triggerIcon,
  align = "left",
  withBackdrop = false,
  disabled = false,
  triggerClassName,
  menuClassName,
  onSelectItem,
}: AppActionMenuProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const hasItems = groups.some((group) => group.items.length > 0);

  return (
    <div className="relative" ref={rootRef}>
      {open && withBackdrop ? (
        <div className="fixed inset-0 z-40 bg-black/30" />
      ) : null}

      <button
        className={cn(
          "relative z-50 inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors",
          "bg-primary/30 text-primary hover:bg-primary/35",
          "disabled:cursor-not-allowed disabled:opacity-60",
          triggerClassName,
        )}
        disabled={disabled || !hasItems}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {triggerIcon ? <span className="inline-flex h-5 w-5 items-center justify-center">{triggerIcon}</span> : null}
        <span>{triggerLabel}</span>
        <ChevronDownIcon open={open} />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-lg",
            align === "right" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {groups.map((group, groupIndex) => (
            <div
              className={cn(groupIndex > 0 && "border-t border-border")}
              key={group.id}
            >
              {group.items.map((item) => {
                const itemClassName = cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                  item.destructive
                    ? "text-danger hover:bg-danger/10"
                    : "text-foreground hover:bg-muted",
                  item.disabled && "cursor-not-allowed opacity-50",
                );

                if (item.href) {
                  return (
                    <Link
                      className={itemClassName}
                      href={item.href}
                      key={item.id}
                      onClick={() => {
                        item.onClick?.();
                        onSelectItem?.(item);
                        if (!item.keepOpen) {
                          setOpen(false);
                        }
                      }}
                    >
                      {item.icon ? <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span> : null}
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    className={itemClassName}
                    disabled={item.disabled}
                    key={item.id}
                    onClick={() => {
                      item.onClick?.();
                      onSelectItem?.(item);
                      if (!item.keepOpen) {
                        setOpen(false);
                      }
                    }}
                    type="button"
                  >
                    {item.icon ? <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span> : null}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
