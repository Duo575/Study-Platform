import React from 'react';
import { motion } from 'framer-motion';
import { useGamificationStore } from '../../store/gamificationStore';

interface StreakTrackerProps {
  className?: string;
  compact?: boolean;
}

/**
 * Component that displays the user's current study streak with visual indicators
 */
export const StreakTracker: React.FC<StreakTrackerProps> = ({
  className = '',
  compact = false,
}) => {
  const { streakData } = useGamificationStore();
  const { currentStreak, isActive } = streakData;

  // Generate days for the streak display
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const reorderedDays = [...days.slice(today), ...days.slice(0, today)];

  // Calculate which days should be highlighted based on the streak
  const getStreakStatus = (index: number) => {
    if (index === 0) return 'today'; // Today
    if (index < currentStreak) return 'completed'; // Past days in streak
    return 'future'; // Future days
  };

  return (
    <div className={`${className}`}>
      {!compact && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Study Streak
          </h3>
          <div className="flex items-center">
            <span className="text-lg font-bold text-amber-500">
              {currentStreak}
            </span>
            <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
              days
            </span>
            {isActive ? (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                Active
              </span>
            ) : (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
                Inactive
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between gap-1">
        {days.map((day, index) => {
          const status = getStreakStatus(index);

          return (
            <div key={index} className="flex flex-col items-center">
              {!compact && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {day}
                </span>
              )}
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  status === 'today'
                    ? 'bg-amber-500 text-white'
                    : status === 'completed'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                }`}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: status === 'today' ? [1, 1.1, 1] : 1,
                  opacity: status === 'future' ? 0.7 : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: status === 'today' ? Infinity : 0,
                  repeatType: 'reverse',
                  repeatDelay: 2,
                }}
              >
                {status === 'today' ? (
                  <span className="text-sm">{compact ? '•' : day}</span>
                ) : status === 'completed' ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm">{compact ? '•' : day}</span>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {currentStreak >= 3 && !compact && (
        <motion.div
          className="mt-2 text-xs text-center text-amber-600 dark:text-amber-400"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {currentStreak >= 30
            ? '🔥 Monthly streak achieved! Keep it up!'
            : currentStreak >= 7
              ? "🔥 Weekly streak achieved! You're on fire!"
              : '🔥 3-day streak! Keep going!'}
        </motion.div>
      )}
    </div>
  );
};

export default StreakTracker;
