import { Router } from 'express';
import {
  createSubscription,
  getMySubscriptions,
  getSubscriptionById,
  cancelSubscription,
  getAllSubscriptions,
  updateSubscriptionStatus,
  activateSubscription,
  getSubscriptionStats,
  checkExpiredSubscriptions,
  renewSubscription,
  toggleAutoRenew,
} from './subscriptions.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/authorize.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import {
  validateCreateSubscription,
  validateUpdateSubscriptionStatus,
  validateToggleAutoRenew,
} from './subscriptions.validation';

const router = Router();

/**
 * User routes (require authentication)
 */

// POST /api/v1/subscriptions - Create new subscription
router.post(
  '/',
  authenticate,
  validate(validateCreateSubscription),
  createSubscription
);

// GET /api/v1/subscriptions/my - Get current user's subscriptions
router.get('/my', authenticate, getMySubscriptions);

// GET /api/v1/subscriptions/:id - Get subscription by ID
router.get('/:id', authenticate, getSubscriptionById);

// POST /api/v1/subscriptions/:id/cancel - Cancel subscription
router.post('/:id/cancel', authenticate, cancelSubscription);

// POST /api/v1/subscriptions/:id/renew - Renew subscription (creates new PENDING sub for same plan)
router.post('/:id/renew', authenticate, renewSubscription);

// PUT /api/v1/subscriptions/:id/auto-renew - Toggle auto-renewal
router.put(
  '/:id/auto-renew',
  authenticate,
  validate(validateToggleAutoRenew),
  toggleAutoRenew
);

/**
 * Admin routes (require authentication + ADMIN role)
 */

// GET /api/v1/subscriptions - Get all subscriptions (admin)
router.get('/', authenticate, authorize('ADMIN'), getAllSubscriptions);

// PUT /api/v1/subscriptions/:id/status - Update subscription status
router.put(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validate(validateUpdateSubscriptionStatus),
  updateSubscriptionStatus
);

// POST /api/v1/subscriptions/:id/activate - Activate subscription
router.post(
  '/:id/activate',
  authenticate,
  authorize('ADMIN'),
  activateSubscription
);

// GET /api/v1/subscriptions/stats/overview - Get subscription statistics
router.get('/stats/overview', authenticate, authorize('ADMIN'), getSubscriptionStats);

// POST /api/v1/subscriptions/maintenance/check-expired - Check expired subscriptions
router.post(
  '/maintenance/check-expired',
  authenticate,
  authorize('ADMIN'),
  checkExpiredSubscriptions
);

export default router;
