"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useState, type ReactNode } from "react";
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
  const [open, setOpen] = useState(false);

  const hasItems = groups.some((group) => group.items.length > 0);
  const alignMode: "start" | "end" = align === "right" ? "end" : "start";

  const handleItemSelect = (item: AppActionMenuItem) => (event: Event) => {
    item.onClick?.();
    onSelectItem?.(item);

    if (item.keepOpen) {
      event.preventDefault();
      return;
    }

    setOpen(false);
  };

  return (
    <DropdownMenu.Root onOpenChange={setOpen} open={open}>
      {open && withBackdrop ? (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
          role="presentation"
        />
      ) : null}

      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "relative z-50 inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors",
            "bg-primary/30 text-primary hover:bg-primary/35",
            "disabled:cursor-not-allowed disabled:opacity-60",
            triggerClassName,
          )}
          disabled={disabled || !hasItems}
          type="button"
        >
          {triggerIcon ? <span className="inline-flex h-5 w-5 items-center justify-center">{triggerIcon}</span> : null}
          <span>{triggerLabel}</span>
          <ChevronDownIcon open={open} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={alignMode}
          className={cn(
            "z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg",
            menuClassName,
          )}
          sideOffset={8}
        >
          {groups.map((group, groupIndex) => (
            <div className={cn(groupIndex > 0 && "border-t border-border")} key={group.id}>
              {group.items.map((item) => {
                const itemClassName = cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors outline-none",
                  item.destructive
                    ? "text-danger focus:bg-danger/10 data-[highlighted]:bg-danger/10"
                    : "text-foreground focus:bg-muted data-[highlighted]:bg-muted",
                  item.disabled && "opacity-50",
                );

                if (item.href) {
                  return (
                    <DropdownMenu.Item
                      asChild
                      key={item.id}
                      onSelect={handleItemSelect(item)}
                      {...(item.disabled ? { disabled: true } : {})}
                    >
                      <Link className={itemClassName} href={item.href}>
                        {item.icon ? <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span> : null}
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenu.Item>
                  );
                }

                return (
                  <DropdownMenu.Item
                    className={itemClassName}
                    key={item.id}
                    onSelect={handleItemSelect(item)}
                    {...(item.disabled ? { disabled: true } : {})}
                  >
                    {item.icon ? <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span> : null}
                    <span>{item.label}</span>
                  </DropdownMenu.Item>
                );
              })}
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
