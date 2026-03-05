import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Package, Calendar, XCircle, ArrowRight, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import subscriptionsService from '@/services/subscriptions.service';
import type { Subscription, SubscriptionStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const statusMap: Record<SubscriptionStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
  ACTIVE: { label: 'Đang hoạt động', variant: 'success' },
  PENDING: { label: 'Chờ thanh toán', variant: 'warning' },
  CANCELED: { label: 'Đã hủy', variant: 'danger' },
  FAILED: { label: 'Thất bại', variant: 'danger' },
};

export default function MySubscriptionsPage() {
  useDocumentTitle('Gói đăng ký');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await subscriptionsService.getMy();
      setSubscriptions(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy gói đăng ký này?')) return;
    try {
      await subscriptionsService.cancel(id);
      toast.success('Đã hủy gói đăng ký');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRenew = async (id: string) => {
    try {
      const newSub = await subscriptionsService.renew(id);
      toast.success('Đã tạo gia hạn. Vui lòng thanh toán.');
      navigate(`/checkout/${newSub.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleAutoRenew = async (id: string, currentValue: boolean) => {
    try {
      await subscriptionsService.toggleAutoRenew(id, !currentValue);
      toast.success(`Tự động gia hạn đã ${!currentValue ? 'bật' : 'tắt'}`);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gói đăng ký của tôi</h1>
        <Link to="/plans">
          <Button size="sm">
            <Package className="w-4 h-4 mr-2" /> Đăng ký gói mới
          </Button>
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Chưa có gói đăng ký</h3>
            <p className="text-text-secondary mb-4">Hãy chọn một gói phù hợp với nhu cầu của bạn.</p>
            <Link to="/plans">
              <Button>Xem các gói <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const status = statusMap[sub.status];
            return (
              <Card key={sub.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{sub.plan?.name || 'Unknown Plan'}</h3>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-secondary">
                        <span>Giá: {formatPrice(Number(sub.plan?.price || 0))}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {sub.startDate
                            ? `${new Date(sub.startDate).toLocaleDateString('vi-VN')} — ${new Date(sub.endDate!).toLocaleDateString('vi-VN')}`
                            : 'Chưa kích hoạt'}
                        </span>
                        {(sub.status === 'ACTIVE' || sub.status === 'PENDING') && (
                          <button
                            onClick={() => handleToggleAutoRenew(sub.id, sub.autoRenew)}
                            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                            title={sub.autoRenew ? 'Tắt tự động gia hạn' : 'Bật tự động gia hạn'}
                          >
                            {sub.autoRenew ? (
                              <ToggleRight className="w-4 h-4 text-primary" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                            <span className={sub.autoRenew ? 'text-primary' : ''}>
                              Tự động gia hạn
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {sub.status === 'PENDING' && (
                        <Link to={`/checkout/${sub.id}`}>
                          <Button size="sm">Thanh toán</Button>
                        </Link>
                      )}
                      {sub.status === 'ACTIVE' && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => handleRenew(sub.id)}>
                            <RefreshCw className="w-4 h-4 mr-1" /> Gia hạn
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleCancel(sub.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Hủy
                          </Button>
                        </>
                      )}
                      {(sub.status === 'CANCELED' || sub.status === 'FAILED') && (
                        <Button size="sm" onClick={() => handleRenew(sub.id)}>
                          <RefreshCw className="w-4 h-4 mr-1" /> Đăng ký lại
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
