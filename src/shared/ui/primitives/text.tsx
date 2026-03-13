import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { formatAmount } from "@/shared/lib/format/amount-formatter";
import { cn } from "@/shared/lib/ui/cn";

export function AppTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("text-2xl font-semibold leading-tight", className)} {...rest} />;
}

export function AppSubtitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-medium text-muted-foreground", className)} {...rest} />;
}

export function AppBody({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-foreground", className)} {...rest} />;
}

export function AppCaption({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-xs text-muted-foreground", className)} {...rest} />;
}

export function AppLabel({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-sm font-medium", className)} {...rest} />;
}

interface AppLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export function AppLink({ className, href, children, ...rest }: AppLinkProps) {
  return (
    <a className={cn("text-sm text-primary underline underline-offset-4", className)} href={href} {...rest}>
      {children}
    </a>
  );
}

interface AppNumberProps {
  value: number;
  locale?: string;
  currencyCode?: string;
}

export function AppNumber({ value, locale, currencyCode = "USD" }: AppNumberProps) {
  return <span>{formatAmount(value, currencyCode, locale)}</span>;
}
