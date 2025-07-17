import React from 'react';
import { ChevronDown, Calendar, Circle } from 'lucide-react';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import type { Routine } from '../../../types';

interface RoutineSelectorProps {
  routines: Routine[];
  selectedRoutine: Routine | null;
  onSelect: (routine: Routine) => void;
  className?: string;
}

export const RoutineSelector: React.FC<RoutineSelectorProps> = ({
  routines,
  selectedRoutine,
  onSelect,
  className = '',
}) => {
  const activeRoutines = routines.filter(r => r.isActive);
  const inactiveRoutines = routines.filter(r => !r.isActive);

  const handleChange = (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
      onSelect(routine);
    }
  };

  if (routines.length === 0) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 ${className}`}>
        No routines available
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Routine:
        </span>
      </div>

      <div className="relative min-w-[200px]">
        <Select
          value={selectedRoutine?.id || ''}
          onChange={handleChange}
          className="appearance-none"
        >
          <option value="" disabled>
            Select a routine...
          </option>
          
          {activeRoutines.length > 0 && (
            <optgroup label="Active Routines">
              {activeRoutines.map((routine) => (
                <option key={routine.id} value={routine.id}>
                  {routine.name}
                </option>
              ))}
            </optgroup>
          )}
          
          {inactiveRoutines.length > 0 && (
            <optgroup label="Inactive Routines">
              {inactiveRoutines.map((routine) => (
                <option key={routine.id} value={routine.id}>
                  {routine.name} (Inactive)
                </option>
              ))}
            </optgroup>
          )}
        </Select>
      </div>

      {selectedRoutine && (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedRoutine.color }}
          />
          <Badge
            variant={selectedRoutine.isActive ? 'success' : 'secondary'}
            size="sm"
          >
            {selectedRoutine.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {selectedRoutine.scheduleSlots.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedRoutine.scheduleSlots.length} time slots
            </span>
          )}
        </div>
      )}
    </div>
  );
};