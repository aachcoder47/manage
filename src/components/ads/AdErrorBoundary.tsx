'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AdErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only log ad-related errors in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Ad-related error caught (normal in development):', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%',
          maxWidth: '468px',
          margin: '20px auto',
          border: '2px solid #ff6b35',
          borderRadius: '8px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', marginBottom: '5px' }}>Advertisement</div>
            <div style={{ fontSize: '14px' }}>Ad space (protected)</div>
            {process.env.NODE_ENV === 'development' && (
              <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
                Error boundary active
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdErrorBoundary;
