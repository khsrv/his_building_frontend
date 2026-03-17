"use client";

import { useCallback, useDeferredValue, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { AppInput } from "@/shared/ui/primitives/input";
import { AppButton } from "@/shared/ui/primitives/button";
import { useI18n } from "@/shared/providers/locale-provider";

export interface AppSearchableSelectOption {
  id: string;
  label: string;
  secondary?: string;
  disabled?: boolean;
}

interface AppSearchableSelectProps<T extends AppSearchableSelectOption> {
  options: readonly T[];
  value: string | null;
  onChange: (id: string, option: T) => void;
  triggerLabel?: string;
  dialogTitle?: string;
  searchPlaceholder?: string;
  renderOption?: (option: T) => ReactNode;
  filterFn?: (option: T, query: string) => boolean;
  loading?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

function defaultFilter(option: AppSearchableSelectOption, query: string): boolean {
  const q = query.toLowerCase();
  if (option.label.toLowerCase().includes(q)) {
    return true;
  }
  if (option.secondary?.toLowerCase().includes(q)) {
    return true;
  }
  return option.id.toLowerCase().includes(q);
}

export function AppSearchableSelect<T extends AppSearchableSelectOption>({
  options,
  value,
  onChange,
  triggerLabel,
  dialogTitle,
  searchPlaceholder,
  renderOption,
  filterFn,
  loading = false,
  emptyLabel,
  disabled = false,
  size = "sm",
}: AppSearchableSelectProps<T>) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const selectedOption = useMemo(
    () => options.find((o) => o.id === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!deferredSearch.trim()) {
      return options;
    }
    const filter = filterFn ?? defaultFilter;
    return options.filter((o) => filter(o, deferredSearch));
  }, [deferredSearch, filterFn, options]);

  const handleSelect = useCallback(
    (option: T) => {
      onChange(option.id, option);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  return (
    <>
      <AppButton
        disabled={disabled}
        label={selectedOption?.label ?? triggerLabel ?? t("searchSelect.select")}
        onClick={() => setOpen(true)}
        size={size}
        variant="outline"
      />

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => {
          setOpen(false);
          setSearch("");
        }}
        open={open}
      >
        <DialogTitle>{dialogTitle ?? t("searchSelect.title")}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 1.5 }}>
            <AppInput
              onChangeValue={setSearch}
              placeholder={searchPlaceholder ?? t("searchSelect.searchPlaceholder")}
              value={search}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : filtered.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }} variant="body2">
              {emptyLabel ?? t("searchSelect.empty")}
            </Typography>
          ) : (
            <List sx={{ maxHeight: 360, overflow: "auto" }}>
              {filtered.map((option) => (
                <ListItemButton
                  disabled={option.disabled}
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  selected={option.id === value}
                  sx={{ borderRadius: 1.25, mb: 0.25 }}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <ListItemText primary={option.label} secondary={option.secondary} />
                  )}
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
