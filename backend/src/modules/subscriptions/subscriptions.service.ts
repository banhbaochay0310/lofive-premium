import { PrismaClient, Prisma, Subscription, SubscriptionStatus } from '@prisma/client';
import { NotFoundError, ConflictError, BusinessLogicError } from '../../common/errors';

const prisma = new PrismaClient();

interface CreateSubscriptionDto {
  userId: string;
  planId: string;
}

interface UpdateSubscriptionStatusDto {
  status: SubscriptionStatus;
}

export class SubscriptionsService {
  /**
   * Create a new subscription for a user
   * @param data - Subscription data
   * @returns Created subscription with plan details
   */
  async createSubscription(data: CreateSubscriptionDto): Promise<any> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Check if plan exists and is active
        const plan = await tx.plan.findUnique({
          where: { id: data.planId },
        });

        if (!plan) {
          throw new NotFoundError('Plan not found');
        }

        if (!plan.isActive) {
          throw new BusinessLogicError('This plan is no longer available');
        }

        // Check if user already has an active or pending subscription (race-condition safe)
        const existingSubscription = await tx.subscription.findFirst({
          where: {
            userId: data.userId,
            status: { in: ['ACTIVE', 'PENDING'] },
          },
        });

        if (existingSubscription) {
          throw new ConflictError(
            existingSubscription.status === 'ACTIVE'
              ? 'User already has an active subscription'
              : 'User already has a pending subscription. Please complete or cancel it first.'
          );
        }

