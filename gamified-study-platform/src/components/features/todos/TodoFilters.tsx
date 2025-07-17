import React from 'react'
import { useTodoSelectors } from '../../../store/todoStore'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { Search, Filter, X } from 'lucide-react'

export const TodoFilters: React.FC = () => {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useTodoSelectors()

  const handleSearchChange = (value: string) => {
    setFilters({ search: value })
  }

  const handleCompletionFilterChange = (value: string) => {
    const completed = value === 'all' ? undefined : value === 'completed'
    setFilters({ completed })
  }

  const handlePriorityFilterChange = (value: string) => {
    setFilters({ priority: value as any })
  }

  const handleDueDateFilterChange = (value: string) => {
    setFilters({ dueDate: value as any })
  }

  const handleSortChange = (value: string) => {
    setFilters({ sortBy: value as any })
  }

  const handleSortOrderChange = (value: string) => {
    setFilters({ sortOrder: value as any })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search todos..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            icon={Search}
            className="w-full"
          />
        </div>

        {/* Completion Status */}
        <div>
          <Select
            value={filters.completed === undefined ? 'all' : filters.completed ? 'completed' : 'pending'}
            onChange={handleCompletionFilterChange}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' }
            ]}
          />
        </div>

        {/* Priority */}
        <div>
          <Select
            value={filters.priority || 'all'}
            onChange={handlePriorityFilterChange}
            options={[
              { value: 'all', label: 'All Priority' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]}
          />
        </div>

        {/* Due Date */}
        <div>
          <Select
            value={filters.dueDate || 'all'}
            onChange={handleDueDateFilterChange}
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'today', label: 'Due Today' },
              { value: 'week', label: 'This Week' },
              { value: 'overdue', label: 'Overdue' }
            ]}
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <Select
            value={filters.sortBy || 'created_at'}
            onChange={handleSortChange}
            options={[
              { value: 'created_at', label: 'Created' },
              { value: 'due_date', label: 'Due Date' },
              { value: 'priority', label: 'Priority' },
              { value: 'estimated_time', label: 'Time' }
            ]}
            className="flex-1"
          />
          
          <Select
            value={filters.sortOrder || 'desc'}
            onChange={handleSortOrderChange}
            options={[
              { value: 'desc', label: '↓' },
              { value: 'asc', label: '↑' }
            ]}
            className="w-16"
          />
        </div>
      </div>
    </div>
  )
}