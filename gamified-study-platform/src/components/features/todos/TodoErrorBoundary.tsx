import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class TodoErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TodoErrorBoundary caught an error:', error, errorInfo);

    // Store error info for debugging
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you could send to error tracking service like Sentry
      console.error('Production error in TodoErrorBoundary:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // Force page reload after max retries
      window.location.reload();
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isMaxRetriesReached = this.state.retryCount >= this.maxRetries;

      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                Something went wrong with the todo component
              </h3>

              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                {this.state.error?.message ||
                  'An unexpected error occurred while loading the todo list.'}
              </p>

              {this.state.retryCount > 0 && (
                <p className="text-xs text-red-500 dark:text-red-400 mb-4">
                  Retry attempt: {this.state.retryCount} of {this.maxRetries}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={this.handleRetry}
                  disabled={isMaxRetriesReached}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isMaxRetriesReached ? 'Reload Page' : 'Try Again'}
                </button>

                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' &&
                this.state.errorInfo && (
                  <details className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded border">
                    <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                      <Bug className="h-4 w-4" />
                      Debug Information
                    </summary>
                    <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                      <div className="mb-2">
                        <strong>Error:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.error?.stack}
                        </pre>
                      </div>
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  </details>
                )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
