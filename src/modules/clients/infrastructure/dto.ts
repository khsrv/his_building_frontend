export interface ClientsItemDto {
  id: string;
  title: string;
  created_at: string;
}

export interface ClientsListResponseDto {
  data: ClientsItemDto[];
}
