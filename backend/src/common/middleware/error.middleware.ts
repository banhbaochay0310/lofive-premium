import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate response
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any = undefined;

  // Handle operational errors (AppError instances)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    // Include validation errors if present
    if ('errors' in err) {
      errors = (err as any).errors;
    }
  } else {
    // Handle unexpected errors
    console.error('Unexpected Error:', err);
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal server error';
    } else {
      message = err.message || 'Internal server error';
    }
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.name || 'ERROR',
      message,
      ...(errors && { details: errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
