import prisma from '../../database/prisma';
import { hashPassword, comparePassword } from '../../common/utils/bcrypt.util';
import { normalizeEmail } from '../../common/utils/validators';
import { NotFoundError, ConflictError, BusinessLogicError } from '../../common/errors';

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserStats {
  total: number;
  admins: number;
  users: number;
}

/**
 * Users Service
 * Handles all user management business logic
 */
export class UsersService {
  /**
   * Get all users (Admin)
   */
  async getAllUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  /**
   * Get user by ID (Admin)
   */
  async getUserById(id: string): Promise<UserResponse & { subscriptions: any[] }> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            plan: {
              select: {
                id: true,
                name: true,
                price: true,
                durationDays: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update user role (Admin)
   */
  async updateRole(id: string, role: string, adminUserId: string): Promise<UserResponse> {
    // Prevent admin from changing own role
    if (id === adminUserId) {
      throw new BusinessLogicError('Cannot change your own role');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Delete user (Admin)
   */
  async deleteUser(id: string, adminUserId: string): Promise<void> {
    // Prevent admin from deleting themselves
    if (id === adminUserId) {
      throw new BusinessLogicError('Cannot delete your own account');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.subscriptions.length > 0) {
      throw new ConflictError('Cannot delete user with active subscriptions. Cancel subscriptions first.');
    }

    // Delete related data first (payments → subscriptions → user)
    await prisma.$transaction(async (tx) => {
      // Delete payments for all user subscriptions
      const subIds = await tx.subscription.findMany({
        where: { userId: id },
        select: { id: true },
      });

      if (subIds.length > 0) {
        await tx.payment.deleteMany({
          where: { subscriptionId: { in: subIds.map((s) => s.id) } },
        });
      }

      // Delete subscriptions
      await tx.subscription.deleteMany({ where: { userId: id } });

      // Delete user
      await tx.user.delete({ where: { id } });
    });
  }

  /**
   * Update profile (User - change email)
   */
  async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<UserResponse> {
    const updateData: any = {};

    if (data.email) {
      const normalized = normalizeEmail(data.email);
      // Check if new email already taken
      const existing = await prisma.user.findUnique({ where: { email: normalized } });
      if (existing && existing.id !== userId) {
        throw new ConflictError('Email already in use');
      }
      updateData.email = normalized;
    }

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Change password (User)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new BusinessLogicError('Current password is incorrect');
    }

    // Hash and update
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  }

  /**
   * Get user statistics (Admin)
   */
  async getStats(): Promise<UserStats> {
    const [total, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    return {
      total,
      admins,
      users: total - admins,
    };
  }
}

export default new UsersService();
