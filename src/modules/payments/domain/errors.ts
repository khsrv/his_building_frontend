export class PaymentsDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentsDomainError";
  }
}
