// =====================
// API Response Types
// =====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// =====================
// User & Auth
// =====================

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// =====================
// Plans
// =====================

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanStats {
  plan: Plan;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

export interface CreatePlanInput {
  name: string;
  price: number;
  durationDays: number;
  isActive?: boolean;
}

export interface UpdatePlanInput {
  name?: string;
  price?: number;
  durationDays?: number;
  isActive?: boolean;
}

// =====================
// Subscriptions
// =====================

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'CANCELED' | 'FAILED';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
  user?: User;
  payments?: Payment[];
}

export interface SubscriptionStats {
  total: number;
  active: number;
  pending: number;
  canceled: number;
  failed: number;
  totalRevenue: number;
}

// =====================
// Payments
// =====================

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  provider: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  subscription?: Subscription;
}

export interface PaymentStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  totalRevenue: number;
}

export interface CreatePaymentInput {
  subscriptionId: string;
  amount: number;
  provider: string;
}

// =====================
// Users (Admin)
// =====================

export interface UserWithSubscriptions extends User {
  updatedAt: string;
  subscriptions: Array<{
    id: string;
    status: SubscriptionStatus;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    plan: {
      id: string;
      name: string;
      price: number;
      durationDays: number;
    };
  }>;
}

export interface UserStats {
  total: number;
  admins: number;
  users: number;
}
