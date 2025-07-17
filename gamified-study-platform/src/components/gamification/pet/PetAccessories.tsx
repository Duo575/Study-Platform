import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePetStore } from '../../../store/petStore';
import type { PetAccessory } from '../../../types';

interface PetAccessoriesProps {
  userId: string;
  onClose: () => void;
}

export function PetAccessories({ userId, onClose }: PetAccessoriesProps) {
  const { pet, fetchAccessories, unlockAccessory } = usePetStore();
  const [accessories, setAccessories] = useState<PetAccessory[]>([]);
  const [selectedAccessory, setSelectedAccessory] = useState<PetAccessory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadAccessories = async () => {
      setIsLoading(true);
      try {
        const petAccessories = await fetchAccessories(userId);
        setAccessories(petAccessories);
      } catch (error) {
        console.error('Error loading accessories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAccessories();
  }, [fetchAccessories, userId]);
  
  const handleSelectAccessory = (accessory: PetAccessory) => {
    setSelectedAccessory(accessory);
  };
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-500';
      case 'rare':
        return 'text-blue-500';
      case 'epic':
        return 'text-purple-500';
      case 'legendary':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pet Accessories</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : accessories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No accessories unlocked yet. Complete quests and study sessions to unlock accessories!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {accessories.map((accessory) => (
            <motion.div
              key={accessory.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectAccessory(accessory)}
              className={`
                cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center
                ${selectedAccessory?.id === accessory.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'}
              `}
            >
              <div className="w-12 h-12 mb-2 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {/* This would be replaced with actual accessory images */}
                <span className="text-2xl">👒</span>
              </div>
              <h3 className="text-sm font-medium text-center">{accessory.name}</h3>
              <p className={`text-xs ${getRarityColor(accessory.rarity)}`}>
                {accessory.rarity.charAt(0).toUpperCase() + accessory.rarity.slice(1)}
              </p>
            </motion.div>
          ))}
        </div>
      )}
      
      {selectedAccessory && (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-1">{selectedAccessory.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {selectedAccessory.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Unlocked on {selectedAccessory.unlockedAt.toLocaleDateString()}
          </p>
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Close
        </button>
        
        {selectedAccessory && (
          <button
            onClick={() => {
              // Toggle accessory on/off logic would go here
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Equip
          </button>
        )}
      </div>
    </div>
  );
}