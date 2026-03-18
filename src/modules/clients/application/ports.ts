import type { ClientsItem } from "@/modules/clients/domain/entities";

export interface ClientsRepository {
  list(): Promise<ClientsItem[]>;
}
