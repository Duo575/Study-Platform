import { motion } from 'framer-motion';
import type { StudyPet } from '../../../types';

interface PetStatsProps {
  pet: StudyPet;
}

export function PetStats({ pet }: PetStatsProps) {
  // Calculate stat percentages
  const happinessPercent = Math.min(100, Math.max(0, pet.happiness));
  const healthPercent = Math.min(100, Math.max(0, pet.health));
  
  // Calculate time since last interactions
  const now = new Date();
  const lastFed = new Date(pet.lastFed);
  const lastPlayed = new Date(pet.lastPlayed);
  
  const hoursSinceFed = Math.floor((now.getTime() - lastFed.getTime()) / (1000 * 60 * 60));
  const hoursSincePlayed = Math.floor((now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60));
  
  // Get status text based on stat values
  const getHappinessStatus = () => {
    if (happinessPercent >= 80) return 'Ecstatic';
    if (happinessPercent >= 60) return 'Happy';
    if (happinessPercent >= 40) return 'Content';
    if (happinessPercent >= 20) return 'Sad';
    return 'Depressed';
  };
  
  const getHealthStatus = () => {
    if (healthPercent >= 80) return 'Excellent';
    if (healthPercent >= 60) return 'Good';
    if (healthPercent >= 40) return 'Fair';
    if (healthPercent >= 20) return 'Poor';
    return 'Critical';
  };
  
  const getFeedingStatus = () => {
    if (hoursSinceFed < 6) return 'Recently fed';
    if (hoursSinceFed < 12) return 'Getting hungry';
    if (hoursSinceFed < 24) return 'Hungry';
    return 'Starving';
  };
  
  const getPlayStatus = () => {
    if (hoursSincePlayed < 12) return 'Recently played';
    if (hoursSincePlayed < 24) return 'Wants to play';
    if (hoursSincePlayed < 48) return 'Bored';
    return 'Very bored';
  };
  
  // Get color classes based on stat values
  const getHappinessColor = () => {
    if (happinessPercent >= 60) return 'bg-green-500';
    if (happinessPercent >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getHealthColor = () => {
    if (healthPercent >= 60) return 'bg-green-500';
    if (healthPercent >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="font-medium text-sm mb-3">Pet Stats</h3>
      
      <div className="space-y-3">
        {/* Happiness stat */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Happiness</span>
            <span>{getHappinessStatus()}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getHappinessColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${happinessPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Health stat */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Health</span>
            <span>{getHealthStatus()}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getHealthColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${healthPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Level progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Level {pet.level}</span>
            <span>
              {pet.evolution.nextStageRequirements.length > 0 ? 
                `${pet.evolution.nextStageRequirements[0].current}/${pet.evolution.nextStageRequirements[0].target}` : 
                'Max level'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ 
                width: pet.evolution.nextStageRequirements.length > 0 ? 
                  `${(pet.evolution.nextStageRequirements[0].current / pet.evolution.nextStageRequirements[0].target) * 100}%` : 
                  '100%'
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center">
          <span className="mr-1">🍎</span>
          <span>{getFeedingStatus()}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">⚽</span>
          <span>{getPlayStatus()}</span>
        </div>
      </div>
    </div>
  );
}