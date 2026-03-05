import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { getErrorMessage } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  useDocumentTitle('Đăng ký');
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = 'Tên không được để trống';
    else if (name.trim().length < 2) newErrors.name = 'Tên phải có ít nhất 2 ký tự';

    if (!email.trim()) newErrors.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email không hợp lệ';

    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    else if (password.length < 8) newErrors.password = 'Mật khẩu tối thiểu 8 ký tự';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Cần ít nhất 1 chữ hoa';
    else if (!/[0-9]/.test(password)) newErrors.password = 'Cần ít nhất 1 số';

    if (!confirmPassword) newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      toast.success('Đăng ký thành công!');
      navigate('/dashboard', { replace: true });
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
          <h1 className="text-2xl font-bold text-center mb-8">Tạo tài khoản</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Tên hiển thị"
              type="text"
              placeholder="Nhập tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoComplete="name"
              autoFocus
            />

            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-text-muted text-sm">Đã có tài khoản? </span>
            <Link
              to="/login"
              className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
