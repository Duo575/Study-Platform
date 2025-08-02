import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  StarIcon,
  ClockIcon,
  TrophyIcon,
  GiftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';
import { usePetStore } from '../../store/petStore';
import { useGamificationStore } from '../../store/gamificationStore';
import {
  petEvolutionSystem,
  type EvolutionCelebration,
} from '../../services/petEvolutionSystem';
import type { EvolutionEligibility, EvolutionRequirement } from '../../types';

interface PetEvolutionCenterProps {
  userId: string;
  className?: string;
}

export const PetEvolutionCenter: React.FC<PetEvolutionCenterProps> = ({
  userId,
  className = '',
}) => {
  const {
    pet,
    evolutionEligibility,
    checkEvolution,
    checkEvolutionEligibility,
    isEvolving,
  } = usePetStore();

  const { totalStudyTime, streakDays, level, questsCompleted } =
    useGamificationStore();

  const [evolutionProgress, setEvolutionProgress] = useState<any>(null);
  const [evolutionTips, setEvolutionTips] = useState<string[]>([]);
  const [evolutionHistory, setEvolutionHistory] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] =
    useState<EvolutionCelebration | null>(null);

  // Update evolution data when pet or stats change
  useEffect(() => {
    if (pet) {
      const studyStats = {
        totalStudyHours: Math.floor(totalStudyTime / 60), // Convert minutes to hours
        streakDays,
        questsCompleted,
        averageSessionLength: 25, // Mock data
      };

      // Get evolution progress
      const progress = petEvolutionSystem.getEvolutionProgressSummary(
        pet,
        studyStats
      );
      setEvolutionProgress(progress);

      // Get evolution tips
      const tips = petEvolutionSystem.getEvolutionTips(pet, studyStats);
      setEvolutionTips(tips);

      // Get evolution history
      const history = petEvolutionSystem.getEvolutionHistory(pet.id);
      setEvolutionHistory(history);

      // Check evolution eligibility
      checkEvolutionEligibility(userId);
    }
  }, [
    pet,
    totalStudyTime,
    streakDays,
    questsCompleted,
    userId,
    checkEvolutionEligibility,
  ]);

  const handleEvolvePet = async () => {
    if (!pet || !evolutionEligibility?.canEvolve) return;

    try {
      const studyStats = {
        totalStudyHours: Math.floor(totalStudyTime / 60),
        streakDays,
        questsCompleted,
        averageSessionLength: 25,
      };

      // Trigger evolution through the evolution system
      const result = await petEvolutionSystem.triggerEvolution(pet, studyStats);

      if (result.success) {
        // Show celebration
        const celebrations = petEvolutionSystem.getEvolutionCelebrations(
          pet.id
        );
        const latestCelebration = celebrations[celebrations.length - 1];

        if (latestCelebration) {
          setCelebrationData(latestCelebration);
          setShowCelebration(true);
        }

        // Update pet through store
        await checkEvolution(userId);
      } else {
        alert(result.error || 'Evolution failed. Please try again.');
      }
    } catch (error) {
      console.error('Error evolving pet:', error);
      alert('Failed to evolve pet. Please try again.');
    }
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'study_hours':
        return '📚';
      case 'streak_days':
        return '🔥';
      case 'level_reached':
        return '⭐';
      case 'quests_completed':
        return '🎯';
      case 'happiness_maintained':
        return '😊';
      case 'health_maintained':
        return '❤️';
      case 'care_consistency':
        return '🤗';
      default:
        return '📈';
    }
  };

  const getRequirementColor = (requirement: EvolutionRequirement) => {
    const progress =
      (Number(requirement.current) / Number(requirement.target)) * 100;
    if (progress >= 100) return 'text-green-600 bg-green-50 border-green-200';
    if (progress >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (progress >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (!pet) {
    return (
      <div className={`pet-evolution-center ${className}`}>
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No pet to evolve</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pet-evolution-center space-y-6 ${className}`}>
      {/* Evolution Celebration Modal */}
      {showCelebration && celebrationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <SparklesSolidIcon className="w-16 h-16 text-yellow-500 mx-auto animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Evolution Complete! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              {pet.name} has evolved from {celebrationData.fromStage} to{' '}
              {celebrationData.toStage}!
            </p>

            {/* Rewards */}
            {celebrationData.celebrationData.rewards.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rewards:
                </h3>
                <div className="space-y-2">
                  {celebrationData.celebrationData.rewards.map(
                    (reward, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center space-x-2 text-sm"
                      >
                        <GiftIcon className="w-4 h-4 text-purple-500" />
                        <span>
                          {reward.type === 'coins' && `${reward.amount} coins`}
                          {reward.type === 'xp' && `${reward.amount} XP`}
                          {reward.type === 'item' &&
                            `New item: ${reward.itemId}`}
                          {reward.type === 'ability' &&
                            `New ability: ${reward.abilityId}`}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowCelebration(false)}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Current Evolution Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <SparklesSolidIcon className="w-6 h-6 text-purple-500" />
            <span>Evolution Center</span>
          </h3>
          {evolutionEligibility?.canEvolve && (
            <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Ready to Evolve!
            </div>
          )}
        </div>

        {evolutionProgress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Status */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Stage:</span>
                  <span className="font-medium">
                    {evolutionProgress.currentStage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Stage:</span>
                  <span className="font-medium">
                    {evolutionProgress.nextStage || 'Max Evolution'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Evolutions:</span>
                  <span className="font-medium">
                    {evolutionProgress.evolutionCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time to Next:</span>
                  <span className="font-medium">
                    {evolutionProgress.timeToNextEvolution}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Evolution Progress
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium">
                      {evolutionProgress.overallProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${evolutionProgress.overallProgress}%` }}
                    />
                  </div>
                </div>

                {evolutionEligibility?.canEvolve && (
                  <button
                    onClick={handleEvolvePet}
                    disabled={isEvolving}
                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <SparklesSolidIcon className="w-5 h-5" />
                    <span>{isEvolving ? 'Evolving...' : 'Evolve Now!'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Evolution Requirements */}
      {evolutionEligibility &&
        evolutionEligibility.missingRequirements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Evolution Requirements
            </h3>
            <div className="space-y-3">
              {evolutionEligibility.missingRequirements.map(
                (requirement, index) => {
                  const progress =
                    (Number(requirement.current) / Number(requirement.target)) *
                    100;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getRequirementColor(requirement)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {getRequirementIcon(requirement.type)}
                          </span>
                          <span className="font-medium">
                            {requirement.description}
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          {requirement.current}/{requirement.target}
                        </div>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div
                          className="h-2 bg-current rounded-full transition-all duration-300 opacity-60"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

      {/* Evolution Tips */}
      {evolutionTips.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <ExclamationCircleIcon className="w-6 h-6 text-blue-500" />
            <span>Evolution Tips</span>
          </h3>
          <div className="space-y-2">
            {evolutionTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evolution History */}
      {evolutionHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrophyIcon className="w-6 h-6 text-yellow-500" />
            <span>Evolution History</span>
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {evolutionHistory.map((evolution, index) => (
              <div
                key={evolution.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Evolved to {evolution.evolutionStage}
                  </div>
                  <div className="text-sm text-gray-600">
                    Level {evolution.levelAtEvolution} •{' '}
                    {evolution.studyHoursAtEvolution}h studied
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(evolution.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evolution Abilities */}
      {pet.evolution.stage.unlockedAbilities &&
        pet.evolution.stage.unlockedAbilities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Abilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pet.evolution.stage.unlockedAbilities.map((ability, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg"
                >
                  <SparklesSolidIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700 capitalize">
                    {ability.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
