import { Router } from 'express';
import {
  createPayment,
  getMyPayments,
  getPaymentById,
  getAllPayments,
  processPaymentWebhook,
  getPaymentStats,
  simulatePaymentProcessing,
} from './payments.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/authorize.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import {
  validateCreatePayment,
  validatePaymentWebhook,
  validatePaymentQuery,
} from './payments.validation';

const router = Router();

/**
 * User routes (require authentication)
 */

// POST /api/v1/payments - Create new payment
router.post(
  '/',
  authenticate,
  validate(validateCreatePayment),
  createPayment
);

// GET /api/v1/payments/my - Get current user's payment history
router.get('/my', authenticate, getMyPayments);

// GET /api/v1/payments/:id - Get payment by ID
router.get('/:id', authenticate, getPaymentById);

/**
 * Admin routes (require authentication + ADMIN role)
 */

// GET /api/v1/payments - Get all payments (admin)
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  getAllPayments
);

// GET /api/v1/payments/stats/overview - Get payment statistics
router.get('/stats/overview', authenticate, authorize('ADMIN'), getPaymentStats);

/**
 * Webhook and simulation routes
 */

// POST /api/v1/payments/:id/webhook - Process payment webhook callback
// Note: In production, this should have webhook signature verification
router.post(
  '/:id/webhook',
  validate(validatePaymentWebhook),
  processPaymentWebhook
);

// POST /api/v1/payments/:id/simulate - Simulate payment processing (Mock Gateway)
// Note: This is for testing only, remove in production
router.post('/:id/simulate', authenticate, simulatePaymentProcessing);

export default router;
