export interface PaymentsItemDto {
  id: string;
  title: string;
  created_at: string;
}

export interface PaymentsListResponseDto {
  data: PaymentsItemDto[];
}
