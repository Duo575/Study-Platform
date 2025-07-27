/**
 * Study Pet Integration Service
 *
 * This service handles the integration between study sessions and pet growth,
 * providing a bridge between the study tracking system and pet management.
 */

import { studySessionTracker } from './studySessionTracker';
import { petMoodManager } from './petMoodManager';
import { usePetStore } from '../store/petStore';
import { useGamificationStore } from '../store/gamificationStore';
import type { StudyPetExtended, PetEvolution } from '../types';

export interface StudyPetIntegrationService {
  /**
   * Initialize the integration service for a user
   */
  initialize(userId: string): Promise<void>;

  /**
   * Handle study session completion and update pet accordingly
   */
  handleStudySessionComplete(
    userId: string,
    sessionDuration: number,
    sessionQuality: 'poor' | 'average' | 'good' | 'excellent',
    courseId?: string
  ): Promise<void>;

  /**
   * Handle quest completion and update pet
   */
  handleQuestComplete(
    userId: string,
    questType: 'daily' | 'weekly' | 'milestone',
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<void>;

  /**
   * Handle todo completion and update pet
   */
  handleTodoComplete(
    userId: string,
    estimatedMinutes: number,
    completedEarly: boolean
  ): Promise<void>;

  /**
   * Check and handle pet evolution based on study progress
   */
  checkPetEvolution(userId: string): Promise<boolean>;

  /**
   * Get pet growth recommendations based on study habits
   */
  getPetGrowthRecommendations(userId: string): Promise<string[]>;

  /**
   * Calculate bonus evolution progress for study streaks
   */
  calculateStreakEvolutionBonus(userId: string): Promise<number>;
}

class StudyPetIntegrationServiceImpl implements StudyPetIntegrationService {
  private initialized = new Set<string>();

  async initialize(userId: string): Promise<void> {
    if (this.initialized.has(userId)) {
      return;
    }

    // Start mood monitoring
    petMoodManager.startMoodMonitoring(userId);

    // Mark as initialized
    this.initialized.add(userId);
  }

  async handleStudySessionComplete(
    userId: string,
    sessionDuration: number,
    sessionQuality: 'poor' | 'average' | 'good' | 'excellent',
    courseId?: string
  ): Promise<void> {
    try {
      // Create a temporary session ID for tracking
      const sessionId = `temp_${Date.now()}`;

      // Start and immediately end a session to trigger pet updates
      await studySessionTracker.startStudySession({
        userId,
        sessionId,
        courseId,
        startTime: new Date(Date.now() - sessionDuration * 60 * 1000),
        type: 'free_study',
      });

      await studySessionTracker.endStudySession(
        userId,
        sessionId,
        sessionQuality
      );

      // Check for evolution after study session
      await this.checkPetEvolution(userId);
    } catch (error) {
      console.error('Error handling study session completion:', error);
    }
  }

  async handleQuestComplete(
    userId: string,
    questType: 'daily' | 'weekly' | 'milestone',
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<void> {
    try {
      const petStore = usePetStore.getState();

      // Update pet from quest completion
      await petStore.updateFromStudyActivity(userId, 'quest_complete');

      // Calculate happiness bonus based on quest type and difficulty
      let happinessBonus = 0;
      switch (questType) {
        case 'daily':
          happinessBonus =
            difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;
          break;
        case 'weekly':
          happinessBonus =
            difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
          break;
        case 'milestone':
          happinessBonus =
            difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 35;
          break;
      }

      // Apply mood change for quest completion
      await petMoodManager.handleStudySessionMoodResponse(
        userId,
        0, // No duration for quest completion
        difficulty === 'hard'
          ? 'excellent'
          : difficulty === 'medium'
            ? 'good'
            : 'average',
        true // Assume quest completion continues streak
      );

      // Check for evolution
      await this.checkPetEvolution(userId);
    } catch (error) {
      console.error('Error handling quest completion:', error);
    }
  }

  async handleTodoComplete(
    userId: string,
    estimatedMinutes: number,
    completedEarly: boolean
  ): Promise<void> {
    try {
      const petStore = usePetStore.getState();

      // Update pet from todo completion
      await petStore.updateFromStudyActivity(userId, 'todo_complete');

      // Apply mood change for todo completion
      const quality = completedEarly ? 'good' : 'average';
      await petMoodManager.handleStudySessionMoodResponse(
        userId,
        estimatedMinutes,
        quality,
        false // Todo completion doesn't affect streak
      );
    } catch (error) {
      console.error('Error handling todo completion:', error);
    }
  }

  async checkPetEvolution(userId: string): Promise<boolean> {
    try {
      const petStore = usePetStore.getState();
      const pet = petStore.pet as StudyPetExtended;

      if (!pet) {
        return false;
      }

      // Calculate total evolution progress including streak bonus
      const baseProgress = pet.evolution?.progress || 0;
      const streakBonus = await this.calculateStreakEvolutionBonus(userId);
      const totalProgress = baseProgress + streakBonus;

      // Check if pet can evolve
      const canEvolve =
        totalProgress >= 100 && pet.level >= 5 && pet.happiness >= 80;

      if (canEvolve) {
        const evolved = await petStore.checkEvolution(userId);

        if (evolved) {
          // Celebrate evolution milestone
          await petMoodManager.handleMilestoneMoodResponse(
            userId,
            'level_up',
            pet.level + 1
          );
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking pet evolution:', error);
      return false;
    }
  }

  async getPetGrowthRecommendations(userId: string): Promise<string[]> {
    try {
      const petStore = usePetStore.getState();
      const gamificationStore = useGamificationStore.getState();
      const pet = petStore.pet as StudyPetExtended;
      const gameStats = gamificationStore.gameStats;

      if (!pet || !gameStats) {
        return [];
      }

      const recommendations: string[] = [];

      // Check happiness level
      if (pet.happiness < 50) {
        recommendations.push(
          'Your pet needs more attention! Try completing some study sessions to boost happiness.'
        );
      } else if (pet.happiness < 80) {
        recommendations.push(
          'Keep up the good work! A few more quality study sessions will make your pet very happy.'
        );
      }

      // Check health level
      if (pet.health < 50) {
        recommendations.push(
          "Your pet's health is low. Regular study sessions and feeding will help improve it."
        );
      }

      // Check study streak
      const streakData = studySessionTracker.getStreakData(userId);
      if (!streakData || !streakData.isActive) {
        recommendations.push(
          "Start a study streak to boost your pet's evolution progress!"
        );
      } else if (streakData.currentStreak < 7) {
        recommendations.push(
          `Great ${streakData.currentStreak}-day streak! Reach 7 days for a big evolution bonus.`
        );
      }

      // Check evolution progress
      const evolutionProgress = pet.evolution?.progress || 0;
      if (evolutionProgress < 50) {
        recommendations.push(
          'Focus on consistent daily study sessions to help your pet evolve.'
        );
      } else if (evolutionProgress < 90) {
        recommendations.push(
          'Your pet is close to evolving! Maintain your study habits and high-quality sessions.'
        );
      }

      // Check level
      if (pet.level < 5) {
        recommendations.push(
          `Reach level 5 to unlock evolution. Current level: ${pet.level}`
        );
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting pet growth recommendations:', error);
      return [];
    }
  }

  async calculateStreakEvolutionBonus(userId: string): Promise<number> {
    return studySessionTracker.calculateStreakEvolutionBonus(userId);
  }
}

// Export singleton instance
export const studyPetIntegrationService = new StudyPetIntegrationServiceImpl();
