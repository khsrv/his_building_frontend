"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
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
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 160ms ease" }}
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

const sidebarColors = {
  border: "rgb(var(--border))",
  card: "rgb(var(--card))",
  muted: "rgb(var(--muted))",
  text: "rgb(var(--foreground))",
  mutedText: "rgb(var(--muted-foreground))",
  primary: "rgb(var(--primary))",
  primaryForeground: "rgb(var(--primary-foreground))",
  primarySoft: "rgb(var(--primary) / 0.15)",
};

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

  const width = compact ? 86 : 300;
  const commonItemSx = (isActive: boolean, isCompact: boolean) => ({
    borderRadius: "12px",
    gap: 1.25,
    minHeight: 44,
    px: isCompact ? 1 : 1.5,
    py: 1,
    justifyContent: isCompact ? "center" : "flex-start",
    color: isActive ? sidebarColors.primaryForeground : sidebarColors.text,
    bgcolor: isActive ? sidebarColors.primary : "transparent",
    transition: "background-color 160ms ease, color 160ms ease",
    "&:hover": {
      bgcolor: isActive ? sidebarColors.primary : sidebarColors.muted,
    },
  });
  const commonIconSx = (isCompact: boolean) => ({
    minWidth: 0,
    color: "inherit",
    justifyContent: "center",
    opacity: isCompact ? 1 : 0.9,
  });
  const childItemSx = (isActive: boolean) => ({
    borderRadius: "10px",
    minHeight: 36,
    px: 1,
    py: 0.75,
    gap: 1,
    color: isActive ? sidebarColors.primary : sidebarColors.mutedText,
    bgcolor: isActive ? sidebarColors.primarySoft : "transparent",
    "&:hover": {
      bgcolor: isActive ? sidebarColors.primarySoft : sidebarColors.muted,
      color: isActive ? sidebarColors.primary : sidebarColors.text,
    },
  });

  return (
    <Box
      className={cn("relative hidden h-screen shrink-0 md:flex", className)}
      ref={rootRef}
      sx={{
        width,
        borderRight: `1px solid ${sidebarColors.border}`,
        bgcolor: sidebarColors.card,
        flexDirection: "column",
        transition: "width 180ms ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 2 }}>
        <Box sx={{ display: "flex", minWidth: 0, alignItems: "center", gap: 1.5 }}>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              border: `1px solid rgb(var(--primary) / 0.35)`,
              color: sidebarColors.primary,
            }}
          >
            {brandIcon}
          </Box>

          {!compact ? (
            <Typography
              sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 20, fontWeight: 600, color: sidebarColors.text }}
              variant="h6"
            >
              {brandLabel}
            </Typography>
          ) : null}
        </Box>

        <IconButton
          aria-label={compact ? t("sidebar.expand") : t("sidebar.collapse")}
          onClick={() => {
            setCompact((current) => {
              const next = !current;
              if (!next) {
                setFlyoutParentId(null);
              }
              return next;
            });
          }}
          size="small"
          sx={{
            color: sidebarColors.mutedText,
            borderRadius: "10px",
            "&:hover": {
              bgcolor: sidebarColors.muted,
              color: sidebarColors.text,
            },
          }}
          title={compact ? t("sidebar.expand") : t("sidebar.collapse")}
        >
          <ToggleSidebarIcon compact={compact} />
        </IconButton>
      </Box>

      <List disablePadding sx={{ minHeight: 0, flex: 1, overflowY: "auto", px: 1, pb: 1.5 }}>
        {items.map((item) => {
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isActive = hasActiveDescendant(item, activeItemId);
          const isExpanded = expandedIds.has(item.id);
          const showFlyout = compact && hasChildren && flyoutParentId === item.id;

          return (
            <Box key={item.id} sx={{ position: "relative", mb: 0.5 }}>
              {hasChildren ? (
                <Tooltip disableHoverListener={!compact} placement="right" title={compact ? item.label : ""}>
                  <ListItemButton
                    onClick={() => {
                      if (compact) {
                        setFlyoutParentId((current) => (current === item.id ? null : item.id));
                        return;
                      }

                      toggleExpanded(item.id);
                    }}
                    sx={commonItemSx(isActive, compact)}
                  >
                    <ListItemIcon sx={commonIconSx(compact)}>{item.icon}</ListItemIcon>
                    {!compact ? (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ noWrap: true, fontSize: 14, fontWeight: 500 }}
                      />
                    ) : null}
                    {!compact ? <ChevronRightIcon open={isExpanded} /> : null}
                  </ListItemButton>
                </Tooltip>
              ) : item.href ? (
                <Tooltip disableHoverListener={!compact} placement="right" title={compact ? item.label : ""}>
                  <Link href={item.href} style={{ color: "inherit", textDecoration: "none" }}>
                    <ListItemButton sx={commonItemSx(isActive, compact)}>
                      <ListItemIcon sx={commonIconSx(compact)}>{item.icon}</ListItemIcon>
                      {!compact ? (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ noWrap: true, fontSize: 14, fontWeight: 500 }}
                        />
                      ) : null}
                    </ListItemButton>
                  </Link>
                </Tooltip>
              ) : (
                <Tooltip disableHoverListener={!compact} placement="right" title={compact ? item.label : ""}>
                  <ListItemButton sx={commonItemSx(isActive, compact)}>
                    <ListItemIcon sx={commonIconSx(compact)}>{item.icon}</ListItemIcon>
                    {!compact ? (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ noWrap: true, fontSize: 14, fontWeight: 500 }}
                      />
                    ) : null}
                  </ListItemButton>
                </Tooltip>
              )}

              {!compact && hasChildren ? (
                <Collapse in={isExpanded} timeout={160} unmountOnExit>
                  <List disablePadding sx={{ mt: 0.5, pl: 3 }}>
                    {(item.children ?? []).map((child) => {
                      const childActive = hasActiveDescendant(child, activeItemId);
                      const childContent = (
                        <>
                          <ListItemIcon sx={{ minWidth: 0, color: "inherit", mr: 1 }}>
                            <DotIcon />
                          </ListItemIcon>
                          <ListItemText primary={child.label} primaryTypographyProps={{ noWrap: true, fontSize: 14 }} />
                        </>
                      );

                      if (child.href) {
                        return (
                          <Link href={child.href} key={child.id} style={{ color: "inherit", textDecoration: "none" }}>
                            <ListItemButton sx={childItemSx(childActive)}>{childContent}</ListItemButton>
                          </Link>
                        );
                      }

                      return (
                        <ListItemButton disabled key={child.id} sx={childItemSx(childActive)}>
                          {childContent}
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              ) : null}

              {showFlyout ? (
                <Paper
                  elevation={10}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "calc(100% + 8px)",
                    zIndex: (theme) => theme.zIndex.modal,
                    width: 256,
                    borderRadius: "12px",
                    border: `1px solid ${sidebarColors.border}`,
                    bgcolor: sidebarColors.card,
                    p: 1,
                  }}
                >
                  <Typography
                    sx={{ px: 1, py: 1, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: sidebarColors.mutedText }}
                  >
                    {item.label}
                  </Typography>

                  <List disablePadding>
                    {(item.children ?? []).map((child) => {
                      const childActive = hasActiveDescendant(child, activeItemId);

                      if (child.href) {
                        return (
                          <Link
                            href={child.href}
                            key={child.id}
                            onClick={() => setFlyoutParentId(null)}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            <ListItemButton sx={childItemSx(childActive)}>
                              <ListItemIcon sx={{ minWidth: 0, color: "inherit", mr: 1 }}>
                                <DotIcon />
                              </ListItemIcon>
                              <ListItemText primary={child.label} primaryTypographyProps={{ noWrap: true, fontSize: 14 }} />
                            </ListItemButton>
                          </Link>
                        );
                      }

                      return (
                        <ListItemButton disabled key={child.id} sx={childItemSx(childActive)}>
                          <ListItemIcon sx={{ minWidth: 0, color: "inherit", mr: 1 }}>
                            <DotIcon />
                          </ListItemIcon>
                          <ListItemText primary={child.label} primaryTypographyProps={{ noWrap: true, fontSize: 14 }} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Paper>
              ) : null}
            </Box>
          );
        })}
      </List>

      {!compact && footer ? (
        <Box sx={{ borderTop: `1px solid ${sidebarColors.border}`, p: 1.5 }}>
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}
