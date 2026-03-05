import { Router } from 'express';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanStats,
} from './plans.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/authorize.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import {
  validateCreatePlan,
  validateUpdatePlan,
} from './plans.validation';

const router = Router();

/**
 * Public routes
 */

// GET /api/v1/plans - Get all active plans (public)
router.get('/', getAllPlans);

// GET /api/v1/plans/:id - Get plan by ID (public)
router.get('/:id', getPlanById);

/**
 * Admin-only routes
 * Require authentication + ADMIN role
 */

// POST /api/v1/plans - Create new plan
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(validateCreatePlan),
  createPlan
);

// PUT /api/v1/plans/:id - Update plan
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(validateUpdatePlan),
  updatePlan
);

// DELETE /api/v1/plans/:id - Delete plan (soft delete)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  deletePlan
);

// GET /api/v1/plans/:id/stats - Get plan statistics
router.get(
  '/:id/stats',
  authenticate,
  authorize('ADMIN'),
  getPlanStats
);

export default router;
