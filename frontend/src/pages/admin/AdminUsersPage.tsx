import { useState, useEffect } from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Search,
  Trash2,
  ArrowUpDown,
  Eye,
  X,
  CreditCard,
} from 'lucide-react';
import usersService from '@/services/users.service';
import type { User, UserStats, UserWithSubscriptions, UserRole } from '@/types';
import { getErrorMessage } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

// =====================
// Stat Card Component
// =====================

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================
// User Detail Modal
// =====================

function UserDetailModal({
  user,
  onClose,
}: {
  user: UserWithSubscriptions;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface-card border border-border-default rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default">
          <h3 className="text-lg font-semibold">Chi tiết người dùng</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user.email}</p>
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="mt-1">
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-text-secondary">ID</p>
              <p className="font-mono text-xs break-all">{user.id}</p>
            </div>
            <div>
              <p className="text-text-secondary">Ngày tạo</p>
              <p>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="pt-4 border-t border-border-default">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Gói đăng ký ({user.subscriptions.length})
            </h4>

            {user.subscriptions.length === 0 ? (
              <p className="text-sm text-text-secondary">Chưa có gói đăng ký nào</p>
            ) : (
              <div className="space-y-2">
                {user.subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-highlight/50 text-sm"
                  >
                    <div>
                      <p className="font-medium">{sub.plan.name}</p>
                      <p className="text-text-secondary text-xs">
                        {formatPrice(Number(sub.plan.price))} / {sub.plan.durationDays} ngày
                      </p>
                    </div>
                    <Badge
                      variant={
                        sub.status === 'ACTIVE'
                          ? 'success'
                          : sub.status === 'PENDING'
                          ? 'warning'
                          : sub.status === 'CANCELED'
                          ? 'secondary'
                          : 'danger'
                      }
                    >
                      {sub.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

// =====================
// Main Page
// =====================

export default function AdminUsersPage() {
  useDocumentTitle('Quản lý người dùng');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [detailUser, setDetailUser] = useState<UserWithSubscriptions | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        usersService.getAll(),
        usersService.getStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter users by search and role
  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // View user detail
  const viewDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const user = await usersService.getById(id);
      setDetailUser(user);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  };

  // Toggle role
  const toggleRole = async (user: User) => {
    const newRole: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'nâng cấp lên Admin' : 'hạ xuống User';
    if (!confirm(`Bạn có chắc muốn ${action} cho ${user.email}?`)) return;

    try {
      await usersService.updateRole(user.id, newRole);
      toast.success(`Đã ${action} cho ${user.email}`);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Delete user
  const handleDelete = async (user: User) => {
    if (!confirm(`Bạn có chắc muốn XÓA người dùng ${user.email}? Hành động này không thể hoàn tác.`)) return;

    try {
      await usersService.deleteUser(user.id);
      toast.success(`Đã xóa người dùng ${user.email}`);
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
      <h1 className="text-2xl font-bold">Quản lý người dùng</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Tổng người dùng" value={stats.total} color="bg-primary/20 text-primary" />
          <StatCard icon={ShieldCheck} label="Admin" value={stats.admins} color="bg-amber-500/20 text-amber-400" />
          <StatCard icon={UserCheck} label="User" value={stats.users} color="bg-blue-500/20 text-blue-400" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm theo email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-card border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'USER', 'ADMIN'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-primary text-black'
                  : 'bg-surface-card text-text-secondary hover:text-white border border-border-default'
              }`}
            >
              {role === 'ALL' ? 'Tất cả' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-text-secondary">
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Vai trò</th>
                <th className="p-4 font-medium">Ngày tạo</th>
                <th className="p-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-secondary">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border-default/50 hover:bg-surface-highlight/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium truncate max-w-50">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-text-secondary">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => viewDetail(user.id)}
                          className="p-1.5 rounded hover:bg-surface-highlight text-text-secondary hover:text-white transition-colors"
                          title="Xem chi tiết"
                        >
                          {detailLoading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleRole(user)}
                          className="p-1.5 rounded hover:bg-amber-500/10 text-text-secondary hover:text-amber-400 transition-colors"
                          title={user.role === 'ADMIN' ? 'Hạ xuống User' : 'Nâng lên Admin'}
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 rounded hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors"
                          title="Xóa người dùng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Result count */}
      <p className="text-sm text-text-secondary">
        Hiển thị {filtered.length} / {users.length} người dùng
      </p>

      {/* Detail Modal */}
      {detailUser && (
        <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />
      )}
    </div>
  );
}
