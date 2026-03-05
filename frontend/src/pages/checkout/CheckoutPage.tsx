import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, CheckCircle, XCircle, CreditCard, Loader2 } from 'lucide-react';
import subscriptionsService from '@/services/subscriptions.service';
import paymentsService from '@/services/payments.service';
import type { Subscription, Payment } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type CheckoutStep = 'review' | 'processing' | 'success' | 'failed';

export default function CheckoutPage() {
  useDocumentTitle('Thanh toán');
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [, setPayment] = useState<Payment | null>(null);
  const [step, setStep] = useState<CheckoutStep>('review');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!subscriptionId) return;
      try {
        const sub = await subscriptionsService.getById(subscriptionId);
        setSubscription(sub);

        // Check if payment already exists
        if (sub.payments && sub.payments.length > 0) {
          setPayment(sub.payments[0]);
          if (sub.payments[0].status === 'COMPLETED') setStep('success');
          else if (sub.payments[0].status === 'FAILED') setStep('failed');
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
        navigate('/plans');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subscriptionId, navigate]);

  const handlePay = async () => {
    if (!subscription || !subscription.plan) return;
    setStep('processing');

    try {
      // 1. Create payment
      const newPayment = await paymentsService.create({
        subscriptionId: subscription.id,
        amount: Number(subscription.plan.price),
        provider: 'stripe',
      });
      setPayment(newPayment);

      // 2. Simulate payment processing
      await paymentsService.simulate(newPayment.id);

      // 3. Send webhook (COMPLETED)
      await paymentsService.webhook(newPayment.id, 'COMPLETED');

      // 4. Refresh subscription to get updated status
      const updated = await subscriptionsService.getById(subscription.id);
      setSubscription(updated);
      setStep('success');
      toast.success('Thanh toán thành công!');
    } catch (error) {
      setStep('failed');
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

  if (!subscription) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Back */}
      <Link to="/plans" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại chọn gói
      </Link>

      <h1 className="text-2xl font-bold">Thanh toán</h1>

      {/* Order summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Tóm tắt đơn hàng</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Gói</span>
              <span className="font-medium">{subscription.plan?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Thời hạn</span>
              <span>{subscription.plan?.durationDays} ngày</span>
            </div>
            <div className="border-t border-border-default pt-3 flex justify-between">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(Number(subscription.plan?.price || 0))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment action */}
      {step === 'review' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Phương thức thanh toán</h3>
            <p className="text-sm text-text-secondary mb-4">
              Mock Payment Gateway — Thanh toán sẽ được xử lý tự động.
            </p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-highlight border border-border-default mb-6">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-sm">Thẻ tín dụng / Ghi nợ (Demo)</span>
            </div>
            <Button fullWidth size="lg" onClick={handlePay}>
              Thanh toán {formatPrice(Number(subscription.plan?.price || 0))}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'processing' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Đang xử lý thanh toán...</h3>
            <p className="text-sm text-text-secondary">Vui lòng đợi trong giây lát.</p>
          </CardContent>
        </Card>
      )}

      {step === 'success' && (
        <Card className="border-primary/30">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">Thanh toán thành công!</h3>
            <p className="text-sm text-text-secondary mb-2">
              Gói {subscription.plan?.name} đã được kích hoạt.
            </p>
            {subscription.endDate && (
              <p className="text-sm text-text-muted mb-6">
                Có hiệu lực đến: {new Date(subscription.endDate).toLocaleDateString('vi-VN')}
              </p>
            )}
            <Badge variant="success" className="mb-6">ACTIVE</Badge>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link to="/dashboard">
                <Button>Về Dashboard</Button>
              </Link>
              <Link to="/subscriptions">
                <Button variant="outline">Xem gói đăng ký</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'failed' && (
        <Card className="border-danger/30">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-danger mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">Thanh toán thất bại</h3>
            <p className="text-sm text-text-secondary mb-6">
              Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/plans">
                <Button>Thử lại</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline">Về Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
