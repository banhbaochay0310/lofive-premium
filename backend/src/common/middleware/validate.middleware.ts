import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';

/**
 * Generic validation middleware
 * Validates request data against a validation function
 */
export const validate = (validationFn: (data: any) => { valid: boolean; errors?: any }) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validationFn(req.body);

    if (!result.valid) {
      return next(new ValidationError('Validation failed', result.errors));
    }

    next();
  };
};
