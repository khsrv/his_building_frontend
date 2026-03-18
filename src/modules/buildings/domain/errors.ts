export class BuildingsDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuildingsDomainError";
  }
}
