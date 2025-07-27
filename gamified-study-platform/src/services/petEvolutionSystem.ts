import type {
  StudyPetExtended,
  PetEvolutionStage,
  EvolutionRequirement,
  EvolutionEligibility,
  EvolutionResult,
} from '../types';

export interface EvolutionCelebration {
  id: string;
  petId: string;
  fromStage: string;
  toStage: string;
  timestamp: Date;
  celebrationData: {
    animation: string;
    effects: string[];
    rewards: Array<{
      type: 'coins' | 'xp' | 'item' | 'ability';
      amount?: number;
      itemId?: string;
      abilityId?: string;
    }>;
  };
}

export interface EvolutionHistory {
  id: string;
  petId: string;
  evolutionStage: string;
  timestamp: Date;
  requirements: EvolutionRequirement[];
  studyHoursAtEvolution: number;
  levelAtEvolution: number;
  happinessAtEvolution: number;
  healthAtEvolution: number;
}

/**
 * Service for managing pet evolution system
 */
export class PetEvolutionSystemService {
  private evolutionHistory: Map<string, EvolutionHistory[]> = new Map();
  private evolutionCelebrations: Map<string, EvolutionCelebration[]> =
    new Map();

  /**
   * Check if a pet is eligible for evolution
   */
  checkEvolutionEligibility(
    pet: StudyPetExtended,
    studyStats: {
      totalStudyHours: number;
      streakDays: number;
      questsCompleted: number;
      averageSessionLength: number;
    }
  ): EvolutionEligibility {
    const currentStage = pet.evolution.stage;
    const nextStage = this.getNextEvolutionStage(
      pet.species.id,
      currentStage.id
    );

    if (!nextStage) {
      return {
        canEvolve: false,
        nextStage: null,
        missingRequirements: [],
        progress: 100, // Already at max evolution
      };
    }

    const requirements = this.getEvolutionRequirements(
      pet.species.id,
      nextStage.id
    );
    const missingRequirements: EvolutionRequirement[] = [];
    let totalProgress = 0;
    let completedRequirements = 0;

    for (const requirement of requirements) {
      let currentValue = 0;
      let isCompleted = false;

      switch (requirement.type) {
        case 'study_hours':
          currentValue = studyStats.totalStudyHours;
          isCompleted = currentValue >= requirement.target;
          break;
        case 'streak_days':
          currentValue = studyStats.streakDays;
          isCompleted = currentValue >= requirement.target;
          break;
        case 'quests_completed':
          currentValue = studyStats.questsCompleted;
          isCompleted = currentValue >= requirement.target;
          break;
        case 'level_reached':
          currentValue = pet.level;
          isCompleted = currentValue >= requirement.target;
          break;
        case 'happiness_maintained':
          currentValue = pet.happiness;
          isCompleted = currentValue >= requirement.target;
          break;
        case 'health_maintained':
          currentValue = pet.health;
          isCompleted = currentValue >= requirement.target;
          break;
        case 'care_consistency':
          // Calculate care consistency based on feeding/playing frequency
          currentValue = this.calculateCareConsistency(pet);
          isCompleted = currentValue >= requirement.target;
          break;
      }

      const updatedRequirement: EvolutionRequirement = {
        ...requirement,
        current: currentValue,
      };

      if (isCompleted) {
        completedRequirements++;
        totalProgress += 100;
      } else {
        missingRequirements.push(updatedRequirement);
        const progress = Math.min(
          100,
          (currentValue / requirement.target) * 100
        );
        totalProgress += progress;
      }
    }

    const overallProgress =
      requirements.length > 0 ? totalProgress / requirements.length : 0;
    const canEvolve = missingRequirements.length === 0;

    return {
      canEvolve,
      nextStage: canEvolve ? nextStage : null,
      missingRequirements,
      progress: Math.round(overallProgress),
    };
  }

