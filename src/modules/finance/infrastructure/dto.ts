export interface FinanceItemDto {
  id: string;
  title: string;
  created_at: string;
}

export interface FinanceListResponseDto {
  data: FinanceItemDto[];
}
