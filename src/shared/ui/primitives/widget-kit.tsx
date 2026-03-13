"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";
import { AppButton } from "@/shared/ui/primitives/button";

export interface AppWidgetMenuOption {
  id: string;
  label: string;
  value?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface AppWidgetMenuProps {
  trigger: ReactNode;
  options: readonly AppWidgetMenuOption[];
  selectedOptionId?: string;
  onSelectOption?: (option: AppWidgetMenuOption) => void;
  align?: "left" | "right";
  withBackdrop?: boolean;
  triggerClassName?: string;
  menuClassName?: string;
}

interface AppWidgetFilterModalProps {
  open: boolean;
  title: string;
  applyLabel: string;
  closeLabel: string;
  isApplying?: boolean;
  applyDisabled?: boolean;
  closeDisabled?: boolean;
  onClose: () => void;
  onApply: () => void;
  children: ReactNode;
}

type WidgetFieldGridColumns = 1 | 2 | 3;

interface AppWidgetFieldGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: WidgetFieldGridColumns;
}

const fieldGridClass: Record<WidgetFieldGridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};

export function AppWidgetMenu({
  trigger,
  options,
  selectedOptionId,
  onSelectOption,
  align = "right",
  withBackdrop = false,
  triggerClassName,
  menuClassName,
}: AppWidgetMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const alignMode: "start" | "end" = align === "right" ? "end" : "start";

  return (
    <DropdownMenu.Root onOpenChange={setIsOpen} open={isOpen}>
      {isOpen && withBackdrop ? (
        <div
          className="fixed inset-0 z-40 bg-black/35"
          onClick={() => setIsOpen(false)}
          role="presentation"
        />
      ) : null}

      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "relative z-50 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted",
            triggerClassName,
          )}
          type="button"
        >
          {trigger}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={alignMode}
          className={cn("z-50 w-64 rounded-xl border border-border bg-card p-1.5 shadow-lg", menuClassName)}
          sideOffset={8}
        >
          <div className="space-y-1">
            {options.map((option) => {
              const isSelected = selectedOptionId === option.id;

              return (
                <DropdownMenu.Item
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm outline-none transition-colors",
                    option.disabled && "opacity-50",
                    isSelected
                      ? "bg-primary/15 text-primary"
                      : "text-foreground focus:bg-muted data-[highlighted]:bg-muted",
                  )}
                  key={option.id}
                  onSelect={() => {
                    onSelectOption?.(option);
                    setIsOpen(false);
                  }}
                  {...(option.disabled ? { disabled: true } : {})}
                >
                  {option.icon ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center">
                      {option.icon}
                    </span>
                  ) : null}
                  <span className="text-sm leading-none">{option.label}</span>
                  {option.value ? (
                    <span className="ml-auto text-sm leading-none text-inherit">{option.value}</span>
                  ) : null}
                </DropdownMenu.Item>
              );
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function AppWidgetFilterModal({
  open,
  title,
  applyLabel,
  closeLabel,
  isApplying = false,
  applyDisabled = false,
  closeDisabled = false,
  onClose,
  onApply,
  children,
}: AppWidgetFilterModalProps) {
  return (
    <Dialog.Root onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        onClose();
      }
    }} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-4 shadow-xl focus:outline-none">
          <div className="space-y-4">
            <Dialog.Title className="text-xl font-semibold text-foreground">{title}</Dialog.Title>

            {children}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <AppButton
                className="h-11 bg-primary/15 text-primary hover:bg-primary/20"
                disabled={applyDisabled}
                isLoading={isApplying}
                label={applyLabel}
                onClick={onApply}
                variant="tonal"
              />
              <Dialog.Close asChild>
                <AppButton
                  className="h-11 bg-rose-100/70 text-rose-500 hover:bg-rose-100"
                  disabled={closeDisabled}
                  label={closeLabel}
                  variant="tonal"
                />
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function AppWidgetFieldGrid({
  columns = 1,
  className,
  children,
  ...rest
}: AppWidgetFieldGridProps) {
  return (
    <div className={cn("grid gap-3", fieldGridClass[columns], className)} {...rest}>
      {children}
    </div>
  );
}
