import React from 'react';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import type {
  QuestFilters as QuestFiltersType,
  Course,
  QuestType,
  QuestDifficulty,
  QuestStatus,
} from '../../../types';

interface QuestFiltersProps {
  filters: QuestFiltersType;
  courses: Course[];
  onFilterChange: (
    type?: QuestType | 'all',
    difficulty?: QuestDifficulty | 'all',
    status?: QuestStatus | 'all',
    courseId?: string,
    search?: string
  ) => void;
  onSortChange: (
    sortBy?: 'difficulty' | 'created_at' | 'xp_reward' | 'expires_at',
    sortOrder?: 'asc' | 'desc'
  ) => void;
  onReset: () => void;
}

const QuestFilters: React.FC<QuestFiltersProps> = ({
  filters,
  courses,
  onFilterChange,
  onSortChange,
  onReset,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label
            htmlFor="type-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Type
          </label>
          <Select
            id="type-filter"
            value={filters.type || 'all'}
            onChange={e =>
              onFilterChange(
                e.target.value as QuestType | 'all',
                undefined,
                undefined,
                undefined,
                undefined
              )
            }
          >
            <option value="all">All Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="milestone">Milestone</option>
            <option value="bonus">Bonus</option>
          </Select>
        </div>

        <div>
          <label
            htmlFor="difficulty-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Difficulty
          </label>
          <Select
            id="difficulty-filter"
            value={filters.difficulty || 'all'}
            onChange={e =>
              onFilterChange(
                undefined,
                e.target.value as QuestDifficulty | 'all',
                undefined,
                undefined,
                undefined
              )
            }
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </div>

        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <Select
            id="status-filter"
            value={filters.status || 'all'}
            onChange={e =>
              onFilterChange(
                undefined,
                undefined,
                e.target.value as QuestStatus | 'all',
                undefined,
                undefined
              )
            }
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </Select>
        </div>

        <div>
          <label
            htmlFor="course-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Course
          </label>
          <Select
            id="course-filter"
            value={filters.courseId || ''}
            onChange={e =>
              onFilterChange(
                undefined,
                undefined,
                undefined,
                e.target.value || undefined,
                undefined
              )
            }
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label
            htmlFor="search-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search
          </label>
          <Input
            id="search-filter"
            type="text"
            placeholder="Search quests..."
            value={filters.search || ''}
            onChange={e =>
              onFilterChange(
                undefined,
                undefined,
                undefined,
                undefined,
                e.target.value
              )
            }
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label
            htmlFor="sort-by"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sort By
          </label>
          <Select
            id="sort-by"
            value={filters.sortBy || 'created_at'}
            onChange={e =>
              onSortChange(
                e.target.value as
                  | 'difficulty'
                  | 'created_at'
                  | 'xp_reward'
                  | 'expires_at',
                undefined
              )
            }
          >
            <option value="created_at">Date Created</option>
            <option value="xp_reward">XP Reward</option>
            <option value="difficulty">Difficulty</option>
            <option value="expires_at">Expiration Date</option>
          </Select>
        </div>

        <div>
          <label
            htmlFor="sort-order"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sort Order
          </label>
          <Select
            id="sort-order"
            value={filters.sortOrder || 'desc'}
            onChange={e =>
              onSortChange(undefined, e.target.value as 'asc' | 'desc')
            }
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>
        </div>

        <div className="lg:col-span-3 flex items-end">
          <Button variant="outline" onClick={onReset} className="ml-auto">
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestFilters;
