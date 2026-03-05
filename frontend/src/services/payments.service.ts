import api from '@/lib/api';
import type { ApiResponse, Payment, PaymentStats, CreatePaymentInput } from '@/types';

const paymentsService = {
  // User endpoints
  async create(input: CreatePaymentInput): Promise<Payment> {
    const { data } = await api.post<ApiResponse<{ payment: Payment }>>('/payments', input);
    return data.data.payment;
  },

  async getMy(): Promise<Payment[]> {
    const { data } = await api.get<ApiResponse<{ payments: Payment[] }>>('/payments/my');
    return data.data.payments;
  },

  async getById(id: string): Promise<Payment> {
    const { data } = await api.get<ApiResponse<{ payment: Payment }>>(`/payments/${id}`);
    return data.data.payment;
  },

  async simulate(id: string): Promise<unknown> {
    const { data } = await api.post<ApiResponse<unknown>>(`/payments/${id}/simulate`);
    return data.data;
  },

  // Webhook (used internally / for testing)
  async webhook(id: string, status: 'COMPLETED' | 'FAILED'): Promise<unknown> {
    const { data } = await api.post<ApiResponse<unknown>>(`/payments/${id}/webhook`, { status });
    return data.data;
  },

  // Admin endpoints
  async getAll(status?: string): Promise<Payment[]> {
    const { data } = await api.get<ApiResponse<{ payments: Payment[] }>>('/payments', {
      params: status ? { status } : undefined,
    });
    return data.data.payments;
  },

  async getStats(): Promise<PaymentStats> {
    const { data } = await api.get<ApiResponse<PaymentStats>>('/payments/stats/overview');
    return data.data;
  },
};

export default paymentsService;
