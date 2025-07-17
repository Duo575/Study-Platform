import { describe, it, expect, vi, beforeEach } from 'vitest';
import { achievementService } from '../achievementService';
import type { AchievementRequirement, AchievementCondition } from '../achievementService';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          })),
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'test-id', unlocked_at: new Date().toISOString() },
              error: null
            }))
          }))
        })),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        })),
        not: vi.fn(() => ({
          gte: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }
}));

// Mock the gamification service
vi.mock('../gamificationService', () => ({
  gamificationService: {
    awardXP: vi.fn().mockResolvedValue({ xpAwarded: 50, levelUp: false })
  }
}));

describe('AchievementService', () => {
  const mockUserId = 'test-user-id';
  const mockGameStats = {
    level: 5,
    total_xp: 1000,
    streak_days: 7,
    last_activity: new Date().toISOString()
  };

  const mockStudySessions = [
    {
      id: 'session-1',
      duration: 60,
      started_at: new Date().toISOString()
    },
    {
      id: 'session-2',
      duration: 45,
      started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
    },
    {
      id: 'session-3',
      duration: 90,
      started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateTotalStudyTime', () => {
    it('should calculate total study time for all sessions', () => {
      const totalTime = achievementService.calculateTotalStudyTime(mockStudySessions, 'all_time');
      expect(totalTime).toBe(195); // 60 + 45 + 90
    });

    it('should calculate study time for daily timeframe', () => {
      const dailyTime = achievementService.calculateTotalStudyTime(mockStudySessions, 'daily');
      expect(dailyTime).toBe(60); // Only today's session
    });

    it('should calculate study time for weekly timeframe', () => {
      const weeklyTime = achievementService.calculateTotalStudyTime(mockStudySessions, 'weekly');
      expect(weeklyTime).toBe(195); // All sessions within a week
    });

    it('should return 0 for empty sessions', () => {
      const totalTime = achievementService.calculateTotalStudyTime([], 'all_time');
      expect(totalTime).toBe(0);
    });
  });

  describe('getStudySessionCount', () => {
    it('should count all sessions for all_time timeframe', () => {
      const count = achievementService.getStudySessionCount(mockStudySessions, 'all_time');
      expect(count).toBe(3);
    });

    it('should count sessions for daily timeframe', () => {
      const count = achievementService.getStudySessionCount(mockStudySessions, 'daily');
      expect(count).toBe(1); // Only today's session
    });

    it('should return 0 for empty sessions', () => {
      const count = achievementService.getStudySessionCount([], 'all_time');
      expect(count).toBe(0);
    });
  });

  describe('calculateConsecutiveStudyDays', () => {
    it('should calculate consecutive study days correctly', () => {
      const consecutiveDays = achievementService.calculateConsecutiveStudyDays(mockStudySessions);
      expect(consecutiveDays).toBe(3); // Today, yesterday, and 2 days ago
    });

    it('should return 0 for no sessions', () => {
      const consecutiveDays = achievementService.calculateConsecutiveStudyDays([]);
      expect(consecutiveDays).toBe(0);
    });

    it('should return 0 if no recent study activity', () => {
      const oldSessions = [
        {
          started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
        }
      ];
      const consecutiveDays = achievementService.calculateConsecutiveStudyDays(oldSessions);
      expect(consecutiveDays).toBe(0);
    });
  });

  describe('getEarlyMorningSessions', () => {
    it('should count early morning sessions (5-7 AM)', () => {
      const earlyMorningSessions = [
        {
          started_at: new Date(2024, 0, 1, 6, 0).toISOString() // 6 AM
        },
        {
          started_at: new Date(2024, 0, 1, 8, 0).toISOString() // 8 AM (not early morning)
        },
        {
          started_at: new Date(2024, 0, 1, 5, 30).toISOString() // 5:30 AM
        }
      ];

      const count = achievementService.getEarlyMorningSessions(earlyMorningSessions, 'all_time');
      expect(count).toBe(2); // 6 AM and 5:30 AM sessions
    });

    it('should return 0 for no early morning sessions', () => {
      const count = achievementService.getEarlyMorningSessions(mockStudySessions, 'all_time');
      expect(count).toBe(0);
    });
  });

  describe('getLateNightSessions', () => {
    it('should count late night sessions (10 PM - 2 AM)', () => {
      const lateNightSessions = [
        {
          started_at: new Date(2024, 0, 1, 23, 0).toISOString() // 11 PM
        },
        {
          started_at: new Date(2024, 0, 1, 1, 0).toISOString() // 1 AM
        },
        {
          started_at: new Date(2024, 0, 1, 15, 0).toISOString() // 3 PM (not late night)
        }
      ];

      const count = achievementService.getLateNightSessions(lateNightSessions, 'all_time');
      expect(count).toBe(2); // 11 PM and 1 AM sessions
    });
  });

  describe('getWeekendSessions', () => {
    it('should count weekend sessions (Saturday and Sunday)', () => {
      const weekendSessions = [
        {
          started_at: new Date(2024, 0, 6, 10, 0).toISOString() // Saturday
        },
        {
          started_at: new Date(2024, 0, 7, 10, 0).toISOString() // Sunday
        },
        {
          started_at: new Date(2024, 0, 8, 10, 0).toISOString() // Monday (not weekend)
        }
      ];

      const count = achievementService.getWeekendSessions(weekendSessions, 'all_time');
      expect(count).toBe(2); // Saturday and Sunday sessions
    });
  });

  describe('checkCondition', () => {
    const mockContext = {
      gameStats: mockGameStats,
      studySessions: mockStudySessions,
      userId: mockUserId
    };

    it('should check total_study_time condition correctly', async () => {
      const condition: AchievementCondition = {
        metric: 'total_study_time',
        operator: '>=',
        value: 100
      };

      const result = await achievementService.checkCondition(condition, mockContext);
      expect(result).toBe(true); // 195 minutes >= 100
    });

    it('should check streak_days condition correctly', async () => {
      const condition: AchievementCondition = {
        metric: 'streak_days',
        operator: '>=',
        value: 5
      };

      const result = await achievementService.checkCondition(condition, mockContext);
      expect(result).toBe(true); // 7 days >= 5
    });

    it('should check level condition correctly', async () => {
      const condition: AchievementCondition = {
        metric: 'level',
        operator: '>=',
        value: 10
      };

      const result = await achievementService.checkCondition(condition, mockContext);
      expect(result).toBe(false); // 5 < 10
    });

    it('should handle different operators correctly', async () => {
      const conditions = [
        { metric: 'level', operator: '>', value: 4, expected: true },
        { metric: 'level', operator: '<', value: 10, expected: true },
        { metric: 'level', operator: '=', value: 5, expected: true },
        { metric: 'level', operator: '<=', value: 5, expected: true }
      ] as const;

      for (const { metric, operator, value, expected } of conditions) {
        const condition: AchievementCondition = { metric, operator, value };
        const result = await achievementService.checkCondition(condition, mockContext);
        expect(result).toBe(expected);
      }
    });
  });

  describe('checkAchievementRequirement', () => {
    const mockContext = {
      gameStats: mockGameStats,
      studySessions: mockStudySessions,
      userId: mockUserId
    };

    it('should check AND requirements correctly', async () => {
      const requirement: AchievementRequirement = {
        type: 'composite',
        operator: 'AND',
        conditions: [
          { metric: 'level', operator: '>=', value: 3 },
          { metric: 'streak_days', operator: '>=', value: 5 }
        ]
      };

      const result = await achievementService.checkAchievementRequirement(requirement, mockContext);
      expect(result).toBe(true); // Both conditions are met
    });

    it('should check OR requirements correctly', async () => {
      const requirement: AchievementRequirement = {
        type: 'composite',
        operator: 'OR',
        conditions: [
          { metric: 'level', operator: '>=', value: 10 }, // False
          { metric: 'streak_days', operator: '>=', value: 5 } // True
        ]
      };

      const result = await achievementService.checkAchievementRequirement(requirement, mockContext);
      expect(result).toBe(true); // At least one condition is met
    });

    it('should fail when AND requirements are not all met', async () => {
      const requirement: AchievementRequirement = {
        type: 'composite',
        operator: 'AND',
        conditions: [
          { metric: 'level', operator: '>=', value: 3 }, // True
          { metric: 'streak_days', operator: '>=', value: 20 } // False
        ]
      };

      const result = await achievementService.checkAchievementRequirement(requirement, mockContext);
      expect(result).toBe(false); // Not all conditions are met
    });
  });

  describe('calculateAchievementProgress', () => {
    const mockContext = {
      gameStats: mockGameStats,
      studySessions: mockStudySessions,
      userId: mockUserId
    };

    it('should calculate progress for study time achievement', () => {
      const requirement: AchievementRequirement = {
        type: 'study_time',
        conditions: [
          { metric: 'total_study_time', operator: '>=', value: 300 }
        ]
      };

      const progress = achievementService.calculateAchievementProgress(requirement, mockContext);
      expect(progress.current).toBe(195); // Current study time
      expect(progress.target).toBe(300); // Target study time
      expect(progress.description).toContain('Study for 300 minutes total');
    });

    it('should calculate progress for streak achievement', () => {
      const requirement: AchievementRequirement = {
        type: 'consistency',
        conditions: [
          { metric: 'streak_days', operator: '>=', value: 10 }
        ]
      };

      const progress = achievementService.calculateAchievementProgress(requirement, mockContext);
      expect(progress.current).toBe(7); // Current streak
      expect(progress.target).toBe(10); // Target streak
      expect(progress.description).toContain('Maintain a 10-day study streak');
    });

    it('should cap current progress at target', () => {
      const requirement: AchievementRequirement = {
        type: 'study_time',
        conditions: [
          { metric: 'total_study_time', operator: '>=', value: 100 }
        ]
      };

      const progress = achievementService.calculateAchievementProgress(requirement, mockContext);
      expect(progress.current).toBe(100); // Capped at target (195 > 100)
      expect(progress.target).toBe(100);
    });
  });

  describe('filterSessionsByTimeframe', () => {
    it('should return all sessions for all_time', () => {
      const filtered = achievementService.filterSessionsByTimeframe(mockStudySessions, 'all_time');
      expect(filtered).toHaveLength(3);
    });

    it('should filter sessions by daily timeframe', () => {
      const filtered = achievementService.filterSessionsByTimeframe(mockStudySessions, 'daily');
      expect(filtered).toHaveLength(1); // Only today's session
    });

    it('should filter sessions by weekly timeframe', () => {
      const filtered = achievementService.filterSessionsByTimeframe(mockStudySessions, 'weekly');
      expect(filtered).toHaveLength(3); // All sessions within a week
    });

    it('should filter sessions by monthly timeframe', () => {
      const filtered = achievementService.filterSessionsByTimeframe(mockStudySessions, 'monthly');
      expect(filtered).toHaveLength(3); // All sessions within current month
    });
  });

  describe('getTimeframeCutoff', () => {
    it('should return correct cutoff for daily timeframe', () => {
      const cutoff = achievementService.getTimeframeCutoff('daily');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(cutoff.toDateString()).toBe(today.toDateString());
    });

    it('should return correct cutoff for weekly timeframe', () => {
      const cutoff = achievementService.getTimeframeCutoff('weekly');
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(Math.abs(cutoff.getTime() - weekAgo.getTime())).toBeLessThan(1000); // Within 1 second
    });

    it('should return correct cutoff for monthly timeframe', () => {
      const cutoff = achievementService.getTimeframeCutoff('monthly');
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      expect(cutoff.toDateString()).toBe(monthStart.toDateString());
    });

    it('should return epoch for unknown timeframe', () => {
      const cutoff = achievementService.getTimeframeCutoff('unknown');
      expect(cutoff.getTime()).toBe(0);
    });
  });
});

