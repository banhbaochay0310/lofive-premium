import { PrismaClient, Plan } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../common/errors';

const prisma = new PrismaClient();

interface CreatePlanDto {
  name: string;
  price: number;
  durationDays: number;
  isActive?: boolean;
}

interface UpdatePlanDto {
  name?: string;
  price?: number;
  durationDays?: number;
  isActive?: boolean;
}

export class PlansService {
  /**
   * Get all plans (with optional filtering)
   * @param activeOnly - If true, return only active plans
   * @returns Array of plans
   */
  async getAllPlans(activeOnly: boolean = false): Promise<Plan[]> {
    const where = activeOnly ? { isActive: true } : {};
    
    return await prisma.plan.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { price: 'asc' },
      ],
    });
  }

  /**
   * Get plan by ID
   * @param id - Plan ID
   * @returns Plan details
   * @throws NotFoundError if plan doesn't exist
   */
  async getPlanById(id: string): Promise<Plan> {
    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    return plan;
  }

  /**
   * Create a new plan
   * @param data - Plan data
   * @returns Created plan
   * @throws ConflictError if plan with same name exists
   */
  async createPlan(data: CreatePlanDto): Promise<Plan> {
    // Check if plan with same name already exists
    const existingPlan = await prisma.plan.findFirst({
      where: { 
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingPlan) {
      throw new ConflictError('Plan with this name already exists');
    }

    return await prisma.plan.create({
      data: {
        name: data.name,
        price: data.price,
        durationDays: data.durationDays,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Update an existing plan
   * @param id - Plan ID
   * @param data - Updated plan data
   * @returns Updated plan
   * @throws NotFoundError if plan doesn't exist
   * @throws ConflictError if new name conflicts with another plan
   */
  async updatePlan(id: string, data: UpdatePlanDto): Promise<Plan> {
    // Check if plan exists
    const existingPlan = await this.getPlanById(id);

    // If name is being updated, check for conflicts
    if (data.name && data.name !== existingPlan.name) {
      const nameConflict = await prisma.plan.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: 'insensitive',
          },
          id: {
            not: id,
          },
        },
      });

      if (nameConflict) {
        throw new ConflictError('Plan with this name already exists');
      }
    }

    return await prisma.plan.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a plan (soft delete by setting isActive to false)
   * @param id - Plan ID
   * @returns Updated plan
   * @throws NotFoundError if plan doesn't exist
   */
  async deletePlan(id: string): Promise<Plan> {
    // Check if plan exists
    await this.getPlanById(id);

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.subscription.findFirst({
      where: {
        planId: id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions) {
      throw new ConflictError('Cannot delete plan with active subscriptions');
    }

    // Soft delete by setting isActive to false
    return await prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Calculate total price for multiple months
   * @param planId - Plan ID
   * @param months - Number of months
   * @returns Total price
   */
  async calculatePrice(planId: string, months: number): Promise<number> {
    const plan = await this.getPlanById(planId);
    
    // Convert Decimal to number and calculate price per month based on duration
    const price = Number(plan.price);
    const pricePerMonth = price / (plan.durationDays / 30);
    
    return pricePerMonth * months;
  }

  /**
   * Get plan statistics (for admin)
   * @param planId - Plan ID
   * @returns Plan statistics
   */
  async getPlanStats(planId: string) {
    const plan = await this.getPlanById(planId);

    const [totalSubscriptions, activeSubscriptions, revenue] = await Promise.all([
      prisma.subscription.count({
        where: { planId },
      }),
      prisma.subscription.count({
        where: {
          planId,
          status: 'ACTIVE',
        },
      }),
      prisma.payment.aggregate({
        where: {
          subscription: {
            planId,
          },
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      plan,
      totalSubscriptions,
      activeSubscriptions,
      totalRevenue: revenue._sum.amount ? Number(revenue._sum.amount) : 0,
    };
  }
}
