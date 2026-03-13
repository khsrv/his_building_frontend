"use client";

import type { ReactNode } from "react";
import { Box, Divider, Drawer, Stack, Typography } from "@mui/material";
import { AppButton } from "@/shared/ui/primitives/button";

interface AppDrawerFormProps {
  open: boolean;
  title: string;
  subtitle?: string;
  saveLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
  saveDisabled?: boolean;
  widthClassName?: string;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
}

export function AppDrawerForm({
  open,
  title,
  subtitle,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  isSaving = false,
  saveDisabled = false,
  widthClassName = "w-[min(520px,100vw)]",
  onClose,
  onSave,
  children,
}: AppDrawerFormProps) {
  return (
    <Drawer anchor="right" onClose={onClose} open={open}>
      <Box className={widthClassName} sx={{ display: "flex", height: "100%", flexDirection: "column" }}>
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="h4">{title}</Typography>
          {subtitle ? (
            <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <Divider />

        <Box sx={{ minHeight: 0, flex: 1, overflowY: "auto", px: 2, py: 2 }}>{children}</Box>

        <Divider />

        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ px: 2, py: 1.5 }}>
          <AppButton label={cancelLabel} onClick={onClose} variant="secondary" />
          <AppButton disabled={saveDisabled} isLoading={isSaving} label={saveLabel} onClick={onSave} variant="primary" />
        </Stack>
      </Box>
    </Drawer>
  );
}