describe('Achievement Integration Tests', () => {
  it('should handle achievement unlock workflow', async () => {
    const mockDefinition = {
      id: 'test-achievement',
      title: 'Test Achievement',
      description: 'A test achievement',
      category: 'study_time' as const,
      rarity: 'common' as const,
      xpReward: 50,
      requirements: {
        type: 'study_time' as const,
        conditions: [
          { metric: 'total_study_time', operator: '>=' as const, value: 60 }
        ]
      }
    };

    const unlock = await achievementService.unlockAchievement('test-user', mockDefinition);
    expect(unlock).toBeTruthy();
    expect(unlock?.achievement.id).toBe('test-achievement');
    expect(unlock?.xpAwarded).toBe(50);
    expect(unlock?.isNew).toBe(true);
  });

  it('should handle empty data gracefully', async () => {
    const emptyContext = {
      gameStats: { level: 1, total_xp: 0, streak_days: 0 },
      studySessions: [],
      userId: 'empty-user'
    };

    const requirement: AchievementRequirement = {
      type: 'study_time',
      conditions: [
        { metric: 'total_study_time', operator: '>=', value: 60 }
      ]
    };

    const result = await achievementService.checkAchievementRequirement(requirement, emptyContext);
    expect(result).toBe(false);

    const progress = achievementService.calculateAchievementProgress(requirement, emptyContext);
    expect(progress.current).toBe(0);
    expect(progress.target).toBe(60);
  });
});