/**
 * Pet Mood Manager Service
 *
 * This service manages pet mood changes based on user study performance,
 * implementing dynamic mood responses to study habits and consistency.
 */

import type { StudyPetExtended, PetMood, MoodFactor } from '../types';
import { usePetStore } from '../store/petStore';
import { useGamificationStore } from '../store/gamificationStore';

export interface StudyPerformanceData {
  sessionsToday: number;
  totalStudyTimeToday: number; // in minutes
  averageSessionQuality: 'poor' | 'average' | 'good' | 'excellent';
  streakDays: number;
  isStreakActive: boolean;
  lastStudySession: Date | null;
  weeklyStudyHours: number;
  completedGoalsToday: number;
  missedGoalsToday: number;
}

export interface MoodChangeResult {
  newMood: PetMood['current'];
  moodFactors: MoodFactor[];
  happinessChange: number;
  message: string;
  celebrationLevel?: 'small' | 'medium' | 'large';
}

export class PetMoodManager {
  private static instance: PetMoodManager;
  private moodUpdateInterval: NodeJS.Timeout | null = null;

  static getInstance(): PetMoodManager {
    if (!PetMoodManager.instance) {
      PetMoodManager.instance = new PetMoodManager();
    }
    return PetMoodManager.instance;
  }

  /**
   * Start automatic mood monitoring
   */
  startMoodMonitoring(userId: string): void {
    // Clear existing interval
    if (this.moodUpdateInterval) {
      clearInterval(this.moodUpdateInterval);
    }

    // Update mood every 30 minutes
    this.moodUpdateInterval = setInterval(
      () => {
        this.updatePetMoodBasedOnPerformance(userId);
      },
      30 * 60 * 1000
    );

    // Initial mood update
    this.updatePetMoodBasedOnPerformance(userId);
  }

  /**
   * Stop automatic mood monitoring
   */
  stopMoodMonitoring(): void {
    if (this.moodUpdateInterval) {
      clearInterval(this.moodUpdateInterval);
      this.moodUpdateInterval = null;
    }
  }

  /**
   * Update pet mood based on current study performance
   */
  async updatePetMoodBasedOnPerformance(
    userId: string
  ): Promise<MoodChangeResult | null> {
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    if (!pet) {
      return null;
    }

    const performanceData = await this.gatherStudyPerformanceData(userId);
    const moodChange = this.calculateMoodChange(pet, performanceData);

    if (moodChange) {
      await this.applyMoodChange(userId, moodChange);
      return moodChange;
    }

    return null;
  }

