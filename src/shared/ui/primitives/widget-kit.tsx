"use client";

import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={rootRef}>
      {isOpen && withBackdrop ? (
        <div className="fixed inset-0 z-40 bg-black/35" />
      ) : null}

      <button
        className={cn(
          "relative z-50 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted",
          triggerClassName,
        )}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {trigger}
      </button>

      {isOpen ? (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-border bg-card p-1.5 shadow-lg",
            align === "right" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          <div className="space-y-1">
            {options.map((option) => {
              const isSelected = selectedOptionId === option.id;

              return (
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    option.disabled && "cursor-not-allowed opacity-50",
                    isSelected
                      ? "bg-primary/15 text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                  disabled={option.disabled}
                  key={option.id}
                  onClick={() => {
                    onSelectOption?.(option);
                    setIsOpen(false);
                  }}
                  type="button"
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
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
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
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xl rounded-xl border border-border bg-card p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>

          {children}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <AppButton
              disabled={applyDisabled}
              isLoading={isApplying}
              label={applyLabel}
              onClick={onApply}
              variant="tonal"
              className="h-11 bg-primary/15 text-primary hover:bg-primary/20"
            />
            <AppButton
              disabled={closeDisabled}
              label={closeLabel}
              onClick={onClose}
              variant="tonal"
              className="h-11 bg-rose-100/70 text-rose-500 hover:bg-rose-100"
            />
          </div>
        </div>
      </div>
    </div>
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
