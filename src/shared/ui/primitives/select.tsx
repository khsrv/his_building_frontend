import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/ui/cn";

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

interface AppSelectProps<T extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  hint?: string;
  errorText?: string;
  options: readonly SelectOption<T>[];
}

export function AppSelect<T extends string = string>({
  label,
  hint,
  errorText,
  options,
  className,
  ...rest
}: AppSelectProps<T>) {
  return (
    <label className="grid gap-1.5">
      {label ? <span className="text-sm font-medium text-foreground">{label}</span> : null}

      <select
        className={cn(
          "h-11 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none",
          "focus:ring-2 focus:ring-primary/30",
          errorText && "border-danger focus:ring-danger/30",
          className,
        )}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {errorText ? <span className="text-xs text-danger">{errorText}</span> : null}
      {hint && !errorText ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
