import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Kindle 体验模式 / 出错提示</h2>
          <p style={{ fontSize: '14px', color: '#666', margin: '10px 0' }}>
            {this.state.error?.message || '组件渲染遇到未知兼容问题'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              border: '2px solid #000',
              background: '#fff',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            刷新重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const isForceKindle = typeof window !== 'undefined' && (
  window.location.search.indexOf('mode=kindle') !== -1 || 
  localStorage.getItem('desk_clock_force_kindle') === 'true'
);

if (isForceKindle) {
  console.log('Kindle Standalone ES5 Mode is force-enabled.');
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
