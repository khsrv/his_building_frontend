import type { FinanceItem } from "@/modules/finance/domain/entities";

export interface FinanceRepository {
  list(): Promise<FinanceItem[]>;
}
