export interface DealsItemDto {
  id: string;
  title: string;
  created_at: string;
}

export interface DealsListResponseDto {
  data: DealsItemDto[];
}
