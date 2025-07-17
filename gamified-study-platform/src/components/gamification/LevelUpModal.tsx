import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore } from '../../store/gamificationStore';
import type { Achievement } from '../../types';
import XPBar from './XPBar';

interface LevelUpModalProps {
  onClose?: () => void;
}

/**
 * Modal that displays when a user levels up, with animations and rewards
 */
export const LevelUpModal: React.FC<LevelUpModalProps> = ({ onClose }) => {
  const { isLevelUpModalOpen, levelUpData, closeLevelUpModal } = useGamificationStore();
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);
  
  const handleClose = () => {
    closeLevelUpModal();
    if (onClose) onClose();
  };
  
  if (!levelUpData) return null;
  
  const { oldLevel, newLevel, xpGained, newAchievements } = levelUpData;
  
  return (
    <AnimatePresence>
      {isLevelUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Confetti animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="confetti-container">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="confetti"
                    initial={{ 
                      top: "-10%", 
                      left: `${Math.random() * 100}%`,
                      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                      width: `${Math.random() * 10 + 5}px`,
                      height: `${Math.random() * 10 + 5}px`,
                      opacity: 1,
                      rotate: 0
                    }}
                    animate={{ 
                      top: "100%", 
                      rotate: 360,
                      opacity: 0
                    }}
                    transition={{ 
                      duration: Math.random() * 3 + 2,
                      ease: "linear",
                      delay: Math.random() * 0.5
                    }}
                    style={{
                      position: "absolute",
                      borderRadius: Math.random() > 0.5 ? "50%" : "0"
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Modal content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <motion.h2 
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Level Up!
                </motion.h2>
                
                <motion.div
                  className="mt-2 text-gray-600 dark:text-gray-300"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  You've reached level {newLevel}
                </motion.div>
              </div>
              
              <motion.div
                className="flex justify-center items-center gap-4 my-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.6
                }}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-400 dark:text-gray-500">{oldLevel}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Previous</div>
                </div>
                
                <motion.div 
                  className="text-3xl text-blue-500"
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 0.5,
                    delay: 1,
                    ease: "easeInOut"
                  }}
                >
                  →
                </motion.div>
                
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">{newLevel}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">New Level</div>
                </div>
              </motion.div>
              
              <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-center mb-2 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">+{xpGained} XP</span> earned!
                </div>
                
                {/* Simulated XP bar for the new level */}
                <XPBar 
                  gameStats={{
                    ...levelUpData,
                    level: newLevel,
                    currentXP: 0,
                    xpToNextLevel: 100, // This will be calculated properly in the real app
                    totalXP: 0,
                    streakDays: 0,
                    achievements: [],
                    lastActivity: new Date(),
                    weeklyStats: {
                      studyHours: 0,
                      questsCompleted: 0,
                      streakMaintained: false,
                      xpEarned: 0
                    }
                  }}
                  showLevel={false}
                />
              </motion.div>
              
              {/* New achievements section */}
              {newAchievements && newAchievements.length > 0 && (
                <motion.div
                  className="mt-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    New Achievements Unlocked!
                  </h3>
                  <div className="space-y-2">
                    {newAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1 + (index * 0.2) }}
                      >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <img 
                            src={achievement.iconUrl} 
                            alt={achievement.title}
                            className="w-6 h-6"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).src = '/icons/achievement-default.svg';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{achievement.title}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</div>
                        </div>
                        <div className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400">
                          +{achievement.xpReward} XP
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;