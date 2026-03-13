import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/ui/cn";

export function ShimmerBox({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shimmer-box rounded-md", className)} {...rest} />;
}
