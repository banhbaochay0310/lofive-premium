import { useState } from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { User, Mail, Shield, Calendar, KeyRound, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usersService from '@/services/users.service';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function SettingsPage() {
  useDocumentTitle('Cài đặt');
  const { user, refreshUser } = useAuth();

  // Name form state
  const [name, setName] = useState(user?.name || '');
  const [nameSubmitting, setNameSubmitting] = useState(false);

  // Email form state
  const [email, setEmail] = useState(user?.email || '');
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  if (!user) return null;

  const infoRows = [
    { icon: User, label: 'Tên', value: user.name || '(Chưa đặt tên)' },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Shield, label: 'Vai trò', value: user.role, badge: true },
    { icon: Calendar, label: 'Ngày tạo', value: new Date(user.createdAt).toLocaleDateString('vi-VN') },
  ];

  // Handle name update
  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === (user.name || '')) {
      toast.error('Tên mới phải khác tên hiện tại');
      return;
    }
    if (name.trim().length < 2) {
      toast.error('Tên phải có ít nhất 2 ký tự');
      return;
    }
    setNameSubmitting(true);
    try {
      await usersService.updateProfile({ name: name.trim() });
      await refreshUser();
      toast.success('Cập nhật tên thành công');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setNameSubmitting(false);
    }
  };

  // Handle email update
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === user.email) {
      toast.error('Email mới phải khác email hiện tại');
      return;
    }
    setEmailSubmitting(true);
    try {
      await usersService.updateProfile({ email });
      await refreshUser();
      toast.success('Cập nhật email thành công');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEmailSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    setPasswordSubmitting(true);
    try {
      await usersService.changePassword(currentPassword, newPassword);
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Cài đặt tài khoản</h1>

      {/* Profile Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.name || user.email}</h3>
              <p className="text-sm text-text-secondary">{user.email}</p>
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="mt-1">
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-center gap-3 py-3 border-b border-border-default/50 last:border-0">
                <row.icon className="w-5 h-5 text-text-muted" />
                <span className="text-sm text-text-secondary w-24">{row.label}</span>
                {row.badge ? (
                  <Badge variant={row.value === 'ADMIN' ? 'default' : 'secondary'}>{row.value}</Badge>
                ) : (
                  <span className="text-sm font-medium">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Update Name */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Thay đổi tên hiển thị
          </h3>
          <form onSubmit={handleNameUpdate} className="space-y-4">
            <Input
              label="Tên mới"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên hiển thị"
              required
            />
            <Button type="submit" disabled={nameSubmitting || name.trim() === (user.name || '')}>
              {nameSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Cập nhật tên
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Update Email */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Thay đổi email
          </h3>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <Input
              label="Email mới"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
            <Button type="submit" disabled={emailSubmitting || email === user.email}>
              {emailSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Cập nhật email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Đổi mật khẩu
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              required
            />
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
            <Button type="submit" disabled={passwordSubmitting || !currentPassword || !newPassword || !confirmPassword}>
              {passwordSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <KeyRound className="w-4 h-4 mr-1" />
              )}
              Đổi mật khẩu
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
