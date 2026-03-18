export interface BuildingsItemDto {
  id: string;
  title: string;
  created_at: string;
}

export interface BuildingsListResponseDto {
  data: BuildingsItemDto[];
}
