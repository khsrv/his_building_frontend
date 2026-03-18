import type { DealsItem } from "@/modules/deals/domain/entities";

export interface DealsRepository {
  list(): Promise<DealsItem[]>;
}
