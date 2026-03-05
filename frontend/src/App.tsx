import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { router } from '@/router';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#181818',
            color: '#fff',
            border: '1px solid #282828',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#1db954', secondary: '#000' },
          },
          error: {
            iconTheme: { primary: '#e22134', secondary: '#fff' },
          },
        }}
      />
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
