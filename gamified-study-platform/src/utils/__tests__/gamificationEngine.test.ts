import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateStudySessionXP,
  calculateQuestXP,
  calculateTodoXP,
  calculateStreakBonus,
  calculateLevelFromXP,
  calculateXPForLevel,
  calculateCurrentLevelXP,
  calculateXPToNextLevel,
  updateGameStats,
  calculateStudyStreak,
  isStreakActive,
  validateDailyActivity,
  formatXP,
  formatLevel,
  getProgressPercentage
} from '../gamificationEngine';
import { XP_REWARDS, DIFFICULTY_MULTIPLIERS, TIME_MULTIPLIERS, LEVEL_XP_REQUIREMENTS } from '../constants';
import type { GameStats } from '../../types';

describe('Gamification Engine', () => {
  describe('Study Session XP Calculation', () => {
    it('should calculate XP with base and time components', () => {
      const result = calculateStudySessionXP(30, 'medium', false, 100);
      const expected = Math.floor((XP_REWARDS.STUDY_SESSION_BASE + 30 * XP_REWARDS.STUDY_SESSION_PER_MINUTE) * DIFFICULTY_MULTIPLIERS.medium * TIME_MULTIPLIERS.MEDIUM_SESSION);
      expect(result).toBe(expected);
    });

    it('should apply time multipliers based on session length', () => {
      expect(calculateStudySessionXP(10, 'medium')).toBeLessThan(calculateStudySessionXP(20, 'medium'));
      expect(calculateStudySessionXP(50, 'medium')).toBeGreaterThan(calculateStudySessionXP(40, 'medium'));
      expect(calculateStudySessionXP(100, 'medium')).toBeGreaterThan(calculateStudySessionXP(80, 'medium'));
    });

    it('should apply difficulty multipliers correctly', () => {
      const baseXP = calculateStudySessionXP(30, 'medium');
      const easyXP = calculateStudySessionXP(30, 'easy');
      const hardXP = calculateStudySessionXP(30, 'hard');

      expect(easyXP).toBeLessThan(baseXP);
      expect(hardXP).toBeGreaterThan(baseXP);
    });

    it('should apply focus percentage correctly', () => {
      const fullFocus = calculateStudySessionXP(30, 'medium', false, 100);
      const partialFocus = calculateStudySessionXP(30, 'medium', false, 80);
      const poorFocus = calculateStudySessionXP(30, 'medium', false, 50);

      expect(partialFocus).toBeLessThan(fullFocus);
      expect(poorFocus).toBeLessThan(partialFocus);
    });

    it('should add focus session bonus when applicable', () => {
      const withBonus = calculateStudySessionXP(30, 'medium', true);
      const withoutBonus = calculateStudySessionXP(30, 'medium', false);

      expect(withBonus).toBe(withoutBonus + XP_REWARDS.FOCUS_SESSION_BONUS);
    });

    it('should return minimum 1 XP', () => {
      expect(calculateStudySessionXP(0, 'easy', false, 10)).toBe(1);
      expect(calculateStudySessionXP(1, 'easy', false, 1)).toBe(1);
    });
  });

  describe('Quest XP Calculation', () => {
    it('should calculate XP based on quest type', () => {
      expect(calculateQuestXP('daily')).toBe(Math.floor(XP_REWARDS.DAILY_QUEST * DIFFICULTY_MULTIPLIERS.medium));
      expect(calculateQuestXP('weekly')).toBe(Math.floor(XP_REWARDS.WEEKLY_QUEST * DIFFICULTY_MULTIPLIERS.medium));
      expect(calculateQuestXP('milestone')).toBe(Math.floor(XP_REWARDS.MILESTONE_QUEST * DIFFICULTY_MULTIPLIERS.medium));
      expect(calculateQuestXP('bonus')).toBe(Math.floor(XP_REWARDS.BONUS_QUEST * DIFFICULTY_MULTIPLIERS.medium));
    });

    it('should apply difficulty multipliers', () => {
      const baseXP = calculateQuestXP('daily', 'medium');
      const easyXP = calculateQuestXP('daily', 'easy');
      const hardXP = calculateQuestXP('daily', 'hard');

      expect(easyXP).toBeLessThan(baseXP);
      expect(hardXP).toBeGreaterThan(baseXP);
    });

    it('should apply early completion bonus', () => {
      const normalXP = calculateQuestXP('daily', 'medium', false);
      const earlyXP = calculateQuestXP('daily', 'medium', true);

      expect(earlyXP).toBe(Math.floor(normalXP * 1.25));
    });

    it('should handle unknown quest types gracefully', () => {
      // @ts-ignore - Testing unknown quest type
      const result = calculateQuestXP('unknown', 'medium');
      expect(result).toBe(Math.floor(XP_REWARDS.QUEST_COMPLETION_BASE * DIFFICULTY_MULTIPLIERS.medium));
    });
  });

  describe('Todo XP Calculation', () => {
    it('should calculate XP based on completion timing', () => {
      const earlyXP = calculateTodoXP(60, true, true);
      const onTimeXP = calculateTodoXP(60, false, true);
      const lateXP = calculateTodoXP(60, false, false);

      expect(earlyXP).toBe(XP_REWARDS.TODO_COMPLETION_EARLY + Math.floor(60 / 30) * 2);
      expect(onTimeXP).toBe(XP_REWARDS.TODO_COMPLETION_ON_TIME + Math.floor(60 / 30) * 2);
      expect(lateXP).toBe(XP_REWARDS.TODO_COMPLETION + Math.floor(60 / 30) * 2);
    });

    it('should add time bonus for longer tasks', () => {
      const shortTask = calculateTodoXP(15, false, true);
      const longTask = calculateTodoXP(60, false, true);

      expect(longTask).toBeGreaterThan(shortTask);
      expect(longTask - shortTask).toBe(Math.floor(60 / 30) * 2 - Math.floor(15 / 30) * 2);
    });
  });

  describe('Streak Bonus Calculation', () => {
    it('should return correct bonuses for different streak lengths', () => {
      expect(calculateStreakBonus(2)).toBe(0);
      expect(calculateStreakBonus(3)).toBe(XP_REWARDS.STREAK_BONUS);
      expect(calculateStreakBonus(7)).toBe(XP_REWARDS.WEEKLY_STREAK_BONUS);
      expect(calculateStreakBonus(30)).toBe(XP_REWARDS.MONTHLY_STREAK_BONUS);
    });
  });

  describe('Level System', () => {
    it('should calculate level from XP using predefined requirements', () => {
      expect(calculateLevelFromXP(0)).toBe(0);
      expect(calculateLevelFromXP(100)).toBe(1);
      expect(calculateLevelFromXP(250)).toBe(2);
      expect(calculateLevelFromXP(450)).toBe(3);
    });

    it('should handle XP beyond predefined levels', () => {
      const highXP = LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1] + 10000;
      const level = calculateLevelFromXP(highXP);
      expect(level).toBeGreaterThan(LEVEL_XP_REQUIREMENTS.length - 1);
    });

    it('should calculate XP required for specific levels', () => {
      expect(calculateXPForLevel(0)).toBe(0);
      expect(calculateXPForLevel(1)).toBe(LEVEL_XP_REQUIREMENTS[1]);
      expect(calculateXPForLevel(5)).toBe(LEVEL_XP_REQUIREMENTS[5]);
    });

    it('should calculate XP for levels beyond predefined requirements', () => {
      const highLevel = LEVEL_XP_REQUIREMENTS.length + 5;
      const xp = calculateXPForLevel(highLevel);
      expect(xp).toBeGreaterThan(LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1]);
    });

    it('should calculate current level XP correctly', () => {
      const totalXP = 350;
      const currentLevel = calculateLevelFromXP(totalXP);
      const currentLevelMinXP = calculateXPForLevel(currentLevel);
      const currentXP = calculateCurrentLevelXP(totalXP);
      
      expect(currentXP).toBe(totalXP - currentLevelMinXP);
    });

    it('should calculate XP to next level correctly', () => {
      const totalXP = 350;
      const currentLevel = calculateLevelFromXP(totalXP);
      const nextLevelXP = calculateXPForLevel(currentLevel + 1);
      const currentLevelXP = calculateXPForLevel(currentLevel);
      const xpToNext = calculateXPToNextLevel(totalXP);
      
      expect(xpToNext).toBe(nextLevelXP - currentLevelXP);
    });
  });

  describe('Game Stats Updates', () => {
    let mockGameStats: GameStats;

    beforeEach(() => {
      mockGameStats = {
        level: 2,
        totalXP: 300,
        currentXP: 50,
        xpToNextLevel: 150,
        streakDays: 5,
        achievements: [],
        lastActivity: new Date(),
        weeklyStats: {
          studyHours: 10,
          questsCompleted: 3,
          streakMaintained: true,
          xpEarned: 100
        }
      };
    });

    it('should update stats without level up', () => {
      const result = updateGameStats(mockGameStats, 50);
      
      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBeUndefined();
      expect(result.stats.totalXP).toBe(350);
      expect(result.stats.weeklyStats.xpEarned).toBe(150);
    });

    it('should detect level up', () => {
      const result = updateGameStats(mockGameStats, 200);
      
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBeGreaterThan(mockGameStats.level);
      expect(result.stats.totalXP).toBe(500);
    });

    it('should update activity-specific stats', () => {
      const questResult = updateGameStats(mockGameStats, 50, 'quest');
      expect(questResult.stats.weeklyStats.questsCompleted).toBe(4);

      const studyResult = updateGameStats(mockGameStats, 60, 'study');
      expect(studyResult.stats.weeklyStats.studyHours).toBeGreaterThan(10);
    });

    it('should update last activity timestamp', () => {
      const result = updateGameStats(mockGameStats, 50);
      expect(result.stats.lastActivity).toBeInstanceOf(Date);
      expect(result.stats.lastActivity.getTime()).toBeGreaterThan(mockGameStats.lastActivity.getTime());
    });
  });

  describe('Study Streak Calculation', () => {
    it('should calculate streak from consecutive study days', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
      
      const sessions = [today, yesterday, twoDaysAgo];
      const streak = calculateStudyStreak(sessions);
      
      expect(streak).toBe(3);
    });

    it('should handle gaps in study sessions', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const fourDaysAgo = new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000);
      
      const sessions = [today, yesterday, fourDaysAgo];
      const streak = calculateStudyStreak(sessions);
      
      expect(streak).toBe(2); // Only today and yesterday count
    });

    it('should handle multiple sessions on same day', () => {
      const today = new Date();
      const todayMorning = new Date(today);
      todayMorning.setHours(9, 0, 0, 0);
      const todayEvening = new Date(today);
      todayEvening.setHours(20, 0, 0, 0);
      
      const sessions = [todayMorning, todayEvening];
      const streak = calculateStudyStreak(sessions);
      
      expect(streak).toBe(1); // Same day counts as 1
    });

    it('should return 0 for empty sessions', () => {
      expect(calculateStudyStreak([])).toBe(0);
    });
  });

  describe('Streak Activity Validation', () => {
    it('should validate if streak is active', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

      expect(isStreakActive(today)).toBe(true);
      expect(isStreakActive(yesterday)).toBe(true);
      expect(isStreakActive(twoDaysAgo)).toBe(false);
    });

    it('should validate daily activity correctly', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

      // First activity (no previous activity)
      const firstActivity = validateDailyActivity(null, today);
      expect(firstActivity.isValid).toBe(true);
      expect(firstActivity.streakMaintained).toBe(false);

      // Consecutive day activity
      const consecutiveActivity = validateDailyActivity(yesterday, today);
      expect(consecutiveActivity.isValid).toBe(true);
      expect(consecutiveActivity.streakMaintained).toBe(true);
      expect(consecutiveActivity.daysDifference).toBe(1);

      // Same day activity
      const sameDayActivity = validateDailyActivity(today, today);
      expect(sameDayActivity.isValid).toBe(false);
      expect(sameDayActivity.daysDifference).toBe(0);

      // Gap in activity
      const gapActivity = validateDailyActivity(twoDaysAgo, today);
      expect(gapActivity.isValid).toBe(true);
      expect(gapActivity.streakMaintained).toBe(false);
      expect(gapActivity.daysDifference).toBe(2);
    });
  });

  describe('Formatting Functions', () => {
    describe('formatXP', () => {
      it('should format XP values correctly', () => {
        expect(formatXP(0)).toBe('0');
        expect(formatXP(500)).toBe('500');
        expect(formatXP(1000)).toBe('1.0K');
        expect(formatXP(1500)).toBe('1.5K');
        expect(formatXP(1000000)).toBe('1.0M');
        expect(formatXP(2500000)).toBe('2.5M');
      });
    });

    describe('formatLevel', () => {
      it('should format level correctly', () => {
        expect(formatLevel(1)).toBe('Level 1');
        expect(formatLevel(25)).toBe('Level 25');
        expect(formatLevel(100)).toBe('Level 100');
      });
    });

    describe('getProgressPercentage', () => {
      it('should calculate progress percentage correctly', () => {
        expect(getProgressPercentage(0, 100)).toBe(0);
        expect(getProgressPercentage(25, 100)).toBe(25);
        expect(getProgressPercentage(50, 100)).toBe(50);
        expect(getProgressPercentage(100, 100)).toBe(100);
        expect(getProgressPercentage(150, 100)).toBe(100); // Capped at 100%
      });

      it('should handle edge cases', () => {
        expect(getProgressPercentage(50, 0)).toBe(100); // Division by zero
        expect(getProgressPercentage(0, 0)).toBe(100); // Both zero
        expect(getProgressPercentage(33, 100)).toBe(33); // Decimal truncation
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle negative values gracefully', () => {
      expect(calculateStudySessionXP(-10)).toBe(1); // Minimum XP
      expect(calculateLevelFromXP(-100)).toBe(0); // Minimum level
      expect(calculateStreakBonus(-5)).toBe(0);
    });

    it('should handle very large values', () => {
      const largeXP = 999999999;
      expect(calculateLevelFromXP(largeXP)).toBeGreaterThan(0);
      expect(isFinite(calculateLevelFromXP(largeXP))).toBe(true);
    });

    it('should handle invalid dates in streak calculations', () => {
      const invalidDate = new Date('invalid');
      expect(isStreakActive(invalidDate)).toBe(false);
    });

    it('should handle empty or invalid input arrays', () => {
      expect(calculateStudyStreak([])).toBe(0);
      // @ts-ignore - Testing invalid input
      expect(calculateStudyStreak(null)).toBe(0);
    });
  });
});