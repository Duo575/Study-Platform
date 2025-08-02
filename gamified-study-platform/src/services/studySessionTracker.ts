/**
 * Study Session Tracker Service
 *
 * This service tracks study sessions and their impact on pet growth,
 * implementing the reward system integration with study progress.
 */

import { usePetStore } from '../store/petStore';
import { useGamificationStore } from '../store/gamificationStore';
import { useStoreStore } from '../store/storeStore';
import type { StudySession, StudyPetExtended, PetMood } from '../types';

export interface StudySessionData {
  userId: string;
  sessionId: string;
  courseId?: string;
  todoItemId?: string;
  questId?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: 'pomodoro' | 'free_study' | 'break';
  quality?: 'poor' | 'average' | 'good' | 'excellent';
  notes?: string;
}

export interface StudyStreakData {
  currentStreak: number;
  isActive: boolean;
  lastStudyDate: Date | null;
  streakBonusEarned: boolean;
  longestStreak: number;
}

export interface PetGrowthImpact {
  happinessChange: number;
  healthChange: number;
  evolutionProgressChange: number;
  moodChange: PetMood['current'];
  bonusMultiplier: number;
  reasons: string[];
}

export class StudySessionTracker {
  private static instance: StudySessionTracker;
  private activeSessions: Map<string, StudySessionData> = new Map();
  private streakData: Map<string, StudyStreakData> = new Map();

  static getInstance(): StudySessionTracker {
    if (!StudySessionTracker.instance) {
      StudySessionTracker.instance = new StudySessionTracker();
    }
    return StudySessionTracker.instance;
  }

  /**
   * Start tracking a study session
   */
  async startStudySession(
    data: Omit<StudySessionData, 'endTime' | 'duration'>
  ): Promise<void> {
    const sessionData: StudySessionData = {
      ...data,
      endTime: new Date(), // Will be updated when session ends
      duration: 0,
    };

    this.activeSessions.set(data.sessionId, sessionData);

    // Update pet mood to indicate studying
    await this.updatePetMoodForStudyStart(data.userId);
  }

  /**
   * End a study session and calculate pet growth impact
   */
  async endStudySession(
    userId: string,
    sessionId: string,
    quality: StudySessionData['quality'] = 'average',
    notes?: string
  ): Promise<PetGrowthImpact | null> {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) {
      console.warn(`No active session found for sessionId: ${sessionId}`);
      return null;
    }

