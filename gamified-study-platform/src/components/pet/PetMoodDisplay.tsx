/**
 * Pet Mood Display Component
 *
 * This component displays the pet's current mood, happiness level,
 * and growth progress based on study habits.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useStudyPetIntegration,
  usePetEvolutionProgress,
} from '../../hooks/useStudyPetIntegration';
import { usePetStore } from '../../store/petStore';
import type { StudyPetExtended, PetMood } from '../../types';

interface PetMoodDisplayProps {
  className?: string;
  showEvolutionProgress?: boolean;
  showRecommendations?: boolean;
}

const moodEmojis: Record<PetMood['current'], string> = {
  excited: '🤩',
  happy: '😊',
  content: '😌',
  sad: '😢',
  sleepy: '😴',
  hungry: '🍽️',
};

const moodColors: Record<PetMood['current'], string> = {
  excited: 'text-yellow-500',
  happy: 'text-green-500',
  content: 'text-blue-500',
  sad: 'text-gray-500',
  sleepy: 'text-purple-500',
  hungry: 'text-orange-500',
};

const moodBackgrounds: Record<PetMood['current'], string> = {
  excited: 'bg-yellow-100 border-yellow-300',
  happy: 'bg-green-100 border-green-300',
  content: 'bg-blue-100 border-blue-300',
  sad: 'bg-gray-100 border-gray-300',
  sleepy: 'bg-purple-100 border-purple-300',
  hungry: 'bg-orange-100 border-orange-300',
};

export const PetMoodDisplay: React.FC<PetMoodDisplayProps> = ({
  className = '',
  showEvolutionProgress = true,
  showRecommendations = true,
}) => {
  const { pet } = usePetStore();
  const { getPetMoodSummary, lastMoodChange } = useStudyPetIntegration();
  const evolutionProgress = usePetEvolutionProgress();

  const [moodSummary, setMoodSummary] =
    useState<ReturnType<typeof getPetMoodSummary>>(null);
  const [showMoodChange, setShowMoodChange] = useState(false);

  // Update mood summary periodically
  useEffect(() => {
    const updateMoodSummary = () => {
      const summary = getPetMoodSummary();
      setMoodSummary(summary);
    };

    updateMoodSummary();
    const interval = setInterval(updateMoodSummary, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [getPetMoodSummary]);

  // Show mood change animation when mood changes
  useEffect(() => {
    if (lastMoodChange) {
      setShowMoodChange(true);
      const timer = setTimeout(() => setShowMoodChange(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastMoodChange]);

  if (!pet || !moodSummary) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🐾</div>
          <p>No pet found</p>
        </div>
      </div>
    );
  }

  const typedPet = pet as StudyPetExtended;
  const currentMood = moodSummary.currentMood;
  const happiness = moodSummary.happiness;

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Pet Mood Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {typedPet.name}'s Mood
        </h3>
        <div
          className={`px-3 py-1 rounded-full border-2 ${moodBackgrounds[currentMood]}`}
        >
          <span className="text-sm font-medium capitalize">
            {moodEmojis[currentMood]} {currentMood}
          </span>
        </div>
      </div>

      {/* Happiness Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Happiness</span>
          <span className="text-sm font-bold text-gray-800">
            {happiness}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className={`h-3 rounded-full ${
              happiness >= 80
                ? 'bg-green-500'
                : happiness >= 60
                  ? 'bg-yellow-500'
                  : happiness >= 40
                    ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${happiness}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Mood Message */}
      <div className="mb-4">
        <div
          className={`p-3 rounded-lg border-l-4 ${
            currentMood === 'excited'
              ? 'bg-yellow-50 border-yellow-400'
              : currentMood === 'happy'
                ? 'bg-green-50 border-green-400'
                : currentMood === 'content'
                  ? 'bg-blue-50 border-blue-400'
                  : currentMood === 'sad'
                    ? 'bg-gray-50 border-gray-400'
                    : currentMood === 'sleepy'
                      ? 'bg-purple-50 border-purple-400'
                      : 'bg-orange-50 border-orange-400'
          }`}
        >
          <p className="text-sm text-gray-700 italic">
            "{moodSummary.message}"
          </p>
        </div>
      </div>

      {/* Recent Mood Factors */}
      {moodSummary.recentFactors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Recent Influences
          </h4>
          <div className="space-y-1">
            {moodSummary.recentFactors.slice(0, 3).map((factor, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-gray-600">{factor.description}</span>
                <span
                  className={`font-medium ${
                    factor.impact > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {factor.impact > 0 ? '+' : ''}
                  {factor.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evolution Progress */}
      {showEvolutionProgress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Evolution Progress
            </span>
            <span className="text-sm font-bold text-gray-800">
              {evolutionProgress.totalProgress}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${evolutionProgress.totalProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {evolutionProgress.streakBonus > 0 && (
            <div className="text-xs text-purple-600 font-medium">
              +{evolutionProgress.streakBonus} streak bonus!
            </div>
          )}

          {evolutionProgress.nextEvolutionRequirements.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">
                Next evolution requirements:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                {evolutionProgress.nextEvolutionRequirements.map(
                  (req, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {req}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mood Change Animation */}
      <AnimatePresence>
        {showMoodChange && lastMoodChange && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 rounded-lg"
          >
            <div className="text-center p-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-4xl mb-2"
              >
                {moodEmojis[lastMoodChange.newMood]}
              </motion.div>
              <p className="text-sm font-medium text-gray-800 mb-1">
                Mood changed to {lastMoodChange.newMood}!
              </p>
              <p className="text-xs text-gray-600">{lastMoodChange.message}</p>
              {lastMoodChange.celebrationLevel && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-2"
                >
                  {lastMoodChange.celebrationLevel === 'large' && '🎉'}
                  {lastMoodChange.celebrationLevel === 'medium' && '✨'}
                  {lastMoodChange.celebrationLevel === 'small' && '👍'}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PetMoodDisplay;
