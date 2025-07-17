import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PomodoroSettings as PomodoroSettingsType } from '../../../types';
import { usePomodoro } from '../../../hooks/usePomodoro';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Checkbox } from '../../ui/Checkbox';

const settingsSchema = z.object({
  workDuration: z.number().min(1).max(60),
  shortBreakDuration: z.number().min(1).max(30),
  longBreakDuration: z.number().min(1).max(60),
  sessionsUntilLongBreak: z.number().min(2).max(8),
  soundEnabled: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface PomodoroSettingsProps {
  settings: PomodoroSettingsType;
  onClose: () => void;
}

export const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({
  settings,
  onClose,
}) => {
  const { updateSettings } = usePomodoro();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      updateSettings(data);
      onClose();
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const watchedValues = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Work Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Work Duration (minutes)
        </label>
        <Input
          type="number"
          {...register('workDuration', { valueAsNumber: true })}
          error={errors.workDuration?.message}
          min={1}
          max={60}
        />
        <p className="text-xs text-gray-500 mt-1">
          Recommended: 25 minutes for optimal focus
        </p>
      </div>

      {/* Short Break Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Short Break Duration (minutes)
        </label>
        <Input
          type="number"
          {...register('shortBreakDuration', { valueAsNumber: true })}
          error={errors.shortBreakDuration?.message}
          min={1}
          max={30}
        />
        <p className="text-xs text-gray-500 mt-1">
          Recommended: 5 minutes for quick refreshment
        </p>
      </div>

      {/* Long Break Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Long Break Duration (minutes)
        </label>
        <Input
          type="number"
          {...register('longBreakDuration', { valueAsNumber: true })}
          error={errors.longBreakDuration?.message}
          min={1}
          max={60}
        />
        <p className="text-xs text-gray-500 mt-1">
          Recommended: 15-30 minutes for proper rest
        </p>
      </div>

      {/* Sessions Until Long Break */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Work Sessions Before Long Break
        </label>
        <Input
          type="number"
          {...register('sessionsUntilLongBreak', { valueAsNumber: true })}
          error={errors.sessionsUntilLongBreak?.message}
          min={2}
          max={8}
        />
        <p className="text-xs text-gray-500 mt-1">
          Recommended: 4 sessions (classic Pomodoro technique)
        </p>
      </div>

      {/* Sound Enabled */}
      <div>
        <Checkbox
          {...register('soundEnabled')}
          label="Enable notification sounds"
          description="Play a sound when sessions start and end"
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Session Preview
        </h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Work sessions:</span>
            <span>{watchedValues.workDuration} minutes each</span>
          </div>
          <div className="flex justify-between">
            <span>Short breaks:</span>
            <span>{watchedValues.shortBreakDuration} minutes each</span>
          </div>
          <div className="flex justify-between">
            <span>Long break:</span>
            <span>Every {watchedValues.sessionsUntilLongBreak} sessions ({watchedValues.longBreakDuration} minutes)</span>
          </div>
          <div className="flex justify-between font-medium text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>Full cycle time:</span>
            <span>
              {(watchedValues.workDuration * watchedValues.sessionsUntilLongBreak) +
               (watchedValues.shortBreakDuration * (watchedValues.sessionsUntilLongBreak - 1)) +
               watchedValues.longBreakDuration} minutes
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
};