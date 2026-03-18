import type { Deal } from "@/modules/deals/domain/deal";

export interface DealsRepository {
  list(): Promise<Deal[]>;
}
