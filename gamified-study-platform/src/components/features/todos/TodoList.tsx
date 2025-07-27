import React from 'react';
import { TodoItem } from '../../../types';
import { TodoListItem } from './TodoListItem';
import { TodoItemErrorBoundary } from './TodoItemErrorBoundary';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

interface TodoListProps {
  todos: TodoItem[];
  onToggle: (xpEarned: number) => void;
  isLoading?: boolean;
}

export const TodoList: React.FC<TodoListProps> = React.memo(
  ({ todos, onToggle, isLoading = false }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {todos.map(todo => (
          <TodoItemErrorBoundary key={todo.id} todoId={todo.id}>
            <TodoListItem todo={todo} onToggle={onToggle} />
          </TodoItemErrorBoundary>
        ))}
      </div>
    );
  }
);
