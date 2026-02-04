export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: "fail" | "error";
  public readonly isOperational: boolean;
  public readonly originalError?: Error;

  constructor(message: string, statusCode = 500, originalError?: Error) {
    super(message);

    // Prototype chain (important for Error subclasses)
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = statusCode < 500;

    // keep original error for debugging
    this.originalError = originalError;

    // keep correct stack
    if (originalError?.stack) {
      this.stack = originalError.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