  /**
   * Trigger pet evolution
   */
  async triggerEvolution(
    pet: StudyPetExtended,
    studyStats: any
  ): Promise<EvolutionResult> {
    const eligibility = this.checkEvolutionEligibility(pet, studyStats);

    if (!eligibility.canEvolve || !eligibility.nextStage) {
      return {
        success: false,
        newStage: pet.evolution.stage,
        unlockedAbilities: [],
        celebrationAnimation: '',
        error: 'Pet is not eligible for evolution',
      };
    }

    try {
      const newStage = eligibility.nextStage;
      const unlockedAbilities = newStage.unlockedAbilities || [];

      // Create evolution history entry
      const historyEntry: EvolutionHistory = {
        id: `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        petId: pet.id,
        evolutionStage: newStage.id,
        timestamp: new Date(),
        requirements: this.getEvolutionRequirements(
          pet.species.id,
          newStage.id
        ),
        studyHoursAtEvolution: studyStats.totalStudyHours,
        levelAtEvolution: pet.level,
        happinessAtEvolution: pet.happiness,
        healthAtEvolution: pet.health,
      };

      this.addEvolutionHistory(pet.id, historyEntry);

      // Create celebration
      const celebration = this.createEvolutionCelebration(
        pet,
        pet.evolution.stage.name,
        newStage.name
      );

      this.addEvolutionCelebration(pet.id, celebration);

      return {
        success: true,
        newStage,
        unlockedAbilities,
        celebrationAnimation: celebration.celebrationData.animation,
        rewards: celebration.celebrationData.rewards,
      };
    } catch (error) {
      console.error('Error triggering evolution:', error);
      return {
        success: false,
        newStage: pet.evolution.stage,
        unlockedAbilities: [],
        celebrationAnimation: '',
        error: 'Failed to evolve pet',
      };
    }
  }

  /**
   * Get evolution requirements for a specific stage
   */
  private getEvolutionRequirements(
    speciesId: string,
    stageId: string
  ): EvolutionRequirement[] {
    // This would typically come from a database or configuration
    // For now, we'll return mock requirements based on stage
    const baseRequirements: Record<string, EvolutionRequirement[]> = {
      baby_to_child: [
        {
          type: 'study_hours',
          target: 10,
          current: 0,
          description: 'Study for 10 hours total',
        },
        {
          type: 'level_reached',
          target: 5,
          current: 0,
          description: 'Reach level 5',
        },
        {
          type: 'happiness_maintained',
          target: 70,
          current: 0,
          description: 'Maintain happiness above 70',
        },
      ],
      child_to_teen: [
        {
          type: 'study_hours',
          target: 25,
          current: 0,
          description: 'Study for 25 hours total',
        },
        {
          type: 'streak_days',
          target: 7,
          current: 0,
          description: 'Maintain a 7-day study streak',
        },
        {
          type: 'level_reached',
          target: 10,
          current: 0,
          description: 'Reach level 10',
        },
        {
          type: 'quests_completed',
          target: 5,
          current: 0,
          description: 'Complete 5 quests',
        },
      ],
      teen_to_adult: [
        {
          type: 'study_hours',
          target: 50,
          current: 0,
          description: 'Study for 50 hours total',
        },
        {
          type: 'streak_days',
          target: 14,
          current: 0,
          description: 'Maintain a 14-day study streak',
        },
        {
          type: 'level_reached',
          target: 20,
          current: 0,
          description: 'Reach level 20',
        },
        {
          type: 'care_consistency',
          target: 80,
          current: 0,
          description: 'Maintain 80% care consistency',
        },
        {
          type: 'health_maintained',
          target: 80,
          current: 0,
          description: 'Maintain health above 80',
        },
      ],
      adult_to_elder: [
        {
          type: 'study_hours',
          target: 100,
          current: 0,
          description: 'Study for 100 hours total',
        },
        {
          type: 'streak_days',
          target: 30,
          current: 0,
          description: 'Maintain a 30-day study streak',
        },
        {
          type: 'level_reached',
          target: 35,
          current: 0,
          description: 'Reach level 35',
        },
        {
          type: 'quests_completed',
          target: 25,
          current: 0,
          description: 'Complete 25 quests',
        },
      ],
    };

    return baseRequirements[stageId] || [];
  }

  /**
   * Get the next evolution stage for a species
   */
  private getNextEvolutionStage(
    speciesId: string,
    currentStageId: string
  ): PetEvolutionStage | null {
    // This would typically come from a database
    // For now, we'll return mock evolution stages
    const evolutionChain: Record<string, PetEvolutionStage> = {
      baby: {
        id: 'child',
        name: 'Child',
        description: 'Your pet has grown into a playful child!',
        imageUrl: `/pets/${speciesId}/child.png`,
        unlockedAbilities: ['play_bonus', 'study_companion'],
      },
      child: {
        id: 'teen',
        name: 'Teen',
        description: 'Your pet is now a curious teenager!',
        imageUrl: `/pets/${speciesId}/teen.png`,
        unlockedAbilities: ['focus_boost', 'motivation_reminder'],
      },
      teen: {
        id: 'adult',
        name: 'Adult',
        description: 'Your pet has matured into a wise adult!',
        imageUrl: `/pets/${speciesId}/adult.png`,
        unlockedAbilities: [
          'study_efficiency',
          'goal_tracking',
          'wisdom_bonus',
        ],
      },
      adult: {
        id: 'elder',
        name: 'Elder',
        description:
          'Your pet has become a wise elder with incredible abilities!',
        imageUrl: `/pets/${speciesId}/elder.png`,
        unlockedAbilities: ['master_focus', 'perfect_recall', 'time_mastery'],
      },
    };

    return evolutionChain[currentStageId] || null;
  }

  /**
   * Calculate care consistency percentage
   */
  private calculateCareConsistency(pet: StudyPetExtended): number {
    // This would typically analyze feeding/playing history
    // For now, we'll calculate based on current stats and time
    const now = new Date();
    const lastFed = new Date(pet.lastFed);
    const lastPlayed = new Date(pet.lastPlayed);

    const hoursSinceLastFed =
      (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60);
    const hoursSinceLastPlayed =
      (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60);

    // Calculate consistency based on regular care intervals
    const feedingConsistency = Math.max(
      0,
      100 - (hoursSinceLastFed / 24) * 100
    );
    const playingConsistency = Math.max(
      0,
      100 - (hoursSinceLastPlayed / 48) * 100
    );
    const healthConsistency = pet.health;
    const happinessConsistency = pet.happiness;

    return Math.round(
      (feedingConsistency +
        playingConsistency +
        healthConsistency +
        happinessConsistency) /
        4
    );
  }

  /**
   * Create evolution celebration
   */
  private createEvolutionCelebration(
    pet: StudyPetExtended,
    fromStage: string,
    toStage: string
  ): EvolutionCelebration {
    const rewards = [
      { type: 'coins' as const, amount: 100 },
      { type: 'xp' as const, amount: 50 },
    ];

    // Add stage-specific rewards
    if (toStage === 'Adult') {
      rewards.push({ type: 'item' as const, itemId: 'evolution_trophy' });
    }

    return {
      id: `celebration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      petId: pet.id,
      fromStage,
      toStage,
      timestamp: new Date(),
      celebrationData: {
        animation: 'evolution_sparkles',
        effects: ['confetti', 'sparkles', 'glow'],
        rewards,
      },
    };
  }

  /**
   * Add evolution history entry
   */
  private addEvolutionHistory(petId: string, entry: EvolutionHistory): void {
    const history = this.evolutionHistory.get(petId) || [];
    history.push(entry);

    // Keep only last 10 evolution entries
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    this.evolutionHistory.set(petId, history);
  }

  /**
   * Add evolution celebration
   */
  private addEvolutionCelebration(
    petId: string,
    celebration: EvolutionCelebration
  ): void {
    const celebrations = this.evolutionCelebrations.get(petId) || [];
    celebrations.push(celebration);

    // Keep only last 5 celebrations
    if (celebrations.length > 5) {
      celebrations.splice(0, celebrations.length - 5);
    }

    this.evolutionCelebrations.set(petId, celebrations);
  }

  /**
   * Get evolution history for a pet
   */
  getEvolutionHistory(petId: string): EvolutionHistory[] {
    return [...(this.evolutionHistory.get(petId) || [])];
  }

  /**
   * Get evolution celebrations for a pet
   */
  getEvolutionCelebrations(petId: string): EvolutionCelebration[] {
    return [...(this.evolutionCelebrations.get(petId) || [])];
  }

  /**
   * Get evolution progress summary
   */
  getEvolutionProgressSummary(
    pet: StudyPetExtended,
    studyStats: any
  ): {
    currentStage: string;
    nextStage: string | null;
    overallProgress: number;
    timeToNextEvolution: string;
    evolutionCount: number;
  } {
    const eligibility = this.checkEvolutionEligibility(pet, studyStats);
    const history = this.getEvolutionHistory(pet.id);

    // Estimate time to next evolution based on current progress
    let timeToNextEvolution = 'Unknown';
    if (eligibility.nextStage && eligibility.progress < 100) {
      const remainingProgress = 100 - eligibility.progress;
      if (remainingProgress <= 20) {
        timeToNextEvolution = '1-2 days';
      } else if (remainingProgress <= 50) {
        timeToNextEvolution = '1-2 weeks';
      } else {
        timeToNextEvolution = '2-4 weeks';
      }
    } else if (eligibility.canEvolve) {
      timeToNextEvolution = 'Ready now!';
    } else if (!eligibility.nextStage) {
      timeToNextEvolution = 'Max evolution reached';
    }

    return {
      currentStage: pet.evolution.stage.name,
      nextStage: eligibility.nextStage?.name || null,
      overallProgress: eligibility.progress,
      timeToNextEvolution,
      evolutionCount: history.length,
    };
  }

  /**
   * Get evolution tips based on missing requirements
   */
  getEvolutionTips(pet: StudyPetExtended, studyStats: any): string[] {
    const eligibility = this.checkEvolutionEligibility(pet, studyStats);
    const tips: string[] = [];

    if (eligibility.canEvolve) {
      tips.push('🎉 Your pet is ready to evolve! Check the evolution section.');
      return tips;
    }

    for (const requirement of eligibility.missingRequirements) {
      const remaining = requirement.target - requirement.current;

      switch (requirement.type) {
        case 'study_hours':
          tips.push(`📚 Study ${remaining} more hours to help your pet grow`);
          break;
        case 'streak_days':
          tips.push(`🔥 Maintain your study streak for ${remaining} more days`);
          break;
        case 'level_reached':
          tips.push(
            `⭐ Gain ${remaining} more levels through consistent studying`
          );
          break;
        case 'quests_completed':
          tips.push(`🎯 Complete ${remaining} more quests to unlock evolution`);
          break;
        case 'happiness_maintained':
          tips.push(
            `😊 Keep your pet's happiness above ${requirement.target} by playing regularly`
          );
          break;
        case 'health_maintained':
          tips.push(
            `❤️ Maintain your pet's health above ${requirement.target} through proper care`
          );
          break;
        case 'care_consistency':
          tips.push(
            `🤗 Be more consistent with feeding and playing with your pet`
          );
          break;
      }
    }

    return tips;
  }

  /**
   * Dispose of all data
   */
  dispose(): void {
    this.evolutionHistory.clear();
    this.evolutionCelebrations.clear();
  }
}

// Create and export singleton instance
export const petEvolutionSystem = new PetEvolutionSystemService();
