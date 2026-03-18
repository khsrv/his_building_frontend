export interface BuildingsItemDto {
  id: string;
  name: string;
  status?: string;
  created_at: string;
}

export interface BuildingsListResponseDto {
  data: {
    items: BuildingsItemDto[];
    pagination?: unknown;
  } | BuildingsItemDto[];
}
