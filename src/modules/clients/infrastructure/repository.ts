import type { ClientsRepository } from "@/modules/clients/application/ports";
import { createListClientsUseCase } from "@/modules/clients/application/use-cases/list-clients.use-case";
import type { ClientsListResponseDto } from "@/modules/clients/infrastructure/dto";
import { mapClientsDtoToDomain } from "@/modules/clients/infrastructure/mappers";
import { httpRequest } from "@/shared/lib/http/http-client";

export class ApiClientsRepository implements ClientsRepository {
  async list() {
    const response = await httpRequest<ClientsListResponseDto>("/clients", { method: "GET" });
    return response.data.map(mapClientsDtoToDomain);
  }
}

const repository = new ApiClientsRepository();
export const listClients = createListClientsUseCase(repository);
