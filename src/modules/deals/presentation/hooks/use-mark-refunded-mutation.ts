import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markRefunded } from "@/modules/deals/infrastructure/refund-repository";
import type { MarkRefundedInput } from "@/modules/deals/domain/refund";

export function useMarkRefundedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cancellationId, input }: { cancellationId: string; input: MarkRefundedInput }) =>
      markRefunded(cancellationId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deal-cancellations"] });
    },
  });
}
