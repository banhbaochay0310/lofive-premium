import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service';

const paymentsService = new PaymentsService();

/**
 * Create a new payment for a subscription
 * User initiates payment for their PENDING subscription
 */
export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { subscriptionId, amount, provider } = req.body;

    const payment = await paymentsService.createPayment(
      { subscriptionId, amount, provider },
      userId
    );

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's payment history
 */
export const getMyPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const payments = await paymentsService.getMyPayments(userId);

    res.status(200).json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment by ID
 * User can only view their own payments
 * Admin can view any payment
 */
export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.role === 'ADMIN' ? undefined : req.user!.userId;

    const payment = await paymentsService.getPaymentById(id, userId);

    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all payments (Admin only)
 * Supports filtering by status
 */
export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;
    const payments = await paymentsService.getAllPayments(
      status as any
    );

    res.status(200).json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process payment webhook callback
 * Simulates payment gateway callback
 * Updates payment status and activates subscription on success
 */
export const processPaymentWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    const payment = await paymentsService.processPaymentWebhook(id, {
      status,
      transactionId,
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment statistics (Admin only)
 */
export const getPaymentStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await paymentsService.getPaymentStats();

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Simulate payment processing (Mock Gateway)
 * This endpoint simulates a payment gateway processing the payment
 * In production, this would be handled by external payment provider
 */
export const simulatePaymentProcessing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const shouldSucceed = req.body?.shouldSucceed !== false;

    const result = await paymentsService.simulatePaymentProcessing(
      id,
      shouldSucceed
    );

    res.status(200).json({
      success: true,
      message: 'Payment simulation completed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
