import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CreditCard, Play, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import subscriptionsService from '@/services/subscriptions.service';
import paymentsService from '@/services/payments.service';
import type { Subscription, Payment } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  ACTIVE: { label: 'Đang hoạt động', variant: 'success' },
  PENDING: { label: 'Chờ xử lý', variant: 'warning' },
  CANCELED: { label: 'Đã hủy', variant: 'danger' },
  FAILED: { label: 'Thất bại', variant: 'danger' },
};

export default function UserDashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subs, pays] = await Promise.all([
          subscriptionsService.getMy(),
          paymentsService.getMy(),
        ]);
        setSubscriptions(subs);
        setPayments(pays);
      } catch {
        // Empty state will show
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeSub = subscriptions.find((s) => s.status === 'ACTIVE');
  const recentPayments = payments.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold mb-1">
          Xin chào, {user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-text-secondary">Quản lý gói đăng ký và thanh toán của bạn.</p>
      </div>

      {/* Active subscription card */}
      <Card className={activeSub ? 'border-primary/30' : ''}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {activeSub ? `Gói ${activeSub.plan?.name}` : 'Chưa có gói đăng ký'}
                </h3>
                {activeSub ? (
                  <div className="space-y-1">
                    <Badge variant={statusMap[activeSub.status].variant}>
                      {statusMap[activeSub.status].label}
                    </Badge>
                    <p className="text-sm text-text-secondary">
                      Giá: {formatPrice(Number(activeSub.plan?.price || 0))} / {activeSub.plan?.durationDays} ngày
                    </p>
                    {activeSub.endDate && (
                      <p className="text-sm text-text-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Hết hạn: {new Date(activeSub.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">
                    Bắt đầu với LOFIVE Premium để trải nghiệm nhạc không giới hạn.
                  </p>
                )}
              </div>
            </div>
            <Link to={activeSub ? '/subscriptions' : '/plans'}>
              <Button variant={activeSub ? 'outline' : 'primary'} size="sm">
                {activeSub ? 'Chi tiết' : 'Khám phá gói'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick action cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/plans" className="group">
          <Card className="hover:border-primary/30 transition-colors h-full">
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Chọn gói</h3>
              <p className="text-sm text-text-secondary">Xem tất cả gói Premium</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/subscriptions" className="group">
          <Card className="hover:border-primary/30 transition-colors h-full">
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Gói đăng ký</h3>
              <p className="text-sm text-text-secondary">{subscriptions.length} gói đã đăng ký</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/payments" className="group">
          <Card className="hover:border-primary/30 transition-colors h-full">
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Thanh toán</h3>
              <p className="text-sm text-text-secondary">{payments.length} giao dịch</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent payments */}
      {recentPayments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Thanh toán gần đây</h2>
            <Link to="/payments" className="text-sm text-primary hover:text-primary-hover transition-colors">
              Xem tất cả
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border-default">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-sm">{formatPrice(Number(payment.amount))}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Badge variant={statusMap[payment.status]?.variant || 'default'}>
                      {statusMap[payment.status]?.label || payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
