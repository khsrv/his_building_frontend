import { useQuery } from "@tanstack/react-query";
import { fetchClientPayments } from "@/modules/deals/infrastructure/repository";

export function useClientPaymentsQuery(clientId: string) {
  return useQuery({
    queryKey: ["payments", "client", clientId],
    queryFn: () => fetchClientPayments(clientId),
    enabled: Boolean(clientId),
  });
}
