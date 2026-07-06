import { App } from './App.tsx';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OnlineStatusProvider } from '@/components/OnlineStatusProvider';
import { GlobalErrorFallback } from '@/components/ui/GlobalErrorFallback';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OnlineStatusProvider>
      <AuthGuard>
        <BrowserRouter>
          <ErrorBoundary
            fallbackRender={GlobalErrorFallback}
            onReset={() => window.location.reload()}
          >
            <App />
          </ErrorBoundary>
        </BrowserRouter>
      </AuthGuard>
    </OnlineStatusProvider>
  </React.StrictMode>,
);
