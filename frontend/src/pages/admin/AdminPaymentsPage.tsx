import { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CreditCard, Filter } from 'lucide-react';
import paymentsService from '@/services/payments.service';
import type { Payment, PaymentStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const statusConfig: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  COMPLETED: { label: 'Thành công', variant: 'success' },
  PENDING: { label: 'Đang chờ', variant: 'warning' },
  FAILED: { label: 'Thất bại', variant: 'danger' },
};

const statusFilters: (PaymentStatus | 'ALL')[] = ['ALL', 'COMPLETED', 'PENDING', 'FAILED'];

export default function AdminPaymentsPage() {
  useDocumentTitle('Quản lý thanh toán');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await paymentsService.getAll();
        setPayments(data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'ALL' ? payments : payments.filter((p) => p.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>

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
                <th className="p-4 font-medium">Mã GD</th>
                <th className="p-4 font-medium">Người dùng</th>
                <th className="p-4 font-medium">Gói</th>
                <th className="p-4 font-medium">Số tiền</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Provider</th>
                <th className="p-4 font-medium">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-secondary">Không có thanh toán nào.</td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const st = statusConfig[p.status];
                  return (
                    <tr key={p.id} className="border-b border-border-default/50 hover:bg-surface-highlight/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-text-muted" />
                          <span className="font-mono text-xs">{p.transactionId || p.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="p-4">{p.subscription?.user?.email || '—'}</td>
                      <td className="p-4">{p.subscription?.plan?.name || '—'}</td>
                      <td className="p-4 font-medium">{formatPrice(Number(p.amount))}</td>
                      <td className="p-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="p-4 text-text-secondary">{p.provider || '—'}</td>
                      <td className="p-4 text-text-secondary">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
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