  /**
   * Handle immediate mood response to study session completion
   */
  async handleStudySessionMoodResponse(
    userId: string,
    sessionDuration: number,
    sessionQuality: 'poor' | 'average' | 'good' | 'excellent',
    isStreakContinued: boolean
  ): Promise<MoodChangeResult | null> {
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    if (!pet) {
      return null;
    }

    const moodFactors: MoodFactor[] = [];
    let happinessChange = 0;
    let newMood: PetMood['current'] = pet.mood?.current || 'content';
    let message = '';
    let celebrationLevel: 'small' | 'medium' | 'large' | undefined;

    // Session completion happiness
    if (sessionDuration >= 25) {
      happinessChange += 15;
      moodFactors.push({
        type: 'attention',
        impact: 15,
        description: 'Completed a full study session together',
        timestamp: new Date(),
      });
      message = 'Great job on completing your study session!';
    } else if (sessionDuration >= 15) {
      happinessChange += 10;
      moodFactors.push({
        type: 'attention',
        impact: 10,
        description: 'Completed a study session',
        timestamp: new Date(),
      });
      message = 'Nice work studying together!';
    }

    // Quality-based mood response
    switch (sessionQuality) {
      case 'excellent':
        happinessChange += 10;
        newMood = 'excited';
        moodFactors.push({
          type: 'happiness',
          impact: 10,
          description: 'Excellent study quality made me so happy!',
          timestamp: new Date(),
        });
        message += ' Your focus was amazing!';
        celebrationLevel = 'large';
        break;
      case 'good':
        happinessChange += 5;
        newMood = 'happy';
        moodFactors.push({
          type: 'happiness',
          impact: 5,
          description: 'Good study quality',
          timestamp: new Date(),
        });
        message += ' You did really well!';
        celebrationLevel = 'medium';
        break;
      case 'average':
        newMood = 'content';
        message += ' Keep up the good work!';
        celebrationLevel = 'small';
        break;
      case 'poor':
        happinessChange -= 5;
        newMood = 'sad';
        moodFactors.push({
          type: 'happiness',
          impact: -5,
          description: 'Study session could have gone better',
          timestamp: new Date(),
        });
        message = "Don't worry, we'll do better next time!";
        break;
    }

    // Streak continuation bonus
    if (isStreakContinued) {
      happinessChange += 5;
      newMood =
        newMood === 'sad'
          ? 'content'
          : newMood === 'content'
            ? 'happy'
            : 'excited';
      moodFactors.push({
        type: 'happiness',
        impact: 5,
        description: 'Study streak continued!',
        timestamp: new Date(),
      });
      message += ' Our study streak continues!';
    }

    const moodChange: MoodChangeResult = {
      newMood,
      moodFactors,
      happinessChange,
      message,
      celebrationLevel,
    };

    await this.applyMoodChange(userId, moodChange);
    return moodChange;
  }

  /**
   * Handle mood response to broken study streak
   */
  async handleBrokenStreakMoodResponse(
    userId: string,
    previousStreak: number
  ): Promise<MoodChangeResult | null> {
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    if (!pet) {
      return null;
    }

    const moodFactors: MoodFactor[] = [
      {
        type: 'happiness',
        impact: -Math.min(20, previousStreak * 2),
        description: `Study streak of ${previousStreak} days was broken`,
        timestamp: new Date(),
      },
    ];

    let newMood: PetMood['current'] = 'sad';
    let message = `I'm a bit sad our ${previousStreak}-day streak ended, but we can start a new one!`;

    if (previousStreak >= 30) {
      newMood = 'sad';
      message = `Our amazing ${previousStreak}-day streak ended, but I believe we can build an even better one!`;
    } else if (previousStreak >= 7) {
      newMood = 'sad';
      message = `Our ${previousStreak}-day streak ended, but let's start fresh tomorrow!`;
    }

    const moodChange: MoodChangeResult = {
      newMood,
      moodFactors,
      happinessChange: -Math.min(20, previousStreak * 2),
      message,
    };

    await this.applyMoodChange(userId, moodChange);
    return moodChange;
  }

