import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Các gói Premium', href: '#plans' },
    { label: 'Khám phá', href: '#features' },
    { label: 'Tải xuống', href: '/OIP.jpg', download: true },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-base/90 backdrop-blur-md border-b border-border-default">
      <div className="max-w-360 mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Lofive</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.download ? { download: 'capybara.jpg' } : {})}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="font-medium gap-2">
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium max-w-30 truncate">
                  {user.name || user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="font-medium gap-1 text-text-secondary hover:text-danger">
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link to="/register">
                <Button variant="ghost" size="sm">
                  Đăng ký
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Đăng nhập
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-card border-t border-border-default px-6 py-4 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.download ? { download: 'capybara.jpg' } : {})}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block text-text-secondary hover:text-text-primary py-2 font-medium"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border-default">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium truncate">{user.name || user.email}</span>
                </div>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" fullWidth className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" fullWidth onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" fullWidth>
                    Đăng ký
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" fullWidth>
                    Đăng nhập
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
