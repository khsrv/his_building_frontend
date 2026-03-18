import type { LandRepository } from "@/modules/land/application/ports";

export function createListLandUseCase(repository: LandRepository) {
  return async function listLand() {
    return repository.list();
  };
}
