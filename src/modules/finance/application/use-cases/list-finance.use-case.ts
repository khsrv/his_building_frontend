import type { FinanceRepository } from "@/modules/finance/application/ports";

export function createListFinanceUseCase(repository: FinanceRepository) {
  return async function listFinance() {
    return repository.list();
  };
}
