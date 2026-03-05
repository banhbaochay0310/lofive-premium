interface ValidationResult {
  valid: boolean;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Validate create subscription request data
 */
export const validateCreateSubscription = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  // Validate planId
  if (!data.planId) {
    errors.push({ field: 'planId', message: 'Plan ID is required' });
  } else if (typeof data.planId !== 'string') {
    errors.push({ field: 'planId', message: 'Plan ID must be a string' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate update subscription status request data
 */
export const validateUpdateSubscriptionStatus = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  const validStatuses = ['PENDING', 'ACTIVE', 'CANCELED', 'FAILED'];

  // Validate status
  if (!data.status) {
    errors.push({ field: 'status', message: 'Status is required' });
  } else if (!validStatuses.includes(data.status)) {
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

/**
 * Validate toggle auto-renew request data
 */
export const validateToggleAutoRenew = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  if (data.autoRenew === undefined || data.autoRenew === null) {
    errors.push({ field: 'autoRenew', message: 'autoRenew is required' });
  } else if (typeof data.autoRenew !== 'boolean') {
    errors.push({ field: 'autoRenew', message: 'autoRenew must be a boolean' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate subscription ID parameter
 */
export const validateSubscriptionId = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  if (!data.id) {
    errors.push({ field: 'id', message: 'Subscription ID is required' });
  } else if (typeof data.id !== 'string') {
    errors.push({ field: 'id', message: 'Subscription ID must be a string' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};
