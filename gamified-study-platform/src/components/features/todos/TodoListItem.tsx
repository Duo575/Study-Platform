import React, { useState, useRef } from 'react';
import { TodoItem } from '../../../types';
import { useTodoSelectors, useTodoStore } from '../../../store/todoStore';
import { Button } from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { EditTodoModal } from './EditTodoModal';
import {
  Calendar,
  Clock,
  BookOpen,
  Edit3,
  Trash2,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { formatDistanceToNow, isAfter, isBefore, startOfDay } from 'date-fns';

interface TodoListItemProps {
  todo: TodoItem;
  onToggle: (xpEarned: number) => void;
}

export const TodoListItem: React.FC<TodoListItemProps> = React.memo(
  ({ todo, onToggle }) => {
    const store = useTodoStore();
    const { toggleTodo, deleteTodo } = useTodoSelectors();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Check if this todo has a pending operation
    const isPending = store.pendingOperations.has(todo.id);

    const handleToggle = React.useCallback(async () => {
      if (isPending) {
        console.log('🚫 Operation already pending for todo:', todo.id);
        return;
      }

      console.log('🎯 Executing toggle for todo:', todo.id);

      try {
        const result = await toggleTodo(todo.id);
        if (result.todo) {
          onToggle(result.xpEarned);
        }
      } catch (error) {
        console.error('❌ Failed to toggle todo:', error);
      }
    }, [todo.id, isPending, toggleTodo, onToggle]);

    const handleDelete = React.useCallback(async () => {
      try {
        await deleteTodo(todo.id);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }, [deleteTodo, todo.id]);

    // Memoize priority colors to prevent recalculation on every render
    const priorityColor = React.useMemo(() => {
      switch (todo.priority) {
        case 'high':
          return 'text-red-600 dark:text-red-400';
        case 'medium':
          return 'text-yellow-600 dark:text-yellow-400';
        case 'low':
          return 'text-green-600 dark:text-green-400';
        default:
          return 'text-gray-600 dark:text-gray-400';
      }
    }, [todo.priority]);

    const priorityBadgeColor = React.useMemo(() => {
      switch (todo.priority) {
        case 'high':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'low':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      }
    }, [todo.priority]);

    // Memoize date calculations to prevent recalculation on every render
    const { isOverdue, isDueToday } = React.useMemo(() => {
      if (!todo.dueDate || todo.completed) {
        return { isOverdue: false, isDueToday: false };
      }

      const now = new Date();
      const startOfToday = startOfDay(now);

      return {
        isOverdue: isBefore(todo.dueDate, startOfToday),
        isDueToday: todo.dueDate.toDateString() === now.toDateString(),
      };
    }, [todo.dueDate, todo.completed]);

    return (
      <>
        <div
          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
            todo.completed ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <div className="flex-shrink-0 mt-1">
              <Checkbox
                checked={todo.completed}
                onChange={handleToggle}
                disabled={isPending}
                className="h-5 w-5"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3
                    className={`text-sm font-medium ${
                      todo.completed
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {todo.title}
                  </h3>

                  {/* Description */}
                  {todo.description && (
                    <p
                      className={`text-sm mt-1 ${
                        todo.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {todo.description}
                    </p>
                  )}

                  {/* Meta information */}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
                    {/* Priority */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priorityBadgeColor}`}
                    >
                      <Star className="h-3 w-3" />
                      {todo.priority}
                    </span>

                    {/* Estimated time */}
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      {todo.estimatedMinutes}m
                    </span>

                    {/* Course */}
                    {todo.courseId && (
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <BookOpen className="h-3 w-3" />
                        Course
                      </span>
                    )}

                    {/* Due date */}
                    {todo.dueDate && (
                      <span
                        className={`flex items-center gap-1 ${
                          isOverdue
                            ? 'text-red-600 dark:text-red-400'
                            : isDueToday
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        {isOverdue && <AlertTriangle className="h-3 w-3" />}
                        {formatDistanceToNow(todo.dueDate, { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <EditTodoModal
          todo={todo}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Todo"
          message="Are you sure you want to delete this todo? This action cannot be undone."
          confirmText="Delete"
          confirmVariant="danger"
        />
      </>
    );
  }
);
