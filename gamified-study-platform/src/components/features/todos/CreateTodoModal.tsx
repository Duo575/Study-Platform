import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTodoSelectors } from '../../../store/todoStore'
import { Modal } from '../../ui/Modal'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { TodoForm } from '../../../types'

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  estimatedMinutes: z.number().min(1, 'Estimated time must be at least 1 minute').max(480, 'Estimated time cannot exceed 8 hours'),
  courseId: z.string().optional(),
  dueDate: z.date().optional(),
})

type TodoFormData = z.infer<typeof todoSchema>

interface CreateTodoModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateTodoModal: React.FC<CreateTodoModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createTodo, isLoading } = useTodoSelectors()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      priority: 'medium',
      estimatedMinutes: 30
    }
  })

  const onSubmit = async (data: TodoFormData) => {
    try {
      const todoData: TodoForm = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        estimatedMinutes: data.estimatedMinutes,
        courseId: data.courseId,
        dueDate: data.dueDate
      }

      await createTodo(todoData)
      reset()
      onClose()
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to create todo:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const dueDateValue = watch('dueDate')

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Todo"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <Input
            {...register('title')}
            placeholder="Enter todo title..."
            error={errors.title?.message}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <Textarea
            {...register('description')}
            placeholder="Add a description (optional)..."
            rows={3}
            error={errors.description?.message}
          />
        </div>

        {/* Priority and Estimated Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority *
            </label>
            <Select
              value={watch('priority')}
              onChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high')}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' }
              ]}
              error={errors.priority?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Time (minutes) *
            </label>
            <Input
              type="number"
              {...register('estimatedMinutes', { valueAsNumber: true })}
              placeholder="30"
              min={1}
              max={480}
              error={errors.estimatedMinutes?.message}
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <Input
            type="datetime-local"
            {...register('dueDate', { 
              setValueAs: (value) => value ? new Date(value) : undefined 
            })}
            error={errors.dueDate?.message}
          />
        </div>

        {/* Course Selection - Placeholder for now */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course (Optional)
          </label>
          <Select
            value={watch('courseId') || ''}
            onChange={(value) => setValue('courseId', value || undefined)}
            options={[
              { value: '', label: 'No course selected' },
              // TODO: Load actual courses from store
              { value: 'course-1', label: 'Sample Course 1' },
              { value: 'course-2', label: 'Sample Course 2' }
            ]}
            error={errors.courseId?.message}
          />
        </div>

        {/* XP Preview */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 dark:text-blue-300">
              Estimated XP Reward:
            </span>
            <span className="font-semibold text-blue-800 dark:text-blue-200">
              {calculateXPPreview(watch('priority'), watch('estimatedMinutes'))} XP
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Complete this todo to earn XP and level up!
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
          >
            Create Todo
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Helper function to calculate XP preview
function calculateXPPreview(priority: 'low' | 'medium' | 'high', estimatedMinutes: number): number {
  const basePriorityXP = {
    low: 10,
    medium: 20,
    high: 30
  }

  const timeBonus = Math.floor((estimatedMinutes || 0) / 15) * 5
  return basePriorityXP[priority] + timeBonus
}