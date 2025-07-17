import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { formatXP, getProgressPercentage } from '../../../utils/gamification';
import { useGamificationStore } from '../../../store/gamificationStore';
import { clsx } from 'clsx';

interface XPBarProps {
  className?: string;
  showLevel?: boolean;
  showXP?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function XPBar({
  className,
  showLevel = true,
  showXP = true,
  size = 'md',
  animated = true,
}: XPBarProps) {
  const { gameStats, xpAnimationQueue } = useGamificationStore();
  const controls = useAnimation();

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  useEffect(() => {
    if (animated && xpAnimationQueue.length > 0) {
      // Animate the XP bar when new XP is gained
      controls.start({
        scaleX: 1,
        transition: { duration: 0.8, ease: 'easeOut' },
      });
    }
  }, [animated, controls, xpAnimationQueue]);

  if (!gameStats) {
    return null;
  }

  const { level, currentXP, xpToNextLevel } = gameStats;
  const progressPercentage = getProgressPercentage(currentXP, currentXP + xpToNextLevel);

  return (
    <div className={clsx('w-full', className)}>
      {/* XP Bar Container */}
      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* XP Progress */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
          style={{ width: `${progressPercentage}%` }}
          initial={{ scaleX: animated ? 0 : 1, originX: 0 }}
          animate={controls}
        />
        
        {/* Static Bar (for initial render) */}
        <div 
          className={clsx(
            'w-full bg-transparent',
            sizeClasses[size]
          )}
        />
      </div>

      {/* XP Information */}
      {(showLevel || showXP) && (
        <div className="flex justify-between items-center mt-1 text-sm">
          {showLevel && (
            <div className="font-medium text-gray-700 dark:text-gray-300">
              Level {level}
            </div>
          )}
          {showXP && (
            <div className="text-gray-600 dark:text-gray-400">
              {formatXP(currentXP)} / {formatXP(currentXP + xpToNextLevel)} XP
            </div>
          )}
        </div>
      )}
    </div>
  );
}