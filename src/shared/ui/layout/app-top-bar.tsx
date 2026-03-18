"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";
import {
  Avatar,
  Badge,
  Box,
  ButtonBase,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

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

function itemSx(item: AppTopBarMenuItem) {
  if (item.tone === "danger") {
    return {
      color: "error.main",
      "&:hover": { bgcolor: "error.light" },
    };
  }

  if (item.tone === "primary" || item.active) {
    return {
      color: "primary.main",
      "&:hover": { bgcolor: "primary.light" },
    };
  }

  return {
    color: "text.primary",
    "&:hover": { bgcolor: "action.hover" },
  };
}

function renderMenuItem(
  item: AppTopBarMenuItem,
  closeMenu: () => void,
) {
  const onClick = () => {
    item.onClick?.();
    closeMenu();
  };

  if (item.href) {
    return (
      <MenuItem
        component={Link}
        href={item.href}
        key={item.id}
        onClick={onClick}
        sx={{ borderRadius: 1, gap: 1, py: 0.8, ...itemSx(item) }}
      >
        {item.icon ? <Box sx={{ display: "inline-flex", width: 20, height: 20 }}>{item.icon}</Box> : null}
        <Typography variant="body2">{item.label}</Typography>
      </MenuItem>
    );
  }

  return (
    <MenuItem key={item.id} onClick={onClick} sx={{ borderRadius: 1, gap: 1, py: 0.8, ...itemSx(item) }}>
      {item.icon ? <Box sx={{ display: "inline-flex", width: 20, height: 20 }}>{item.icon}</Box> : null}
      <Typography variant="body2">{item.label}</Typography>
    </MenuItem>
  );
}

export function AppTopBar({ leftSlot, actions = [], profile, className }: AppTopBarProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuOwnerId, setMenuOwnerId] = useState<string | null>(null);

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuOwnerId(null);
  };

  const openMenu = (id: string, event: MouseEvent<HTMLElement>) => {
    setMenuOwnerId(id);
    setMenuAnchor(event.currentTarget);
  };

  return (
    <Paper className={className} sx={{ borderRadius: 1.5, p: 1 }}>
      <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}>
        <Box sx={{ mr: "auto" }}>{leftSlot}</Box>

        {actions.map((action) => {
          const hasMenu = Boolean(action.menuItems && action.menuItems.length > 0);
          const selected = action.active || menuOwnerId === action.id;

          const content = (
            <Stack alignItems="center" direction="row" gap={action.label ? 1 : 0} justifyContent="center">
              <Box sx={{ display: "inline-flex", width: 20, height: 20 }}>{action.icon}</Box>
              {action.label ? <Typography variant="subtitle1">{action.label}</Typography> : null}
            </Stack>
          );

          if (hasMenu) {
            return (
              <Box key={action.id}>
                <IconButton
                  aria-label={action.title}
                  color={selected ? "primary" : "default"}
                  onClick={(event) => openMenu(action.id, event)}
                  sx={{
                    height: 38,
                    minWidth: action.label ? 66 : 38,
                    px: action.label ? 1.2 : 0,
                    bgcolor: selected ? "primary.light" : "transparent",
                    borderRadius: 1.25,
                  }}
                  title={action.title}
                >
                  {content}
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  onClose={closeMenu}
                  open={menuOwnerId === action.id}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                >
                  {action.menuItems?.map((item) => renderMenuItem(item, closeMenu))}
                </Menu>
              </Box>
            );
          }

          if (action.href) {
            return (
              <IconButton
                aria-label={action.title}
                color={selected ? "primary" : "default"}
                component={Link}
                href={action.href}
                key={action.id}
                sx={{
                  height: 38,
                  minWidth: action.label ? 66 : 38,
                  px: action.label ? 1.2 : 0,
                  borderRadius: 1.25,
                  bgcolor: selected ? "primary.light" : "transparent",
                }}
                title={action.title}
              >
                {content}
              </IconButton>
            );
          }

          return (
            <IconButton
              aria-label={action.title}
              color={selected ? "primary" : "default"}
              key={action.id}
              onClick={action.onClick}
              sx={{
                height: 38,
                minWidth: action.label ? 66 : 38,
                px: action.label ? 1.2 : 0,
                borderRadius: 1.25,
                bgcolor: selected ? "primary.light" : "transparent",
              }}
              title={action.title}
            >
              {content}
            </IconButton>
          );
        })}

        {profile ? (
          <Box>
            <ButtonBase
              onClick={(event) => {
                const hasMenu = Boolean(profile.menuItems && profile.menuItems.length > 0);
                if (hasMenu) {
                  openMenu("profile", event);
                  return;
                }
                profile.onClick?.();
              }}
              sx={{
                borderRadius: 1.25,
                px: 0.75,
                py: 0.35,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack alignItems="center" direction="row" gap={1}>
                <Badge
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  color="success"
                  invisible={!profile.online}
                  overlap="circular"
                  variant="dot"
                >
                  <Avatar sx={{ width: 36, height: 36 }}>
                    {profile.avatarUrl ? (
                      <Image alt={profile.name} height={36} src={profile.avatarUrl} width={36} />
                    ) : (
                      initials(profile.name)
                    )}
                  </Avatar>
                </Badge>

                <Box sx={{ minWidth: 0, textAlign: "left" }}>
                  <Typography noWrap variant="subtitle1">
                    {profile.name}
                  </Typography>
                  {profile.subtitle ? (
                    <Typography noWrap color="text.secondary" variant="body2">
                      {profile.subtitle}
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
            </ButtonBase>

            <Menu
              anchorEl={menuAnchor}
              onClose={closeMenu}
              open={menuOwnerId === "profile"}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
            >
              {profile.menuItems?.map((item) => renderMenuItem(item, closeMenu))}
            </Menu>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
