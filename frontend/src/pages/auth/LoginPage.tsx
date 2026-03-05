import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { getErrorMessage } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function LoginPage() {
  useDocumentTitle('Đăng nhập');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">LOFIVE</span>
        </Link>

        {/* Card */}
        <div className="bg-surface-card rounded-xl p-8 border border-border-default">
          <h1 className="text-2xl font-bold text-center mb-8">Đăng nhập</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-text-muted text-sm">Chưa có tài khoản? </span>
            <Link
              to="/register"
              className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Test accounts hint (dev only) */}
        {import.meta.env.DEV && (
        <div className="mt-6 p-4 rounded-lg bg-surface-elevated border border-border-default">
          <p className="text-xs text-text-muted mb-2 font-semibold">Tài khoản test:</p>
          <p className="text-xs text-text-secondary">Admin: admin@subscription.com / Admin123!</p>
          <p className="text-xs text-text-secondary">User: user@test.com / Test123!</p>
        </div>
        )}
      </div>
    </div>
  );
}
