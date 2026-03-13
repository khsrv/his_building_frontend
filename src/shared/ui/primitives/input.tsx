"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/shared/lib/ui/cn";

interface AppInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "prefix"> {
  label?: string;
  hint?: string;
  errorText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  value?: string;
  defaultValue?: string;
  onChangeValue?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  searchMode?: boolean;
  minSearchLength?: number;
  searchDelayMs?: number;
}

export function AppInput({
  label,
  hint,
  errorText,
  prefix,
  suffix,
  value,
  defaultValue = "",
  onChange,
  onChangeValue,
  onDebouncedChange,
  searchMode = false,
  minSearchLength = 2,
  searchDelayMs = 500,
  className,
  id,
  ...rest
}: AppInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const debounceRef = useRef<number | null>(null);

  const currentValue = isControlled ? value : innerValue;

  useEffect(() => {
    if (!onDebouncedChange) {
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (searchMode) {
      if (currentValue.length === 0) {
        onDebouncedChange(currentValue);
        return;
      }

      if (currentValue.length < minSearchLength) {
        return;
      }
    }

    debounceRef.current = window.setTimeout(() => {
      onDebouncedChange(currentValue);
    }, searchDelayMs);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [currentValue, minSearchLength, onDebouncedChange, searchDelayMs, searchMode]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (!isControlled) {
      setInnerValue(nextValue);
    }

    onChangeValue?.(nextValue);
    onChange?.(event);
  };

  return (
    <label className="grid gap-1.5" htmlFor={inputId}>
      {label ? <span className="text-sm font-medium text-foreground">{label}</span> : null}

      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-3",
          "focus-within:ring-2 focus-within:ring-primary/30",
          errorText && "border-danger/80 focus-within:ring-danger/30",
        )}
      >
        {prefix ? <span className="text-muted-foreground">{prefix}</span> : null}

        <input
          className={cn(
            "h-full w-full bg-transparent text-sm text-foreground outline-none",
            "placeholder:text-muted-foreground",
            className,
          )}
          id={inputId}
          onChange={handleChange}
          value={currentValue}
          {...rest}
        />

        {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
      </div>

      {errorText ? <span className="text-xs text-danger">{errorText}</span> : null}
      {hint && !errorText ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
