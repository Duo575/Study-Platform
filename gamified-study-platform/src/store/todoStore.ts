import { create } from 'zustand';
import { mockTodoService, MOCK_MODE } from '../services/mockDatabase';

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  courseId?: string;
  createdAt: string;
}

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTodos: () => Promise<void>;
  createTodo: (todoData: Partial<Todo>) => Promise<Todo | null>;
  updateTodo: (id: string, todoData: Partial<Todo>) => Promise<Todo | null>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log('🔧 Using mock todo data');
      const todosData = await mockTodoService.getByUserId('mock-user');
      set({ todos: todosData, isLoading: false });
    } catch (error) {
      console.error('Error fetching todos:', error);
      set({ error: 'Failed to load todos', isLoading: false });
    }
  },

  createTodo: async todoData => {
    try {
      set({ isLoading: true, error: null });
      console.log('🔧 Creating todo with mock data');
      const newTodo = await mockTodoService.create(todoData);

      // Add to local state
      const { todos } = get();
      set({ todos: [...todos, newTodo], isLoading: false });

      return newTodo;
    } catch (error) {
      console.error('Error creating todo:', error);
      set({ error: 'Failed to create todo', isLoading: false });
      return null;
    }
  },

  updateTodo: async (id, todoData) => {
    try {
      set({ isLoading: true, error: null });
      console.log('🔧 Updating todo with mock data');
      const updatedTodo = await mockTodoService.update(id, todoData);

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
      return null;
    }
  },

  deleteTodo: async id => {
    try {
      set({ isLoading: true, error: null });
      console.log('🔧 Deleting todo with mock data');
      await mockTodoService.delete(id);

      // Remove from local state
      const { todos } = get();
      const updatedTodos = todos.filter(todo => todo.id !== id);
      set({ todos: updatedTodos, isLoading: false });
    } catch (error) {
      console.error('Error deleting todo:', error);
      set({ error: 'Failed to delete todo', isLoading: false });
    }
  },

  toggleTodo: async id => {
    const { todos } = get();
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await get().updateTodo(id, { completed: !todo.completed });
    }
  },
}));
