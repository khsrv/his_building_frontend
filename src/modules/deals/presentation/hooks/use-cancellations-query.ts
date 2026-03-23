import { useQuery } from "@tanstack/react-query";
import { fetchCancellations } from "@/modules/deals/infrastructure/refund-repository";

export function useCancellationsQuery(status?: string | undefined) {
  return useQuery({
    queryKey: ["deal-cancellations", status ?? "all"],
    queryFn: () => fetchCancellations(status),
  });
}
