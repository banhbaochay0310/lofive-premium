import { Request, Response, NextFunction } from 'express';
import { PlansService } from './plans.service';

const plansService = new PlansService();

/**
 * Get all plans
 * Query params:
 *  - activeOnly: boolean (optional) - return only active plans
 */
export const getAllPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const plans = await plansService.getAllPlans(activeOnly);

    res.status(200).json({
      success: true,
      data: { plans },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get plan by ID
 */
export const getPlanById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await plansService.getPlanById(id);

    res.status(200).json({
      success: true,
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new plan (Admin only)
 */
export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plan = await plansService.createPlan(req.body);

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing plan (Admin only)
 */
export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await plansService.updatePlan(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a plan (Admin only)
 * Soft delete - sets isActive to false
 */
export const deletePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await plansService.deletePlan(id);

    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get plan statistics (Admin only)
 */
export const getPlanStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const stats = await plansService.getPlanStats(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
