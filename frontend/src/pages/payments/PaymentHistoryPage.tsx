import { useState, useEffect } from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Receipt, CreditCard } from 'lucide-react';
import paymentsService from '@/services/payments.service';
import type { Payment, PaymentStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const statusMap: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  COMPLETED: { label: 'Thành công', variant: 'success' },
  PENDING: { label: 'Đang xử lý', variant: 'warning' },
  FAILED: { label: 'Thất bại', variant: 'danger' },
};

export default function PaymentHistoryPage() {
  useDocumentTitle('Lịch sử thanh toán');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await paymentsService.getMy();
        setPayments(data);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lịch sử thanh toán</h1>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Chưa có giao dịch</h3>
            <p className="text-text-secondary">Lịch sử thanh toán sẽ hiển thị tại đây.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-text-secondary">
                  <th className="p-4 font-medium">Mã giao dịch</th>
                  <th className="p-4 font-medium">Gói</th>
                  <th className="p-4 font-medium">Số tiền</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const status = statusMap[p.status];
                  return (
                    <tr key={p.id} className="border-b border-border-default/50 hover:bg-surface-highlight/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-text-muted" />
                          <span className="font-mono text-xs">{p.transactionId || p.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="p-4">{p.subscription?.plan?.name || '—'}</td>
                      <td className="p-4 font-medium">{formatPrice(Number(p.amount))}</td>
                      <td className="p-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
