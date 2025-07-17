import React from 'react';
import { motion } from 'framer-motion';
import { useGamificationStore } from '../../../store/gamificationStore';
import { clsx } from 'clsx';

interface StreakTrackerProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakTracker({
  className,
  showLabel = true,
  size = 'md',
}: StreakTrackerProps) {
  const { streakData } = useGamificationStore();
  const { currentStreak, isActive } = streakData;

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Flame animation variants
  const flameVariants = {
    active: {
      scale: [1, 1.1, 1],
      filter: [
        'brightness(1)',
        'brightness(1.2)',
        'brightness(1)',
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
    inactive: {
      scale: 1,
      filter: 'brightness(0.7)',
    },
  };

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      {/* Streak Counter with Flame Icon */}
      <div className="relative">
        <motion.div
          className={clsx(
            'rounded-full flex items-center justify-center',
            isActive ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gray-300 dark:bg-gray-600',
            sizeClasses[size]
          )}
          variants={flameVariants}
          animate={isActive ? 'active' : 'inactive'}
        >
          <span className={clsx('font-bold text-white', currentStreak >= 100 ? 'text-xs' : '')}>
            {currentStreak}
          </span>
        </motion.div>
        
        {/* Flame Icon for Active Streak */}
        {isActive && currentStreak > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 text-orange-500"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Streak Label */}
      {showLabel && (
        <span className={clsx(
          'mt-1 font-medium',
          isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400',
          labelSizeClasses[size]
        )}>
          {currentStreak === 0 ? 'No Streak' : currentStreak === 1 ? 'Day Streak' : 'Day Streak'}
        </span>
      )}
    </div>
  );
}