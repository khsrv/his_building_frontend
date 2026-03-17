import { useMemo } from "react";
import { cn } from "@/shared/lib/ui/cn";

type CurrencyDisplaySize = "sm" | "md" | "lg" | "xl";

interface AppCurrencyDisplayProps {
  amount: number;
  currency: string;
  locale?: string;
  size?: CurrencyDisplaySize;
  showSign?: boolean;
  secondaryAmount?: number;
  secondaryCurrency?: string;
  className?: string;
}

const sizeClasses: Record<CurrencyDisplaySize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg font-semibold",
  xl: "text-2xl font-bold",
};

export function AppCurrencyDisplay({
  amount,
  currency,
  locale = "ru-RU",
  size = "md",
  showSign = false,
  secondaryAmount,
  secondaryCurrency,
  className,
}: AppCurrencyDisplayProps) {
  const formatted = useMemo(() => {
    const abs = Math.abs(amount);
    const str = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(abs);

    if (showSign && amount !== 0) {
      return amount > 0 ? `+${str}` : `−${str}`;
    }
    return amount < 0 ? `−${str}` : str;
  }, [amount, locale, showSign]);

  const secondary = useMemo(() => {
    if (secondaryAmount === undefined || !secondaryCurrency) {
      return null;
    }
    const str = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Math.abs(secondaryAmount));
    return `≈ ${str} ${secondaryCurrency}`;
  }, [locale, secondaryAmount, secondaryCurrency]);

  const colorClass =
    showSign && amount !== 0
      ? amount > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400"
      : "text-foreground";

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className={cn(sizeClasses[size], colorClass)}>
        {formatted}{" "}
        <span className="text-muted-foreground text-[0.8em] font-normal">{currency}</span>
      </span>
      {secondary ? (
        <span className="text-muted-foreground text-xs">{secondary}</span>
      ) : null}
    </span>
  );
}
