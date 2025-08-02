import React, { useState, useEffect } from 'react';
import {
  HeartIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetStore } from '../../store/petStore';
import {
  PetInteractionAnimation,
  LoadingAnimation,
  VisualFeedback,
  HoverScale,
} from '../ui/AnimationComponents';
import type { StudyPetExtended, PetStatus } from '../../types';

interface PetDisplayProps {
  userId: string;
  className?: string;
  showControls?: boolean;
  compact?: boolean;
}

export const PetDisplay: React.FC<PetDisplayProps> = ({
  userId,
  className = '',
  showControls = true,
  compact = false,
}) => {
  const {
    pet,
    petStatus,
    needsAttention,
    attentionReason,
    petNeeds,
    isFeeding,
    isPlaying,
    isInteracting,
    evolutionEligibility,
    feedPet,
    playWithPet,
    carePet,
    updatePetStatus,
    checkEvolutionEligibility,
    checkPetNeeds,
  } = usePetStore();

  const [petAnimation, setPetAnimation] = useState<
    'idle' | 'happy' | 'eating' | 'playing' | 'sleeping'
  >('idle');
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  // Update pet status periodically
  useEffect(() => {
    if (pet) {
      updatePetStatus(userId);
      checkEvolutionEligibility(userId);
      checkPetNeeds(userId);

      const interval = setInterval(() => {
        updatePetStatus(userId);
        checkPetNeeds(userId);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [pet, userId, updatePetStatus, checkEvolutionEligibility, checkPetNeeds]);

  // Update animation based on pet state
  useEffect(() => {
    if (isFeeding) {
      setPetAnimation('eating');
    } else if (isPlaying) {
      setPetAnimation('playing');
    } else if (pet && pet.happiness > 80) {
      setPetAnimation('happy');
    } else if (pet && pet.health < 30) {
      setPetAnimation('sleeping');
    } else {
      setPetAnimation('idle');
    }
  }, [isFeeding, isPlaying, pet]);

  // Get enhanced animation class based on interaction type
  const getEnhancedAnimationClass = () => {
    if (isFeeding) return 'pet-feeding-enhanced';
    if (isPlaying) return 'pet-playing-enhanced';
    if (isInteracting) return 'pet-caring-enhanced';
    if (evolutionEligibility?.canEvolve) return 'pet-evolving';
    if (pet && pet.health < 30) return 'pet-sleeping';
    return '';
  };

  const showFeedback = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  ) => {
    setFeedbackMessage({ type, message, visible: true });
  };

  const hideFeedback = () => {
    setFeedbackMessage(prev => ({ ...prev, visible: false }));
  };

  const handleFeedPet = async () => {
    try {
      await feedPet(userId);
      showFeedback('success', `${pet?.name} enjoyed the meal! 🍽️`);
    } catch (error) {
      console.error('Error feeding pet:', error);
      showFeedback('error', 'Failed to feed pet. Please try again.');
    }
  };

  const handlePlayWithPet = async () => {
    try {
      await playWithPet(userId);
      showFeedback('success', `${pet?.name} had fun playing! 🎾`);
    } catch (error) {
      console.error('Error playing with pet:', error);
      showFeedback('error', 'Failed to play with pet. Please try again.');
    }
  };

  const handleCarePet = async () => {
    try {
      await carePet(userId);
      showFeedback('success', `${pet?.name} feels loved and cared for! ❤️`);
    } catch (error) {
      console.error('Error caring for pet:', error);
      showFeedback('error', 'Failed to care for pet. Please try again.');
    }
  };

  const getStatusBarColor = (
    value: number,
    type: 'health' | 'happiness' | 'hunger' | 'energy'
  ) => {
    if (type === 'hunger') {
      // Hunger is bad when high
      if (value >= 80) return 'bg-red-500';
      if (value >= 60) return 'bg-yellow-500';
      return 'bg-green-500';
    } else {
      // Health, happiness, energy are good when high
      if (value >= 70) return 'bg-green-500';
      if (value >= 40) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };

  const getPetMoodEmoji = () => {
    if (!pet) return '😴';

    if (pet.happiness >= 80) return '😊';
    if (pet.happiness >= 60) return '🙂';
    if (pet.happiness >= 40) return '😐';
    if (pet.happiness >= 20) return '😔';
    return '😢';
  };

  const getPetImageUrl = () => {
    if (!pet) return '/pets/default.png';

    const stage = pet.evolution.stage.name || 'baby';
    const mood = petAnimation;
    return `/pets/${pet.species.id}/${stage}/${mood}.png`;
  };

  if (!pet) {
    return (
      <div className={`pet-display-empty ${className}`}>
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">🥚</div>
          <p className="text-gray-600">No pet adopted yet</p>
          <p className="text-sm text-gray-500">
            Complete your first study session to adopt a pet!
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`pet-display-compact flex items-center space-x-3 ${className}`}
      >
        <div className="relative">
          <img
            src={getPetImageUrl()}
            alt={pet.name}
            className="w-12 h-12 rounded-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src = '/pets/default.png';
            }}
          />
          {needsAttention && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate flex items-center space-x-1">
            <span>{pet.name}</span>
            <span className="text-lg">{getPetMoodEmoji()}</span>
          </div>
          <div className="text-sm text-gray-500">
            Level {pet.level} • {pet.evolution.stage.name}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pet-display bg-white rounded-lg shadow-lg p-6 ${className}`}
    >
      {/* Pet Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>{pet.name}</span>
            <span className="text-2xl">{getPetMoodEmoji()}</span>
          </h3>
          <p className="text-sm text-gray-600">
            Level {pet.level} {pet.species.name} • {pet.evolution.stage.name}
          </p>
        </div>

        {needsAttention && (
          <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Needs attention</span>
          </div>
        )}
      </div>

      {/* Pet Image */}
      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto relative">
          <PetInteractionAnimation
            isInteracting={isInteracting}
            interactionType={
              isFeeding ? 'feeding' : isPlaying ? 'playing' : 'idle'
            }
            className={`w-full h-full ${getEnhancedAnimationClass()}`}
          >
            <motion.img
              src={getPetImageUrl()}
              alt={pet.name}
              className="w-full h-full object-cover rounded-lg smooth-hover"
              onError={e => {
                (e.target as HTMLImageElement).src = '/pets/default.png';
              }}
              animate={{
                filter: pet.health < 30 ? 'grayscale(0.3)' : 'grayscale(0)',
              }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </PetInteractionAnimation>

          {/* Animation overlays */}
          <AnimatePresence>
            {petAnimation === 'playing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <SparklesIcon className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {evolutionEligibility?.canEvolve && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <SparklesIcon className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attention indicator */}
          <AnimatePresence>
            {needsAttention && (
              <motion.div
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 10 }}
                className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Bars */}
      {petStatus && (
        <div className="space-y-3 mb-6">
          {/* Health */}
          <div className="flex items-center space-x-3">
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Health</span>
                <span className="font-medium">{petStatus.health}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full progress-shimmer ${getStatusBarColor(petStatus.health, 'health')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${petStatus.health}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Happiness */}
          <div className="flex items-center space-x-3">
            <span className="text-lg">😊</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Happiness</span>
                <span className="font-medium">{petStatus.happiness}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full progress-shimmer ${getStatusBarColor(petStatus.happiness, 'happiness')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${petStatus.happiness}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
            </div>
          </div>

          {/* Hunger */}
          <div className="flex items-center space-x-3">
            <span className="text-lg">🍽️</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Hunger</span>
                <span className="font-medium">{petStatus.hunger}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full progress-shimmer ${getStatusBarColor(petStatus.hunger, 'hunger')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${petStatus.hunger}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Energy */}
          <div className="flex items-center space-x-3">
            <span className="text-lg">⚡</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Energy</span>
                <span className="font-medium">{petStatus.energy}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full progress-shimmer ${getStatusBarColor(petStatus.energy, 'energy')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${petStatus.energy}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pet Needs */}
      {petNeeds.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            Pet Needs:
          </h4>
          <div className="space-y-1">
            {petNeeds.map((need, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-sm text-yellow-700"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    need.urgency === 'critical'
                      ? 'bg-red-500'
                      : need.urgency === 'high'
                        ? 'bg-orange-500'
                        : need.urgency === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                  }`}
                />
                <span>{need.description}</span>
                {need.timeRemaining && (
                  <span className="text-xs text-yellow-600">
                    ({need.timeRemaining}m)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evolution Progress */}
      {evolutionEligibility && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-purple-800">
              Evolution Progress
            </h4>
            {evolutionEligibility.canEvolve && (
              <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                Ready!
              </span>
            )}
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="h-2 bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${evolutionEligibility.progress}%` }}
            />
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {evolutionEligibility.progress.toFixed(0)}% complete
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showControls && (
        <div className="flex space-x-2">
          <HoverScale scale={1.05}>
            <motion.button
              onClick={handleFeedPet}
              disabled={isInteracting}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bounce-hover ${
                petStatus?.hunger && petStatus.hunger > 70
                  ? 'attention-pulse'
                  : ''
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={isFeeding ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: isFeeding ? Infinity : 0 }}
              >
                <GiftIcon className="w-4 h-4" />
              </motion.div>
              <span>{isFeeding ? 'Feeding...' : 'Feed'}</span>
            </motion.button>
          </HoverScale>

          <HoverScale scale={1.05}>
            <motion.button
              onClick={handlePlayWithPet}
              disabled={isInteracting}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors elastic-hover ${
                petStatus?.happiness && petStatus.happiness < 50
                  ? 'attention-bounce'
                  : ''
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0 }}
              >
                <PlayIcon className="w-4 h-4" />
              </motion.div>
              <span>{isPlaying ? 'Playing...' : 'Play'}</span>
            </motion.button>
          </HoverScale>

          <HoverScale scale={1.05}>
            <motion.button
              onClick={handleCarePet}
              disabled={isInteracting}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors smooth-hover ${
                petStatus?.health && petStatus.health < 40
                  ? 'attention-shake'
                  : ''
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <HeartIcon className="w-4 h-4" />
              </motion.div>
              <span>Care</span>
            </motion.button>
          </HoverScale>
        </div>
      )}

      {/* Visual Feedback */}
      <VisualFeedback
        type={feedbackMessage.type}
        message={feedbackMessage.message}
        isVisible={feedbackMessage.visible}
        onClose={hideFeedback}
        duration={3000}
      />

      {/* Last Interaction Info */}
      {pet.lastFed && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Last fed: {new Date(pet.lastFed).toLocaleString()}</div>
            <div>Last played: {new Date(pet.lastPlayed).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};
