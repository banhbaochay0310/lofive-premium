import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Play,
  LayoutDashboard,
  CreditCard,
  Receipt,
  ListMusic,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================
// Sidebar Navigation Items
// =====================

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const userNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Chọn gói', path: '/plans', icon: <ListMusic className="w-5 h-5" /> },
  { label: 'Gói đăng ký', path: '/subscriptions', icon: <CreditCard className="w-5 h-5" /> },
  { label: 'Lịch sử thanh toán', path: '/payments', icon: <Receipt className="w-5 h-5" /> },
  { label: 'Cài đặt', path: '/settings', icon: <Settings className="w-5 h-5" /> },
];

const adminNav: NavItem[] = [
  { label: 'Admin Dashboard', path: '/admin', icon: <ShieldCheck className="w-5 h-5" />, adminOnly: true },
  { label: 'Quản lý gói', path: '/admin/plans', icon: <ListMusic className="w-5 h-5" />, adminOnly: true },
  { label: 'Quản lý đăng ký', path: '/admin/subscriptions', icon: <CreditCard className="w-5 h-5" />, adminOnly: true },
  { label: 'Quản lý thanh toán', path: '/admin/payments', icon: <Receipt className="w-5 h-5" />, adminOnly: true },
  { label: 'Quản lý người dùng', path: '/admin/users', icon: <Users className="w-5 h-5" />, adminOnly: true },
];

// =====================
// Sidebar Link Component
// =====================

function SidebarLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard' || item.path === '/admin'}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-text-secondary hover:text-white hover:bg-surface-highlight'
        )
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
}

// =====================
// Dashboard Layout
// =====================

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-linear-to-b from-[#0a1f13] via-surface-base to-surface-base text-text-primary">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-border-default flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border-default">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">LOFIVE</span>
          </NavLink>
          <button onClick={closeSidebar} className="lg:hidden text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {userNav.map((item) => (
            <SidebarLink key={item.path} item={item} onClick={closeSidebar} />
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="pt-6 pb-2 px-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Admin
                </p>
              </div>
              {adminNav.map((item) => (
                <SidebarLink key={item.path} item={item} onClick={closeSidebar} />
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-border-default p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-surface-highlight flex items-center justify-center text-sm font-bold text-primary">
              {(user?.name || user?.email)?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
              <p className="text-xs text-text-muted">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="h-16 border-b border-border-default flex items-center px-6 lg:px-8 bg-surface-card/80 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 text-text-muted hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb placeholder */}
          <div className="flex items-center gap-1 text-sm text-text-muted">
            <span>LOFIVE</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Dashboard</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
