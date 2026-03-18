import type { LandItem } from "@/modules/land/domain/entities";

export interface LandRepository {
  list(): Promise<LandItem[]>;
}
