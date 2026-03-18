export interface LandItemDto {
  id: string;
  title: string;
  created_at: string;
}

export interface LandListResponseDto {
  data: LandItemDto[];
}