    // Update session data
    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - sessionData.startTime.getTime()) / (1000 * 60)
    );

    sessionData.endTime = endTime;
    sessionData.duration = duration;
    sessionData.quality = quality;
    sessionData.notes = notes;

    // Calculate pet growth impact
    const petImpact = await this.calculatePetGrowthImpact(userId, sessionData);

    // Apply the impact to the pet
    if (petImpact) {
      await this.applyPetGrowthImpact(userId, petImpact);
    }

    // Update study streak
    await this.updateStudyStreak(userId);

    // Award coins and XP
    await this.awardStudyRewards(userId, sessionData, petImpact);

    // Clean up
    this.activeSessions.delete(sessionId);

    return petImpact;
  }

  /**
   * Calculate the impact of a study session on pet growth
   */
  private async calculatePetGrowthImpact(
    userId: string,
    sessionData: StudySessionData
  ): Promise<PetGrowthImpact | null> {
    const petStore = usePetStore.getState();
    const pet = petStore.pet;

    if (!pet) {
      return null;
    }

    const { duration, quality, type } = sessionData;
    const streakData = this.streakData.get(userId);

    // Base impact calculation
    let happinessChange = 0;
    let healthChange = 0;
    let evolutionProgressChange = 0;
    let bonusMultiplier = 1.0;
    const reasons: string[] = [];

    // Duration-based impact
    if (duration >= 25) {
      // Standard pomodoro session
      happinessChange += 15;
      healthChange += 5;
      evolutionProgressChange += 2;
      reasons.push('Completed focused study session');
    } else if (duration >= 15) {
      happinessChange += 10;
      healthChange += 3;
      evolutionProgressChange += 1;
      reasons.push('Completed short study session');
    } else if (duration >= 5) {
      happinessChange += 5;
      healthChange += 1;
      evolutionProgressChange += 0.5;
      reasons.push('Brief study session');
    }

    // Quality-based multiplier
    switch (quality) {
      case 'excellent':
        bonusMultiplier *= 1.5;
        reasons.push('Excellent study quality');
        break;
      case 'good':
        bonusMultiplier *= 1.2;
        reasons.push('Good study quality');
        break;
      case 'average':
        bonusMultiplier *= 1.0;
        break;
      case 'poor':
        bonusMultiplier *= 0.7;
        reasons.push('Study quality could be improved');
        break;
    }

    // Streak bonus
    if (streakData && streakData.isActive && streakData.currentStreak > 1) {
      const streakBonus = Math.min(0.5, streakData.currentStreak * 0.1);
      bonusMultiplier *= 1 + streakBonus;
      reasons.push(`${streakData.currentStreak}-day streak bonus`);
    }

    // Session type bonus
    if (type === 'pomodoro') {
      bonusMultiplier *= 1.1;
      reasons.push('Pomodoro technique bonus');
    }

    // Pet current state consideration
    const currentHappiness = pet.happiness;
    const currentHealth = pet.health;

    // Diminishing returns for high stats
    if (currentHappiness > 80) {
      happinessChange *= 0.7;
    }
    if (currentHealth > 90) {
      healthChange *= 0.5;
    }

    // Apply multiplier
    happinessChange = Math.floor(happinessChange * bonusMultiplier);
    healthChange = Math.floor(healthChange * bonusMultiplier);
    evolutionProgressChange = Math.floor(
      evolutionProgressChange * bonusMultiplier
    );

    // Determine mood change
    const newHappiness = Math.min(100, currentHappiness + happinessChange);
    let moodChange: PetMood['current'] = pet.mood?.current || 'content';

    if (newHappiness >= 90) {
      moodChange = 'excited';
    } else if (newHappiness >= 70) {
      moodChange = 'happy';
    } else if (newHappiness >= 50) {
      moodChange = 'content';
    } else {
      moodChange = 'sad';
    }

    return {
      happinessChange,
      healthChange,
      evolutionProgressChange,
      moodChange,
      bonusMultiplier,
      reasons,
    };
  }

  /**
   * Apply pet growth impact to the pet
   */
  private async applyPetGrowthImpact(
    userId: string,
    impact: PetGrowthImpact
  ): Promise<void> {
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    if (!pet) return;

    // Update pet stats
    const newHappiness = Math.min(
      100,
      Math.max(0, pet.happiness + impact.happinessChange)
    );
    const newHealth = Math.min(
      100,
      Math.max(0, pet.health + impact.healthChange)
    );
    const newEvolutionProgress = Math.min(
      100,
      Math.max(0, pet.evolution.progress + impact.evolutionProgressChange)
    );

    // Update mood
    const newMood: PetMood = {
      current: impact.moodChange,
      factors: [
        {
          type: 'attention',
          impact: impact.happinessChange,
          description: 'Recent study session',
          timestamp: new Date(),
        },
        ...(pet.mood?.factors?.filter(f => f.type !== 'attention') || []),
      ],
      lastUpdated: new Date(),
      trend: 'stable',
    };

    // Create activity record
    const activity = {
      id: `study_${Date.now()}`,
      type: 'studying_together' as const,
      timestamp: new Date(),
      duration: 0, // Will be set by the pet service
      happiness_change: impact.happinessChange,
      health_change: impact.healthChange,
      energy_change: -5, // Studying uses some energy
    };

    // Update the pet through the store
    try {
      await petStore.updateFromStudyActivity(userId, 'study_session');

      // Additional direct updates for extended properties
      const updatedPet: StudyPetExtended = {
        ...pet,
        happiness: newHappiness,
        health: newHealth,
        mood: newMood,
        evolution: {
          ...pet.evolution,
          progress: newEvolutionProgress,
        },
        updatedAt: new Date(),
      };

      // This would typically be done through a proper service call
      // For now, we'll update the store directly
      petStore.pet = updatedPet;
    } catch (error) {
      console.error('Error applying pet growth impact:', error);
    }
  }

  /**
   * Update study streak data
   */
  private async updateStudyStreak(userId: string): Promise<void> {
    const gamificationStore = useGamificationStore.getState();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streakData = this.streakData.get(userId);

    if (!streakData) {
      streakData = {
        currentStreak: 0,
        isActive: false,
        lastStudyDate: null,
        streakBonusEarned: false,
        longestStreak: 0,
      };
    }

    const lastStudyDate = streakData.lastStudyDate;
    const lastStudyDateNormalized = lastStudyDate
      ? new Date(lastStudyDate)
      : null;
    if (lastStudyDateNormalized) {
      lastStudyDateNormalized.setHours(0, 0, 0, 0);
    }

    // Check if this is a new day of studying
    if (
      !lastStudyDateNormalized ||
      today.getTime() !== lastStudyDateNormalized.getTime()
    ) {
      if (lastStudyDateNormalized) {
        const daysDiff = Math.floor(
          (today.getTime() - lastStudyDateNormalized.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          // Consecutive day - increment streak
          streakData.currentStreak += 1;
          streakData.isActive = true;
        } else if (daysDiff > 1) {
          // Streak broken - reset to 1
          streakData.currentStreak = 1;
          streakData.isActive = true;
        }
      } else {
        // First study session
        streakData.currentStreak = 1;
        streakData.isActive = true;
      }

      streakData.lastStudyDate = today;
      streakData.longestStreak = Math.max(
        streakData.longestStreak,
        streakData.currentStreak
      );

      // Update gamification store
      gamificationStore.updateStreak(today);
    }

    this.streakData.set(userId, streakData);
  }

  /**
   * Award study rewards (coins and XP)
   */
  private async awardStudyRewards(
    userId: string,
    sessionData: StudySessionData,
    petImpact: PetGrowthImpact | null
  ): Promise<void> {
    const gamificationStore = useGamificationStore.getState();
    const { duration, quality, type, courseId } = sessionData;

    // Award coins through the integrated coin earning system
    try {
      const { coinEarningSystem } = await import('./coinEarningSystem');
      await coinEarningSystem.awardStudySessionCoins(
        userId,
        duration,
        quality || 'average',
        courseId
      );
    } catch (error) {
      console.error('Error awarding study session coins:', error);
      // Fallback to basic coin awarding
      const storeStore = useStoreStore.getState();
      const baseCoins = Math.floor(duration / 5);
      storeStore.updateCoins(baseCoins);
    }

    // Award XP through gamification system
    await gamificationStore.awardStudySessionXP(
      duration,
      quality === 'excellent' ? 'hard' : quality === 'good' ? 'medium' : 'easy',
      (petImpact?.bonusMultiplier || 1.0) > 1.2
    );
  }

  /**
   * Update pet mood when study session starts
   */
  private async updatePetMoodForStudyStart(userId: string): Promise<void> {
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    if (!pet) return;

    const newMood: PetMood = {
      current: 'content',
      factors: [
        {
          type: 'attention',
          impact: 5,
          description: 'Starting study session together',
          timestamp: new Date(),
        },
        ...(pet.mood?.factors?.filter(f => f.type !== 'attention') || []),
      ],
      lastUpdated: new Date(),
      trend: 'stable',
    };

    // Update pet mood
    try {
      const updatedPet: StudyPetExtended = {
        ...pet,
        mood: newMood,
      };

      petStore.pet = updatedPet;
    } catch (error) {
      console.error('Error updating pet mood for study start:', error);
    }
  }

  /**
   * Get current streak data for a user
   */
  getStreakData(userId: string): StudyStreakData | null {
    return this.streakData.get(userId) || null;
  }

  /**
   * Check if user has an active study session
   */
  hasActiveSession(userId: string): boolean {
    for (const [sessionId, sessionData] of this.activeSessions) {
      if (sessionData.userId === userId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get active session for a user
   */
  getActiveSession(userId: string): StudySessionData | null {
    for (const [sessionId, sessionData] of this.activeSessions) {
      if (sessionData.userId === userId) {
        return sessionData;
      }
    }
    return null;
  }

  /**
   * Calculate bonus pet evolution progress for consistent study streaks
   */
  async calculateStreakEvolutionBonus(userId: string): Promise<number> {
    const streakData = this.streakData.get(userId);
    if (!streakData || !streakData.isActive) {
      return 0;
    }

    const { currentStreak } = streakData;

    // Bonus evolution progress based on streak length
    if (currentStreak >= 30) {
      return 10; // Major bonus for 30+ day streak
    } else if (currentStreak >= 14) {
      return 5; // Good bonus for 2+ week streak
    } else if (currentStreak >= 7) {
      return 3; // Small bonus for 1+ week streak
    } else if (currentStreak >= 3) {
      return 1; // Tiny bonus for 3+ day streak
    }

    return 0;
  }
}

// Export singleton instance
export const studySessionTracker = StudySessionTracker.getInstance();
