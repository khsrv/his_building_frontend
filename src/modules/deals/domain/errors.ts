export class DealsDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DealsDomainError";
  }
}
