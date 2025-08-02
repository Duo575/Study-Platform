import React from 'react';
import { motion } from 'framer-motion';
import { useGamification } from '../../hooks/useGamification';
import XPBar from './XPBar';
import StreakTracker from './StreakTracker';
import LevelUpModal from './LevelUpModal';
import XPAnimation from './XPAnimation';
import { formatXP, formatLevel } from '../../utils/gamification';

interface GamificationDashboardProps {
  className?: string;
  compact?: boolean;
}

/**
 * Dashboard component that displays all gamification elements
 */
export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  className = '',
  compact = false,
}) => {
  const { gameStats, streakData, isLoading, error } = useGamification();

  if (isLoading) {
    return (
      <div
        className={`${className} p-4 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse`}
      >
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error || !gameStats) {
    return (
      <div
        className={`${className} p-4 bg-white dark:bg-gray-800 rounded-lg shadow`}
      >
        <div className="text-red-500 dark:text-red-400 text-center">
          {error || 'Failed to load gamification data'}
        </div>
      </div>
    );
  }

  const { level, totalXP, currentXP, xpToNextLevel } = gameStats;

  return (
    <div
      className={`${className} ${compact ? 'p-2' : 'p-4'} bg-white dark:bg-gray-800 rounded-lg shadow`}
    >
      {/* Level and XP display */}
      {!compact && (
        <div className="flex justify-between items-center mb-4">
          <motion.div
            className="text-lg font-bold text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {formatLevel(level)}
          </motion.div>
          <motion.div
            className="text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Total XP: {formatXP(totalXP)}
          </motion.div>
        </div>
      )}

      {/* XP Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <XPBar
          gameStats={gameStats}
          showLevel={!compact}
          showValues={!compact}
          compact={compact}
        />
      </motion.div>

      {/* Streak Tracker */}
      {!compact && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StreakTracker />
        </motion.div>
      )}

      {/* Quick Stats */}
      {!compact && (
        <motion.div
          className="mt-6 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
              Weekly XP
            </div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {formatXP(gameStats.weeklyStats.xpEarned)}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
            <div className="text-xs text-green-600 dark:text-green-400 mb-1">
              Study Hours
            </div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {gameStats.weeklyStats.studyHours.toFixed(1)}h
            </div>
          </div>
        </motion.div>
      )}

      {/* Level Up Modal */}
      <LevelUpModal />

      {/* XP Animation */}
      <XPAnimation
        xpAmount={0}
        position={compact ? 'bottom-right' : 'top-right'}
      />
    </div>
  );
};

export default GamificationDashboard;