  /**
   * Handle mood response to achieving study milestones
   */
  async handleMilestoneMoodResponse(
    userId: string,
    milestoneType: 'streak' | 'total_hours' | 'sessions_completed' | 'level_up',
    milestoneValue: number
  ): Promise<MoodChangeResult | null> {
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    if (!pet) {
      return null;
    }

    const moodFactors: MoodFactor[] = [];
    let happinessChange = 0;
    let newMood: PetMood['current'] = 'excited';
    let message = '';
    let celebrationLevel: 'small' | 'medium' | 'large' = 'medium';

    switch (milestoneType) {
      case 'streak':
        if (milestoneValue >= 100) {
          happinessChange = 50;
          celebrationLevel = 'large';
          message = `WOW! ${milestoneValue} days of studying together! You're incredible!`;
        } else if (milestoneValue >= 30) {
          happinessChange = 30;
          celebrationLevel = 'large';
          message = `Amazing! ${milestoneValue} days in a row! I'm so proud of you!`;
        } else if (milestoneValue >= 7) {
          happinessChange = 20;
          celebrationLevel = 'medium';
          message = `Great job! ${milestoneValue} days of consistent studying!`;
        } else {
          happinessChange = 10;
          celebrationLevel = 'small';
          message = `Nice! ${milestoneValue} days of studying together!`;
        }
        moodFactors.push({
          type: 'happiness',
          impact: happinessChange,
          description: `Celebrated ${milestoneValue}-day study streak`,
          timestamp: new Date(),
        });
        break;

      case 'total_hours':
        if (milestoneValue >= 1000) {
          happinessChange = 40;
          celebrationLevel = 'large';
          message = `${milestoneValue} hours of studying! You're a true scholar!`;
        } else if (milestoneValue >= 100) {
          happinessChange = 25;
          celebrationLevel = 'medium';
          message = `${milestoneValue} hours of learning together! Fantastic!`;
        } else {
          happinessChange = 15;
          celebrationLevel = 'small';
          message = `${milestoneValue} hours of studying! Keep it up!`;
        }
        moodFactors.push({
          type: 'happiness',
          impact: happinessChange,
          description: `Celebrated ${milestoneValue} total study hours`,
          timestamp: new Date(),
        });
        break;

      case 'level_up':
        happinessChange = 25;
        celebrationLevel = 'large';
        message = `Level ${milestoneValue}! We're growing stronger together!`;
        moodFactors.push({
          type: 'happiness',
          impact: happinessChange,
          description: `Celebrated reaching level ${milestoneValue}`,
          timestamp: new Date(),
        });
        break;

      case 'sessions_completed':
        if (milestoneValue >= 1000) {
          happinessChange = 35;
          celebrationLevel = 'large';
          message = `${milestoneValue} study sessions completed! You're amazing!`;
        } else if (milestoneValue >= 100) {
          happinessChange = 20;
          celebrationLevel = 'medium';
          message = `${milestoneValue} study sessions! Great dedication!`;
        } else {
          happinessChange = 10;
          celebrationLevel = 'small';
          message = `${milestoneValue} study sessions completed!`;
        }
        moodFactors.push({
          type: 'happiness',
          impact: happinessChange,
          description: `Celebrated ${milestoneValue} completed study sessions`,
          timestamp: new Date(),
        });
        break;
    }

    const moodChange: MoodChangeResult = {
      newMood,
      moodFactors,
      happinessChange,
      message,
      celebrationLevel,
    };

    await this.applyMoodChange(userId, moodChange);
    return moodChange;
  }

