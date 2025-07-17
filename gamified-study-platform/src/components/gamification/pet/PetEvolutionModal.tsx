import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudyPet } from '../../../types';

interface PetEvolutionModalProps {
  pet: StudyPet;
  previousStage: string;
  newStage: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PetEvolutionModal({
  pet,
  previousStage,
  newStage,
  isOpen,
  onClose
}: PetEvolutionModalProps) {
  // Close modal after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  
  // Get emoji for pet species
  const getPetEmoji = (speciesName: string): string => {
    const emojis: Record<string, string> = {
      'Dragon': '🐉',
      'Phoenix': '🦅',
      'Owl': '🦉',
      'Cat': '🐱',
      'Robot': '🤖',
      // Add more as needed
    };
    
    return emojis[speciesName] || '🐾';
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Evolution Complete!</h2>
              
              <div className="flex justify-center items-center space-x-8 my-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 mx-auto opacity-70">
                    <span className="text-4xl">{getPetEmoji(pet.species.name)}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{previousStage}</p>
                </div>
                
                <div className="text-2xl">
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ➡️
                  </motion.div>
                </div>
                
                <div className="text-center">
                  <motion.div
                    className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2 mx-auto"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(250, 204, 21, 0.4)',
                        '0 0 0 10px rgba(250, 204, 21, 0.2)',
                        '0 0 0 0 rgba(250, 204, 21, 0)'
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <span className="text-5xl">{getPetEmoji(pet.species.name)}</span>
                  </motion.div>
                  <p className="text-sm font-medium">{newStage}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <p className="text-sm">
                  Congratulations! Your {pet.name} has evolved to the <strong>{newStage}</strong> stage!
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  New abilities and accessories have been unlocked.
                </p>
              </div>
              
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Awesome!
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}