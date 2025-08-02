import { describe, it, expect } from 'vitest';
import {
  calculateLevelFromXP,
  calculateXPForLevel,
  calculateCurrentLevelXP,
  calculateXPToNextLevel,
  calculateStudySessionXP,
  calculateQuestXP,
  calculateTodoXP,
  calculateStreakBonus,
  updateGameStats,
  isStreakActive,
} from '../gamification';

describe('Gamification Utils', () => {
  describe('Level Calculations', () => {
    it('should calculate level from XP correctly', () => {
      expect(calculateLevelFromXP(0)).toBe(1);
      expect(calculateLevelFromXP(100)).toBe(2);
      expect(calculateLevelFromXP(400)).toBe(3);
      expect(calculateLevelFromXP(900)).toBe(4);
      expect(calculateLevelFromXP(1600)).toBe(5);
    });

    it('should calculate XP required for specific levels', () => {
      expect(calculateXPForLevel(1)).toBe(0);
      expect(calculateXPForLevel(2)).toBe(100);
      expect(calculateXPForLevel(3)).toBe(400);
      expect(calculateXPForLevel(4)).toBe(900);
      expect(calculateXPForLevel(5)).toBe(1600);
    });

    it('should calculate current level XP correctly', () => {
      expect(calculateCurrentLevelXP(150)).toBe(50); // Level 2, 50 XP into level
      expect(calculateCurrentLevelXP(500)).toBe(100); // Level 3, 100 XP into level
      expect(calculateCurrentLevelXP(1000)).toBe(100); // Level 4, 100 XP into level
    });

    it('should calculate XP to next level correctly', () => {
      expect(calculateXPToNextLevel(150)).toBe(250); // Need 250 more for level 3
      expect(calculateXPToNextLevel(500)).toBe(400); // Need 400 more for level 4
      expect(calculateXPToNextLevel(1000)).toBe(600); // Need 600 more for level 5
    });
  });

  describe('XP Calculations', () => {
    describe('Study Session XP', () => {
      it('should calculate basic study session XP', () => {
        expect(calculateStudySessionXP(30)).toBe(30); // 30 minutes, medium difficulty
        expect(calculateStudySessionXP(60)).toBe(60); // 60 minutes, medium difficulty
      });

      it('should apply difficulty multipliers correctly', () => {
        expect(calculateStudySessionXP(30, 'easy')).toBe(24); // 30 * 0.8
        expect(calculateStudySessionXP(30, 'medium')).toBe(30); // 30 * 1.0
        expect(calculateStudySessionXP(30, 'hard')).toBe(36); // 30 * 1.2
      });

      it('should apply bonus multiplier when applicable', () => {
        expect(calculateStudySessionXP(30, 'medium', true)).toBe(37); // 30 * 1.25
        expect(calculateStudySessionXP(30, 'hard', true)).toBe(45); // 36 * 1.25
      });

      it('should handle edge cases', () => {
        expect(calculateStudySessionXP(0)).toBe(0);
        expect(calculateStudySessionXP(1, 'easy')).toBe(0); // Floor of 0.8
        expect(calculateStudySessionXP(2, 'easy')).toBe(1); // Floor of 1.6
      });
    });

    describe('Quest XP', () => {
      it('should calculate quest XP based on type and difficulty', () => {
        // Daily quests
        expect(calculateQuestXP('daily', 'easy')).toBe(16); // 20 * 0.8
        expect(calculateQuestXP('daily', 'medium')).toBe(20); // 20 * 1.0
        expect(calculateQuestXP('daily', 'hard')).toBe(30); // 20 * 1.5

        // Weekly quests
        expect(calculateQuestXP('weekly', 'easy')).toBe(40); // 50 * 0.8
        expect(calculateQuestXP('weekly', 'medium')).toBe(50); // 50 * 1.0
        expect(calculateQuestXP('weekly', 'hard')).toBe(75); // 50 * 1.5

        // Milestone quests
        expect(calculateQuestXP('milestone', 'easy')).toBe(80); // 100 * 0.8
        expect(calculateQuestXP('milestone', 'medium')).toBe(100); // 100 * 1.0
        expect(calculateQuestXP('milestone', 'hard')).toBe(150); // 100 * 1.5

        // Bonus quests
        expect(calculateQuestXP('bonus', 'easy')).toBe(24); // 30 * 0.8
        expect(calculateQuestXP('bonus', 'medium')).toBe(30); // 30 * 1.0
        expect(calculateQuestXP('bonus', 'hard')).toBe(45); // 30 * 1.5
      });
    });

    describe('Todo XP', () => {
      it('should calculate todo XP based on estimated time and completion status', () => {
        expect(calculateTodoXP(30, false, true)).toBe(6); // On time: 30/5 = 6
        expect(calculateTodoXP(30, true, true)).toBe(9); // Early: 6 * 1.5 = 9
        expect(calculateTodoXP(30, false, false)).toBe(4); // Late: 6 * 0.7 = 4.2 -> 4
      });

      it('should ensure minimum XP of 1', () => {
        expect(calculateTodoXP(1, false, true)).toBe(1); // Minimum XP
        expect(calculateTodoXP(0, false, true)).toBe(1); // Minimum XP
      });

      it('should handle various time estimates', () => {
        expect(calculateTodoXP(5, false, true)).toBe(1); // 5/5 = 1
        expect(calculateTodoXP(10, false, true)).toBe(2); // 10/5 = 2
        expect(calculateTodoXP(25, false, true)).toBe(5); // 25/5 = 5
      });
    });

    describe('Streak Bonus', () => {
      it('should return 0 for streaks less than 3 days', () => {
        expect(calculateStreakBonus(0)).toBe(0);
        expect(calculateStreakBonus(1)).toBe(0);
        expect(calculateStreakBonus(2)).toBe(0);
      });

      it('should return milestone bonuses for special streaks', () => {
        expect(calculateStreakBonus(7)).toBe(50); // One week
        expect(calculateStreakBonus(30)).toBe(200); // One month
        expect(calculateStreakBonus(100)).toBe(500); // 100 days
        expect(calculateStreakBonus(365)).toBe(1000); // One year
      });

      it('should return regular bonuses for interval streaks', () => {
        expect(calculateStreakBonus(3)).toBe(5); // Every 3 days
        expect(calculateStreakBonus(5)).toBe(15); // Every 5 days
        expect(calculateStreakBonus(6)).toBe(5); // Every 3 days
        expect(calculateStreakBonus(9)).toBe(5); // Every 3 days
        expect(calculateStreakBonus(10)).toBe(30); // Every 10 days
        expect(calculateStreakBonus(15)).toBe(15); // Every 5 days
        expect(calculateStreakBonus(20)).toBe(30); // Every 10 days
      });

      it('should prioritize milestone bonuses over regular bonuses', () => {
        expect(calculateStreakBonus(30)).toBe(200); // Milestone, not 30 (10-day bonus)
        expect(calculateStreakBonus(100)).toBe(500); // Milestone, not 30 (10-day bonus)
      });
    });
  });

  describe('Game Stats Updates', () => {
    const mockGameStats = {
      level: 2,
      totalXP: 150,
      currentXP: 50,
      xpToNextLevel: 250,
      streakDays: 5,
      achievements: [],
      lastActivity: new Date(),
      weeklyStats: {
        studyHours: 10,
        questsCompleted: 3,
        streakMaintained: true,
        xpEarned: 150,
      },
    };

    it('should update stats without level up', () => {
      const result = updateGameStats(mockGameStats, 50);

      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBe(null);
      expect(result.stats.totalXP).toBe(200);
      expect(result.stats.level).toBe(2);
      expect(result.stats.currentXP).toBe(100);
      expect(result.stats.xpToNextLevel).toBe(200);
    });

    it('should detect level up when XP threshold is crossed', () => {
      const result = updateGameStats(mockGameStats, 300);

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(3);
      expect(result.stats.totalXP).toBe(450);
      expect(result.stats.level).toBe(3);
      expect(result.stats.currentXP).toBe(50);
      expect(result.stats.xpToNextLevel).toBe(450);
    });

    it('should handle multiple level ups', () => {
      const result = updateGameStats(mockGameStats, 1000);

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBeGreaterThan(3);
      expect(result.stats.totalXP).toBe(1150);
      expect(result.stats.level).toBeGreaterThan(3);
    });
  });

  describe('Streak Activity Validation', () => {
    it('should validate active streaks correctly', () => {
      const now = new Date();
      const today = new Date(now);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      expect(isStreakActive(today)).toBe(true);
      expect(isStreakActive(yesterday)).toBe(true);
      expect(isStreakActive(twoDaysAgo)).toBe(false);
    });

    it('should handle string dates', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      expect(isStreakActive(now.toISOString())).toBe(true);
      expect(isStreakActive(yesterday.toISOString())).toBe(true);
    });

    it('should handle edge cases around midnight', () => {
      const now = new Date();
      const justBeforeMidnight = new Date(now);
      justBeforeMidnight.setHours(23, 59, 59, 999);

      const justAfterMidnight = new Date(now);
      justAfterMidnight.setHours(0, 0, 0, 1);

      expect(isStreakActive(justBeforeMidnight)).toBe(true);
      expect(isStreakActive(justAfterMidnight)).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle negative XP values', () => {
      expect(calculateLevelFromXP(-100)).toBe(1); // Should default to level 1
    });

    it('should handle very large XP values', () => {
      const largeXP = 1000000;
      const level = calculateLevelFromXP(largeXP);
      expect(level).toBeGreaterThan(100);
      expect(typeof level).toBe('number');
      expect(isFinite(level)).toBe(true);
    });

    it('should handle zero and negative time values in study sessions', () => {
      expect(calculateStudySessionXP(0)).toBe(0);
      expect(calculateStudySessionXP(-10)).toBe(0); // Should not be negative
    });

    it('should handle invalid difficulty levels gracefully', () => {
      // @ts-expect-error - Testing invalid input
      expect(calculateStudySessionXP(30, 'invalid')).toBe(30); // Should default to medium
    });
  });
});
