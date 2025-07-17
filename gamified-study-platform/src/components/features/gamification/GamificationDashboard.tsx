import React from 'react';
import { motion } from 'framer-motion';
import { XPBar } from './XPBar';
import { StreakTracker } from './StreakTracker';
import { useGamificationStore } from '../../../store/gamificationStore';
import { formatLevel, formatXP } from '../../../utils/gamification';
import { Card } from '../../ui/Card';

interface GamificationDashboardProps {
  className?: string;
  compact?: boolean;
}

export function GamificationDashboard({
  className,
  compact = false,
}: GamificationDashboardProps) {
  const { gameStats } = useGamificationStore();

  if (!gameStats) {
    return null;
  }

  const { level, totalXP, currentXP, xpToNextLevel, streakDays, achievements } = gameStats;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className={`${className} w-full`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Stats Section */}
      <motion.div variants={itemVariants} className="mb-6">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Level and XP */}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                {formatLevel(level)}
              </h3>
              <XPBar showLevel={false} size="lg" />
            </div>

            {/* Streak */}
            <div className="flex items-center gap-4">
              <StreakTracker size="lg" />
            </div>
          </div>

          {!compact && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total XP */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-center">
                <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  Total XP
                </div>
                <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  {formatXP(totalXP)}
                </div>
              </div>

              {/* Next Level */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Next Level
                </div>
                <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {formatXP(currentXP)} / {formatXP(currentXP + xpToNextLevel)}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  Achievements
                </div>
                <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
                  {achievements.length}
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {!compact && (
        <>
          {/* Recent Achievements */}
          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Recent Achievements
            </h3>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <Card key={achievement.id} className="p-3 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center mr-3">
                      <img
                        src={achievement.iconUrl}
                        alt={achievement.title}
                        className="w-6 h-6"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = '/achievements/default.png';
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {achievement.unlockedAt
                          ? new Date(achievement.unlockedAt).toLocaleDateString()
                          : 'In progress'}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center text-gray-500 dark:text-gray-400">
                Complete tasks and quests to earn achievements!
              </Card>
            )}
          </motion.div>

          {/* Weekly Stats */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              This Week's Progress
            </h3>
            <Card className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {gameStats.weeklyStats.studyHours.toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Study Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {gameStats.weeklyStats.questsCompleted}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Quests Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {formatXP(gameStats.weeklyStats.xpEarned)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">XP Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {streakDays}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Day Streak</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}