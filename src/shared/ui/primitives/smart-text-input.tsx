"use client";

import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";

export interface SmartTextOption {
  value: string;
  label: string;
  keywords?: readonly string[];
}

export type SmartTextInputMode = "text" | "single" | "select" | "multi";

type SmartTextInputValue = string | readonly string[];

interface AppSmartTextInputProps {
  mode?: SmartTextInputMode;
  label?: string;
  placeholder?: string;
  hint?: string;
  errorText?: string;
  required?: boolean;
  prefix?: ReactNode;
  options?: readonly SmartTextOption[];
  value?: SmartTextInputValue;
  defaultValue?: SmartTextInputValue;
  onChangeValue?: (value: string | string[]) => void;
  allowCreate?: boolean;
  onCreateOption?: (query: string) => SmartTextOption | void;
  disabled?: boolean;
  className?: string;
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6l6-6" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function normalizeStringValue(input: SmartTextInputValue | undefined, mode: SmartTextInputMode) {
  if (mode === "multi") {
    return "";
  }

  if (typeof input === "string") {
    return input;
  }

  if (Array.isArray(input)) {
    return input[0] ?? "";
  }

  return "";
}

function normalizeArrayValue(input: SmartTextInputValue | undefined, mode: SmartTextInputMode) {
  if (mode !== "multi") {
    return [] as string[];
  }

  if (Array.isArray(input)) {
    return [...input];
  }

  if (typeof input === "string" && input.length > 0) {
    return [input];
  }

  return [] as string[];
}

