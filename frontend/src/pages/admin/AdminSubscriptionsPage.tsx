import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import subscriptionsService from '@/services/subscriptions.service';
import type { Subscription, SubscriptionStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const statusConfig: Record<SubscriptionStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
  ACTIVE: { label: 'Hoạt động', variant: 'success' },
  PENDING: { label: 'Chờ xử lý', variant: 'warning' },
  CANCELED: { label: 'Đã hủy', variant: 'danger' },
  FAILED: { label: 'Thất bại', variant: 'danger' },
};

const statusFilters: (SubscriptionStatus | 'ALL')[] = ['ALL', 'ACTIVE', 'PENDING', 'CANCELED', 'FAILED'];

export default function AdminSubscriptionsPage() {
  useDocumentTitle('Quản lý đăng ký');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SubscriptionStatus | 'ALL'>('ALL');

  const load = async () => {
    try {
      const data = await subscriptionsService.getAll();
      setSubscriptions(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleActivate = async (id: string) => {
    try {
      await subscriptionsService.activate(id);
      toast.success('Đã kích hoạt đăng ký');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đăng ký này?')) return;
    try {
      await subscriptionsService.cancel(id);
      toast.success('Đã hủy đăng ký');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filtered = filter === 'ALL' ? subscriptions : subscriptions.filter((s) => s.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý đăng ký</h1>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-text-secondary" />
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-primary text-white'
                : 'bg-surface-highlight text-text-secondary hover:text-white'
            }`}
          >
            {s === 'ALL' ? 'Tất cả' : statusConfig[s].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-text-secondary">
                <th className="p-4 font-medium">Người dùng</th>
                <th className="p-4 font-medium">Gói</th>
                <th className="p-4 font-medium">Giá</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Ngày tạo</th>
                <th className="p-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">Không có đăng ký nào.</td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  const st = statusConfig[sub.status];
                  return (
                    <tr key={sub.id} className="border-b border-border-default/50 hover:bg-surface-highlight/50 transition-colors">
                      <td className="p-4">{sub.user?.email || sub.userId.slice(0, 8)}</td>
                      <td className="p-4 font-medium">{sub.plan?.name || '—'}</td>
                      <td className="p-4">{formatPrice(Number(sub.plan?.price || 0))}</td>
                      <td className="p-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="p-4 text-text-secondary">{new Date(sub.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          {sub.status === 'PENDING' && (
                            <Button size="sm" onClick={() => handleActivate(sub.id)}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Kích hoạt
                            </Button>
                          )}
                          {sub.status === 'ACTIVE' && (
                            <Button size="sm" variant="outline" onClick={() => handleCancel(sub.id)}>
                              <XCircle className="w-4 h-4 mr-1" /> Hủy
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
