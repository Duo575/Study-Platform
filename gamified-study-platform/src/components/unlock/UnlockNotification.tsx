/**
 * Unlock Notification Component
 *
 * This component displays notifications when new content is unlocked
 * based on study achievements and milestones.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnlockSystem } from '../../hooks/useUnlockSystem';
import type { UnlockResult } from '../../services/unlockManager';

interface UnlockNotificationProps {
  className?: string;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'center';
  autoHideDuration?: number; // in milliseconds
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
};

const typeIcons = {
  environment: '🌍',
  theme: '🎨',
  pet_accessory: '👑',
  music_pack: '🎵',
  decoration: '✨',
};

const celebrationEmojis = {
  small: '🎉',
  medium: '✨🎉✨',
  large: '🎊🎉🎊',
};

export const UnlockNotification: React.FC<UnlockNotificationProps> = ({
  className = '',
  position = 'top-right',
  autoHideDuration = 5000,
}) => {
  const { recentUnlocks, dismissUnlock } = useUnlockSystem();
  const [visibleUnlocks, setVisibleUnlocks] = useState<UnlockResult[]>([]);

  // Update visible unlocks when new ones arrive
  useEffect(() => {
    if (recentUnlocks.length > 0) {
      setVisibleUnlocks(recentUnlocks.slice(0, 3)); // Show max 3 at once
    }
  }, [recentUnlocks]);

  // Auto-hide notifications
  useEffect(() => {
    if (visibleUnlocks.length > 0) {
      const timers = visibleUnlocks.map(
        (unlock, index) =>
          setTimeout(
            () => {
              handleDismiss(unlock.content.id);
            },
            autoHideDuration + index * 500
          ) // Stagger dismissals
      );

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [visibleUnlocks, autoHideDuration]);

  const handleDismiss = (contentId: string) => {
    setVisibleUnlocks(prev =>
      prev.filter(unlock => unlock.content.id !== contentId)
    );
    dismissUnlock(contentId);
  };

  if (visibleUnlocks.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 space-y-3 ${className}`}
    >
      <AnimatePresence>
        {visibleUnlocks.map((unlock, index) => (
          <UnlockNotificationCard
            key={unlock.content.id}
            unlock={unlock}
            index={index}
            onDismiss={() => handleDismiss(unlock.content.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface UnlockNotificationCardProps {
  unlock: UnlockResult;
  index: number;
  onDismiss: () => void;
}

const UnlockNotificationCard: React.FC<UnlockNotificationCardProps> = ({
  unlock,
  index,
  onDismiss,
}) => {
  const { content, celebrationLevel, message } = unlock;

  const getRarityStyles = () => {
    switch (content.rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300';
      case 'epic':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300';
      case 'rare':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300';
      case 'common':
      default:
        return 'bg-white text-gray-800 border-gray-300';
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: position.includes('right') ? 300 : -300,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        x: position.includes('right') ? 300 : -300,
        scale: 0.8,
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      className={`
        relative max-w-sm rounded-lg shadow-lg border-2 p-4 cursor-pointer
        ${getRarityStyles()}
        hover:shadow-xl transition-shadow duration-200
      `}
      onClick={onDismiss}
    >
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute -top-2 -right-2 text-2xl"
      >
        {celebrationEmojis[celebrationLevel]}
      </motion.div>

      {/* Close Button */}
      <button
        onClick={e => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center text-white text-sm transition-colors"
      >
        ×
      </button>

      {/* Content */}
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl flex-shrink-0"
        >
          {typeIcons[content.type]}
        </motion.div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <motion.h4
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-bold text-lg leading-tight"
          >
            New {content.type.replace('_', ' ')} unlocked!
          </motion.h4>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-semibold text-base mt-1"
          >
            {content.name}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`text-sm mt-1 ${
              content.rarity === 'common'
                ? 'text-gray-600'
                : 'text-white text-opacity-90'
            }`}
          >
            {message}
          </motion.p>

          {/* Rarity Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-2"
          >
            <span
              className={`
              inline-block px-2 py-1 rounded-full text-xs font-medium
              ${
                content.rarity === 'legendary'
                  ? 'bg-yellow-200 text-yellow-800'
                  : content.rarity === 'epic'
                    ? 'bg-purple-200 text-purple-800'
                    : content.rarity === 'rare'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-800'
              }
            `}
            >
              {content.rarity.toUpperCase()}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Progress Bar Animation */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: autoHideDuration / 1000, ease: 'linear' }}
        className={`
          absolute bottom-0 left-0 h-1 rounded-b-lg
          ${content.rarity === 'common' ? 'bg-gray-400' : 'bg-white bg-opacity-50'}
        `}
      />

      {/* Sparkle Effects for Rare Items */}
      {(content.rarity === 'epic' || content.rarity === 'legendary') && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, Math.random() * 40 - 20],
                y: [0, Math.random() * 40 - 20],
              }}
              transition={{
                duration: 2,
                delay: 0.8 + i * 0.2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default UnlockNotification;
