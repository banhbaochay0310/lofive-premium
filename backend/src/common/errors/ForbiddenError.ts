import { AppError } from './AppError';

/**
 * Forbidden Error (403)
 * Used when user is authenticated but doesn't have permission
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden - Insufficient permissions') {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
