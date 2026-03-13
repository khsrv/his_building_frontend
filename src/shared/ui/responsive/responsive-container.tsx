import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/ui/cn";

type ContainerWidth = "narrow" | "default" | "wide" | "full";

interface ResponsiveContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
}

const widthClass: Record<ContainerWidth, string> = {
  narrow: "mx-auto w-full max-w-3xl px-4 sm:px-6",
  default: "mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8",
  wide: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
  full: "w-full px-4 sm:px-6 lg:px-8",
};

export function ResponsiveContainer({ width = "default", className, ...rest }: ResponsiveContainerProps) {
  return <div className={cn(widthClass[width], className)} {...rest} />;
}
