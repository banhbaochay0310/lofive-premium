import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/components/guards/RouteGuards';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Lazy load pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import UserDashboard from '@/pages/dashboard/UserDashboard';
import PlanSelectionPage from '@/pages/plans/PlanSelectionPage';
import MySubscriptionsPage from '@/pages/subscriptions/MySubscriptionsPage';
import PaymentHistoryPage from '@/pages/payments/PaymentHistoryPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPlansPage from '@/pages/admin/AdminPlansPage';
import AdminSubscriptionsPage from '@/pages/admin/AdminSubscriptionsPage';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import CheckoutPage from '@/pages/checkout/CheckoutPage';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * Application Router
 *
 * Public:     / (landing), /login, /register
 * Protected:  /dashboard, /plans, /subscriptions, /payments, /settings, /checkout/:id
 * Admin:      /admin, /admin/plans, /admin/subscriptions, /admin/payments, /admin/users
 * Catch-all:  * → 404
 */
export const router = createBrowserRouter([
  // =====================
  // Public Routes
  // =====================
  {
    path: '/',
    element: <LandingPage />,
  },

  // =====================
  // Guest-Only Routes (redirect to dashboard if logged in)
  // =====================
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },

  // =====================
  // Protected Routes (User)
  // =====================
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <UserDashboard /> },
      { path: '/plans', element: <PlanSelectionPage /> },
      { path: '/checkout/:subscriptionId', element: <CheckoutPage /> },
      { path: '/subscriptions', element: <MySubscriptionsPage /> },
      { path: '/payments', element: <PaymentHistoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },

  // =====================
  // Admin Routes
  // =====================
  {
    element: (
      <AdminRoute>
        <DashboardLayout />
      </AdminRoute>
    ),
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/plans', element: <AdminPlansPage /> },
      { path: '/admin/subscriptions', element: <AdminSubscriptionsPage /> },
      { path: '/admin/payments', element: <AdminPaymentsPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
    ],
  },

  // =====================
  // 404 Catch-All
  // =====================
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
