import React, { useState, useEffect } from 'react';
import { X, Clock, BookOpen, Coffee, Dumbbell, Utensils, Settings, AlertTriangle } from 'lucide-react';
import { useRoutineStore } from '../../../store/routineStore';
import { useCourseStore } from '../../../store/courseStore';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Textarea } from '../../ui/Textarea';
import { Checkbox } from '../../ui/Checkbox';
import { Badge } from '../../ui/Badge';
import type { Routine, ScheduleSlot, ActivityType, ScheduleConflict } from '../../../types';

interface ScheduleSlotModalProps {
  routine: Routine;
  slot?: ScheduleSlot | null;
  defaultDay?: number | null;
  defaultTime?: string | null;
  onClose: () => void;
  onSave: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: React.ReactNode }[] = [
  { value: 'study', label: 'Study', icon: <BookOpen className="w-4 h-4" /> },
  { value: 'break', label: 'Break', icon: <Coffee className="w-4 h-4" /> },
  { value: 'exercise', label: 'Exercise', icon: <Dumbbell className="w-4 h-4" /> },
  { value: 'meal', label: 'Meal', icon: <Utensils className="w-4 h-4" /> },
  { value: 'custom', label: 'Custom', icon: <Settings className="w-4 h-4" /> },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: 'Very Low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Very High' },
];

export const ScheduleSlotModal: React.FC<ScheduleSlotModalProps> = ({
  routine,
  slot,
  defaultDay,
  defaultTime,
  onClose,
  onSave,
}) => {
  const { createScheduleSlot, updateScheduleSlot, deleteScheduleSlot } = useRoutineStore();
  const { courses } = useCourseStore();

  const [formData, setFormData] = useState({
    dayOfWeek: slot?.dayOfWeek ?? defaultDay ?? 1,
    startTime: slot?.startTime ?? defaultTime ?? '09:00',
    endTime: slot?.endTime ?? '10:00',
    activityType: slot?.activityType ?? 'study' as ActivityType,
    activityName: slot?.activityName ?? '',
    courseId: slot?.courseId ?? '',
    priority: slot?.priority ?? 3,
    isFlexible: slot?.isFlexible ?? false,
    notes: slot?.notes ?? '',
  });

  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!slot;

  // Check for conflicts when time or day changes
  useEffect(() => {
    const checkConflicts = async () => {
      if (!formData.startTime || !formData.endTime) return;

      try {
        const { RoutineService } = await import('../../../services/routineService');
        const detectedConflicts = await RoutineService.detectConflicts(
          formData.dayOfWeek,
          formData.startTime,
          formData.endTime,
          routine.id,
          slot?.id
        );
        setConflicts(detectedConflicts);
      } catch (error) {
        console.error('Failed to check conflicts:', error);
      }
    };

    checkConflicts();
  }, [formData.dayOfWeek, formData.startTime, formData.endTime, routine.id, slot?.id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.activityName.trim()) {
      setError('Activity name is required');
      return false;
    }

    const startTime = new Date(`1970-01-01T${formData.startTime}`);
    const endTime = new Date(`1970-01-01T${formData.endTime}`);

    if (endTime <= startTime) {
      setError('End time must be after start time');
      return false;
    }

    if (conflicts.length > 0 && !formData.isFlexible) {
      setError('Please resolve schedule conflicts or mark this slot as flexible');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const slotData = {
        routineId: routine.id,
        ...formData,
      };

      if (isEditing && slot) {
        await updateScheduleSlot(slot.id, slotData);
      } else {
        await createScheduleSlot(slotData);
      }

      onSave();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save schedule slot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!slot || !confirm('Are you sure you want to delete this time slot?')) return;

    setIsLoading(true);
    try {
      await deleteScheduleSlot(slot.id);
      onSave();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete schedule slot');
    } finally {
      setIsLoading(false);
    }
  };

  const generateEndTime = (startTime: string, duration: number = 60): string => {
    const start = new Date(`1970-01-01T${startTime}`);
    start.setMinutes(start.getMinutes() + duration);
    return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleStartTimeChange = (startTime: string) => {
    const currentStart = new Date(`1970-01-01T${formData.startTime}`);
    const currentEnd = new Date(`1970-01-01T${formData.endTime}`);
    const duration = currentEnd.getTime() - currentStart.getTime();
    
    const newStart = new Date(`1970-01-01T${startTime}`);
    const newEnd = new Date(newStart.getTime() + duration);
    
    handleInputChange('startTime', startTime);
    handleInputChange('endTime', `${newEnd.getHours().toString().padStart(2, '0')}:${newEnd.getMinutes().toString().padStart(2, '0')}`);
  };

  return (
    <Modal isOpen onClose={onClose} title={isEditing ? 'Edit Time Slot' : 'Add Time Slot'}>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {conflicts.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Schedule Conflicts Detected</span>
            </div>
            <div className="space-y-1">
              {conflicts.map((conflict, index) => (
                <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                  • {conflict.activityName} ({conflict.start_time} - {conflict.end_time})
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day of Week
            </label>
            <Select
              value={formData.dayOfWeek.toString()}
              onChange={(value) => handleInputChange('dayOfWeek', parseInt(value))}
            >
              {DAYS.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activity Type
            </label>
            <Select
              value={formData.activityType}
              onChange={(value) => handleInputChange('activityType', value as ActivityType)}
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Activity Name *
          </label>
          <Input
            value={formData.activityName}
            onChange={(e) => handleInputChange('activityName', e.target.value)}
            placeholder="e.g., Mathematics Study Session"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time
            </label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Time
            </label>
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
            />
          </div>
        </div>

        {formData.activityType === 'study' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course (Optional)
            </label>
            <Select
              value={formData.courseId}
              onChange={(value) => handleInputChange('courseId', value)}
            >
              <option value="">Select a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <Select
              value={formData.priority.toString()}
              onChange={(value) => handleInputChange('priority', parseInt(value))}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center pt-8">
            <Checkbox
              checked={formData.isFlexible}
              onChange={(checked) => handleInputChange('isFlexible', checked)}
              label="Flexible timing"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes or instructions..."
            rows={3}
          />
        </div>

        {/* Quick Duration Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Duration
          </label>
          <div className="flex gap-2">
            {[30, 60, 90, 120].map((minutes) => (
              <Button
                key={minutes}
                variant="outline"
                size="sm"
                onClick={() => {
                  const endTime = generateEndTime(formData.startTime, minutes);
                  handleInputChange('endTime', endTime);
                }}
              >
                {minutes}min
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {isEditing && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900"
              >
                Delete Slot
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Slot' : 'Add Slot'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};