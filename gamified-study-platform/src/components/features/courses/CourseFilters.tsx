import React from 'react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import type { CourseFilters as CourseFiltersType } from '../../../types';

interface CourseFiltersProps {
  filters: CourseFiltersType;
  onFilterChange: (filters: CourseFiltersType) => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({ 
  filters, 
  onFilterChange 
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, completionStatus: e.target.value as any });
  };
  
  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as any });
  };
  
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortOrder: e.target.value as any });
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-1">
            Search
          </label>
          <Input
            id="search"
            type="text"
            placeholder="Search courses..."
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <Select
            id="status"
            value={filters.completionStatus || 'all'}
            onChange={handleStatusChange}
            options={[
              { value: 'all', label: 'All Courses' },
              { value: 'completed', label: 'Completed' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'not_started', label: 'Not Started' }
            ]}
          />
        </div>
        
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium mb-1">
            Sort By
          </label>
          <Select
            id="sortBy"
            value={filters.sortBy || 'created_at'}
            onChange={handleSortByChange}
            options={[
              { value: 'name', label: 'Name' },
              { value: 'created_at', label: 'Date Created' },
              { value: 'progress', label: 'Progress' },
              { value: 'last_studied', label: 'Last Studied' }
            ]}
          />
        </div>
        
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium mb-1">
            Order
          </label>
          <Select
            id="sortOrder"
            value={filters.sortOrder || 'desc'}
            onChange={handleSortOrderChange}
            options={[
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};