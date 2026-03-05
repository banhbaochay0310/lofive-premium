import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Users, CreditCard, Package, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';
import plansService from '@/services/plans.service';
import subscriptionsService from '@/services/subscriptions.service';
import paymentsService from '@/services/payments.service';
import usersService from '@/services/users.service';
import type { SubscriptionStats, PaymentStats, UserStats } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard');

  const [plansCount, setPlansCount] = useState(0);
  const [subStats, setSubStats] = useState<SubscriptionStats | null>(null);
  const [payStats, setPayStats] = useState<PaymentStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [plans, ss, pas, us] = await Promise.all([
          plansService.getAll(false),
          subscriptionsService.getStats(),
          paymentsService.getStats(),
          usersService.getStats(),
        ]);
        setPlansCount(plans.length);
        setSubStats(ss);
        setPayStats(pas);
        setUserStats(us);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: formatPrice(payStats?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Đăng ký hoạt động',
      value: subStats?.active ?? 0,
      icon: CreditCard,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Tổng người dùng',
      value: userStats?.total ?? 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Tổng gói dịch vụ',
      value: plansCount,
      icon: Package,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      title: 'Thanh toán thành công',
      value: payStats?.completed ?? 0,
      icon: ShieldCheck,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${s.bg}`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">{s.title}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription breakdown */}
      {subStats && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Phân bổ đăng ký</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {([
                { label: 'Hoạt động', value: subStats.active, color: 'text-success' },
                { label: 'Chờ xử lý', value: subStats.pending, color: 'text-warning' },
                { label: 'Đã hủy', value: subStats.canceled, color: 'text-danger' },
                { label: 'Thất bại', value: subStats.failed, color: 'text-danger' },
              ]).map((item) => (
                <div key={item.label} className="text-center p-4 rounded-lg bg-surface-highlight">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-sm text-text-secondary mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment breakdown */}
      {payStats && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Thống kê thanh toán</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {([
                { label: 'Tổng', value: payStats.total, color: 'text-text-primary' },
                { label: 'Thành công', value: payStats.completed, color: 'text-success' },
                { label: 'Đang chờ', value: payStats.pending, color: 'text-warning' },
                { label: 'Thất bại', value: payStats.failed, color: 'text-danger' },
              ]).map((item) => (
                <div key={item.label} className="text-center p-4 rounded-lg bg-surface-highlight">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-sm text-text-secondary mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Truy cập nhanh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Quản lý gói', path: '/admin/plans', icon: Package, color: 'text-purple-400' },
              { label: 'Quản lý đăng ký', path: '/admin/subscriptions', icon: CreditCard, color: 'text-success' },
              { label: 'Quản lý thanh toán', path: '/admin/payments', icon: TrendingUp, color: 'text-warning' },
              { label: 'Quản lý người dùng', path: '/admin/users', icon: Users, color: 'text-blue-400' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-highlight hover:bg-surface-highlight/80 transition-colors group"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
