import React from 'react';
import { motion } from 'framer-motion';
import { formatXP } from '../../utils/gamification';
import type { GameStats } from '../../types';

interface XPBarProps {
  gameStats: GameStats;
  className?: string;
  showLevel?: boolean;
  showValues?: boolean;
  compact?: boolean;
}

/**
 * XP Bar component that displays the user's current XP progress with animations
 */
export const XPBar: React.FC<XPBarProps> = ({
  gameStats,
  className = '',
  showLevel = true,
  showValues = true,
  compact = false,
}) => {
  const { level, currentXP, xpToNextLevel } = gameStats;
  const progressPercentage = Math.min((currentXP / xpToNextLevel) * 100, 100);
  
  return (
    <div className={`flex flex-col ${compact ? 'gap-1' : 'gap-2'} ${className}`}>
      {showLevel && (
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm">Level {level}</span>
          {showValues && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {formatXP(currentXP)} / {formatXP(xpToNextLevel)} XP
            </span>
          )}
        </div>
      )}
      
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ 
            type: "spring",
            stiffness: 50,
            damping: 10
          }}
        />
      </div>
      
      {!compact && showValues && !showLevel && (
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Level {level}</span>
          <span>{formatXP(currentXP)} / {formatXP(xpToNextLevel)} XP</span>
          <span>Level {level + 1}</span>
        </div>
      )}
    </div>
  );
};

export default XPBar;