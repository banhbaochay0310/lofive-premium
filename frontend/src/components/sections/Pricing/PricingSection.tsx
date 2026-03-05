import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import plansService from '@/services/plans.service';
import subscriptionsService from '@/services/subscriptions.service';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  period: string;
  trial?: string;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'outline';
}

const plans: Plan[] = [
  {
    id: 'mini',
    name: 'Mini',
    tagline: 'Nghe nhạc mọi lúc, giá tiết kiệm',
    price: 4.99,
    period: '/tuần',
    features: [
      { text: 'Nghe nhạc không quảng cáo', included: true },
      { text: 'Nghe trên 1 thiết bị', included: true },
      { text: 'Tải xuống nghe offline', included: false },
      { text: 'Chất lượng âm thanh cao', included: false },
    ],
    buttonText: 'Bắt đầu Mini',
    buttonVariant: 'outline',
  },
  {
    id: 'individual',
    name: 'Individual',
    tagline: 'Gói hoàn hảo cho bạn',
    price: 9.99,
    period: '/tháng',
    trial: 'Dùng thử 3 tháng với giá $4.99',
    features: [
      { text: 'Nghe nhạc không quảng cáo', included: true },
      { text: 'Nghe trên mọi thiết bị', included: true },
      { text: 'Tải xuống nghe offline', included: true },
      { text: 'Chất lượng âm thanh cao', included: true },
    ],
    popular: true,
    buttonText: 'Bắt đầu ngay',
    buttonVariant: 'primary',
  },
  {
    id: 'student',
    name: 'Student',
    tagline: 'Ưu đãi dành cho sinh viên',
    price: 4.99,
    period: '/tháng',
    trial: 'Dùng thử 1 tháng miễn phí',
    features: [
      { text: 'Nghe nhạc không quảng cáo', included: true },
      { text: 'Nghe trên mọi thiết bị', included: true },
      { text: 'Tải xuống nghe offline', included: true },
      { text: 'Giảm giá đặc biệt cho SV', included: true },
    ],
    buttonText: 'Bắt đầu Student',
    buttonVariant: 'outline',
  },
];

export const PricingSection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handlePlanClick = async (planName: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubscribing(planName);
    try {
      // Fetch real plans from API and match by name
      const apiPlans = await plansService.getAll(true);
      const matchedPlan = apiPlans.find(
        (p) => p.name.toLowerCase() === planName.toLowerCase()
      );

      if (!matchedPlan) {
        toast.error('Gói này hiện không khả dụng');
        navigate('/plans');
        return;
      }

      // Create subscription and navigate to checkout
      const subscription = await subscriptionsService.create(matchedPlan.id);
      toast.success(`Đã đăng ký gói ${matchedPlan.name}!`);
      navigate(`/checkout/${subscription.id}`, {
        state: { plan: matchedPlan, subscription },
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubscribing(null);
    }
  };
  return (
    <section id="plans" className="py-20 md:py-28">
      <div className="max-w-360 mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Chọn gói của bạn
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Nghe nhạc không giới hạn. Hủy bất cứ lúc nào.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              highlighted={plan.popular}
              className="flex flex-col hover:bg-surface-elevated hover:-translate-y-1"
            >
              <CardHeader>
                {plan.popular && <Badge className="w-fit mb-2">Phổ biến nhất</Badge>}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-sm text-text-secondary">{plan.tagline}</p>
              </CardHeader>

              <CardContent className="flex flex-col flex-1">
                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                    <span className="text-text-muted text-sm">{plan.period}</span>
                  </div>
                  {plan.trial && (
                    <p className="text-sm text-primary mt-1">{plan.trial}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-border-default my-4" />

                {/* Features */}
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Có gì trong gói này
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-white text-sm' : 'text-text-muted text-sm line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  variant={plan.buttonVariant}
                  fullWidth
                  size="md"
                  disabled={subscribing === plan.name}
                  onClick={() => handlePlanClick(plan.name)}
                >
                  {subscribing === plan.name ? 'Đang xử lý...' : plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Fine print */}
        <p className="text-center text-xs text-text-muted mt-8 max-w-2xl mx-auto">
          Giá trên đã bao gồm thuế. Ưu đãi dùng thử chỉ áp dụng cho người dùng chưa từng sử dụng Premium.{' '}
          <a href="#terms" className="underline hover:text-text-secondary transition-colors">Điều khoản áp dụng</a>.
        </p>
      </div>
    </section>
  );
};
