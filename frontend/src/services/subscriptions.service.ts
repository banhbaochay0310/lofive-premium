import api from '@/lib/api';
import type { ApiResponse, Subscription, SubscriptionStats } from '@/types';

const subscriptionsService = {
  // User endpoints
  async create(planId: string): Promise<Subscription> {
    const { data } = await api.post<ApiResponse<{ subscription: Subscription }>>('/subscriptions', { planId });
    return data.data.subscription;
  },

  async getMy(): Promise<Subscription[]> {
    const { data } = await api.get<ApiResponse<{ subscriptions: Subscription[] }>>('/subscriptions/my');
    return data.data.subscriptions;
  },

  async getById(id: string): Promise<Subscription> {
    const { data } = await api.get<ApiResponse<{ subscription: Subscription }>>(`/subscriptions/${id}`);
    return data.data.subscription;
  },

  async cancel(id: string): Promise<Subscription> {
    const { data } = await api.post<ApiResponse<{ subscription: Subscription }>>(`/subscriptions/${id}/cancel`);
    return data.data.subscription;
  },

  // Admin endpoints
  async getAll(status?: string): Promise<Subscription[]> {
    const { data } = await api.get<ApiResponse<{ subscriptions: Subscription[] }>>('/subscriptions', {
      params: status ? { status } : undefined,
    });
    return data.data.subscriptions;
  },

  async updateStatus(id: string, status: string): Promise<Subscription> {
    const { data } = await api.put<ApiResponse<{ subscription: Subscription }>>(`/subscriptions/${id}/status`, { status });
    return data.data.subscription;
  },

  async activate(id: string): Promise<Subscription> {
    const { data } = await api.post<ApiResponse<{ subscription: Subscription }>>(`/subscriptions/${id}/activate`);
    return data.data.subscription;
  },

  async getStats(): Promise<SubscriptionStats> {
    const { data } = await api.get<ApiResponse<SubscriptionStats>>('/subscriptions/stats/overview');
    return data.data;
  },

  async checkExpired(): Promise<{ expiredCount: number; renewedCount: number }> {
    const { data } = await api.post<ApiResponse<{ expiredCount: number; renewedCount: number }>>('/subscriptions/maintenance/check-expired');
    return data.data;
  },

  async renew(id: string): Promise<Subscription> {
    const { data } = await api.post<ApiResponse<{ subscription: Subscription }>>(`/subscriptions/${id}/renew`);
    return data.data.subscription;
  },

  async toggleAutoRenew(id: string, autoRenew: boolean): Promise<Subscription> {
    const { data } = await api.put<ApiResponse<{ subscription: Subscription }>>(`/subscriptions/${id}/auto-renew`, { autoRenew });
    return data.data.subscription;
  },
};

export default subscriptionsService;
