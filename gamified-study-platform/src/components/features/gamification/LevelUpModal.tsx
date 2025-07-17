import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../../ui/Modal';
import { useGamificationStore } from '../../../store/gamificationStore';
import { Button } from '../../ui/Button';

export function LevelUpModal() {
  const { isLevelUpModalOpen, levelUpData, closeLevelUpModal } = useGamificationStore();

  // Confetti effect
  useEffect(() => {
    if (isLevelUpModalOpen && levelUpData) {
      // This would be a good place to add a confetti library
      // For example: import confetti from 'canvas-confetti'
      // confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [isLevelUpModalOpen, levelUpData]);

  if (!levelUpData) {
    return null;
  }

  const { oldLevel, newLevel, xpGained, newAchievements } = levelUpData;

  return (
    <Modal
      isOpen={isLevelUpModalOpen}
      onClose={closeLevelUpModal}
      size="md"
      showCloseButton={false}
    >
      <div className="flex flex-col items-center text-center p-4">
        {/* Level Up Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative">
            {/* Starburst Background */}
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 20, ease: "linear", repeat: Infinity },
                scale: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
              }}
              className="absolute inset-0 w-32 h-32 mx-auto bg-yellow-400 rounded-full opacity-30 -z-10"
              style={{ filter: 'blur(15px)' }}
            />
            
            {/* Level Badge */}
            <motion.div
              className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(79, 70, 229, 0.7)",
                  "0 0 0 20px rgba(79, 70, 229, 0)",
                ]
              }}
              transition={{ 
                duration: 1.5,
                repeat: 3,
                repeatType: "loop",
                ease: "easeOut",
              }}
            >
              <span className="text-4xl font-bold text-white">{newLevel}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Level Up Text */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Level Up!
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 dark:text-gray-300 mb-6"
        >
          You've advanced from Level {oldLevel} to Level {newLevel}!
        </motion.p>

        {/* XP Gained */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3 mb-6"
        >
          <span className="text-indigo-800 dark:text-indigo-300 font-medium">
            +{xpGained} XP gained
          </span>
        </motion.div>

        {/* New Achievements (if any) */}
        {newAchievements && newAchievements.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="w-full mb-6"
          >
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              New Achievements Unlocked!
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {newAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm flex items-center"
                >
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
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{achievement.xpReward} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <Button onClick={closeLevelUpModal} variant="primary" size="lg">
            Continue Your Journey
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}