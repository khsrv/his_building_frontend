import type { PaymentsItem } from "@/modules/payments/domain/entities";

export interface PaymentsRepository {
  list(): Promise<PaymentsItem[]>;
}
