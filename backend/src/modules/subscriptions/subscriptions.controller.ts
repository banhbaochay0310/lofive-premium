import { Request, Response, NextFunction } from 'express';
import { SubscriptionsService } from './subscriptions.service';

const subscriptionsService = new SubscriptionsService();

/**
 * Create a new subscription
 * User subscribes to a plan
 */
export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { planId } = req.body;

    const subscription = await subscriptionsService.createSubscription({
      userId,
      planId,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's subscriptions
 */
export const getMySubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const subscriptions = await subscriptionsService.getUserSubscriptions(userId);

    res.status(200).json({
      success: true,
      data: { subscriptions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription by ID
 * User can only view their own subscriptions
 * Admin can view any subscription
 */
export const getSubscriptionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.role === 'ADMIN' ? undefined : req.user!.userId;

    const subscription = await subscriptionsService.getSubscriptionById(id, userId);

    res.status(200).json({
      success: true,
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel subscription
 * User can only cancel their own subscriptions
 */
export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const subscription = await subscriptionsService.cancelSubscription(id, userId);

    res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all subscriptions (Admin only)
 * Optional status filter via query param
 */
export const getAllSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const status = req.query.status as any;
    const subscriptions = await subscriptionsService.getAllSubscriptions(status);

    res.status(200).json({
      success: true,
      data: { subscriptions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update subscription status (Admin only)
 */
export const updateSubscriptionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const subscription = await subscriptionsService.updateSubscriptionStatus(id, {
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Subscription status updated successfully',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate subscription (Admin only)
 * Used after payment confirmation
 */
export const activateSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const subscription = await subscriptionsService.activateSubscription(id);

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription statistics (Admin only)
 */
export const getSubscriptionStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await subscriptionsService.getSubscriptionStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check and update expired subscriptions (Admin only)
 * Manual trigger for cron job — also handles auto-renewal
 */
export const checkExpiredSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await subscriptionsService.checkExpiredSubscriptions();

    res.status(200).json({
      success: true,
      message: `${result.expiredCount} subscription(s) expired, ${result.renewedCount} auto-renewed`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Renew a subscription
 * User can renew their own ACTIVE (extend), CANCELED, or FAILED subscription
 */
export const renewSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const subscription = await subscriptionsService.renewSubscription(id, userId);

    res.status(201).json({
      success: true,
      message: 'Subscription renewal created successfully. Please complete payment.',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle auto-renewal for a subscription
 */
export const toggleAutoRenew = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const { autoRenew } = req.body;

    const subscription = await subscriptionsService.toggleAutoRenew(id, userId, autoRenew);

    res.status(200).json({
      success: true,
      message: `Auto-renewal ${autoRenew ? 'enabled' : 'disabled'}`,
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};
