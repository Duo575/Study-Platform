import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class DetailedErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Detailed Error Boundary caught an error:', error);
    console.error('🚨 Error Info:', errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Application Error
              </h1>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Error Details:
              </h2>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 overflow-auto">
                {this.state.error?.message || 'Unknown error occurred'}
              </div>
            </div>

            {this.state.error?.stack && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Stack Trace:
                </h2>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-600 overflow-auto max-h-40">
                  {this.state.error.stack}
                </div>
              </div>
            )}

            {this.state.errorInfo?.componentStack && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Component Stack:
                </h2>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-600 overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() =>
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                  })
                }
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  console.log('Error details:', {
                    error: this.state.error,
                    errorInfo: this.state.errorInfo,
                  });
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Log to Console
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>Quick Fix:</strong> This error has been logged to the
                console. Open Developer Tools (F12) to see more details.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
