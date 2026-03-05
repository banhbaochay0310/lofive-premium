import { isValidEmail, isValidPassword } from '../../common/utils/validators';

interface ValidationResult {
  valid: boolean;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Validate update role request
 */
export const validateUpdateRole = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  if (!data.role) {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!['USER', 'ADMIN'].includes(data.role)) {
    errors.push({ field: 'role', message: 'Role must be USER or ADMIN' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate update profile request
 */
export const validateUpdateProfile = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  // At least one field must be provided
  if (!data.email && data.name === undefined) {
    errors.push({ field: 'general', message: 'At least one field (name or email) is required' });
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    } else if (data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    } else if (data.name.trim().length > 50) {
      errors.push({ field: 'name', message: 'Name must be at most 50 characters' });
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate change password request
 */
export const validateChangePassword = (data: any): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  if (!data.currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  if (!data.newPassword) {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  } else if (!isValidPassword(data.newPassword)) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 8 characters' });
  }

  if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
    errors.push({ field: 'newPassword', message: 'New password must be different from current password' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};
