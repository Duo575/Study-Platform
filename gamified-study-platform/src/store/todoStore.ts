import React from 'react';
import { create } from 'zustand';
import { mockTodoService, MOCK_MODE } from '../services/mockDatabase';
import { TodoItem } from '../types';
import {
  performanceMonitor,
  withPerformanceTracking,
} from '../utils/performanceMonitor';

// Helper function to add timeout to async operations
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 5000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
};

// Helper function to calculate XP earned from completing a todo
const calculateTodoXP = (todo: TodoItem): number => {
  let baseXP = 10; // Base XP for completing any todo

  // Priority multiplier
  const priorityMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2,
  };

  // Time-based bonus (more XP for longer tasks)
  const timeBonus = Math.floor((todo.estimatedMinutes || 0) / 30) * 5; // 5 XP per 30 minutes

  const totalXP =
    Math.floor(baseXP * priorityMultiplier[todo.priority]) + timeBonus;

  return Math.max(totalXP, 5); // Minimum 5 XP
};

interface TodoFilters {
  search: string;
  priority: 'all' | 'low' | 'medium' | 'high';
  status: 'all' | 'completed' | 'pending';
  courseId?: string;
}

interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  totalEstimatedTime: number;
}

interface TodoState {
  todos: TodoItem[];
  isLoading: boolean;
  error: string | null;
  filters: TodoFilters;
  currentPage: number;
  totalPages: number;
  pendingOperations: Set<string>; // Track pending operations by todo ID

  // Actions
  fetchTodos: (page?: number) => Promise<void>;
  createTodo: (todoData: Partial<TodoItem>) => Promise<TodoItem | null>;
  updateTodo: (
    id: string,
    todoData: Partial<TodoItem>
  ) => Promise<TodoItem | null>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (
    id: string
  ) => Promise<{ todo: TodoItem | null; xpEarned: number }>;
  setFilters: (filters: Partial<TodoFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    priority: 'all',
    status: 'all',
    courseId: undefined,
  },
  currentPage: 1,
  totalPages: 1,
  pendingOperations: new Set<string>(),

  fetchTodos: async () => {
    return withPerformanceTracking('fetchTodos', async () => {
      try {
        set({ isLoading: true, error: null });
        console.log('🔧 Using mock todo data');
        const todosData = await withTimeout(
          mockTodoService.getByUserId('mock-user'),
          5000
        );
        set({ todos: todosData, isLoading: false });
      } catch (error) {
        console.error('Error fetching todos:', error);
        set({ error: 'Failed to load todos', isLoading: false });
        throw error;
      }
    });
  },

  createTodo: async todoData => {
    return withPerformanceTracking('createTodo', async () => {
      try {
        set({ isLoading: true, error: null });
        console.log('🔧 Creating todo with mock data');
        const newTodo = await withTimeout(
          mockTodoService.create(todoData),
          5000
        );

        // Add to local state
        const { todos } = get();
        set({ todos: [...todos, newTodo], isLoading: false });

        return newTodo;
      } catch (error) {
        console.error('Error creating todo:', error);
        set({ error: 'Failed to create todo', isLoading: false });
        throw error;
      }
    }).catch(() => null);
  },

