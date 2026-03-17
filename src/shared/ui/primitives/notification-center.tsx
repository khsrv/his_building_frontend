"use client";

import { useCallback, useState } from "react";
import {
  Badge,
  Box,
  Chip,
  ClickAwayListener,
  Divider,
  IconButton,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import { ru } from "date-fns/locale";

export type AppNotificationType = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  type?: AppNotificationType;
  createdAt: string; // ISO
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

const TYPE_COLOR: Record<AppNotificationType, "info" | "success" | "warning" | "error"> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

function formatDate(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return iso;
  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  } catch {
    return iso;
  }
}

function BellIcon({ filled }: { filled?: boolean }) {
  return (
    <svg fill={filled ? "currentColor" : "none"} height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppNotificationCenter({
  notifications,
  onRead,
  onReadAll,
  onDismiss,
  maxVisible = 20,
  className,
}: AppNotificationCenterProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = notifications.slice(0, maxVisible);

  const handleToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl((prev) => (prev ? null : e.currentTarget));
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNotificationClick = useCallback(
    (n: AppNotification) => {
      if (!n.read) onRead(n.id);
      if (n.href) window.open(n.href, "_self");
    },
    [onRead],
  );

  return (
    <Box className={className} sx={{ display: "inline-flex" }}>
      <Tooltip title="Уведомления">
        <IconButton onClick={handleToggle} size="small">
          <Badge
            badgeContent={unreadCount > 0 ? unreadCount : undefined}
            color="error"
            max={99}
            sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16 } }}
          >
            <BellIcon filled={unreadCount > 0} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popper
        anchorEl={anchorEl}
        modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
        open={open}
        placement="bottom-end"
        style={{ zIndex: 1400 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={8}
            sx={{
              width: 360,
              maxHeight: 520,
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              sx={{ px: 2, py: 1.25, flexShrink: 0 }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                Уведомления
                {unreadCount > 0 ? (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: 10,
                      bgcolor: "error.main",
                      color: "error.contrastText",
                      fontSize: 11,
                      verticalAlign: "middle",
                    }}
                  >
                    {unreadCount}
                  </Box>
                ) : null}
              </Typography>
              {unreadCount > 0 ? (
                <Typography
                  color="primary"
                  onClick={onReadAll}
                  sx={{ fontSize: 12, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Прочитать все
                </Typography>
              ) : null}
            </Stack>
            <Divider />

            {/* List */}
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {visible.length === 0 ? (
                <Typography
                  color="text.disabled"
                  sx={{ py: 5, textAlign: "center", fontSize: 13 }}
                >
                  Нет уведомлений
                </Typography>
              ) : (
                visible.map((n, idx) => (
                  <Box key={n.id}>
                    <Box
                      onClick={() => handleNotificationClick(n)}
                      sx={{
                        px: 2,
                        py: 1.25,
                        cursor: "pointer",
                        bgcolor: n.read ? "transparent" : "action.selected",
                        "&:hover": { bgcolor: "action.hover" },
                        transition: "background-color 120ms ease",
                        display: "flex",
                        gap: 1.25,
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Unread dot */}
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: n.read ? "transparent" : "primary.main",
                          flexShrink: 0,
                          mt: 0.75,
                        }}
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack alignItems="center" direction="row" gap={0.75} flexWrap="wrap">
                          <Typography
                            noWrap
                            sx={{ fontSize: 13, fontWeight: n.read ? 400 : 600, flex: 1 }}
                          >
                            {n.title}
                          </Typography>
                          {n.type ? (
                            <Chip
                              color={TYPE_COLOR[n.type]}
                              label={n.type}
                              size="small"
                              sx={{ fontSize: 10, height: 16 }}
                            />
                          ) : null}
                        </Stack>
                        {n.body ? (
                          <Typography
                            color="text.secondary"
                            sx={{ fontSize: 12, mt: 0.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {n.body}
                          </Typography>
                        ) : null}
                        <Stack alignItems="center" direction="row" gap={1} sx={{ mt: 0.5 }}>
                          <Typography color="text.disabled" sx={{ fontSize: 11 }}>
                            {formatDate(n.createdAt)}
                          </Typography>
                          {n.action ? (
                            <Typography
                              color="primary"
                              onClick={(e) => { e.stopPropagation(); n.action!.onClick(); }}
                              sx={{ fontSize: 12, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                            >
                              {n.action.label}
                            </Typography>
                          ) : null}
                          {onDismiss ? (
                            <Typography
                              color="text.disabled"
                              onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
                              sx={{ fontSize: 12, cursor: "pointer", ml: "auto", "&:hover": { color: "error.main" } }}
                            >
                              ✕
                            </Typography>
                          ) : null}
                        </Stack>
                      </Box>
                    </Box>
                    {idx < visible.length - 1 ? <Divider /> : null}
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
