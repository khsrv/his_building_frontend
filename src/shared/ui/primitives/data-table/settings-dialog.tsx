import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { AppButton } from "@/shared/ui/primitives/button";
import type { TranslationKey } from "@/shared/i18n/types";
import type { AppDataTableColumn, ColumnRuntimeState } from "./types";
import { ArrowUpIcon, ArrowDownIcon } from "./icons";

interface SettingsDialogProps<TData> {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  columnsById: Map<string, AppDataTableColumn<TData>>;
  settingsDraft: Record<string, ColumnRuntimeState>;
  settingsDraftOrder: readonly string[];
  onToggleVisible: (columnId: string, next: boolean) => void;
  onTogglePinned: (columnId: string, next: boolean) => void;
  onMoveColumn: (columnId: string, direction: "up" | "down") => void;
  t: (key: TranslationKey) => string;
}

export function SettingsDialog<TData>({
  open,
  onClose,
  onApply,
  onReset,
  columnsById,
  settingsDraft,
  settingsDraftOrder,
  onToggleVisible,
  onTogglePinned,
  onMoveColumn,
  t,
}: SettingsDialogProps<TData>) {
  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open={open}>
      <DialogTitle>{t("table.settingsTitle")}</DialogTitle>
      <DialogContent>
        <Stack divider={<Divider flexItem />} spacing={1}>
          {settingsDraftOrder.map((columnId, index) => {
            const column = columnsById.get(columnId);
            if (!column) {
              return null;
            }

            const state = settingsDraft[column.id] ?? { visible: true, pinned: false };
            return (
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                key={column.id}
                py={0.5}
              >
                <Typography variant="body2">{column.header}</Typography>
                <Stack alignItems="center" direction="row" gap={1.5}>
                  <Stack direction="row" gap={0.25}>
                    <IconButton
                      aria-label={`Move ${column.header} up`}
                      disabled={index === 0}
                      onClick={() => onMoveColumn(column.id, "up")}
                      size="small"
                      sx={{ border: 1, borderColor: "divider" }}
                    >
                      <ArrowUpIcon />
                    </IconButton>
                    <IconButton
                      aria-label={`Move ${column.header} down`}
                      disabled={index === settingsDraftOrder.length - 1}
                      onClick={() => onMoveColumn(column.id, "down")}
                      size="small"
                      sx={{ border: 1, borderColor: "divider" }}
                    >
                      <ArrowDownIcon />
                    </IconButton>
                  </Stack>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={state.visible}
                        disabled={column.canHide === false}
                        onChange={(_event, next) => onToggleVisible(column.id, next)}
                      />
                    }
                    label={t("table.columnVisible")}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={state.pinned}
                        disabled={column.canPin === false}
                        onChange={(_event, next) => onTogglePinned(column.id, next)}
                      />
                    }
                    label={t("table.columnPinned")}
                  />
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton label={t("table.reset")} onClick={onReset} variant="secondary" />
        <AppButton label={t("table.save")} onClick={onApply} variant="primary" />
      </DialogActions>
    </Dialog>
  );
}
