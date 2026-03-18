import type { BuildingsItem } from "@/modules/buildings/domain/entities";

export interface BuildingsRepository {
  list(): Promise<BuildingsItem[]>;
}