  /**
   * Gather current study performance data
   */
  private async gatherStudyPerformanceData(
    userId: string
  ): Promise<StudyPerformanceData> {
    const gamificationStore = useGamificationStore.getState();
    const gameStats = gamificationStore.gameStats;

    // This would typically fetch from a database or analytics service
    // For now, we'll use mock data based on available information
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      sessionsToday: 0, // Would be fetched from session history
      totalStudyTimeToday: 0, // Would be calculated from today's sessions
      averageSessionQuality: 'average', // Would be calculated from recent sessions
      streakDays: gameStats?.streakDays || 0,
      isStreakActive:
        typeof gamificationStore.checkStreakStatus === 'function'
          ? gamificationStore.checkStreakStatus()
          : false,
      lastStudySession: gameStats?.lastActivity || null,
      weeklyStudyHours: 0, // Would be calculated from week's sessions
      completedGoalsToday: 0, // Would be fetched from quest/todo completion
      missedGoalsToday: 0, // Would be calculated from overdue items
    };
  }

  /**
   * Calculate mood change based on performance data
   */
  private calculateMoodChange(
    pet: StudyPetExtended,
    performance: StudyPerformanceData
  ): MoodChangeResult | null {
    const currentMood = pet.mood?.current || 'content';
    const moodFactors: MoodFactor[] = [];
    let happinessChange = 0;
    let newMood: PetMood['current'] = currentMood;
    let message = '';

    // Check for neglect (no study sessions recently)
    const now = new Date();
    const lastStudy = performance.lastStudySession;

    if (lastStudy) {
      const hoursSinceLastStudy =
        (now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastStudy > 48) {
        happinessChange -= 15;
        newMood = 'sad';
        message = "I miss studying with you! Let's have a session soon.";
        moodFactors.push({
          type: 'attention',
          impact: -15,
          description: 'Missing study time together',
          timestamp: new Date(),
        });
      } else if (hoursSinceLastStudy > 24) {
        happinessChange -= 5;
        newMood =
          currentMood === 'excited'
            ? 'happy'
            : currentMood === 'happy'
              ? 'content'
              : 'sad';
        message = "It's been a while since we studied together.";
        moodFactors.push({
          type: 'attention',
          impact: -5,
          description: 'Would like to study together',
          timestamp: new Date(),
        });
      }
    }

    // Check streak status
    if (!performance.isStreakActive && performance.streakDays === 0) {
      happinessChange -= 10;
      newMood = 'sad';
      message = "Let's start building a study streak together!";
      moodFactors.push({
        type: 'happiness',
        impact: -10,
        description: 'No active study streak',
        timestamp: new Date(),
      });
    }

    // Positive mood for good performance
    if (performance.sessionsToday >= 3) {
      happinessChange += 10;
      newMood = 'excited';
      message = "You're doing amazing today! So many study sessions!";
      moodFactors.push({
        type: 'happiness',
        impact: 10,
        description: 'Multiple study sessions today',
        timestamp: new Date(),
      });
    } else if (performance.sessionsToday >= 1) {
      happinessChange += 5;
      newMood = currentMood === 'sad' ? 'content' : 'happy';
      message = 'Great job studying today!';
      moodFactors.push({
        type: 'happiness',
        impact: 5,
        description: 'Studied today',
        timestamp: new Date(),
      });
    }

    // Only return mood change if there's a significant change
    if (Math.abs(happinessChange) >= 5 || newMood !== currentMood) {
      return {
        newMood,
        moodFactors,
        happinessChange,
        message,
      };
    }

    return null;
  }

  /**
   * Apply mood change to the pet
   */
  private async applyMoodChange(
    userId: string,
    moodChange: MoodChangeResult
  ): Promise<void> {
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    if (!pet) return;

    // Update pet mood
    const newMood: PetMood = {
      current: moodChange.newMood,
      factors: moodChange.moodFactors,
      lastUpdated: new Date(),
      trend: 'stable', // Will be calculated based on mood history
    };

    // Update happiness
    const newHappiness = Math.min(
      100,
      Math.max(0, pet.happiness + moodChange.happinessChange)
    );

    try {
      const updatedPet: StudyPetExtended = {
        ...pet,
        happiness: newHappiness,
        mood: newMood,
      };

      // Update the pet store
      petStore.pet = updatedPet;

      // Log the mood change for debugging
      console.log(
        `Pet mood changed to ${moodChange.newMood}: ${moodChange.message}`
      );
    } catch (error) {
      console.error('Error applying mood change:', error);
    }
  }

  /**
   * Get current pet mood summary
   */
  getPetMoodSummary(userId: string): {
    currentMood: PetMood['current'];
    happiness: number;
    recentFactors: MoodFactor[];
    message: string;
  } | null {
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    if (!pet || !pet.mood) {
      return null;
    }

    let message = '';
    switch (pet.mood.current) {
      case 'excited':
        message = "I'm so excited to study with you!";
        break;
      case 'happy':
        message = "I'm happy and ready to learn!";
        break;
      case 'content':
        message = "I'm feeling good and ready for whatever comes next.";
        break;
      case 'sad':
        message = "I'm feeling a bit down. Maybe we could study together?";
        break;
      case 'sleepy':
        message = "I'm feeling sleepy. Maybe it's time for a break?";
        break;
      case 'hungry':
        message = "I'm feeling hungry. Could you feed me?";
        break;
    }

    return {
      currentMood: pet.mood.current,
      happiness: pet.happiness,
      recentFactors: pet.mood.factors || [],
      message,
    };
  }
}

// Export singleton instance
export const petMoodManager = PetMoodManager.getInstance();
