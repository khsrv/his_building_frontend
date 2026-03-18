export class ClientsDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientsDomainError";
  }
}
