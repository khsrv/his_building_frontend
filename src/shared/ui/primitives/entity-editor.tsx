"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/shared/lib/ui/cn";
import { AppButton } from "@/shared/ui/primitives/button";

export interface AppEntityEditorTab {
  id: string;
  label: string;
  icon?: ReactNode;
}

type EntityEditorChildren = ReactNode | ((activeTabId: string) => ReactNode);

interface AppEntityEditorProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onReset" | "children"> {
  tabs?: readonly AppEntityEditorTab[];
  activeTabId?: string;
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
  onSubmitForm?: (event: FormEvent<HTMLFormElement>) => void;
  onResetForm?: () => void;
  saveLabel: string;
  resetLabel: string;
  isSaving?: boolean;
  saveDisabled?: boolean;
  resetDisabled?: boolean;
  footerHint?: ReactNode;
  actions?: ReactNode;
  children: EntityEditorChildren;
}

interface AppEntityEditorSectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
}

type AppEntityEditorColumns = 1 | 2 | 3 | 4;

interface AppEntityEditorGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: AppEntityEditorColumns;
}

const gridColumnsClass: Record<AppEntityEditorColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
};

function ResetIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 3h11l3 3v15H5z" />
      <path d="M8 3v6h8V3M8 17h8" />
    </svg>
  );
}

function renderEditorContent(children: EntityEditorChildren, activeTabId: string) {
  if (typeof children === "function") {
    return children(activeTabId);
  }

  return children;
}

export function AppEntityEditor({
  tabs = [],
  activeTabId,
  defaultTabId,
  onTabChange,
  onSubmitForm,
  onResetForm,
  saveLabel,
  resetLabel,
  isSaving = false,
  saveDisabled = false,
  resetDisabled = false,
  footerHint,
  actions,
  className,
  children,
  ...rest
}: AppEntityEditorProps) {
  const fallbackTabId = tabs[0]?.id ?? "";
  const [internalActiveTabId, setInternalActiveTabId] = useState<string>(
    defaultTabId ?? fallbackTabId,
  );

  const resolvedActiveTabId = useMemo(() => {
    const selectedTabId = activeTabId ?? internalActiveTabId;
    if (!tabs.some((tab) => tab.id === selectedTabId)) {
      return fallbackTabId;
    }

    return selectedTabId;
  }, [activeTabId, fallbackTabId, internalActiveTabId, tabs]);

  const hasTabs = tabs.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {hasTabs ? (
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = resolvedActiveTabId === tab.id;

            return (
              <button
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-muted",
                )}
                key={tab.id}
                onClick={() => {
                  if (!activeTabId) {
                    setInternalActiveTabId(tab.id);
                  }

                  onTabChange?.(tab.id);
                }}
                type="button"
              >
                {tab.icon ? <span className="inline-flex h-5 w-5 items-center justify-center">{tab.icon}</span> : null}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <form
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        onReset={() => onResetForm?.()}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitForm?.(event);
        }}
        {...rest}
      >
        <div className="p-4 md:p-6">
          {renderEditorContent(children, resolvedActiveTabId)}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border bg-muted/20 px-4 py-4 md:px-6">
          {footerHint ? (
            <div className="mr-auto text-sm text-muted-foreground">{footerHint}</div>
          ) : (
            <div className="mr-auto" />
          )}

          {actions ?? (
            <div className="flex flex-wrap items-center gap-3">
              <AppButton
                disabled={resetDisabled || isSaving}
                label={resetLabel}
                leading={<ResetIcon />}
                onClick={onResetForm}
                type="button"
                variant="secondary"
              />
              <AppButton
                disabled={saveDisabled}
                isLoading={isSaving}
                label={saveLabel}
                leading={<SaveIcon />}
                type="submit"
                variant="primary"
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export function AppEntityEditorSection({
  title,
  description,
  className,
  children,
  ...rest
}: AppEntityEditorSectionProps) {
  return (
    <section className={cn("border-t border-border pt-5 first:border-0 first:pt-0", className)} {...rest}>
      {(title || description) ? (
        <header className="mb-3 space-y-1">
          {title ? <h3 className="text-base font-semibold text-foreground">{title}</h3> : null}
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function AppEntityEditorGrid({
  columns = 3,
  className,
  children,
  ...rest
}: AppEntityEditorGridProps) {
  return (
    <div className={cn("grid gap-4", gridColumnsClass[columns], className)} {...rest}>
      {children}
    </div>
  );
}
