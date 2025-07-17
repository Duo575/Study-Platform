import { motion, AnimatePresence } from 'framer-motion';
import type { StudyPet } from '../../../types';

interface PetInteractionProps {
  pet: StudyPet;
  needsAttention: boolean;
  attentionReason: string | null;
  onFeed: () => void;
  onPlay: () => void;
  onCheckEvolution: () => void;
  isInteracting: boolean;
}

export function PetInteraction({
  pet,
  needsAttention,
  attentionReason,
  onFeed,
  onPlay,
  onCheckEvolution,
  isInteracting
}: PetInteractionProps) {
  // Check if pet can evolve
  const canEvolve = pet.evolution.nextStageRequirements.some(req => 
    req.current >= req.target
  );
  
  return (
    <div className="space-y-3">
      {/* Attention alert */}
      <AnimatePresence>
        {needsAttention && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3"
          >
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Your pet needs attention!
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {getAttentionMessage(attentionReason)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Interaction buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onFeed}
          disabled={isInteracting}
          className="flex items-center justify-center px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors disabled:opacity-50"
        >
          <span className="mr-1">🍎</span>
          <span>Feed</span>
        </button>
        
        <button
          onClick={onPlay}
          disabled={isInteracting}
          className="flex items-center justify-center px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors disabled:opacity-50"
        >
          <span className="mr-1">⚽</span>
          <span>Play</span>
        </button>
      </div>
      
      {/* Evolution button */}
      {canEvolve && (
        <motion.button
          onClick={onCheckEvolution}
          disabled={isInteracting}
          className="w-full flex items-center justify-center px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors disabled:opacity-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="mr-1">✨</span>
          <span>Evolve</span>
        </motion.button>
      )}
      
      {/* Pet accessories button */}
      <button
        disabled={isInteracting}
        className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
      >
        <span className="mr-1">👒</span>
        <span>Accessories</span>
      </button>
    </div>
  );
}

// Helper function to get attention message based on reason
function getAttentionMessage(reason: string | null): string {
  switch (reason) {
    case 'hungry':
      return 'Your pet is hungry! Please feed them.';
    case 'bored':
      return 'Your pet is bored! Play with them.';
    case 'lonely':
      return 'Your pet is feeling lonely. Spend some time with them!';
    case 'unhappy':
      return 'Your pet is unhappy. Try feeding and playing with them.';
    case 'unwell':
      return 'Your pet is not feeling well. They need care!';
    default:
      return 'Your pet needs your attention!';
  }
}