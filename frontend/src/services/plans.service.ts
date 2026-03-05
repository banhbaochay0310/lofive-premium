import api from '@/lib/api';
import type { ApiResponse, Plan, PlanStats, CreatePlanInput, UpdatePlanInput } from '@/types';

const plansService = {
  async getAll(activeOnly = true): Promise<Plan[]> {
    const { data } = await api.get<ApiResponse<{ plans: Plan[] }>>('/plans', {
      params: activeOnly ? { activeOnly: 'true' } : undefined,
    });
    return data.data.plans;
  },

  async getById(id: string): Promise<Plan> {
    const { data } = await api.get<ApiResponse<Plan>>(`/plans/${id}`);
    return data.data;
  },

  async getStats(id: string): Promise<PlanStats> {
    const { data } = await api.get<ApiResponse<PlanStats>>(`/plans/${id}/stats`);
    return data.data;
  },

  // Admin
  async create(input: CreatePlanInput): Promise<Plan> {
    const { data } = await api.post<ApiResponse<Plan>>('/plans', input);
    return data.data;
  },

  async update(id: string, input: UpdatePlanInput): Promise<Plan> {
    const { data } = await api.put<ApiResponse<Plan>>(`/plans/${id}`, input);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/plans/${id}`);
  },
};

export default plansService;