        // Create subscription with PENDING status
        return await tx.subscription.create({
          data: {
            userId: data.userId,
            planId: data.planId,
            status: 'PENDING',
          },
          include: {
            plan: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error: any) {
      // Handle Prisma unique constraint violation (DB-level safety net)
      if (error.code === 'P2002') {
        throw new ConflictError('User already has an active subscription');
      }
      // Handle serialization failure (concurrent transaction conflict)
      if (error.code === 'P2034') {
        throw new ConflictError('Concurrent request detected. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Get subscription by ID
   * @param id - Subscription ID
   * @param userId - User ID (optional, for authorization check)
   * @returns Subscription details
   */
  async getSubscriptionById(id: string, userId?: string): Promise<any> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Check if user is authorized to view this subscription
    if (userId && subscription.userId !== userId) {
      throw new BusinessLogicError('You are not authorized to view this subscription');
    }

    return subscription;
  }

  /**
   * Get all subscriptions for a user
   * @param userId - User ID
   * @returns Array of user's subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<any[]> {
    return await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Only latest payment
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all subscriptions (Admin only)
   * @param status - Optional status filter
   * @returns Array of all subscriptions
   */
  async getAllSubscriptions(status?: SubscriptionStatus): Promise<any[]> {
    const where = status ? { status } : {};

    return await prisma.subscription.findMany({
      where,
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Activate a subscription (after successful payment)
   * @param id - Subscription ID
   * @returns Updated subscription
   */
  async activateSubscription(id: string): Promise<Subscription> {
    try {
      return await prisma.$transaction(async (tx) => {
        const subscription = await tx.subscription.findUnique({
          where: { id },
          include: { plan: true },
        });

        if (!subscription) {
          throw new NotFoundError('Subscription not found');
        }

        if (subscription.status === 'ACTIVE') {
          throw new BusinessLogicError('Subscription is already active');
        }

        // Race condition guard: check no other ACTIVE sub for this user
        const existingActive = await tx.subscription.findFirst({
          where: {
            userId: subscription.userId,
            status: 'ACTIVE',
            id: { not: id },
          },
        });

        if (existingActive) {
          throw new ConflictError('User already has an active subscription');
        }

        // Calculate start and end dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + subscription.plan.durationDays);

        return await tx.subscription.update({
          where: { id },
          data: {
            status: 'ACTIVE',
            startDate,
            endDate,
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('User already has an active subscription');
      }
      if (error.code === 'P2034') {
        throw new ConflictError('Concurrent request detected. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Cancel a subscription
   * @param id - Subscription ID
   * @param userId - User ID (for authorization)
   * @returns Updated subscription
   */
  async cancelSubscription(id: string, userId: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id, userId);

    if (subscription.status === 'CANCELED') {
      throw new BusinessLogicError('Subscription is already canceled');
    }

    if (subscription.status === 'FAILED') {
      throw new BusinessLogicError('Cannot cancel a failed subscription');
    }

    return await prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELED',
      },
    });
  }

  /**
   * Update subscription status (Admin only)
   * @param id - Subscription ID
   * @param data - Status update data
   * @returns Updated subscription
   */
  async updateSubscriptionStatus(
    id: string,
    data: UpdateSubscriptionStatusDto
  ): Promise<Subscription> {
    // Check if subscription exists
    await this.getSubscriptionById(id);

    // If activating, set dates
    const updateData: any = {
      status: data.status,
    };

    if (data.status === 'ACTIVE') {
      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: { plan: true },
      });

      if (!subscription) {
        throw new NotFoundError('Subscription not found');
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + subscription.plan.durationDays);

      updateData.startDate = startDate;
      updateData.endDate = endDate;
    }

    return await prisma.subscription.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Get subscription statistics (Admin only)
   * @returns Subscription statistics
   */
  async getSubscriptionStats() {
    const [total, active, pending, canceled, failed, revenue] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'PENDING' } }),
      prisma.subscription.count({ where: { status: 'CANCELED' } }),
      prisma.subscription.count({ where: { status: 'FAILED' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      total,
      active,
      pending,
      canceled,
      failed,
      totalRevenue: revenue._sum.amount ? Number(revenue._sum.amount) : 0,
    };
  }

  /**
   * Check and update expired subscriptions
   * Auto-renews subscriptions with autoRenew=true
   * This should be run by a cron job
   */
  async checkExpiredSubscriptions(): Promise<{ expiredCount: number; renewedCount: number }> {
    const now = new Date();

    // Find all expired ACTIVE subscriptions
    const expiredSubs = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: now },
      },
      include: { plan: true },
    });

    let expiredCount = 0;
    let renewedCount = 0;

    for (const sub of expiredSubs) {
      if (sub.autoRenew && sub.plan.isActive) {
        // Auto-renew: extend endDate by plan duration
        const newEndDate = new Date(sub.endDate!);
        newEndDate.setDate(newEndDate.getDate() + sub.plan.durationDays);

        await prisma.subscription.update({
          where: { id: sub.id },
          data: { endDate: newEndDate },
        });
        renewedCount++;
      } else {
        // Cancel expired subscription
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'CANCELED' },
        });
        expiredCount++;
      }
    }

    return { expiredCount, renewedCount };
  }

  /**
   * Renew a subscription (user-initiated)
   * For ACTIVE subs: extends endDate by plan.durationDays (creates payment for extension)
   * For CANCELED/FAILED subs: creates a new PENDING subscription for the same plan
   * @param id - Subscription ID to renew
   * @param userId - User ID (for authorization)
   * @returns New or extended subscription
   */
  async renewSubscription(id: string, userId: string): Promise<any> {
    try {
      return await prisma.$transaction(async (tx) => {
        const subscription = await tx.subscription.findUnique({
          where: { id },
          include: { plan: true },
        });

        if (!subscription) {
          throw new NotFoundError('Subscription not found');
        }

        if (subscription.userId !== userId) {
          throw new BusinessLogicError('You are not authorized to renew this subscription');
        }

        if (!subscription.plan.isActive) {
          throw new BusinessLogicError('This plan is no longer available. Please choose a different plan.');
        }

        if (subscription.status === 'PENDING') {
          throw new BusinessLogicError('Subscription is still pending payment. Please complete the current payment first.');
        }

        if (subscription.status === 'ACTIVE') {
          // For ACTIVE subscription: create a new PENDING subscription for renewal payment
          const existingPending = await tx.subscription.findFirst({
            where: { userId, status: 'PENDING' },
          });

          if (existingPending) {
            throw new ConflictError('You already have a pending subscription. Please complete or cancel it first.');
          }

          // Create renewal subscription linked to the same plan
          return await tx.subscription.create({
            data: {
              userId,
              planId: subscription.planId,
              status: 'PENDING',
              autoRenew: subscription.autoRenew,
            },
            include: {
              plan: true,
              user: { select: { id: true, email: true, role: true } },
            },
          });
        }

        // For CANCELED or FAILED: check no existing active sub
        const existingActive = await tx.subscription.findFirst({
          where: { userId, status: 'ACTIVE' },
        });

        if (existingActive) {
          throw new ConflictError('You already have an active subscription');
        }

        const existingPending = await tx.subscription.findFirst({
          where: { userId, status: 'PENDING' },
        });

        if (existingPending) {
          throw new ConflictError('You already have a pending subscription. Please complete or cancel it first.');
        }

        // Create a fresh subscription for the same plan
        return await tx.subscription.create({
          data: {
            userId,
            planId: subscription.planId,
            status: 'PENDING',
            autoRenew: subscription.autoRenew,
          },
          include: {
            plan: true,
            user: { select: { id: true, email: true, role: true } },
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('Concurrent subscription conflict detected');
      }
      if (error.code === 'P2034') {
        throw new ConflictError('Concurrent request detected. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Toggle auto-renewal for a subscription
   * @param id - Subscription ID
   * @param userId - User ID (for authorization)
   * @param autoRenew - New auto-renew value
   * @returns Updated subscription
   */
  async toggleAutoRenew(id: string, userId: string, autoRenew: boolean): Promise<any> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new BusinessLogicError('You are not authorized to modify this subscription');
    }

    if (subscription.status !== 'ACTIVE' && subscription.status !== 'PENDING') {
      throw new BusinessLogicError('Can only toggle auto-renewal for active or pending subscriptions');
    }

    return await prisma.subscription.update({
      where: { id },
      data: { autoRenew },
      include: {
        plan: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });
  }
}
