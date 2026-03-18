export class LandDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LandDomainError";
  }
}
