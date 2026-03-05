import { Router } from 'express';
import usersController from './users.controller';
import { authenticate, validate } from '../../common/middleware';
import { authorize } from '../../common/middleware/authorize.middleware';
import { validateUpdateRole, validateUpdateProfile, validateChangePassword } from './users.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =====================
// User Routes (own profile)
// =====================

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update own profile (email)
 * @access  Private
 */
router.put('/profile', validate(validateUpdateProfile), usersController.updateProfile);

/**
 * @route   PUT /api/v1/users/password
 * @desc    Change own password
 * @access  Private
 */
router.put('/password', validate(validateChangePassword), usersController.changePassword);

// =====================
// Admin Routes
// =====================

/**
 * @route   GET /api/v1/users/stats/overview
 * @desc    Get user statistics
 * @access  Admin
 */
router.get('/stats/overview', authorize('ADMIN'), usersController.getStats);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/', authorize('ADMIN'), usersController.getAll);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/:id', authorize('ADMIN'), usersController.getById);

/**
 * @route   PUT /api/v1/users/:id/role
 * @desc    Update user role
 * @access  Admin
 */
router.put('/:id/role', authorize('ADMIN'), validate(validateUpdateRole), usersController.updateRole);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete('/:id', authorize('ADMIN'), usersController.deleteUser);

export default router;
