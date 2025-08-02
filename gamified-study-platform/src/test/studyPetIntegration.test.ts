/**
 * Study Pet Integration Tests
 *
 * Tests for the study session tracking and pet growth integration system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { studySessionTracker } from '../services/studySessionTracker';
import { petMoodManager } from '../services/petMoodManager';
import { studyPetIntegrationService } from '../services/studyPetIntegrationService';
import type { StudyPetExtended, PetMood } from '../types';

// Mock the stores
vi.mock('../store/petStore', () => ({
  usePetStore: {
    getState: () => ({
      pet: {
        id: 'test-pet',
        userId: 'test-user',
        name: 'Test Pet',
        species: {
          id: 'test-species',
          name: 'Test Species',
          description: 'A test pet species',
          baseStats: { happiness: 70, health: 80, intelligence: 60 },
          evolutionStages: [],
        },
        level: 3,
        happiness: 70,
        health: 80,
        mood: {
          current: 'content',
          factors: [],
          lastUpdated: new Date(),
          trend: 'stable',
        },
        moodHistory: [],
        totalStudyTime: 120,
        favoriteSubjects: ['math', 'science'],
        achievements: ['first_study', 'week_streak'],
        evolutionStage: 'child',
        evolution: {
          stage: {
            id: 'child-stage',
            name: 'Child',
            description: 'A young pet',
            imageUrl: '/pets/child.png',
            unlockedAbilities: [],
          },
          progress: 45,
          nextStageRequirements: [],
        },
        accessories: [],
        lastFed: new Date(),
        lastPlayed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as StudyPetExtended,
      updateFromStudyActivity: vi.fn(),
      checkEvolution: vi.fn().mockResolvedValue(false),
    }),
  },
}));

vi.mock('../store/gamificationStore', () => ({
  useGamificationStore: {
    getState: () => ({
      gameStats: {
        level: 5,
        totalXP: 1250,
        streakDays: 3,
        lastActivity: new Date(),
      },
      updateStreak: vi.fn(),
      awardStudySessionXP: vi.fn(),
      checkStreakStatus: vi.fn().mockReturnValue(true),
    }),
  },
}));

vi.mock('../store/storeStore', () => ({
  useStoreStore: {
    getState: () => ({
      addCoins: vi.fn(),
    }),
  },
}));

describe('StudySessionTracker', () => {
  const userId = 'test-user-123';
  const sessionId = 'test-session-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Study Session Tracking', () => {
    it('should start a study session successfully', async () => {
      await studySessionTracker.startStudySession({
        userId,
        sessionId,
        startTime: new Date(),
        type: 'pomodoro',
        courseId: 'course-123',
      });

      expect(studySessionTracker.hasActiveSession(userId)).toBe(true);
      const activeSession = studySessionTracker.getActiveSession(userId);
      expect(activeSession).toBeTruthy();
      expect(activeSession?.sessionId).toBe(sessionId);
    });

    it('should end a study session and calculate pet growth impact', async () => {
      // Start a session first
      await studySessionTracker.startStudySession({
        userId,
        sessionId,
        startTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        type: 'pomodoro',
      });

      // End the session
      const impact = await studySessionTracker.endStudySession(
        userId,
        sessionId,
        'good',
        'Focused session'
      );

      expect(impact).toBeTruthy();
      expect(impact?.happinessChange).toBeGreaterThan(0);
      expect(impact?.reasons).toContain('Completed focused study session');
      expect(studySessionTracker.hasActiveSession(userId)).toBe(false);
    });

    it('should calculate appropriate pet growth impact based on session quality', async () => {
      await studySessionTracker.startStudySession({
        userId,
        sessionId,
        startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        type: 'pomodoro',
      });

      const excellentImpact = await studySessionTracker.endStudySession(
        userId,
        sessionId,
        'excellent'
      );

      expect(excellentImpact?.bonusMultiplier).toBeGreaterThan(1.2);
      expect(excellentImpact?.reasons).toContain('Excellent study quality');
    });

    it('should calculate streak evolution bonus correctly', async () => {
      const bonus =
        await studySessionTracker.calculateStreakEvolutionBonus(userId);
      expect(bonus).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Streak Management', () => {
    it('should track study streaks correctly', async () => {
      await studySessionTracker.startStudySession({
        userId,
        sessionId,
        startTime: new Date(),
        type: 'free_study',
      });

      await studySessionTracker.endStudySession(userId, sessionId, 'average');

      const streakData = studySessionTracker.getStreakData(userId);
      expect(streakData).toBeTruthy();
      expect(streakData?.currentStreak).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('PetMoodManager', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mood Responses', () => {
    it('should handle study session mood response correctly', async () => {
      const moodChange = await petMoodManager.handleStudySessionMoodResponse(
        userId,
        25, // 25 minute session
        'excellent',
        true // streak continued
      );

      expect(moodChange).toBeTruthy();
      expect(moodChange?.newMood).toBe('excited');
      expect(moodChange?.happinessChange).toBeGreaterThan(0);
      expect(moodChange?.celebrationLevel).toBe('large');
    });

    it('should handle broken streak mood response', async () => {
      const moodChange = await petMoodManager.handleBrokenStreakMoodResponse(
        userId,
        7 // 7-day streak broken
      );

      expect(moodChange).toBeTruthy();
      expect(moodChange?.newMood).toBe('sad');
      expect(moodChange?.happinessChange).toBeLessThan(0);
      expect(moodChange?.message).toContain('streak ended');
    });

    it('should handle milestone celebrations', async () => {
      const moodChange = await petMoodManager.handleMilestoneMoodResponse(
        userId,
        'streak',
        30 // 30-day streak
      );

      expect(moodChange).toBeTruthy();
      expect(moodChange?.newMood).toBe('excited');
      expect(moodChange?.celebrationLevel).toBe('large');
      expect(moodChange?.message).toContain('30 days');
    });
  });

  describe('Mood Monitoring', () => {
    it('should start and stop mood monitoring', () => {
      expect(() => {
        petMoodManager.startMoodMonitoring(userId);
        petMoodManager.stopMoodMonitoring();
      }).not.toThrow();
    });

    it('should get pet mood summary', () => {
      const summary = petMoodManager.getPetMoodSummary(userId);
      expect(summary).toBeTruthy();
      expect(summary?.currentMood).toBeDefined();
      expect(summary?.happiness).toBeGreaterThanOrEqual(0);
      expect(summary?.happiness).toBeLessThanOrEqual(100);
    });
  });
});

describe('StudyPetIntegrationService', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Integration Methods', () => {
    it('should initialize successfully', async () => {
      await expect(
        studyPetIntegrationService.initialize(userId)
      ).resolves.not.toThrow();
    });

    it('should handle study session completion', async () => {
      await expect(
        studyPetIntegrationService.handleStudySessionComplete(
          userId,
          25, // 25 minutes
          'good',
          'course-123'
        )
      ).resolves.not.toThrow();
    });

    it('should handle quest completion', async () => {
      await expect(
        studyPetIntegrationService.handleQuestComplete(
          userId,
          'daily',
          'medium'
        )
      ).resolves.not.toThrow();
    });

    it('should handle todo completion', async () => {
      await expect(
        studyPetIntegrationService.handleTodoComplete(
          userId,
          30, // 30 minutes estimated
          true // completed early
        )
      ).resolves.not.toThrow();
    });

    it('should check pet evolution', async () => {
      const evolved =
        await studyPetIntegrationService.checkPetEvolution(userId);
      expect(typeof evolved).toBe('boolean');
    });

    it('should get pet growth recommendations', async () => {
      const recommendations =
        await studyPetIntegrationService.getPetGrowthRecommendations(userId);
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should calculate streak evolution bonus', async () => {
      const bonus =
        await studyPetIntegrationService.calculateStreakEvolutionBonus(userId);
      expect(typeof bonus).toBe('number');
      expect(bonus).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Integration Scenarios', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complete study session workflow', async () => {
    // Initialize the integration service
    await studyPetIntegrationService.initialize(userId);

    // Start a study session
    const sessionId = 'workflow-test-session';
    await studySessionTracker.startStudySession({
      userId,
      sessionId,
      startTime: new Date(Date.now() - 25 * 60 * 1000),
      type: 'pomodoro',
      courseId: 'test-course',
    });

    // Verify session is active
    expect(studySessionTracker.hasActiveSession(userId)).toBe(true);

    // End the session with good quality
    const impact = await studySessionTracker.endStudySession(
      userId,
      sessionId,
      'good',
      'Great focus!'
    );

    // Verify impact was calculated
    expect(impact).toBeTruthy();
    expect(impact?.happinessChange).toBeGreaterThan(0);

    // Verify session is no longer active
    expect(studySessionTracker.hasActiveSession(userId)).toBe(false);

    // Check if pet can evolve
    const evolved = await studyPetIntegrationService.checkPetEvolution(userId);
    expect(typeof evolved).toBe('boolean');
  });

  it('should handle streak building and breaking', async () => {
    // Simulate building a streak
    for (let day = 0; day < 5; day++) {
      const sessionId = `streak-session-${day}`;
      await studySessionTracker.startStudySession({
        userId,
        sessionId,
        startTime: new Date(Date.now() - day * 24 * 60 * 60 * 1000),
        type: 'free_study',
      });

      await studySessionTracker.endStudySession(userId, sessionId, 'average');
    }

    const streakData = studySessionTracker.getStreakData(userId);
    expect(streakData?.currentStreak).toBeGreaterThan(0);

    // Test streak bonus calculation
    const bonus =
      await studySessionTracker.calculateStreakEvolutionBonus(userId);
    expect(bonus).toBeGreaterThanOrEqual(0);
  });
});
