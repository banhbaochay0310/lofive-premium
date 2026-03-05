interface ValidationResult {
  valid: boolean;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Validate create plan request data
 */
export const validateCreatePlan = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  // Validate name
  if (!data.name) {
    errors.push({ field: 'name', message: 'Plan name is required' });
  } else if (typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Plan name must be a string' });
  } else if (data.name.length < 3) {
    errors.push({ field: 'name', message: 'Plan name must be at least 3 characters' });
  } else if (data.name.length > 100) {
    errors.push({ field: 'name', message: 'Plan name must not exceed 100 characters' });
  }

  // Validate price
  if (data.price === undefined || data.price === null) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else if (typeof data.price !== 'number') {
    errors.push({ field: 'price', message: 'Price must be a number' });
  } else if (data.price <= 0) {
    errors.push({ field: 'price', message: 'Price must be greater than 0' });
  }

  // Validate durationDays
  if (data.durationDays === undefined || data.durationDays === null) {
    errors.push({ field: 'durationDays', message: 'Duration is required' });
  } else if (typeof data.durationDays !== 'number') {
    errors.push({ field: 'durationDays', message: 'Duration must be a number' });
  } else if (!Number.isInteger(data.durationDays)) {
    errors.push({ field: 'durationDays', message: 'Duration must be an integer' });
  } else if (data.durationDays <= 0) {
    errors.push({ field: 'durationDays', message: 'Duration must be greater than 0' });
  }

  // Validate isActive (optional)
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive must be a boolean' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate update plan request data
 */
export const validateUpdatePlan = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  // At least one field must be provided
  if (!data.name && !data.price && !data.durationDays && data.isActive === undefined) {
    errors.push({ field: 'general', message: 'At least one field must be provided for update' });
    return {
      valid: false,
      errors,
    };
  }

  // Validate name (if provided)
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push({ field: 'name', message: 'Plan name must be a string' });
    } else if (data.name.length < 3) {
      errors.push({ field: 'name', message: 'Plan name must be at least 3 characters' });
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: 'Plan name must not exceed 100 characters' });
    }
  }

  // Validate price (if provided)
  if (data.price !== undefined) {
    if (typeof data.price !== 'number') {
      errors.push({ field: 'price', message: 'Price must be a number' });
    } else if (data.price <= 0) {
      errors.push({ field: 'price', message: 'Price must be greater than 0' });
    }
  }

  // Validate durationDays (if provided)
  if (data.durationDays !== undefined) {
    if (typeof data.durationDays !== 'number') {
      errors.push({ field: 'durationDays', message: 'Duration must be a number' });
    } else if (!Number.isInteger(data.durationDays)) {
      errors.push({ field: 'durationDays', message: 'Duration must be an integer' });
    } else if (data.durationDays <= 0) {
      errors.push({ field: 'durationDays', message: 'Duration must be greater than 0' });
    }
  }

  // Validate isActive (if provided)
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive must be a boolean' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate plan ID parameter
 */
export const validatePlanId = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  if (!data.id) {
    errors.push({ field: 'id', message: 'Plan ID is required' });
  } else if (typeof data.id !== 'string') {
    errors.push({ field: 'id', message: 'Plan ID must be a string' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};
