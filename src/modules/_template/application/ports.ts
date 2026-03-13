import type { TemplateItem } from "@/modules/_template/domain/entities";

export interface TemplateRepository {
  list(): Promise<TemplateItem[]>;
}
