import { Request, Response, NextFunction } from 'express';
import usersService from './users.service';

/**
 * Users Controller
 * Thin controller - delegates to service layer
 */
export class UsersController {
  /**
   * Get all users
   * GET /api/v1/users
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await usersService.getAllUsers();

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getUserById(req.params.id as string);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role
   * PUT /api/v1/users/:id/role
   */
  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.updateRole(
        req.params.id as string,
        req.body.role,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/v1/users/:id
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.deleteUser(req.params.id as string, req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update own profile
   * PUT /api/v1/users/profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.updateProfile(req.user!.userId, {
        name: req.body.name,
        email: req.body.email,
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change own password
   * PUT /api/v1/users/password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.changePassword(
        req.user!.userId,
        req.body.currentPassword,
        req.body.newPassword
      );

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/v1/users/stats/overview
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await usersService.getStats();

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();
