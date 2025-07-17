import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (e.g., Sentry)
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Placeholder for error tracking service integration
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Store in localStorage as fallback
    try {
      const existingErrors = JSON.parse(
        localStorage.getItem('app_errors') || '[]'
      );
      existingErrors.push(errorData);
      localStorage.setItem(
        'app_errors',
        JSON.stringify(existingErrors.slice(-10))
      ); // Keep last 10 errors
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // Create mailto link with error details
    const subject = encodeURIComponent('Bug Report - Gamified Study Platform');
    const body = encodeURIComponent(`
Error Details:
${JSON.stringify(errorReport, null, 2)}

Please describe what you were doing when this error occurred:
[Your description here]
    `);

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Oops! Something went wrong
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-300 mb-8"
            >
              We encountered an unexpected error. Don't worry, your progress is
              safe!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </button>

              <button
                onClick={this.handleReportBug}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Bug className="w-4 h-4" />
                Report Bug
              </button>
            </motion.div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-left"
              >
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </motion.details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Feature-specific error boundaries
export const StudySessionErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    fallback={
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200 font-medium">
          Study Session Error
        </p>
        <p className="text-red-600 dark:text-red-300 text-sm mt-1">
          There was an issue with your study session. Please refresh the page.
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const PetInteractionErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    fallback={
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
          Pet System Error
        </p>
        <p className="text-yellow-600 dark:text-yellow-300 text-sm mt-1">
          Your pet is taking a nap. Try refreshing the page to wake them up!
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const QuestSystemErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    fallback={
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <p className="text-purple-800 dark:text-purple-200 font-medium">
          Quest System Error
        </p>
        <p className="text-purple-600 dark:text-purple-300 text-sm mt-1">
          The quest board is temporarily unavailable. Your progress is safe!
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);
