import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoro } from '../../../hooks/usePomodoro';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
// import { ProgressBar } from '../../ui/ProgressBar';
import { Select } from '../../ui/Select';
import { Modal } from '../../ui/Modal';
import { PomodoroSettings } from './PomodoroSettings';
import { BreakActivities } from './BreakActivities';
import { Course } from '../../../types';

interface PomodoroTimerProps {
  courses?: Course[];
  selectedCourseId?: string;
  todoItemId?: string;
  questId?: string;
  onCourseChange?: (courseId: string) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  courses = [],
  selectedCourseId,
  todoItemId,
  questId,
  onCourseChange,
}) => {
  const {
    isActive,
    isPaused,
    formattedTime,
    progress,
    sessionInfo,
    todayStats,
    startTimer,
    pauseTimer,
    resumeTimer,
    completeSession,
    skipSession,
    timer,
    isLoading,
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);
  const [showBreakActivities, setShowBreakActivities] = useState(false);
  const [localCourseId, setLocalCourseId] = useState(selectedCourseId || '');

  const handleStart = async () => {
    await startTimer({
      courseId: localCourseId || undefined,
      todoItemId,
      questId,
    });
  };

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = event.target.value;
    setLocalCourseId(courseId);
    onCourseChange?.(courseId);
  };

  const getTimerColor = () => {
    if (sessionInfo.isWorkSession) {
      return 'bg-gradient-to-br from-blue-500 to-purple-600';
    }
    return 'bg-gradient-to-br from-green-500 to-teal-600';
  };

  const getActionButtons = () => {
    if (!isActive) {
      return (
        <Button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full py-4 text-lg font-semibold"
          variant="primary"
        >
          {isLoading ? 'Starting...' : `Start ${sessionInfo.label}`}
        </Button>
      );
    }

    return (
      <div className="flex gap-3">
        <Button
          onClick={isPaused ? resumeTimer : pauseTimer}
          variant="secondary"
          className="flex-1 py-3"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button
          onClick={completeSession}
          variant="primary"
          className="flex-1 py-3"
        >
          Complete
        </Button>
        <Button onClick={skipSession} variant="outline" className="px-4 py-3">
          Skip
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Timer Card */}
      <Card className="p-8">
        <div className="text-center space-y-6">
          {/* Session Info */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessionInfo.label}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Session {sessionInfo.cycleProgress}
            </p>
          </div>

          {/* Timer Display */}
          <motion.div
            className={`relative w-64 h-64 mx-auto rounded-full ${getTimerColor()} p-8 shadow-2xl`}
            animate={{ scale: isActive && !isPaused ? [1, 1.02, 1] : 1 }}
            transition={{
              duration: 1,
              repeat: isActive && !isPaused ? Infinity : 0,
            }}
          >
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-inner">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white">
                  {formattedTime}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {isPaused ? 'Paused' : isActive ? 'Running' : 'Ready'}
                </div>
              </div>
            </div>

            {/* Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100),
                }}
                transition={{ duration: 0.5 }}
              />
            </svg>
          </motion.div>

          {/* Course Selection */}
          {courses.length > 0 && !isActive && (
            <div className="max-w-xs mx-auto">
              <Select
                value={localCourseId}
                onChange={handleCourseChange}
                placeholder="Select a course (optional)"
                className="w-full"
              >
                <option value="">No specific course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="max-w-md mx-auto">{getActionButtons()}</div>

          {/* Settings and Break Activities */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setShowSettings(true)}
              variant="ghost"
              size="sm"
              disabled={isActive}
            >
              ⚙️ Settings
            </Button>
            {sessionInfo.isBreakSession && (
              <Button
                onClick={() => setShowBreakActivities(true)}
                variant="ghost"
                size="sm"
              >
                🎯 Break Activities
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Today's Stats */}
      {todayStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Progress
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {todayStats.sessionsCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sessions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {todayStats.focusTime}m
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Focus Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(todayStats.completionRate)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completion
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {todayStats.xpEarned}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                XP Earned
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <Modal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            title="Pomodoro Settings"
          >
            <PomodoroSettings
              settings={timer.settings}
              onClose={() => setShowSettings(false)}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Break Activities Modal */}
      <AnimatePresence>
        {showBreakActivities && (
          <Modal
            isOpen={showBreakActivities}
            onClose={() => setShowBreakActivities(false)}
            title="Break Activities"
          >
            <BreakActivities onClose={() => setShowBreakActivities(false)} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
