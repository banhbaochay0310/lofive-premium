interface ValidationResult {
  valid: boolean;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Validate create payment request data
 */
export const validateCreatePayment = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  // Validate subscriptionId
  if (!data.subscriptionId) {
    errors.push({ field: 'subscriptionId', message: 'Subscription ID is required' });
  } else if (typeof data.subscriptionId !== 'string') {
    errors.push({ field: 'subscriptionId', message: 'Subscription ID must be a string' });
  }

  // Validate amount
  if (data.amount === undefined || data.amount === null) {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else {
    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be a positive number' });
    }
  }

  // Validate provider
  if (!data.provider) {
    errors.push({ field: 'provider', message: 'Payment provider is required' });
  } else if (typeof data.provider !== 'string') {
    errors.push({ field: 'provider', message: 'Provider must be a string' });
  } else if (data.provider.length < 2 || data.provider.length > 50) {
    errors.push({ field: 'provider', message: 'Provider must be between 2 and 50 characters' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate payment webhook callback data
 */
export const validatePaymentWebhook = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  const validStatuses = ['COMPLETED', 'FAILED'];

  // Validate status
  if (!data.status) {
    errors.push({ field: 'status', message: 'Payment status is required' });
  } else if (!validStatuses.includes(data.status)) {
    errors.push({ 
      field: 'status', 
      message: `Payment status must be one of: ${validStatuses.join(', ')}` 
    });
  }

  // Validate transactionId (optional but if provided, should be valid)
  if (data.transactionId !== undefined && data.transactionId !== null) {
    if (typeof data.transactionId !== 'string' || data.transactionId.trim().length === 0) {
      errors.push({ field: 'transactionId', message: 'Transaction ID must be a non-empty string' });
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate payment ID parameter
 */
export const validatePaymentId = (id: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  if (!id || typeof id !== 'string') {
    errors.push({ field: 'id', message: 'Valid payment ID is required' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate query parameters for listing payments
 */
export const validatePaymentQuery = (query: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  const validStatuses = ['PENDING', 'COMPLETED', 'FAILED'];

  // Validate status filter (optional)
  if (query.status && !validStatuses.includes(query.status)) {
    errors.push({ 
      field: 'status', 
      message: `Status must be one of: ${validStatuses.join(', ')}` 
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};
