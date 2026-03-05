import { PrismaClient, Prisma, Payment, PaymentStatus } from '@prisma/client';
import { NotFoundError, ConflictError, BusinessLogicError } from '../../common/errors';

const prisma = new PrismaClient();

interface CreatePaymentDto {
  subscriptionId: string;
  amount: number;
  provider: string;
}

interface PaymentWebhookDto {
  status: 'COMPLETED' | 'FAILED';
  transactionId?: string;
}

export class PaymentsService {
  /**
   * Create a new payment for a subscription
   * @param data - Payment data
   * @param userId - User ID (for authorization check)
   * @returns Created payment with subscription details
   */
  async createPayment(data: CreatePaymentDto, userId: string): Promise<any> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Check if subscription exists and belongs to user
        const subscription = await tx.subscription.findUnique({
          where: { id: data.subscriptionId },
          include: { plan: true, user: true },
        });

        if (!subscription) {
          throw new NotFoundError('Subscription not found');
        }

        // Verify subscription belongs to user
        if (subscription.userId !== userId) {
          throw new BusinessLogicError('Cannot create payment for another user\'s subscription');
        }

        // Verify subscription is in PENDING status
        if (subscription.status !== 'PENDING') {
          throw new BusinessLogicError('Payment can only be created for PENDING subscriptions');
        }

        // Verify amount matches plan price
        const planPrice = Number(subscription.plan.price);
        if (Math.abs(data.amount - planPrice) > 0.01) {
          throw new BusinessLogicError(
            `Payment amount must match plan price: $${planPrice.toFixed(2)}`
          );
        }

        // Check if payment already exists for this subscription (race-condition safe)
        const existingPayment = await tx.payment.findFirst({
          where: {
            subscriptionId: data.subscriptionId,
            status: { in: ['PENDING', 'COMPLETED'] },
          },
        });

        if (existingPayment) {
          if (existingPayment.status === 'COMPLETED') {
            throw new ConflictError(
              'A completed payment already exists for this subscription'
            );
          }

          // Auto-cancel stale PENDING payment so user can retry
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: { status: 'FAILED' },
          });
        }

        // Create payment with PENDING status
        return await tx.payment.create({
          data: {
            subscriptionId: data.subscriptionId,
            amount: data.amount,
            provider: data.provider,
            status: 'PENDING',
          },
          include: {
            subscription: {
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
            },
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error: any) {
      // Handle Prisma unique constraint violation (DB-level safety net)
      if (error.code === 'P2002') {
        throw new ConflictError('A payment already exists for this subscription');
      }
      // Handle serialization failure (concurrent transaction conflict)
      if (error.code === 'P2034') {
        throw new ConflictError('Concurrent request detected. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param id - Payment ID
   * @param userId - User ID (optional, for authorization check)
   * @returns Payment details
   */
  async getPaymentById(id: string, userId?: string): Promise<any> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        subscription: {
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
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // If userId is provided, verify ownership
    if (userId && payment.subscription.userId !== userId) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  /**
   * Get all payments for a user
   * @param userId - User ID
   * @returns List of user's payments
   */
  async getMyPayments(userId: string): Promise<Payment[]> {
    return await prisma.payment.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all payments (Admin only)
   * @param status - Optional status filter
   * @returns List of all payments
   */
  async getAllPayments(status?: PaymentStatus): Promise<Payment[]> {
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    return await prisma.payment.findMany({
      where: whereClause,
      include: {
        subscription: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Process payment webhook callback
   * @param id - Payment ID
   * @param data - Webhook data with status and transactionId
   * @returns Updated payment
   */
  async processPaymentWebhook(id: string, data: PaymentWebhookDto): Promise<any> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get payment with subscription details
        const payment = await tx.payment.findUnique({
          where: { id },
          include: {
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        });

        if (!payment) {
          throw new NotFoundError('Payment not found');
        }

        // Verify payment is in PENDING status (race-condition safe within serializable tx)
        if (payment.status !== 'PENDING') {
          throw new BusinessLogicError(
            `Payment is already ${payment.status.toLowerCase()}`
          );
        }

        // Update payment status
        const updatedPayment = await tx.payment.update({
          where: { id },
          data: {
            status: data.status,
            transactionId: data.transactionId,
          },
        });

        // If payment is COMPLETED, activate subscription
        if (data.status === 'COMPLETED') {
          // Race condition guard: check no other ACTIVE sub for this user
          const existingActive = await tx.subscription.findFirst({
            where: {
              userId: payment.subscription.userId,
              status: 'ACTIVE',
              id: { not: payment.subscriptionId },
            },
          });

          if (existingActive) {
            throw new ConflictError('User already has an active subscription. Cannot activate another.');
          }

          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + payment.subscription.plan.durationDays);

          await tx.subscription.update({
            where: { id: payment.subscriptionId },
            data: {
              status: 'ACTIVE',
              startDate,
              endDate,
            },
          });
        }

        // If payment FAILED, mark subscription as FAILED
        if (data.status === 'FAILED') {
          await tx.subscription.update({
            where: { id: payment.subscriptionId },
            data: {
              status: 'FAILED',
            },
          });
        }

        return updatedPayment;
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });

      // Return complete payment details
      return await this.getPaymentById(result.id);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('Concurrent payment conflict detected');
      }
      if (error.code === 'P2034') {
        throw new ConflictError('Concurrent request detected. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Get payment statistics (Admin only)
   * @returns Payment statistics
   */
  async getPaymentStats() {
    const [total, pending, completed, failed, revenue] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.count({ where: { status: 'FAILED' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      total,
      pending,
      completed,
      failed,
      totalRevenue: revenue._sum.amount ? Number(revenue._sum.amount) : 0,
    };
  }

  /**
   * Simulate payment processing (Mock Gateway)
   * This simulates a payment gateway processing the payment
   * @param paymentId - Payment ID to process
   * @param shouldSucceed - Whether payment should succeed (for testing)
   * @returns Simulated webhook response
   */
  async simulatePaymentProcessing(
    paymentId: string,
    shouldSucceed: boolean = true
  ): Promise<{ success: boolean; webhookData: PaymentWebhookDto }> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== 'PENDING') {
      throw new BusinessLogicError('Payment must be in PENDING status');
    }

    // Simulate processing delay (in real world, this would be async)
    const webhookData: PaymentWebhookDto = {
      status: shouldSucceed ? 'COMPLETED' : 'FAILED',
      transactionId: shouldSucceed ? `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : undefined,
    };

    return {
      success: true,
      webhookData,
    };
  }
}
