"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/shared/constants/routes";

export default function ExchangeRatesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(routes.financeCurrencies);
  }, [router]);
  return null;
}