  updateTodo: async (id, todoData) => {
    return withPerformanceTracking('updateTodo', async () => {
      try {
        set({ isLoading: true, error: null });
        console.log('🔧 Updating todo with mock data');
        const updatedTodo = await withTimeout(
          mockTodoService.update(id, todoData),
          5000
        );

        if (updatedTodo) {
          // Update local state
          const { todos } = get();
          const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, ...todoData } : todo
          );
          set({ todos: updatedTodos, isLoading: false });
          return updatedTodo;
        }

        set({ isLoading: false });
        return null;
      } catch (error) {
        console.error('Error updating todo:', error);
        set({ error: 'Failed to update todo', isLoading: false });
        throw error;
      }
    }).catch(() => null);
  },

  deleteTodo: async id => {
    return withPerformanceTracking('deleteTodo', async () => {
      try {
        set({ isLoading: true, error: null });
        console.log('🔧 Deleting todo with mock data');
        await withTimeout(mockTodoService.delete(id), 5000);

        // Remove from local state
        const { todos } = get();
        const updatedTodos = todos.filter(todo => todo.id !== id);
        set({ todos: updatedTodos, isLoading: false });
      } catch (error) {
        console.error('Error deleting todo:', error);
        set({ error: 'Failed to delete todo', isLoading: false });
        throw error;
      }
    }).catch(() => {});
  },

  toggleTodo: async id => {
    return withPerformanceTracking('toggleTodo', async () => {
      console.log('🔄 Starting toggleTodo operation for id:', id);

      try {
        // Check if operation is already pending for this todo
        const currentState = get();
        if (currentState.pendingOperations.has(id)) {
          console.log('🚫 Operation already pending for todo:', id);
          return { todo: null, xpEarned: 0 };
        }

        // Clear any previous errors
        set({ error: null });

        const todo = currentState.todos.find(t => t.id === id);

        if (!todo) {
          console.warn('⚠️ Todo not found for id:', id);
          return { todo: null, xpEarned: 0 };
        }

        console.log('📝 Toggling todo:', {
          id: todo.id,
          title: todo.title,
          currentStatus: todo.completed,
          newStatus: !todo.completed,
        });

        // Mark operation as pending
        const newPendingOperations = new Set(currentState.pendingOperations);
        newPendingOperations.add(id);
        set({ pendingOperations: newPendingOperations });

        // Calculate XP earned BEFORE updating (when completing a todo)
        const xpEarned = !todo.completed ? calculateTodoXP(todo) : 0;
        console.log('💰 XP to be earned:', xpEarned);

        // Prepare the new completed status
        const newCompletedStatus = !todo.completed;
        const updateData = {
          completed: newCompletedStatus,
          ...(newCompletedStatus && { completedAt: new Date() }),
        };

        try {
          // Update via mock service first (no optimistic update to prevent loops)
          console.log('🔧 Updating todo via mock service');
          const updatedTodo = await withTimeout(
            mockTodoService.update(id, updateData),
            5000
          );

          if (!updatedTodo) {
            throw new Error('Failed to update todo in mock service');
          }

          // Update local state with the result from service
          const finalState = get();
          const updatedTodos = finalState.todos.map(t =>
            t.id === id ? updatedTodo : t
          );

          // Remove from pending operations
          const finalPendingOperations = new Set(finalState.pendingOperations);
          finalPendingOperations.delete(id);

          set({
            todos: updatedTodos,
            pendingOperations: finalPendingOperations,
          });

          console.log(`✅ toggleTodo completed successfully`);

          return {
            todo: updatedTodo,
            xpEarned,
          };
        } catch (serviceError) {
          // Remove from pending operations on service error
          const errorState = get();
          const errorPendingOperations = new Set(errorState.pendingOperations);
          errorPendingOperations.delete(id);
          set({ pendingOperations: errorPendingOperations });

          throw serviceError;
        }
      } catch (error) {
        console.error('❌ Error in toggleTodo:', error);

        // Remove from pending operations on error
        const errorState = get();
        const errorPendingOperations = new Set(errorState.pendingOperations);
        errorPendingOperations.delete(id);

        // Set error state
        set({
          error: 'Failed to toggle todo',
          pendingOperations: errorPendingOperations,
        });

        throw error;
      }
    }).catch(() => ({ todo: null, xpEarned: 0 }));
  },

  setFilters: newFilters => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        priority: 'all',
        status: 'all',
        courseId: undefined,
      },
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Selector hook with computed values
export const useTodoSelectors = () => {
  const store = useTodoStore();

  // Filter todos based on current filters (memoized to prevent unnecessary recalculations)
  const filteredTodos = React.useMemo(() => {
    console.log('🔍 Filtering todos, total:', store.todos.length);
    return store.todos.filter(todo => {
      const { search, priority, status, courseId } = store.filters;

      // Search filter
      if (
        search &&
        !todo.title.toLowerCase().includes(search.toLowerCase()) &&
        !(todo.description || '').toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      // Priority filter
      if (priority !== 'all' && todo.priority !== priority) {
        return false;
      }

      // Status filter
      if (status === 'completed' && !todo.completed) return false;
      if (status === 'pending' && todo.completed) return false;

      // Course filter
      if (courseId && todo.courseId !== courseId) {
        return false;
      }

      return true;
    });
  }, [
    store.todos,
    store.filters.search,
    store.filters.priority,
    store.filters.status,
    store.filters.courseId,
  ]);

  // Calculate stats (memoized to prevent unnecessary recalculations)
  const stats: TodoStats = React.useMemo(() => {
    console.log('📊 Calculating stats for', store.todos.length, 'todos');
    const now = new Date();
    return {
      total: store.todos.length,
      completed: store.todos.filter(t => t.completed).length,
      pending: store.todos.filter(t => !t.completed).length,
      overdue: store.todos.filter(
        t => !t.completed && t.dueDate && t.dueDate < now
      ).length,
      completionRate:
        store.todos.length > 0
          ? (store.todos.filter(t => t.completed).length / store.todos.length) *
            100
          : 0,
      totalEstimatedTime: store.todos.reduce(
        (total, todo) => total + (todo.estimatedMinutes || 0),
        0
      ),
    };
  }, [store.todos]);

  // Check if filters are active (as a function to match TodoPage expectations)
  const hasActiveFilters = React.useCallback(() => {
    return (
      store.filters.search !== '' ||
      store.filters.priority !== 'all' ||
      store.filters.status !== 'all' ||
      store.filters.courseId !== undefined
    );
  }, [store.filters]);

  // Fetch stats function (placeholder for compatibility)
  const fetchStats = React.useCallback(async () => {
    // Stats are computed in real-time, so this is a no-op
    return Promise.resolve();
  }, []);

  return {
    // State
    todos: filteredTodos,
    allTodos: store.todos,
    isLoading: store.isLoading,
    error: store.error,
    filters: store.filters,
    stats,
    currentPage: store.currentPage,
    totalPages: store.totalPages,
    hasActiveFilters,

    // Actions
    fetchTodos: store.fetchTodos,
    fetchStats,
    createTodo: store.createTodo,
    updateTodo: store.updateTodo,
    deleteTodo: store.deleteTodo,
    toggleTodo: store.toggleTodo,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    clearError: store.clearError,
  };
};
