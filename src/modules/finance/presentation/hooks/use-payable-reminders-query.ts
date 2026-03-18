"use client";

import { useQuery } from "@tanstack/react-query";
import { financeKeys } from "@/modules/finance/presentation/finance-query-keys";
import { fetchPayableReminders } from "@/modules/finance/infrastructure/finance-repository";
import type { PayableReminderListParams } from "@/modules/finance/domain/finance";

export function usePayableRemindersQuery(params?: PayableReminderListParams) {
  return useQuery({
    queryKey: financeKeys.payableReminderList(params),
    queryFn: () => fetchPayableReminders(params),
  });
}
