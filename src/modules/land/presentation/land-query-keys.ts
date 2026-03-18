export const landKeys = {
  all: ["land"] as const,

  // Land plots
  plots: () => ["land", "plots"] as const,
  plotsList: (propertyId?: string) => ["land", "plots", "list", propertyId] as const,
  plotDetail: (id: string) => ["land", "plots", "detail", id] as const,

  // Land owners
  owners: (plotId: string) => ["land", "owners", plotId] as const,
};
