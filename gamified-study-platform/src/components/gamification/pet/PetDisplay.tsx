import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetStore } from '../../../store/petStore';
import type { StudyPet } from '../../../types';
import { PetStats } from './PetStats';
import { PetInteraction } from './PetInteraction';

interface PetDisplayProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  showActions?: boolean;
  className?: string;
}

export function PetDisplay({ 
  userId, 
  size = 'md', 
  showStats = true, 
  showActions = true,
  className = '' 
}: PetDisplayProps) {
  const { 
    pet, 
    isLoading, 
    error, 
    isInteracting, 
    interactionType,
    needsAttention,
    attentionReason,
    fetchUserPet,
    feedPet,
    playWithPet,
    checkEvolution
  } = usePetStore();
  
  const [showEvolutionAnimation, setShowEvolutionAnimation] = useState(false);
  const [evolutionStage, setEvolutionStage] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch pet data when component mounts
    fetchUserPet(userId);
    
    // Set up interval to check pet needs every 5 minutes
    const interval = setInterval(() => {
      if (pet) {
        usePetStore.getState().checkPetNeeds(userId);
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchUserPet, userId]);
  
  // Handle pet interactions
  const handleFeed = async () => {
    await feedPet(userId);
  };
  
  const handlePlay = async () => {
    await playWithPet(userId);
  };
  
  const handleCheckEvolution = async () => {
    const evolved = await checkEvolution(userId);
    
    if (evolved) {
      setShowEvolutionAnimation(true);
      setEvolutionStage(pet?.evolution.stage.name || null);
      
      // Hide evolution animation after 3 seconds
      setTimeout(() => {
        setShowEvolutionAnimation(false);
      }, 3000);
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  if (isLoading && !pet) {
    return (
      <div className={`flex justify-center items-center ${sizeClasses[size]}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error && !pet) {
    return (
      <div className="text-red-500 text-center">
        <p>Failed to load pet</p>
      </div>
    );
  }
  
  if (!pet) {
    return (
      <div className="text-gray-500 text-center">
        <p>No pet found</p>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      {/* Pet display */}
      <div className="flex flex-col items-center">
        <div className={`relative ${sizeClasses[size]} bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden mb-2`}>
          {/* Pet image/emoji */}
          <AnimatePresence>
            <motion.div
              key={`pet-${pet.species.name}-${pet.evolution.stage.name}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-4xl"
            >
              {getPetEmoji(pet.species.name)}
            </motion.div>
          </AnimatePresence>
          
          {/* Attention indicator */}
          {needsAttention && (
            <motion.div 
              className="absolute top-0 right-0 bg-red-500 rounded-full w-4 h-4"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
          
          {/* Interaction animations */}
          <AnimatePresence>
            {isInteracting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
              >
                {interactionType === 'feed' && (
                  <span className="text-2xl">🍎</span>
                )}
                {interactionType === 'play' && (
                  <span className="text-2xl">⚽</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Evolution animation */}
          <AnimatePresence>
            {showEvolutionAnimation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-yellow-400/50 flex items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2 }}
                  className="text-yellow-600 text-2xl"
                >
                  ✨
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="text-center">
          <h3 className="font-medium">{pet.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {pet.species.name} - Level {pet.level}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {pet.evolution.stage.name}
          </p>
        </div>
      </div>
      
      {/* Pet stats */}
      {showStats && (
        <div className="mt-4">
          <PetStats pet={pet} />
        </div>
      )}
      
      {/* Pet actions */}
      {showActions && (
        <div className="mt-4">
          <PetInteraction 
            pet={pet}
            needsAttention={needsAttention}
            attentionReason={attentionReason}
            onFeed={handleFeed}
            onPlay={handlePlay}
            onCheckEvolution={handleCheckEvolution}
            isInteracting={isInteracting}
          />
        </div>
      )}
    </div>
  );
}

// Helper function to get emoji based on pet species name
function getPetEmoji(speciesName: string): string {
  const emojis: Record<string, string> = {
    'Dragon': '🐉',
    'Phoenix': '🦅',
    'Owl': '🦉',
    'Cat': '🐱',
    'Robot': '🤖',
    // Add more as needed
  };
  
  return emojis[speciesName] || '🐾';
}