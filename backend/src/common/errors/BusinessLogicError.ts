import { AppError } from './AppError';

/**
 * Business Logic Error (400)
 * Used when business rules are violated (e.g., user already has active subscription)
 */
export class BusinessLogicError extends AppError {
  constructor(message: string = 'Business logic error') {
    super(message, 400);
    Object.setPrototypeOf(this, BusinessLogicError.prototype);
  }
}
