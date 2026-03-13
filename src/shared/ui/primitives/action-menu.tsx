"use client";

import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";
import { Backdrop, Box, Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const hasItems = groups.some((group) => group.items.length > 0);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Backdrop
        onClick={handleClose}
        open={open && withBackdrop}
        sx={{ zIndex: (theme) => theme.zIndex.modal - 1, bgcolor: "rgba(0,0,0,0.3)" }}
      />
      <Button
        className={triggerClassName}
        disabled={disabled || !hasItems}
        endIcon={
          <Box sx={{ transition: "transform 160ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            <svg aria-hidden fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
              <path d="M6 9l6 6l6-6" />
            </svg>
          </Box>
        }
        onClick={handleOpen}
        startIcon={triggerIcon}
        sx={{
          height: 38,
          borderRadius: 1.25,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
          px: 1.5,
          "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
        }}
        variant="outlined"
      >
        {triggerLabel}
      </Button>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: align === "right" ? "right" : "left", vertical: "bottom" }}
        onClose={handleClose}
        open={open}
        slotProps={{ paper: { className: menuClassName, sx: { minWidth: 260, p: 0.75 } } }}
        transformOrigin={{ horizontal: align === "right" ? "right" : "left", vertical: "top" }}
      >
        {groups.map((group, groupIndex) => (
          <Box key={group.id}>
            {groupIndex > 0 ? <Divider sx={{ my: 0.75 }} /> : null}
            {group.items.map((item) => {
              const handleClick = () => {
                item.onClick?.();
                onSelectItem?.(item);
                if (!item.keepOpen) {
                  handleClose();
                }
              };

              const sx = item.destructive
                ? { color: "error.main", "&:hover": { bgcolor: "error.light" } }
                : undefined;

              if (item.href) {
                return (
                  <MenuItem
                    component={Link}
                    disabled={item.disabled}
                    href={item.href}
                    key={item.id}
                    onClick={handleClick}
                    sx={{ borderRadius: 1.25, py: 1.1, ...sx }}
                  >
                    {item.icon ? <ListItemIcon sx={{ minWidth: 28 }}>{item.icon}</ListItemIcon> : null}
                    <ListItemText>{item.label}</ListItemText>
                  </MenuItem>
                );
              }

              return (
                <MenuItem
                  disabled={item.disabled}
                  key={item.id}
                  onClick={handleClick}
                  sx={{ borderRadius: 1.25, py: 1.1, ...sx }}
                >
                  {item.icon ? <ListItemIcon sx={{ minWidth: 28 }}>{item.icon}</ListItemIcon> : null}
                  <ListItemText>{item.label}</ListItemText>
                </MenuItem>
              );
            })}
          </Box>
        ))}
      </Menu>
    </>
  );
}
