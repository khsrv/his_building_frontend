// Re-export all deal domain types from the canonical file
export type {
  Deal,
  DealStatus,
  DealPaymentType,
  ScheduleItem,
  ScheduleItemStatus,
  CreateDealInput,
  DealsListParams,
  ReceivePaymentInput,
} from "@/modules/deals/domain/deal";
