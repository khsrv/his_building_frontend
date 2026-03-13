import type { TemplateRepository } from "@/modules/_template/application/ports";

export function createListTemplateItemsUseCase(repository: TemplateRepository) {
  return async function listTemplateItems() {
    return repository.list();
  };
}
