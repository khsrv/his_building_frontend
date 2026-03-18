export const clientsQueryKeys = {
  all: ["clients"] as const,
  list: () => ["clients", "list"] as const,
};