function isSameText(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function findOptionByValue(options: readonly SmartTextOption[], value: string) {
  return options.find((option) => option.value === value);
}

function getOptionLabel(options: readonly SmartTextOption[], value: string) {
  return findOptionByValue(options, value)?.label ?? value;
}

export function AppSmartTextInput({
  mode = "text",
  label,
  placeholder,
  hint,
  errorText,
  required = false,
  prefix,
  options = [],
  value,
  defaultValue,
  onChangeValue,
  allowCreate = false,
  onCreateOption,
  disabled = false,
  className,
}: AppSmartTextInputProps) {
  const { t } = useI18n();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isControlled = value !== undefined;
  const supportsDropdown = mode !== "text";
  const isMulti = mode === "multi";
  const isSelectOnly = mode === "select";

  const [internalSingle, setInternalSingle] = useState<string>(() =>
    normalizeStringValue(defaultValue, mode),
  );
  const [internalMulti, setInternalMulti] = useState<string[]>(() =>
    normalizeArrayValue(defaultValue, mode),
  );
  const [createdOptions, setCreatedOptions] = useState<SmartTextOption[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const allOptions = useMemo(() => {
    const combined = [...options, ...createdOptions];
    const seen = new Set<string>();

    return combined.filter((option) => {
      if (seen.has(option.value)) {
        return false;
      }

      seen.add(option.value);
      return true;
    });
  }, [createdOptions, options]);

  const selectedSingle = isControlled
    ? normalizeStringValue(value, mode)
    : internalSingle;
  const selectedMulti = isControlled ? normalizeArrayValue(value, mode) : internalMulti;

  const selectedSet = useMemo(() => new Set(selectedMulti), [selectedMulti]);

  const filteredOptions = useMemo(() => {
    if (!supportsDropdown) {
      return [] as SmartTextOption[];
    }

    const search = query.trim().toLowerCase();

    return allOptions.filter((option) => {
      if (isMulti && selectedSet.has(option.value)) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchable = [option.label, option.value, ...(option.keywords ?? [])]
        .join(" ")
        .toLowerCase();

      return searchable.includes(search);
    });
  }, [allOptions, isMulti, query, selectedSet, supportsDropdown]);

  const canCreateOption = useMemo(() => {
    if (!supportsDropdown || !allowCreate || isSelectOnly) {
      return false;
    }

    const normalized = query.trim();
    if (!normalized) {
      return false;
    }

    return !allOptions.some((option) => {
      return isSameText(option.label, normalized) || isSameText(option.value, normalized);
    });
  }, [allOptions, allowCreate, isSelectOnly, query, supportsDropdown]);

  const hasValue = isMulti
    ? selectedMulti.length > 0
    : selectedSingle.trim().length > 0;

  const selectedSingleLabel = getOptionLabel(allOptions, selectedSingle);

  const visibleInputValue = (() => {
    if (mode === "text") {
      return selectedSingle;
    }

    if (mode === "multi") {
      return query;
    }

    if (isOpen) {
      return query;
    }

    if (!selectedSingle) {
      return "";
    }

    return selectedSingleLabel;
  })();

  const closeDropdown = () => {
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  const emitValue = (nextValue: string | string[]) => {
    onChangeValue?.(nextValue);
  };

  const updateSingle = (next: string) => {
    if (!isControlled) {
      setInternalSingle(next);
    }
    emitValue(next);
  };

  const updateMulti = (next: string[]) => {
    if (!isControlled) {
      setInternalMulti(next);
    }
    emitValue(next);
  };

  const toggleOpen = () => {
    if (!supportsDropdown || disabled) {
      return;
    }

    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    setHighlightedIndex(0);
    if (!nextOpen) {
      setQuery("");
    } else {
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const selectOption = (option: SmartTextOption) => {
    if (mode === "multi") {
      if (!selectedSet.has(option.value)) {
        updateMulti([...selectedMulti, option.value]);
      }
      setQuery("");
      setHighlightedIndex(0);
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return;
    }

    updateSingle(option.value);
    setQuery("");
    closeDropdown();
  };

  const clearValue = () => {
    if (mode === "multi") {
      updateMulti([]);
    } else {
      updateSingle("");
    }

    setQuery("");
    setHighlightedIndex(0);
  };

  const createOption = () => {
    const normalized = query.trim();

    if (!normalized || !canCreateOption) {
      return;
    }

    const created = onCreateOption?.(normalized) ?? {
      value: normalized,
      label: normalized,
    };

    const nextOption: SmartTextOption = {
      value: created.value || normalized,
      label: created.label || normalized,
    };

    setCreatedOptions((current) => [...current, nextOption]);

    if (mode === "multi") {
      updateMulti([...selectedMulti, nextOption.value]);
      setQuery("");
      setHighlightedIndex(0);
      return;
    }

    updateSingle(nextOption.value);
    setQuery("");
    closeDropdown();
  };

  const handleContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!supportsDropdown) {
      return;
    }

    const nextFocused = event.relatedTarget as Node | null;
    if (nextFocused && rootRef.current?.contains(nextFocused)) {
      return;
    }

    if (mode === "single" && query.trim().length > 0 && !isSelectOnly) {
      updateSingle(query.trim());
    }

    setQuery("");
    closeDropdown();
  };

  const handleInputChange = (nextValue: string) => {
    if (mode === "text") {
      updateSingle(nextValue);
      return;
    }

    if (mode === "single" && !isSelectOnly) {
      updateSingle(nextValue);
    }

    setQuery(nextValue);
    if (!isOpen) {
      setIsOpen(true);
    }
    setHighlightedIndex(0);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!supportsDropdown) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex((current) => {
        if (filteredOptions.length === 0) {
          return 0;
        }
        return Math.min(current + 1, filteredOptions.length - 1);
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setQuery("");
      closeDropdown();
      return;
    }

    if (event.key === "Backspace" && isMulti && query.length === 0 && selectedMulti.length > 0) {
      updateMulti(selectedMulti.slice(0, -1));
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    const activeOption = filteredOptions[highlightedIndex];
    if (activeOption) {
      selectOption(activeOption);
      return;
    }

    if (canCreateOption) {
      createOption();
      return;
    }

    if (mode === "single" && query.trim().length > 0 && !isSelectOnly) {
      updateSingle(query.trim());
      setQuery("");
      closeDropdown();
    }
  };

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label ? (
        <label className="text-xs font-medium text-muted-foreground" htmlFor={inputId}>
          {label}
          {required ? <span className="pl-1">*</span> : null}
        </label>
      ) : null}

      <div
        className={cn("relative")}
        onBlur={handleContainerBlur}
        ref={rootRef}
      >
        <div
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-foreground",
            "focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20",
            errorText && "border-danger/80 focus-within:ring-danger/30",
            disabled && "bg-muted/40 opacity-60",
          )}
        >
          {prefix ? <span className="text-muted-foreground">{prefix}</span> : null}

          {mode === "multi" ? (
            <div className="flex min-h-9 flex-1 flex-wrap items-center gap-2 py-1">
              {selectedMulti.map((valueItem) => {
                const itemLabel = getOptionLabel(allOptions, valueItem);
                return (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-sm text-foreground"
                    key={valueItem}
                  >
                    <span>{itemLabel}</span>
                    <button
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/25 text-xs text-card hover:bg-muted-foreground/40"
                      onClick={() => {
                        updateMulti(selectedMulti.filter((item) => item !== valueItem));
                      }}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                );
              })}

              <input
                className="h-9 min-w-[110px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                disabled={disabled}
                id={inputId}
                onChange={(event) => handleInputChange(event.target.value)}
                onFocus={() => {
                  if (supportsDropdown) {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={selectedMulti.length === 0 ? placeholder : ""}
                ref={inputRef}
                value={visibleInputValue}
              />
            </div>
          ) : (
            <input
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              disabled={disabled}
              id={inputId}
              onChange={(event) => handleInputChange(event.target.value)}
              onFocus={() => {
                if (supportsDropdown) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={placeholder}
              ref={inputRef}
              value={visibleInputValue}
            />
          )}

          {hasValue ? (
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={clearValue}
              type="button"
            >
              <ClearIcon />
            </button>
          ) : null}

          {supportsDropdown ? (
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={toggleOpen}
              type="button"
            >
              <ChevronDownIcon isOpen={isOpen} />
            </button>
          ) : null}
        </div>

        {supportsDropdown && isOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {canCreateOption ? (
              <div className="border-b border-border p-2.5">
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  onClick={createOption}
                  type="button"
                >
                  <PlusIcon />
                  <span>{t("smartInput.addValue")}</span>
                </button>
              </div>
            ) : null}

            <div className="max-h-64 overflow-auto p-2">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">{t("smartInput.noOptions")}</p>
              ) : (
                filteredOptions.map((option, index) => {
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      className={cn(
                        "w-full min-h-10 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        isHighlighted ? "bg-primary/20 text-primary" : "text-foreground hover:bg-muted",
                      )}
                      key={option.value}
                      onClick={() => selectOption(option)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </div>

      {errorText ? <span className="text-xs text-danger">{errorText}</span> : null}
      {hint && !errorText ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
