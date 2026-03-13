export class TemplateDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateDomainError";
  }
}
