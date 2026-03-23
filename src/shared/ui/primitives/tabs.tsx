"use client";

import { isValidElement, useMemo, useState, type ReactNode, type SyntheticEvent } from "react";
import { Box, Tab, Tabs } from "@mui/material";

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
  const activeTab = tabs.some((tab) => tab.id === internalTab) ? internalTab : fallbackTab;

  const activeContent = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.content ?? null,
    [activeTab, tabs],
  );

  const handleChange = (_event: SyntheticEvent, nextTab: string) => {
    setInternalTab(nextTab);
    onTabChange?.(nextTab);
  };

  return (
    <Box sx={{ display: "flex", minHeight: 0, flexDirection: "column", gap: 1.5 }}>
      {top}

      <Box sx={{ borderRadius: 1.5, bgcolor: "action.hover", p: 0.5 }}>
        <Tabs
          onChange={handleChange}
          scrollButtons={isScrollable ? "auto" : false}
          sx={{
            minHeight: 36,
            "& .MuiTabs-indicator": { display: "none" },
          }}
          value={activeTab}
          variant={isScrollable ? "scrollable" : "standard"}
        >
          {tabs.map((tab) => (
            <Tab
              icon={isValidElement(tab.icon) ? tab.icon : undefined}
              iconPosition="start"
              key={tab.id}
              label={typeof tab.badge === "number" ? `${tab.title} (${tab.badge})` : tab.title}
              sx={{
                minHeight: 36,
                borderRadius: 1.25,
                textTransform: "none",
                color: "text.secondary",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                },
              }}
              value={tab.id}
            />
          ))}
        </Tabs>
      </Box>

      {bottom}

      <Box sx={{ minHeight: 0, flex: 1 }}>{activeContent}</Box>
    </Box>
  );
}
