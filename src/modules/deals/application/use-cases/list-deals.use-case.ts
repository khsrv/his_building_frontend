import type { DealsRepository } from "@/modules/deals/application/ports";

export function createListDealsUseCase(repository: DealsRepository) {
  return async function listDeals() {
    return repository.list();
  };
}
