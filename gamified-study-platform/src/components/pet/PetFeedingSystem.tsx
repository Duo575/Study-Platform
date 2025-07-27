import React, { useState, useEffect } from 'react';
import {
  GiftIcon,
  ClockIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { usePetStore } from '../../store/petStore';
import { useGamificationStore } from '../../store/gamificationStore';
import type { PetFood, PetEffect } from '../../types';

interface PetFeedingSystemProps {
  userId: string;
  className?: string;
  showHistory?: boolean;
}

interface FeedingHistoryEntry {
  id: string;
  foodId: string;
  foodName: string;
  timestamp: Date;
  effects: PetEffect[];
  coinsSpent: number;
}

export const PetFeedingSystem: React.FC<PetFeedingSystemProps> = ({
  userId,
  className = '',
  showHistory = true,
}) => {
  const {
    pet,
    petStatus,
    petFood,
    selectedFood,
    isFeeding,
    feedPet,
    selectFood,
    useFood,
    fetchPetFood,
  } = usePetStore();

  const { coins, spendCoins } = useGamificationStore();

  const [feedingHistory, setFeedingHistory] = useState<FeedingHistoryEntry[]>(
    []
  );
  const [lastFeedingTime, setLastFeedingTime] = useState<Date | null>(null);
  const [feedingCooldown, setFeedingCooldown] = useState(0);
  const [showEffects, setShowEffects] = useState(false);
  const [lastEffects, setLastEffects] = useState<PetEffect[]>([]);

  // Load pet food on mount
  useEffect(() => {
    fetchPetFood();
  }, [fetchPetFood]);

  // Update feeding cooldown
  useEffect(() => {
    if (pet?.lastFed) {
      const lastFed = new Date(pet.lastFed);
      const now = new Date();
      const timeSinceLastFed = now.getTime() - lastFed.getTime();
      const cooldownTime = 30 * 60 * 1000; // 30 minutes cooldown

      if (timeSinceLastFed < cooldownTime) {
        const remaining = Math.ceil(
          (cooldownTime - timeSinceLastFed) / 1000 / 60
        );
        setFeedingCooldown(remaining);
        setLastFeedingTime(lastFed);

        const interval = setInterval(() => {
          const newRemaining = Math.ceil(
            (cooldownTime - (new Date().getTime() - lastFed.getTime())) /
              1000 /
              60
          );
          if (newRemaining <= 0) {
            setFeedingCooldown(0);
            clearInterval(interval);
          } else {
            setFeedingCooldown(newRemaining);
          }
        }, 60000);

        return () => clearInterval(interval);
      } else {
        setFeedingCooldown(0);
      }
    }
  }, [pet?.lastFed]);

  const handleFeedPet = async (food?: PetFood) => {
    if (!pet) return;

    try {
      const foodToUse = food || selectedFood;

      if (foodToUse) {
        // Check if user has enough coins
        if (coins < foodToUse.cost) {
          alert(
            `Not enough coins! You need ${foodToUse.cost} coins but only have ${coins}.`
          );
          return;
        }

        // Spend coins
        await spendCoins(
          foodToUse.cost,
          `Fed ${pet.name} with ${foodToUse.name}`
        );

        // Use the specific food item
        await useFood(userId, foodToUse.id);

        // Add to feeding history
        const historyEntry: FeedingHistoryEntry = {
          id: `feeding_${Date.now()}`,
          foodId: foodToUse.id,
          foodName: foodToUse.name,
          timestamp: new Date(),
          effects: foodToUse.effects,
          coinsSpent: foodToUse.cost,
        };

        setFeedingHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
        setLastEffects(foodToUse.effects);
        setShowEffects(true);

        // Hide effects after 3 seconds
        setTimeout(() => setShowEffects(false), 3000);
      } else {
        // Use basic feeding
        await feedPet(userId);

        const historyEntry: FeedingHistoryEntry = {
          id: `feeding_${Date.now()}`,
          foodId: 'basic',
          foodName: 'Basic Care',
          timestamp: new Date(),
          effects: [
            { type: 'health', value: 10 },
            { type: 'happiness', value: 15 },
          ],
          coinsSpent: 0,
        };

        setFeedingHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      }

      // Clear selected food
      selectFood(null);
    } catch (error) {
      console.error('Error feeding pet:', error);
      alert('Failed to feed pet. Please try again.');
    }
  };

  const getHungerLevel = () => {
    if (!petStatus) return 'unknown';

    if (petStatus.hunger >= 80) return 'very hungry';
    if (petStatus.hunger >= 60) return 'hungry';
    if (petStatus.hunger >= 40) return 'slightly hungry';
    if (petStatus.hunger >= 20) return 'satisfied';
    return 'full';
  };

  const getHungerColor = () => {
    if (!petStatus) return 'text-gray-500';

    if (petStatus.hunger >= 80) return 'text-red-600';
    if (petStatus.hunger >= 60) return 'text-orange-500';
    if (petStatus.hunger >= 40) return 'text-yellow-500';
    return 'text-green-600';
  };

  const canFeed = () => {
    return pet && feedingCooldown === 0 && !isFeeding;
  };

  const formatEffectValue = (effect: PetEffect) => {
    const sign = effect.value > 0 ? '+' : '';
    return `${sign}${effect.value}`;
  };

  const getEffectIcon = (type: string) => {
    switch (type) {
      case 'health':
        return '❤️';
      case 'happiness':
        return '😊';
      case 'hunger':
        return '🍽️';
      case 'energy':
        return '⚡';
      case 'evolution_boost':
        return '✨';
      default:
        return '📈';
    }
  };

  if (!pet) {
    return (
      <div className={`pet-feeding-system ${className}`}>
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <GiftIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No pet to feed</p>
          <p className="text-sm text-gray-500">Adopt a pet first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pet-feeding-system space-y-6 ${className}`}>
      {/* Pet Hunger Status */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {pet.name}'s Hunger
          </h3>
          <div className={`text-sm font-medium ${getHungerColor()}`}>
            {getHungerLevel()}
          </div>
        </div>

        {petStatus && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hunger Level</span>
              <span className="font-medium">{petStatus.hunger}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  petStatus.hunger >= 80
                    ? 'bg-red-500'
                    : petStatus.hunger >= 60
                      ? 'bg-orange-500'
                      : petStatus.hunger >= 40
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                }`}
                style={{ width: `${petStatus.hunger}%` }}
              />
            </div>
          </div>
        )}

        {/* Feeding Cooldown */}
        {feedingCooldown > 0 && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-700">
              Can feed again in {feedingCooldown} minutes
            </span>
          </div>
        )}

        {/* Feeding Effects Display */}
        {showEffects && lastEffects.length > 0 && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Feeding Effects Applied!
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {lastEffects.map((effect, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-1 text-sm text-green-700"
                >
                  <span>{getEffectIcon(effect.type)}</span>
                  <span className="capitalize">
                    {effect.type.replace('_', ' ')}
                  </span>
                  <span className="font-medium">
                    {formatEffectValue(effect)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Food Selection */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pet Food</h3>

        {/* Basic Feeding */}
        <div className="mb-4">
          <button
            onClick={() => handleFeedPet()}
            disabled={!canFeed()}
            className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
              canFeed()
                ? 'border-green-300 hover:border-green-400 hover:bg-green-50'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <GiftIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">
                {isFeeding ? 'Feeding...' : 'Basic Care (Free)'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Give your pet basic care and attention
            </p>
          </button>
        </div>

        {/* Premium Food Options */}
        {petFood.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Premium Food</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {petFood.map(food => (
                <div
                  key={food.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFood?.id === food.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    coins < food.cost ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (coins >= food.cost) {
                      selectFood(selectedFood?.id === food.id ? null : food);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900">{food.name}</h5>
                      <p className="text-xs text-gray-600">
                        {food.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-yellow-600">
                        {food.cost} coins
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          food.rarity === 'legendary'
                            ? 'bg-purple-100 text-purple-700'
                            : food.rarity === 'epic'
                              ? 'bg-orange-100 text-orange-700'
                              : food.rarity === 'rare'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {food.rarity}
                      </div>
                    </div>
                  </div>

                  {/* Effects Preview */}
                  <div className="flex flex-wrap gap-1">
                    {food.effects.map((effect, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded-full"
                      >
                        <span>{getEffectIcon(effect.type)}</span>
                        <span>{formatEffectValue(effect)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Insufficient coins warning */}
                  {coins < food.cost && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-red-600">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span>Need {food.cost - coins} more coins</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Feed with selected food button */}
            {selectedFood && (
              <button
                onClick={() => handleFeedPet(selectedFood)}
                disabled={!canFeed() || coins < selectedFood.cost}
                className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isFeeding
                  ? 'Feeding...'
                  : `Feed ${selectedFood.name} (${selectedFood.cost} coins)`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feeding History */}
      {showHistory && feedingHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Feeding History
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {feedingHistory.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <GiftIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {entry.foodName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {entry.coinsSpent > 0 && (
                    <div className="text-xs text-yellow-600">
                      -{entry.coinsSpent} coins
                    </div>
                  )}
                  <div className="flex space-x-1">
                    {entry.effects.map((effect, index) => (
                      <span key={index} className="text-xs">
                        {getEffectIcon(effect.type)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
