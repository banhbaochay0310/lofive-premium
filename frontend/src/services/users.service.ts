import api from '@/lib/api';
import type { ApiResponse, User, UserWithSubscriptions, UserStats, UserRole } from '@/types';

/**
 * Users API Service
 * - Admin: list users, get user detail, update role, delete user, get stats
 * - User: update profile (email), change password
 */
const usersService = {
  // =====================
  // Admin endpoints
  // =====================

  async getAll(): Promise<User[]> {
    const { data } = await api.get<ApiResponse<{ users: User[] }>>('/users');
    return data.data.users;
  },

  async getById(id: string): Promise<UserWithSubscriptions> {
    const { data } = await api.get<ApiResponse<{ user: UserWithSubscriptions }>>(`/users/${id}`);
    return data.data.user;
  },

  async updateRole(id: string, role: UserRole): Promise<User> {
    const { data } = await api.put<ApiResponse<{ user: User }>>(`/users/${id}/role`, { role });
    return data.data.user;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getStats(): Promise<UserStats> {
    const { data } = await api.get<ApiResponse<{ stats: UserStats }>>('/users/stats/overview');
    return data.data.stats;
  },

  // =====================
  // User self-service endpoints
  // =====================

  async updateProfile(data: { name?: string; email?: string }): Promise<User> {
    const { data: res } = await api.put<ApiResponse<{ user: User }>>('/users/profile', data);
    return res.data.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/password', { currentPassword, newPassword });
  },
};

export default usersService;
