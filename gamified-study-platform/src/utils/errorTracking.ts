/**
 * Error tracking and logging utilities for production monitoring
 */

import React from 'react';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  RUNTIME = 'runtime',
  PERFORMANCE = 'performance',
  USER_ACTION = 'user_action'
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp?: number;
  userAgent?: string;
  url?: string;
}

// Error report interface
export interface ErrorReport {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  fingerprint?: string;
}

class ErrorTracker {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorReport[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupNetworkStatusHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(
        new Error(event.message),
        ErrorSeverity.HIGH,
        ErrorCategory.RUNTIME,
        {
          component: 'global',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        ErrorSeverity.HIGH,
        ErrorCategory.RUNTIME,
        {
          component: 'promise',
          metadata: {
            reason: event.reason
          }
        }
      );
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        this.captureError(
          new Error(`Resource failed to load: ${target.tagName}`),
          ErrorSeverity.MEDIUM,
          ErrorCategory.NETWORK,
          {
            component: 'resource-loader',
            metadata: {
              tagName: target.tagName,
              src: (target as any).src || (target as any).href,
              outerHTML: target.outerHTML
            }
          }
        );
      }
    }, true);
  }

  private setupNetworkStatusHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Set user ID for error context
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Capture and report an error
  captureError(
    error: Error,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.RUNTIME,
    context: Partial<ErrorContext> = {}
  ) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      severity,
      category,
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        route: window.location.pathname,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
      fingerprint: this.generateFingerprint(error, context)
    };

    // Add to queue
    this.errorQueue.push(errorReport);

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorReport);
    }
  }

  // Generate error fingerprint for deduplication
  private generateFingerprint(error: Error, context: Partial<ErrorContext>): string {
    const key = `${error.message}_${context.component}_${context.route}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
  }

  // Flush error queue to remote service
  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // Send to error tracking service (e.g., Sentry, LogRocket, custom endpoint)
      await this.sendToErrorService(errors);
    } catch (sendError) {
      // If sending fails, put errors back in queue
      this.errorQueue.unshift(...errors);
      console.warn('Failed to send errors to tracking service:', sendError);
    }
  }

  private async sendToErrorService(errors: ErrorReport[]) {
    // Example: Send to custom error tracking endpoint
    if (navigator.sendBeacon) {
      const data = JSON.stringify({ errors });
      const sent = navigator.sendBeacon('/api/errors', data);
      if (!sent) {
        throw new Error('Failed to send via beacon');
      }
    } else {
      // Fallback to fetch
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
  }

  // Capture user action for context
  captureUserAction(action: string, metadata?: Record<string, any>) {
    // Store recent user actions for error context
    const userAction = {
      action,
      metadata,
      timestamp: Date.now(),
      route: window.location.pathname
    };

    // Store in session storage for persistence
    const recentActions = this.getRecentUserActions();
    recentActions.push(userAction);
    
    // Keep only last 10 actions
    if (recentActions.length > 10) {
      recentActions.shift();
    }

    sessionStorage.setItem('recent_user_actions', JSON.stringify(recentActions));
  }

  private getRecentUserActions(): any[] {
    try {
      const stored = sessionStorage.getItem('recent_user_actions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Get error statistics
  getErrorStats() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      queuedErrors: this.errorQueue.length,
      isOnline: this.isOnline
    };
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Utility functions for error handling

// Async error boundary wrapper
export const withErrorBoundary = async <T>(
  fn: () => Promise<T>,
  context: Partial<ErrorContext> = {}
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    errorTracker.captureError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      ErrorCategory.RUNTIME,
      context
    );
    throw error;
  }
};

// Network request error wrapper
export const withNetworkErrorHandling = async <T>(
  request: () => Promise<T>,
  context: Partial<ErrorContext> = {}
): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    const severity = error instanceof TypeError ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
    
    errorTracker.captureError(
      error instanceof Error ? error : new Error(String(error)),
      severity,
      ErrorCategory.NETWORK,
      {
        ...context,
        metadata: {
          ...context.metadata,
          networkStatus: navigator.onLine ? 'online' : 'offline'
        }
      }
    );
    throw error;
  }
};

// Form validation error handler
export const captureValidationError = (
  field: string,
  message: string,
  formData?: Record<string, any>
) => {
  errorTracker.captureError(
    new Error(`Validation error: ${message}`),
    ErrorSeverity.LOW,
    ErrorCategory.VALIDATION,
    {
      component: 'form-validation',
      action: 'validate-field',
      metadata: {
        field,
        formData: formData ? Object.keys(formData) : undefined // Don't log actual form data for privacy
      }
    }
  );
};

// Authentication error handler
export const captureAuthError = (
  action: string,
  error: Error,
  context?: Record<string, any>
) => {
  errorTracker.captureError(
    error,
    ErrorSeverity.HIGH,
    ErrorCategory.AUTHENTICATION,
    {
      component: 'auth',
      action,
      metadata: context
    }
  );
};

// Performance error handler
export const capturePerformanceError = (
  metric: string,
  value: number,
  threshold: number
) => {
  if (value > threshold) {
    errorTracker.captureError(
      new Error(`Performance threshold exceeded: ${metric}`),
      ErrorSeverity.MEDIUM,
      ErrorCategory.PERFORMANCE,
      {
        component: 'performance-monitor',
        metadata: {
          metric,
          value,
          threshold,
          exceedBy: value - threshold
        }
      }
    );
  }
};

// Initialize error tracking
export const initializeErrorTracking = (userId?: string) => {
  if (userId) {
    errorTracker.setUserId(userId);
  }

  // Capture initial page load
  errorTracker.captureUserAction('page-load', {
    url: window.location.href,
    referrer: document.referrer,
    timestamp: Date.now()
  });

  // Set up periodic error queue flush
  setInterval(() => {
    if (navigator.onLine) {
      errorTracker.flushErrorQueue();
    }
  }, 30000); // Every 30 seconds
};

// React Error Boundary helper
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.captureError(
      error,
      ErrorSeverity.HIGH,
      ErrorCategory.RUNTIME,
      {
        component: 'react-error-boundary',
        metadata: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      }
    );
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }
      
      return (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600">
            We've been notified about this error and will fix it soon.
          </p>
          <button
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}