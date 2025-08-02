import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementNotifications } from '../../hooks/useAchievements';
import type { AchievementUnlock } from '../../types';

interface AchievementNotificationProps {
  className?: string;
}

/**
 * Achievement Notification Component
 * Shows celebration animations when achievements are unlocked
 */
export function AchievementNotification({
  className = '',
}: AchievementNotificationProps) {
  const {
    notifications,
    isVisible,
    dismissNotification,
    clearAllNotifications: _clearAllNotifications,
  } = useAchievementNotifications();

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 pointer-events-none ${className}`}>
      <AnimatePresence>
        {notifications.map((unlock, index) => (
          <AchievementUnlockModal
            key={unlock.achievement.id}
            unlock={unlock}
            index={index}
            onDismiss={() => dismissNotification(unlock.achievement.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Achievement Unlock Modal
 */
function AchievementUnlockModal({
  unlock,
  index,
  onDismiss,
}: {
  unlock: AchievementUnlock;
  index: number;
  onDismiss: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          bg: 'from-yellow-400 via-orange-500 to-red-500',
          border: 'border-yellow-400',
          glow: 'shadow-yellow-400/50',
          text: 'text-yellow-100',
        };
      case 'epic':
        return {
          bg: 'from-purple-400 via-pink-500 to-red-500',
          border: 'border-purple-400',
          glow: 'shadow-purple-400/50',
          text: 'text-purple-100',
        };
      case 'rare':
        return {
          bg: 'from-blue-400 via-indigo-500 to-purple-500',
          border: 'border-blue-400',
          glow: 'shadow-blue-400/50',
          text: 'text-blue-100',
        };
      default:
        return {
          bg: 'from-gray-400 via-gray-500 to-gray-600',
          border: 'border-gray-400',
          glow: 'shadow-gray-400/50',
          text: 'text-gray-100',
        };
    }
  };

  const colors = getRarityColors(unlock.achievement.rarity);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: index * 0.1,
          }}
          className="fixed inset-0 flex items-center justify-center pointer-events-auto"
          style={{ zIndex: 1000 + index }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleDismiss}
          />

          {/* Achievement Modal */}
          <motion.div
            className={`relative bg-gradient-to-br ${colors.bg} p-8 rounded-2xl border-2 ${colors.border} shadow-2xl ${colors.glow} max-w-md mx-4`}
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.6 }}
          >
            {/* Celebration Particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-70"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1, 0],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center relative z-10">
              {/* Achievement Unlocked Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <h2 className={`text-2xl font-bold ${colors.text} mb-1`}>
                  🎉 Achievement Unlocked!
                </h2>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors.text} bg-white bg-opacity-20`}
                >
                  {unlock.achievement.rarity.toUpperCase()}
                </div>
              </motion.div>

              {/* Achievement Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.4,
                  type: 'spring',
                  stiffness: 200,
                }}
                className="mb-4"
              >
                <div className="w-24 h-24 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <img
                    src={unlock.achievement.iconUrl}
                    alt={unlock.achievement.title}
                    className="w-16 h-16"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        '/achievements/default.png';
                    }}
                  />
                </div>
              </motion.div>

              {/* Achievement Details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <h3 className={`text-xl font-bold ${colors.text} mb-2`}>
                  {unlock.achievement.title}
                </h3>
                <p className={`${colors.text} opacity-90 mb-4`}>
                  {unlock.achievement.description}
                </p>

                {/* XP Reward */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.8,
                    type: 'spring',
                    stiffness: 300,
                  }}
                  className="inline-flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2"
                >
                  <span className="text-2xl">⭐</span>
                  <span className={`font-bold ${colors.text}`}>
                    +{unlock.xpAwarded} XP
                  </span>
                </motion.div>
              </motion.div>

              {/* Action Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={handleDismiss}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium px-6 py-3 rounded-lg transition-all backdrop-blur-sm"
              >
                Awesome! 🎊
              </motion.button>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -left-4 text-4xl"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              🏆
            </motion.div>

            <motion.div
              className="absolute -top-2 -right-2 text-3xl"
              animate={{
                rotate: [0, -10, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 0.5,
              }}
            >
              ⭐
            </motion.div>

            <motion.div
              className="absolute -bottom-2 -left-2 text-2xl"
              animate={{
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 1,
              }}
            >
              🎉
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Mini Achievement Toast Notification
 * For less intrusive notifications
 */
export function AchievementToast({
  unlock,
  onDismiss,
}: {
  unlock: AchievementUnlock;
  onDismiss: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🏆</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  Achievement Unlocked!
                </p>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-gray-600 truncate">
                {unlock.achievement.title}
              </p>

              <p className="text-xs text-blue-600 font-medium">
                +{unlock.xpAwarded} XP
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AchievementNotification;
