import type { BuildingsRepository } from "@/modules/buildings/application/ports";

export function createListBuildingsUseCase(repository: BuildingsRepository) {
  return async function listBuildings() {
    return repository.list();
  };
}
