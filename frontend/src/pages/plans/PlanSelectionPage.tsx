import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import plansService from '@/services/plans.service';
import subscriptionsService from '@/services/subscriptions.service';
import type { Plan } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const featuresByPlan: Record<string, { text: string; included: boolean }[]> = {
  default: [
    { text: 'Nghe nhạc không quảng cáo', included: true },
    { text: 'Nghe trên mọi thiết bị', included: true },
    { text: 'Tải xuống nghe offline', included: true },
    { text: 'Chất lượng âm thanh cao', included: true },
  ],
};

export default function PlanSelectionPage() {
  useDocumentTitle('Chọn gói');
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await plansService.getAll(true);
        setPlans(data);
      } catch {
        toast.error('Không thể tải danh sách gói');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    setSubscribing(plan.id);
    try {
      const subscription = await subscriptionsService.create(plan.id);
      toast.success(`Đã đăng ký gói ${plan.name}!`);
      navigate(`/checkout/${subscription.id}`, { state: { plan, subscription } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubscribing(null);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Chọn gói đăng ký</h1>
        <p className="text-text-secondary">Nghe nhạc không giới hạn. Hủy bất cứ lúc nào.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const features = featuresByPlan[plan.id] || featuresByPlan.default;

          return (
            <Card key={plan.id} className="flex flex-col hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">{formatPrice(Number(plan.price))}</span>
                  <span className="text-text-muted text-sm">/ {plan.durationDays} ngày</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="border-t border-border-default pt-4 mb-3">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    Tính năng
                  </p>
                  <ul className="space-y-2.5">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        {f.included ? (
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? 'text-sm' : 'text-sm text-text-muted line-through'}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  fullWidth
                  disabled={subscribing === plan.id}
                  onClick={() => handleSubscribe(plan)}
                >
                  {subscribing === plan.id ? 'Đang xử lý...' : `Chọn ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">Không có gói nào khả dụng.</p>
        </div>
      )}
    </div>
  );
}
