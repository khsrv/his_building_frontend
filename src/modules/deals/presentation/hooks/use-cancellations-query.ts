import { useQuery } from "@tanstack/react-query";
import { fetchCancellations } from "@/modules/deals/infrastructure/refund-repository";

interface CancellationsParams {
  status?: string | undefined;
  propertyId?: string | undefined;
}

export function useCancellationsQuery(params?: CancellationsParams) {
  return useQuery({
    queryKey: ["deal-cancellations", params?.status ?? "all", params?.propertyId ?? "all"],
    queryFn: () => fetchCancellations(params?.status, params?.propertyId),
  });
}
