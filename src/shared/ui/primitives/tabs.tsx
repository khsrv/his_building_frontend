"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";

export interface TabSpec {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: number;
}

interface AppTabsProps {
  tabs: readonly TabSpec[];
  initialTabId?: string;
  isScrollable?: boolean;
  top?: ReactNode;
  bottom?: ReactNode;
  onTabChange?: (tabId: string) => void;
}

export function AppTabs({
  tabs,
  initialTabId,
  isScrollable = false,
  top,
  bottom,
  onTabChange,
}: AppTabsProps) {
  const fallbackTab = tabs[0]?.id ?? "";
  const [internalTab, setInternalTab] = useState(initialTabId ?? fallbackTab);

  const selectedTab = initialTabId ?? internalTab;
  const activeTab = tabs.some((tab) => tab.id === selectedTab) ? selectedTab : fallbackTab;

  const activeContent = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.content ?? null,
    [activeTab, tabs],
  );

  return (
    <div className="flex min-h-0 flex-col gap-3">
      {top}

      <div className="rounded-lg bg-muted p-1">
        <div className={cn("flex gap-1", isScrollable ? "overflow-x-auto" : "flex-wrap")}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium",
                  "transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-card/80 hover:text-foreground",
                )}
                key={tab.id}
                onClick={() => {
                  if (!initialTabId) {
                    setInternalTab(tab.id);
                  }

                  onTabChange?.(tab.id);
                }}
                type="button"
              >
                {tab.icon}
                <span>{tab.title}</span>
                {typeof tab.badge === "number" ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      isActive ? "bg-primary-foreground/20" : "bg-card",
                    )}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {bottom}

      <div className="min-h-0 flex-1">{activeContent}</div>
    </div>
  );
}
