import { AppError } from './AppError';

/**
 * Validation Error (400 Bad Request)
 * Used when request data fails validation
 */
export class ValidationError extends AppError {
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(message: string = 'Validation failed', errors?: Array<{ field: string; message: string }>) {
    super(message, 400);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
