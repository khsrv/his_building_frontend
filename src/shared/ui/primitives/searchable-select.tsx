"use client";

import { useCallback, useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { cn } from "@/shared/lib/ui/cn";
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
  if (option.label.toLowerCase().includes(q)) return true;
  if (option.secondary?.toLowerCase().includes(q)) return true;
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
    if (!deferredSearch.trim()) return options;
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
        onClose={() => { setOpen(false); setSearch(""); }}
        open={open}
      >
        <DialogTitle className="text-foreground">
          {dialogTitle ?? t("searchSelect.title")}
        </DialogTitle>
        <DialogContent>
          <div className="mb-3">
            <AppInput
              onChangeValue={setSearch}
              placeholder={searchPlaceholder ?? t("searchSelect.searchPlaceholder")}
              value={search}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {emptyLabel ?? t("searchSelect.empty")}
            </p>
          ) : (
            <div className="max-h-[360px] overflow-auto">
              {filtered.map((option) => (
                <button
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    option.disabled
                      ? "cursor-default opacity-40"
                      : "cursor-pointer hover:bg-muted",
                    option.id === value && "bg-primary/10 text-primary",
                  )}
                  disabled={option.disabled}
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  type="button"
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <div>
                      <span className="font-medium text-foreground">{option.label}</span>
                      {option.secondary ? (
                        <span className="ml-2 text-xs text-muted-foreground">{option.secondary}</span>
                      ) : null}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
