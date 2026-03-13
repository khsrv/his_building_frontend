"use client";

import { useEffect, useState } from "react";
import { breakpoints, type BreakpointName } from "@/shared/constants/breakpoints";

const orderedBreakpoints: Array<[BreakpointName, number]> = [
  ["2xl", breakpoints["2xl"]],
  ["xl", breakpoints.xl],
  ["lg", breakpoints.lg],
  ["md", breakpoints.md],
  ["sm", breakpoints.sm],
  ["xs", breakpoints.xs],
];

function detectBreakpoint(width: number): BreakpointName {
  const found = orderedBreakpoints.find(([, minWidth]) => width >= minWidth);
  return found?.[0] ?? "xs";
}

export function useBreakpoint() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => {
      setWidth(window.innerWidth);
    };

    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  const breakpoint = detectBreakpoint(width);

  return {
    width,
    breakpoint,
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
  };
}
