import { AppError } from './AppError';

/**
 * Conflict Error (409)
 * Used when there's a conflict with existing data (e.g., duplicate email)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
