export interface TemplateItemDto {
  id: string;
  title: string;
  created_at: string;
}

export interface TemplateItemsResponseDto {
  data: TemplateItemDto[];
}
