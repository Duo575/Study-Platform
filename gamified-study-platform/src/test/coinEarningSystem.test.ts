/**
 * Coin Earning System Tests
 *
 * Tests for the integrated coin earning system that rewards users
 * for various activities with multipliers and limits.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { coinEarningSystem } from '../services/coinEarningSystem';

// Mock the stores
vi.mock('../store/storeStore', () => ({
  useStoreStore: {
    getState: () => ({
      coins: 1000,
      addCoins: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock('../store/gamificationStore', () => ({
  useGamificationStore: {
    getState: () => ({
      gameStats: {
        level: 5,
        totalXP: 1250,
        streakDays: 7,
        lastActivity: new Date(),
        achievements: [],
      },
    }),
  },
}));

vi.mock('../store/petStore', () => ({
  usePetStore: {
    getState: () => ({
      pet: {
        id: 'test-pet',
        level: 3,
        happiness: 85,
        health: 90,
      },
    }),
  },
}));

vi.mock('../store/environmentStore', () => ({
  useEnvironmentStore: {
    getState: () => ({
      availableEnvironments: [
        {
          id: 'forest',
          name: 'Peaceful Forest',
          category: 'premium',
        },
        {
          id: 'classroom',
          name: 'Classroom',
          category: 'free',
        },
      ],
    }),
  },
}));

describe('CoinEarningSystem', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Study Session Coins', () => {
    it('should award coins for study sessions', async () => {
      const result = await coinEarningSystem.awardStudySessionCoins(
        userId,
        30, // 30 minutes
        'good'
      );

      expect(result).toBeTruthy();
      expect(result.baseCoins).toBe(6); // 30 minutes / 5 = 6 coins
      expect(result.totalCoins).toBeGreaterThan(result.baseCoins); // Should have bonuses
      expect(result.source).toContain('Study session');
      expect(result.multipliers.length).toBeGreaterThan(0);
    });

    it('should apply quality multipliers correctly', async () => {
      const excellentResult = await coinEarningSystem.awardStudySessionCoins(
        userId,
        25,
        'excellent'
      );

      const poorResult = await coinEarningSystem.awardStudySessionCoins(
        userId,
        25,
        'poor'
      );

      expect(excellentResult.totalCoins).toBeGreaterThan(poorResult.totalCoins);
      expect(
        excellentResult.multipliers.some(m => m.type === 'quality_bonus')
      ).toBe(true);
    });

    it('should apply pet happiness bonus', async () => {
      const result = await coinEarningSystem.awardStudySessionCoins(
        userId,
        25,
        'average'
      );

      // Pet happiness is 85 in mock, should get bonus
      const petBonus = result.multipliers.find(m => m.type === 'pet_happiness');
      expect(petBonus).toBeTruthy();
      expect(petBonus?.factor).toBeGreaterThan(1);
    });

    it('should apply streak bonus for long streaks', async () => {
      const result = await coinEarningSystem.awardStudySessionCoins(
        userId,
        25,
        'average'
      );

      // Streak is 7 days in mock, should get bonus
      const streakBonus = result.multipliers.find(
        m => m.type === 'streak_days'
      );
      expect(streakBonus).toBeTruthy();
      expect(streakBonus?.factor).toBeGreaterThan(1);
    });

    it('should apply time bonus for long sessions', async () => {
      const longResult = await coinEarningSystem.awardStudySessionCoins(
        userId,
        60, // 1 hour
        'average'
      );

      const shortResult = await coinEarningSystem.awardStudySessionCoins(
        userId,
        15, // 15 minutes
        'average'
      );

      const longTimeBonus = longResult.multipliers.find(
        m => m.type === 'time_bonus'
      );
      const shortTimeBonus = shortResult.multipliers.find(
        m => m.type === 'time_bonus'
      );

      expect(longTimeBonus).toBeTruthy();
      expect(shortTimeBonus).toBeFalsy();
    });
  });

  describe('Quest Completion Coins', () => {
    it('should award coins for quest completion', async () => {
      const result = await coinEarningSystem.awardQuestCompletionCoins(
        userId,
        'daily',
        'medium'
      );

      expect(result).toBeTruthy();
      expect(result.baseCoins).toBe(15); // Daily medium quest
      expect(result.source).toContain('daily quest');
    });

    it('should award more coins for harder quests', async () => {
      const easyResult = await coinEarningSystem.awardQuestCompletionCoins(
        userId,
        'daily',
        'easy'
      );

      const hardResult = await coinEarningSystem.awardQuestCompletionCoins(
        userId,
        'daily',
        'hard'
      );

      expect(hardResult.baseCoins).toBeGreaterThan(easyResult.baseCoins);
    });

    it('should award more coins for weekly/milestone quests', async () => {
      const dailyResult = await coinEarningSystem.awardQuestCompletionCoins(
        userId,
        'daily',
        'medium'
      );

      const weeklyResult = await coinEarningSystem.awardQuestCompletionCoins(
        userId,
        'weekly',
        'medium'
      );

      const milestoneResult = await coinEarningSystem.awardQuestCompletionCoins(
        userId,
        'milestone',
        'medium'
      );

      expect(weeklyResult.baseCoins).toBeGreaterThan(dailyResult.baseCoins);
      expect(milestoneResult.baseCoins).toBeGreaterThan(weeklyResult.baseCoins);
    });
  });

  describe('Streak Bonus Coins', () => {
    it('should award streak bonus coins', async () => {
      const result = await coinEarningSystem.awardStreakBonusCoins(
        'test-user-streak-1',
        7
      );

      expect(result).toBeTruthy();
      expect(result.baseCoins).toBe(25); // 7-day streak bonus
      expect(result.source).toContain('7-day streak');
    });

    it('should award more coins for longer streaks', async () => {
      // Use different user IDs to avoid hitting limits
      const shortStreak = await coinEarningSystem.awardStreakBonusCoins(
        'test-user-short',
        7
      );
      const mediumStreak = await coinEarningSystem.awardStreakBonusCoins(
        'test-user-medium',
        14
      );
      const longStreak = await coinEarningSystem.awardStreakBonusCoins(
        'test-user-long',
        30
      );

      expect(shortStreak.baseCoins).toBe(25);
      expect(mediumStreak.baseCoins).toBe(50);
      expect(longStreak.baseCoins).toBe(100);
      expect(mediumStreak.baseCoins).toBeGreaterThan(shortStreak.baseCoins);
      expect(longStreak.baseCoins).toBeGreaterThan(mediumStreak.baseCoins);
    });

    it('should not award coins for very short streaks', async () => {
      const result = await coinEarningSystem.awardStreakBonusCoins(
        'test-user-short-streak',
        2
      );

      expect(result.baseCoins).toBe(0);
    });
  });

  describe('Pet Care Coins', () => {
    it('should award coins for pet care activities', async () => {
      // Use different user IDs to avoid hitting limits
      const feedResult = await coinEarningSystem.awardPetCareCoins(
        'test-user-feed',
        'feed',
        10
      );
      const playResult = await coinEarningSystem.awardPetCareCoins(
        'test-user-play',
        'play',
        15
      );
      const evolveResult = await coinEarningSystem.awardPetCareCoins(
        'test-user-evolve',
        'evolve',
        25
      );

      expect(feedResult.baseCoins).toBe(5);
      expect(playResult.baseCoins).toBe(8);
      expect(evolveResult.baseCoins).toBe(50);

      expect(feedResult.source).toContain('Pet care: feed');
      expect(playResult.source).toContain('Pet care: play');
      expect(evolveResult.source).toContain('Pet care: evolve');
    });

    it('should give evolution bonus', async () => {
      const evolveResult = await coinEarningSystem.awardPetCareCoins(
        userId,
        'evolve',
        25
      );

      const evolutionBonus = evolveResult.multipliers.find(
        m => m.type === 'quality_bonus'
      );
      expect(evolutionBonus).toBeTruthy();
      expect(evolutionBonus?.factor).toBe(2.0);
    });
  });

  describe('Environment Usage Coins', () => {
    it('should award coins for environment usage', async () => {
      const result = await coinEarningSystem.awardEnvironmentUsageCoins(
        'test-user-env',
        'forest',
        30 // 30 minutes
      );

      expect(result).toBeTruthy();
      expect(result.baseCoins).toBe(3); // 30 minutes / 10 = 3 coins
      expect(result.source).toContain('Environment usage');
    });

    it('should give premium environment bonus', async () => {
      const premiumResult = await coinEarningSystem.awardEnvironmentUsageCoins(
        userId,
        'forest', // premium environment
        30
      );

      const freeResult = await coinEarningSystem.awardEnvironmentUsageCoins(
        userId,
        'classroom', // free environment
        30
      );

      const premiumBonus = premiumResult.multipliers.find(
        m => m.type === 'environment_premium'
      );
      const freeBonus = freeResult.multipliers.find(
        m => m.type === 'environment_premium'
      );

      expect(premiumBonus).toBeTruthy();
      expect(freeBonus).toBeFalsy();
    });
  });

  describe('Daily Bonus Coins', () => {
    it('should award daily bonus coins', async () => {
      const result =
        await coinEarningSystem.awardDailyBonusCoins('test-user-daily');

      expect(result).toBeTruthy();
      expect(result.baseCoins).toBeGreaterThan(0);
      expect(result.source).toContain('Daily login bonus');
    });

    it('should increase daily bonus with streak', async () => {
      // The mock has a 7-day streak, should get increased bonus
      const result = await coinEarningSystem.awardDailyBonusCoins(
        'test-user-daily-streak'
      );
      expect(result.baseCoins).toBe(40); // 7+ day streak bonus
    });
  });

  describe('Mini-Game Coins', () => {
    it('should award coins for mini-game completion', async () => {
      const result = await coinEarningSystem.awardMiniGameCoins(
        'test-user-minigame',
        'memory-game',
        85,
        'medium'
      );

      expect(result).toBeTruthy();
      expect(result.baseCoins).toBe(10); // Medium difficulty
      expect(result.source).toContain('Mini-game');
    });

    it('should give score bonuses', async () => {
      const highScoreResult = await coinEarningSystem.awardMiniGameCoins(
        userId,
        'memory-game',
        95, // High score
        'medium'
      );

      const lowScoreResult = await coinEarningSystem.awardMiniGameCoins(
        userId,
        'memory-game',
        50, // Low score
        'medium'
      );

      const highScoreBonus = highScoreResult.multipliers.find(
        m => m.type === 'quality_bonus'
      );
      const lowScoreBonus = lowScoreResult.multipliers.find(
        m => m.type === 'quality_bonus'
      );

      expect(highScoreBonus).toBeTruthy();
      expect(lowScoreBonus).toBeFalsy();
    });
  });

  describe('Earning History and Stats', () => {
    it('should track earning history', async () => {
      const historyUserId = 'test-user-history';
      // Award some coins first
      await coinEarningSystem.awardStudySessionCoins(historyUserId, 25, 'good');
      await coinEarningSystem.awardQuestCompletionCoins(
        historyUserId,
        'daily',
        'medium'
      );

      const history = coinEarningSystem.getEarningHistory(historyUserId, 10);
      expect(history.length).toBe(2);
      expect(history[0].source).toContain('Study session');
      expect(history[1].source).toContain('daily quest');
    });

    it('should calculate earning stats', async () => {
      const statsUserId = 'test-user-stats';
      // Award some coins first
      await coinEarningSystem.awardStudySessionCoins(statsUserId, 25, 'good');
      await coinEarningSystem.awardPetCareCoins(statsUserId, 'feed', 10);
      await coinEarningSystem.awardStreakBonusCoins(statsUserId, 7);

      const stats = coinEarningSystem.getEarningStats(statsUserId);

      expect(typeof stats.todayTotal).toBe('number');
      expect(typeof stats.weekTotal).toBe('number');
      expect(typeof stats.averagePerSession).toBe('number');
      expect(typeof stats.topSource).toBe('string');
      expect(typeof stats.streakBonus).toBe('number');
      expect(typeof stats.petCareBonus).toBe('number');

      expect(stats.streakBonus).toBeGreaterThan(0);
      expect(stats.petCareBonus).toBeGreaterThan(0);
    });

    it('should limit earning history size', async () => {
      // Award many coins to test history limit
      for (let i = 0; i < 150; i++) {
        await coinEarningSystem.awardPetCareCoins(userId, 'feed', 5);
      }

      const history = coinEarningSystem.getEarningHistory(userId);
      expect(history.length).toBeLessThanOrEqual(100); // Should be capped at 100
    });
  });

  describe('Bonus Opportunities', () => {
    it('should create bonus opportunities', () => {
      expect(() => {
        coinEarningSystem.createBonusOpportunity(
          userId,
          'double_coins',
          2.0,
          60 // 1 hour
        );
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user IDs gracefully', async () => {
      const result = await coinEarningSystem.awardStudySessionCoins(
        'invalid-user',
        25,
        'average'
      );

      expect(result).toBeTruthy();
      expect(typeof result.totalCoins).toBe('number');
    });

    it('should handle zero duration sessions', async () => {
      const result = await coinEarningSystem.awardStudySessionCoins(
        userId,
        0,
        'average'
      );

      expect(result.baseCoins).toBe(0);
      expect(result.totalCoins).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative values gracefully', async () => {
      const result = await coinEarningSystem.awardStudySessionCoins(
        userId,
        -10, // Negative duration
        'average'
      );

      expect(result.baseCoins).toBeGreaterThanOrEqual(0);
      expect(result.totalCoins).toBeGreaterThanOrEqual(0);
    });
  });
});
