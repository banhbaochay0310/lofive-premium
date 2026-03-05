import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Play, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-base px-4">
          <div className="text-center max-w-md">
            {/* Logo */}
            <a href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">LOFIVE</span>
            </a>

            <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">Đã xảy ra lỗi</h1>
            <p className="text-text-secondary mb-2">
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 p-3 rounded-lg bg-surface-card border border-border-default text-xs text-danger text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-black font-bold hover:bg-primary-hover transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Thử lại
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full border border-neutral-500 text-white font-bold hover:border-white transition-all"
              >
                <Home className="w-4 h-4" /> Trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
