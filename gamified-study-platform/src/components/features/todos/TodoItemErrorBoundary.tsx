import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  todoId: string;
  onRemove?: (todoId: string) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TodoItemErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `TodoItemErrorBoundary caught an error for todo ${this.props.todoId}:`,
      error,
      errorInfo
    );

    // Log specific todo item errors
    if (process.env.NODE_ENV === 'production') {
      console.error('Production error in TodoItemErrorBoundary:', {
        todoId: this.props.todoId,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleRemove = () => {
    if (this.props.onRemove) {
      this.props.onRemove(this.props.todoId);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Error loading todo item
              </h4>

              <p className="text-xs text-yellow-600 dark:text-yellow-300 mb-3">
                {this.state.error?.message ||
                  'This todo item encountered an error and cannot be displayed.'}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Retry
                </button>

                {this.props.onRemove && (
                  <button
                    onClick={this.handleRemove}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Hide
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
