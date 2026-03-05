import { Link } from 'react-router-dom';
import { Play, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('404 - Không tìm thấy');
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">LOFIVE</span>
        </Link>

        {/* 404 */}
        <h1 className="text-8xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-3">Không tìm thấy trang</h2>
        <p className="text-text-secondary mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đến địa chỉ khác.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" /> Trang chủ
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}
