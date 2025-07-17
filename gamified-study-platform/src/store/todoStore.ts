import { create } from 'zustand'
import { TodoItem, TodoForm, TodoFilters } from '../types'
import { TodoService } from '../services/todoService'

interface TodoState {
  // State
  todos: TodoItem[]
  isLoading: boolean
  error: string | null
  filters: TodoFilters
  currentPage: number
  totalPages: number
  totalItems: number
  
  // Stats
  stats: {
    total: number
    completed: number
    pending: number
    overdue: number
    completionRate: number
    totalEstimatedTime: number
    completedTime: number
  } | null

  // Actions
  fetchTodos: (page?: number) => Promise<void>
  createTodo: (todoData: TodoForm) => Promise<void>
  updateTodo: (id: string, updates: Partial<TodoForm>) => Promise<void>
  toggleTodo: (id: string) => Promise<{ xpEarned: number }>
  deleteTodo: (id: string) => Promise<void>
  setFilters: (filters: Partial<TodoFilters>) => void
  clearFilters: () => void
  fetchStats: () => Promise<void>
  setError: (error: string | null) => void
  clearError: () => void
}

const defaultFilters: TodoFilters = {
  completed: undefined,
  priority: 'all',
  courseId: undefined,
  search: '',
  dueDate: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc'
}

export const useTodoStore = create<TodoState>((set, get) => ({
  // Initial state
  todos: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  stats: null,

  // Actions
  fetchTodos: async (page = 1) => {
    set({ isLoading: true, error: null })
    
    try {
      const { filters } = get()
      const response = await TodoService.getTodos(filters, page, 20)
      
      set({
        todos: response.data,
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch todos',
        isLoading: false
      })
    }
  },

  createTodo: async (todoData: TodoForm) => {
    set({ isLoading: true, error: null })
    
    try {
      await TodoService.createTodo(todoData)
      
      // Refresh todos and stats
      await get().fetchTodos(get().currentPage)
      await get().fetchStats()
      
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create todo',
        isLoading: false
      })
      throw error
    }
  },

  updateTodo: async (id: string, updates: Partial<TodoForm>) => {
    set({ isLoading: true, error: null })
    
    try {
      await TodoService.updateTodo(id, updates)
      
      // Refresh todos and stats
      await get().fetchTodos(get().currentPage)
      await get().fetchStats()
      
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update todo',
        isLoading: false
      })
      throw error
    }
  },

  toggleTodo: async (id: string) => {
    set({ error: null })
    
    try {
      const response = await TodoService.toggleTodo(id)
      
      // Update the specific todo in the list
      const { todos } = get()
      const updatedTodos = todos.map(todo => 
        todo.id === id ? response.data.todo : todo
      )
      
      set({ todos: updatedTodos })
      
      // Refresh stats
      await get().fetchStats()
      
      return { xpEarned: response.data.xpEarned }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle todo'
      })
      throw error
    }
  },

  deleteTodo: async (id: string) => {
    set({ error: null })
    
    try {
      await TodoService.deleteTodo(id)
      
      // Remove todo from the list
      const { todos } = get()
      const updatedTodos = todos.filter(todo => todo.id !== id)
      
      set({ todos: updatedTodos, totalItems: get().totalItems - 1 })
      
      // Refresh stats
      await get().fetchStats()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete todo'
      })
      throw error
    }
  },

  setFilters: (newFilters: Partial<TodoFilters>) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters }
    
    set({ 
      filters: updatedFilters,
      currentPage: 1 // Reset to first page when filters change
    })
    
    // Automatically fetch todos with new filters
    get().fetchTodos(1)
  },

  clearFilters: () => {
    set({ 
      filters: defaultFilters,
      currentPage: 1
    })
    
    // Fetch todos with cleared filters
    get().fetchTodos(1)
  },

  fetchStats: async () => {
    try {
      const response = await TodoService.getTodoStats()
      set({ stats: response.data })
    } catch (error) {
      console.error('Failed to fetch todo stats:', error)
      // Don't set error state for stats failure as it's not critical
    }
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  }
}))

// Selectors for computed values
export const useTodoSelectors = () => {
  const store = useTodoStore()
  
  return {
    ...store,
    
    // Computed values
    activeTodos: store.todos.filter(todo => !todo.completed),
    completedTodos: store.todos.filter(todo => todo.completed),
    overdueTodos: store.todos.filter(todo => 
      !todo.completed && 
      todo.dueDate && 
      todo.dueDate < new Date()
    ),
    todayTodos: store.todos.filter(todo => {
      if (!todo.dueDate) return false
      const today = new Date()
      const todoDate = new Date(todo.dueDate)
      return todoDate.toDateString() === today.toDateString()
    }),
    
    // Priority counts
    highPriorityTodos: store.todos.filter(todo => 
      !todo.completed && todo.priority === 'high'
    ),
    mediumPriorityTodos: store.todos.filter(todo => 
      !todo.completed && todo.priority === 'medium'
    ),
    lowPriorityTodos: store.todos.filter(todo => 
      !todo.completed && todo.priority === 'low'
    ),
    
    // Utility functions
    getTodoById: (id: string) => store.todos.find(todo => todo.id === id),
    getTodosByCourse: (courseId: string) => 
      store.todos.filter(todo => todo.courseId === courseId),
    
    // Filter helpers
    hasActiveFilters: () => {
      const { filters } = store
      return (
        filters.completed !== undefined ||
        (filters.priority && filters.priority !== 'all') ||
        filters.courseId ||
        (filters.search && filters.search.length > 0) ||
        (filters.dueDate && filters.dueDate !== 'all')
      )
    }
  }
}