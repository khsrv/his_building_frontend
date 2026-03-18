import type { PaymentsRepository } from "@/modules/payments/application/ports";

export function createListPaymentsUseCase(repository: PaymentsRepository) {
  return async function listPayments() {
    return repository.list();
  };
}
