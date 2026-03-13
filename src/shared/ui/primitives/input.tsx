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
import { InputAdornment, TextField } from "@mui/material";

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
    <TextField
      className={className}
      error={Boolean(errorText)}
      fullWidth
      helperText={errorText ?? hint}
      id={inputId}
      label={label}
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined,
          endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined,
        },
      }}
      size="small"
      value={currentValue}
      variant="outlined"
      {...(rest as Record<string, unknown>)}
    />
  );
}
