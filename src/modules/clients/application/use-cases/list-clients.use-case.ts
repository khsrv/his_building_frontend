import type { ClientsRepository } from "@/modules/clients/application/ports";

export function createListClientsUseCase(repository: ClientsRepository) {
  return async function listClients() {
    return repository.list();
  };
}
