import React, { useEffect, useState } from 'react';
import { useTodoSelectors } from '../store/todoStore';
import { TodoList } from '../components/features/todos/TodoList';
import { TodoFilters } from '../components/features/todos/TodoFilters';
import { TodoStats } from '../components/features/todos/TodoStats';
import { CreateTodoModal } from '../components/features/todos/CreateTodoModal';
import { TodoErrorBoundary } from '../components/features/todos/TodoErrorBoundary';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { XPAnimation } from '../components/gamification/XPAnimation';
import { PerformanceDashboard } from '../components/features/todos/PerformanceDashboard';
import {
  Plus,
  ListTodo,
  Target,
  Clock,
  AlertTriangle,
  Activity,
} from 'lucide-react';

export const TodoPage: React.FC = () => {
  const {
    todos,
    isLoading,
    error,
    stats,
    currentPage,
    totalPages,
    fetchTodos,
    fetchStats,
    clearError,
    hasActiveFilters,
  } = useTodoSelectors();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPerformanceDashboardOpen, setIsPerformanceDashboardOpen] =
    useState(false);
  const [xpAnimation, setXpAnimation] = useState<{
    show: boolean;
    amount: number;
  }>({
    show: false,
    amount: 0,
  });

  // Fetch todos and stats on component mount
  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [fetchTodos, fetchStats]);

  const handleTodoToggle = async (xpEarned: number) => {
    if (xpEarned > 0) {
      setXpAnimation({ show: true, amount: xpEarned });
      setTimeout(() => setXpAnimation({ show: false, amount: 0 }), 3000);
    }
  };

  const handlePageChange = (page: number) => {
    fetchTodos(page);
  };

  if (isLoading && todos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-blue-600" />
            Smart Todo List
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your tasks and earn XP for completing them
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Performance Dashboard Button (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              onClick={() => setIsPerformanceDashboardOpen(true)}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Performance
            </Button>
          )}

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Todo
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={clearError}
        />
      )}

      {/* XP Animation */}
      {xpAnimation.show && (
        <XPAnimation
          xpAmount={xpAnimation.amount}
          onComplete={() => setXpAnimation({ show: false, amount: 0 })}
        />
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ListTodo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Tasks
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stats.completionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Est. Time
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {Math.round(stats.totalEstimatedTime / 60)}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overdue
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stats.overdue}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <TodoFilters />

      {/* Todo List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {todos.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="h-12 w-12 text-gray-400" />}
            title={
              hasActiveFilters()
                ? 'No todos match your filters'
                : 'No todos yet'
            }
            description={
              hasActiveFilters()
                ? 'Try adjusting your filters to see more todos.'
                : 'Create your first todo to get started with organizing your tasks.'
            }
            action={
              !hasActiveFilters() ? (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Todo
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TodoErrorBoundary>
            <TodoList
              todos={todos}
              onToggle={handleTodoToggle}
              isLoading={isLoading}
            />
          </TodoErrorBoundary>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Todo Modal */}
      <CreateTodoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Performance Dashboard */}
      <PerformanceDashboard
        isOpen={isPerformanceDashboardOpen}
        onClose={() => setIsPerformanceDashboardOpen(false)}
      />
    </div>
  );
};
