import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Play, Pause, Edit, Trash2, Copy, Share } from 'lucide-react';
import { useRoutineStore } from '../../../store/routineStore';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { Dropdown } from '../../ui/Dropdown';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import type { Routine, RoutineFilters } from '../../../types';

interface RoutineListProps {
  onCreateRoutine: () => void;
}

export const RoutineList: React.FC<RoutineListProps> = ({ onCreateRoutine }) => {
  const {
    routines,
    filters,
    isLoading,
    setFilters,
    toggleRoutineActive,
    deleteRoutine,
    setActiveRoutine,
  } = useRoutineStore();

  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);

  const filteredRoutines = routines.filter(routine => {
    if (filters.search && !routine.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.isActive !== undefined && routine.isActive !== filters.isActive) {
      return false;
    }
    return true;
  });

  const sortedRoutines = [...filteredRoutines].sort((a, b) => {
    const { sortBy = 'created_at', sortOrder = 'desc' } = filters;
    
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleRoutineAction = async (action: string, routine: Routine) => {
    switch (action) {
      case 'toggle':
        await toggleRoutineActive(routine.id, !routine.isActive);
        break;
      case 'edit':
        setActiveRoutine(routine);
        // TODO: Open edit modal
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${routine.name}"?`)) {
          await deleteRoutine(routine.id);
        }
        break;
      case 'duplicate':
        // TODO: Implement duplicate functionality
        break;
      case 'share':
        // TODO: Implement share functionality
        break;
    }
  };

  const handleBulkAction = async (action: string) => {
    // TODO: Implement bulk actions
    console.log('Bulk action:', action, selectedRoutines);
  };

  const toggleRoutineSelection = (routineId: string) => {
    setSelectedRoutines(prev => 
      prev.includes(routineId)
        ? prev.filter(id => id !== routineId)
        : [...prev, routineId]
    );
  };

  const selectAllRoutines = () => {
    if (selectedRoutines.length === sortedRoutines.length) {
      setSelectedRoutines([]);
    } else {
      setSelectedRoutines(sortedRoutines.map(r => r.id));
    }
  };

  if (isLoading && routines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search routines..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
            onChange={(value) => setFilters({ 
              isActive: value === 'all' ? undefined : value === 'true' 
            })}
          >
            <option value="all">All Routines</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </Select>

          <Select
            value={`${filters.sortBy || 'created_at'}-${filters.sortOrder || 'desc'}`}
            onChange={(value) => {
              const [sortBy, sortOrder] = value.split('-');
              setFilters({ sortBy: sortBy as any, sortOrder: sortOrder as any });
            }}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
          </Select>

          <Button onClick={onCreateRoutine}>
            <Plus className="w-4 h-4 mr-2" />
            New Routine
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRoutines.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRoutines.length} routine{selectedRoutines.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
              >
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Routines List */}
      <div className="space-y-4">
        {sortedRoutines.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Routines Found</h3>
              <p className="mb-4">
                {filters.search || filters.isActive !== undefined
                  ? 'Try adjusting your search or filters'
                  : 'Create your first routine to get started'
                }
              </p>
              {!filters.search && filters.isActive === undefined && (
                <Button onClick={onCreateRoutine}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Routine
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            {/* Select All Header */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedRoutines.length === sortedRoutines.length}
                  onChange={selectAllRoutines}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All ({sortedRoutines.length})
                </span>
              </div>
            </Card>

            {/* Routine Cards */}
            {sortedRoutines.map((routine) => (
              <Card key={routine.id} className="p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedRoutines.includes(routine.id)}
                    onChange={() => toggleRoutineSelection(routine.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div
                    className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: routine.color }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {routine.name}
                        </h3>
                        {routine.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {routine.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={routine.isActive ? 'success' : 'secondary'}
                          size="sm"
                        >
                          {routine.isActive ? 'Active' : 'Inactive'}
                        </Badge>

                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                        >
                          <div className="py-1">
                            <button
                              onClick={() => handleRoutineAction('toggle', routine)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              {routine.isActive ? (
                                <>
                                  <Pause className="w-4 h-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRoutineAction('edit', routine)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleRoutineAction('duplicate', routine)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleRoutineAction('share', routine)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Share className="w-4 h-4" />
                              Share
                            </button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            <button
                              onClick={() => handleRoutineAction('delete', routine)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </Dropdown>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{routine.scheduleSlots.length} time slots</span>
                      <span>•</span>
                      <span>Created {new Date(routine.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Updated {new Date(routine.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {routine.scheduleSlots.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Weekly Schedule Preview:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {routine.scheduleSlots.slice(0, 5).map((slot, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][slot.dayOfWeek]} {slot.startTime}
                            </Badge>
                          ))}
                          {routine.scheduleSlots.length > 5 && (
                            <Badge variant="outline" size="sm">
                              +{routine.scheduleSlots.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};