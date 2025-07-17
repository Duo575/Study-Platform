import React, { useEffect } from 'react';
import { useFeedback } from '../feedback/FeedbackSystem';

/**
 * Global error handling integration
 * This component sets up global error handlers and integrates with the feedback system
 */
export const ErrorIntegration: React.FC = () => {
  const { addMessage } = useFeedback();

  useEffect(() => {
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Show user-friendly error message
      addMessage({
        type: 'error',
        title: 'Something went wrong',
        message: 'We encountered an unexpected error. Please try again.',
        action: {
          label: 'Reload Page',
          onClick: () => window.location.reload()
        },
        duration: 8000
      });

      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Global error handler for JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      // Only show error message for non-development environments
      if (process.env.NODE_ENV === 'production') {
        addMessage({
          type: 'error',
          title: 'Application Error',
          message: 'An unexpected error occurred. The page will reload automatically.',
          duration: 5000
        });

        // Auto-reload after a delay in production
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    };

    // Network error handler
    const handleNetworkError = () => {
      addMessage({
        type: 'warning',
        title: 'Connection Issue',
        message: 'Please check your internet connection and try again.',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        },
        duration: 10000
      });
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('offline', handleNetworkError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('offline', handleNetworkError);
    };
  }, [addMessage]);

  // Online/offline status handler
  useEffect(() => {
    const handleOnline = () => {
      addMessage({
        type: 'success',
        title: 'Back Online',
        message: 'Your connection has been restored.',
        duration: 3000
      });
    };

    const handleOffline = () => {
      addMessage({
        type: 'warning',
        title: 'You\'re Offline',
        message: 'Some features may be limited. Your progress will sync when you\'re back online.',
        persistent: true
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addMessage]);

  return null; // This component doesn't render anything
};

/**
 * API error handler utility
 */
export const handleAPIError = (error: any, addMessage: any) => {
  console.error('API Error:', error);

  let title = 'Request Failed';
  let message = 'Please try again later.';

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    
    switch (status) {
      case 400:
        title = 'Invalid Request';
        message = 'Please check your input and try again.';
        break;
      case 401:
        title = 'Authentication Required';
        message = 'Please log in to continue.';
        break;
      case 403:
        title = 'Access Denied';
        message = 'You don\'t have permission to perform this action.';
        break;
      case 404:
        title = 'Not Found';
        message = 'The requested resource could not be found.';
        break;
      case 429:
        title = 'Too Many Requests';
        message = 'Please wait a moment before trying again.';
        break;
      case 500:
        title = 'Server Error';
        message = 'Our servers are experiencing issues. Please try again later.';
        break;
      default:
        title = `Error ${status}`;
        message = error.response.data?.message || 'An unexpected error occurred.';
    }
  } else if (error.request) {
    // Network error
    title = 'Network Error';
    message = 'Please check your internet connection and try again.';
  }

  addMessage({
    type: 'error',
    title,
    message,
    duration: 6000
  });
};

/**
 * Form validation error handler
 */
export const handleValidationErrors = (errors: Record<string, string>, addMessage: any) => {
  const errorMessages = Object.values(errors);
  
  if (errorMessages.length === 1) {
    addMessage({
      type: 'error',
      title: 'Validation Error',
      message: errorMessages[0],
      duration: 5000
    });
  } else if (errorMessages.length > 1) {
    addMessage({
      type: 'error',
      title: 'Multiple Validation Errors',
      message: `Please fix ${errorMessages.length} errors in the form.`,
      duration: 6000
    });
  }
};

/**
 * Success message handler
 */
export const handleSuccess = (title: string, message?: string, addMessage?: any) => {
  if (addMessage) {
    addMessage({
      type: 'success',
      title,
      message,
      duration: 4000
    });
  }
};

/**
 * Loading state handler
 */
export const handleLoading = (title: string, message?: string, addMessage?: any) => {
  if (addMessage) {
    return addMessage({
      type: 'loading',
      title,
      message,
      persistent: true
    });
  }
  return null;
};

/**
 * Custom hook for integrated error handling
 */
export const useErrorHandler = () => {
  const { addMessage, removeMessage } = useFeedback();

  return {
    handleAPIError: (error: any) => handleAPIError(error, addMessage),
    handleValidationErrors: (errors: Record<string, string>) => 
      handleValidationErrors(errors, addMessage),
    handleSuccess: (title: string, message?: string) => 
      handleSuccess(title, message, addMessage),
    handleLoading: (title: string, message?: string) => 
      handleLoading(title, message, addMessage),
    removeMessage,
    addMessage
  };
};

/**
 * Retry mechanism for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

/**
 * Debounced error handler to prevent spam
 */
export const createDebouncedErrorHandler = (
  handler: (error: any) => void,
  delay: number = 1000
) => {
  let timeoutId: NodeJS.Timeout;
  const errorCounts = new Map<string, number>();

  return (error: any) => {
    const errorKey = error.message || error.toString();
    const count = errorCounts.get(errorKey) || 0;

    // Don't show the same error more than 3 times in a short period
    if (count >= 3) {
      return;
    }

    errorCounts.set(errorKey, count + 1);

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      handler(error);
      
      // Reset error count after delay
      setTimeout(() => {
        errorCounts.delete(errorKey);
      }, 30000); // Reset after 30 seconds
    }, delay);
  };
};