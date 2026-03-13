"use client";

import { useState, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import {
  Backdrop,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
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

const columnsSx: Record<WidgetFieldGridColumns, object> = {
  1: { gridTemplateColumns: "1fr" },
  2: { gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } },
  3: { gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" } },
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

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
        sx={{ zIndex: (theme) => theme.zIndex.modal - 1, bgcolor: "rgba(0,0,0,0.35)" }}
      />
      <Button
        className={triggerClassName}
        onClick={handleOpen}
        sx={{
          height: 38,
          minWidth: 44,
          borderRadius: 1.25,
          borderColor: "divider",
          color: "text.primary",
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
        }}
        variant="outlined"
      >
        {trigger}
      </Button>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: align === "right" ? "right" : "left", vertical: "bottom" }}
        onClose={handleClose}
        open={open}
        slotProps={{ paper: { className: menuClassName, sx: { minWidth: 260, p: 0.75 } } }}
        transformOrigin={{ horizontal: align === "right" ? "right" : "left", vertical: "top" }}
      >
        {options.map((option) => {
          const selected = selectedOptionId === option.id;

          return (
            <MenuItem
              disabled={option.disabled}
              key={option.id}
              onClick={() => {
                onSelectOption?.(option);
                handleClose();
              }}
              selected={selected}
              sx={{
                borderRadius: 1.25,
                py: 1.1,
                color: selected ? "primary.main" : "text.primary",
                bgcolor: selected ? "primary.light" : undefined,
              }}
            >
              {option.icon ? <ListItemIcon sx={{ minWidth: 28 }}>{option.icon}</ListItemIcon> : null}
              <ListItemText>{option.label}</ListItemText>
              {option.value ? (
                <Box component="span" sx={{ ml: 1, color: "text.secondary", fontSize: 14 }}>
                  {option.value}
                </Box>
              ) : null}
            </MenuItem>
          );
        })}
      </Menu>
    </>
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
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 0.5 }}>{children}</Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <AppButton
            disabled={applyDisabled}
            isLoading={isApplying}
            label={applyLabel}
            onClick={onApply}
            variant="tonal"
          />
          <AppButton disabled={closeDisabled} label={closeLabel} onClick={onClose} variant="secondary" />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export function AppWidgetFieldGrid({
  columns = 1,
  className,
  children,
  ...rest
}: AppWidgetFieldGridProps) {
  return (
    <Box
      className={className}
      sx={{
        display: "grid",
        gap: 1.5,
        ...columnsSx[columns],
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
