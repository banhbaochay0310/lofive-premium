import api from '@/lib/api';
import type { ApiResponse, AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';

/**
 * Auth API Service
 * Handles login, register, and current user requests
 */
const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return data.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    return data.data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return data.data.user;
  },
};

export default authService;
