export class HandledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HandledError";
  }
}
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
