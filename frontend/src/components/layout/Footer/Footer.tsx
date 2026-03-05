import { Play } from 'lucide-react';

const footerSections = [
  {
    title: 'Công ty',
    links: [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Việc làm', href: '/jobs' },
      { label: 'Tin tức', href: '/press' },
    ],
  },
  {
    title: 'Cộng đồng',
    links: [
      { label: 'Dành cho Nghệ sĩ', href: '/artists' },
      { label: 'Nhà phát triển', href: '/developers' },
      { label: 'Quảng cáo', href: '/advertising' },
    ],
  },
  {
    title: 'Liên kết hữu ích',
    links: [
      { label: 'Hỗ trợ', href: '/support' },
      { label: 'Ứng dụng di động', href: '/mobile' },
      { label: 'Tài khoản', href: '/account' },
    ],
  },
  {
    title: 'Gói LOFIVE',
    links: [
      { label: 'Premium Individual', href: '/premium' },
      { label: 'Premium Student', href: '/student' },
      { label: 'Premium Family', href: '/family' },
      { label: 'LOFIVE Free', href: '/free' },
    ],
  },
];

const socialLinks = [
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export const Footer = () => {
  return (
    <footer className="bg-surface-base border-t border-border-default">
      <div className="max-w-360 mx-auto px-6 lg:px-12 py-12 md:py-16">
        {/* Top section: Logo + Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 group mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
              </div>
              <span className="text-xl font-bold">LOFIVE</span>
            </a>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border-default my-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Legal links */}
          <div className="flex flex-wrap gap-4 text-xs text-text-muted">
            <a href="/legal" className="hover:text-text-secondary transition-colors">Pháp lý</a>
            <a href="/privacy" className="hover:text-text-secondary transition-colors">Chính sách quyền riêng tư</a>
            <a href="/cookies" className="hover:text-text-secondary transition-colors">Cookie</a>
            <a href="/about-ads" className="hover:text-text-secondary transition-colors">Quảng cáo</a>
          </div>

          {/* Social + Copyright */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-input transition-all"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted mt-6 text-center md:text-left">
          © {new Date().getFullYear()} LOFIVE. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </footer>
  );
};
