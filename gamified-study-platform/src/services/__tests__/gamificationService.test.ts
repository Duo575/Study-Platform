import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gamificationService } from '../gamificationService';
import type { GameStats } from '../../types';

// Mock the supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null
        })),
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  })),
  rpc: vi.fn(() => ({
    data: [],
    error: null
  }))
};

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock the pet store
const mockPetStore = {
  updateFromStudyActivity: vi.fn().mockResolvedValue(undefined)
};

vi.mock('../../store/petStore', () => ({
  usePetStore: {
    getState: () => mockPetStore
  }
}));

// Mock the gamification utils
vi.mock('../../utils/gamification', () => ({
  calculateLevelFromXP: vi.fn((xp: number) => Math.floor(xp / 100) + 1),
  calculateCurrentLevelXP: vi.fn((xp: number) => xp % 100),
  calculateXPToNextLevel: vi.fn((xp: number) => 100 - (xp % 100))
}));

describe('Gamification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchGameStats', () => {
    it('should fetch and transform game stats successfully', async () => {
      const mockDbStats = {
        level: 5,
        total_xp: 1250,
        streak_days: 7,
        last_activity: '2024-01-15T10:00:00Z',
        weekly_stats: {
          studyHours: 15,
          questsCompleted: 8,
          streakMaintained: true,
          xpEarned: 300
        }
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockDbStats,
              error: null
            }))
          }))
        }))
      });

      const result = await gamificationService.fetchGameStats('user-123');

      expect(result).toEqual({
        level: 5,
        totalXP: 1250,
        currentXP: 50, // Mocked calculation
        xpToNextLevel: 50, // Mocked calculation
        streakDays: 7,
        achievements: [],
        lastActivity: new Date('2024-01-15T10:00:00Z'),
        weeklyStats: mockDbStats.weekly_stats
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('game_stats');
    });

    it('should return null when no data is found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      });

      const result = await gamificationService.fetchGameStats('user-123');
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { message: 'Database error' }
            }))
          }))
        }))
      });

      const result = await gamificationService.fetchGameStats('user-123');
      expect(result).toBeNull();
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Connection error');
      });

      const result = await gamificationService.fetchGameStats('user-123');
      expect(result).toBeNull();
    });
  });

  describe('awardXP', () => {
    it('should award XP successfully', async () => {
      const mockResult = [{
        oldLevel: 2,
        newLevel: 3,
        totalXP: 350,
        levelUp: true
      }];

      mockSupabase.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const result = await gamificationService.awardXP('user-123', 50, 'Quest Completion');

      expect(result).toEqual(mockResult[0]);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('award_xp', {
        p_user_id: 'user-123',
        p_xp_amount: 50,
        p_source: 'Quest Completion'
      });
    });

    it('should return null when database error occurs', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await gamificationService.awardXP('user-123', 50, 'Quest Completion');
      expect(result).toBeNull();
    });

    it('should return null when no data is returned', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await gamificationService.awardXP('user-123', 50, 'Quest Completion');
      expect(result).toBeNull();
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Connection error'));

      const result = await gamificationService.awardXP('user-123', 50, 'Quest Completion');
      expect(result).toBeNull();
    });
  });

  describe('updateStreak', () => {
    it('should update streak successfully', async () => {
      const mockResult = [{
        streak_days: 8,
        bonus_awarded: true,
        bonus_xp: 25
      }];

      mockSupabase.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const result = await gamificationService.updateStreak('user-123');

      expect(result).toEqual({
        streakDays: 8,
        bonusAwarded: true,
        bonusXP: 25
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_streak', {
        p_user_id: 'user-123'
      });
    });

    it('should return null when database error occurs', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await gamificationService.updateStreak('user-123');
      expect(result).toBeNull();
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Connection error'));

      const result = await gamificationService.updateStreak('user-123');
      expect(result).toBeNull();
    });
  });

  describe('checkAchievements', () => {
    it('should check and return new achievements', async () => {
      const mockAchievements = [
        {
          achievementId: 'first-quest',
          achievementName: 'First Quest',
          xpAwarded: 25
        },
        {
          achievementId: 'study-streak',
          achievementName: 'Study Streak',
          xpAwarded: 50
        }
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockAchievements,
        error: null
      });

      const result = await gamificationService.checkAchievements('user-123');

      expect(result).toEqual(mockAchievements);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_and_award_achievements', {
        p_user_id: 'user-123'
      });
    });

    it('should return empty array when no new achievements', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await gamificationService.checkAchievements('user-123');
      expect(result).toEqual([]);
    });

    it('should return null when database error occurs', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await gamificationService.checkAchievements('user-123');
      expect(result).toBeNull();
    });
  });

  describe('fetchAchievements', () => {
    it('should fetch and transform achievements successfully', async () => {
      const mockDbAchievements = [
        {
          id: 'user-achievement-1',
          unlocked_at: '2024-01-15T10:00:00Z',
          progress: 100,
          achievement_definitions: {
            id: 'first-quest',
            name: 'First Quest',
            description: 'Complete your first quest',
            category: 'quest_completion',
            icon_url: '/icons/first-quest.png',
            xp_reward: 25,
            rarity: 'common'
          }
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: mockDbAchievements,
            error: null
          }))
        }))
      });

      const result = await gamificationService.fetchAchievements('user-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'first-quest',
        title: 'First Quest',
        description: 'Complete your first quest',
        category: 'quest_completion',
        rarity: 'common',
        xpReward: 25,
        iconUrl: '/icons/first-quest.png',
        unlockedAt: new Date('2024-01-15T10:00:00Z'),
        progress: 100
      });
    });

    it('should use default icon URL when not provided', async () => {
      const mockDbAchievements = [
        {
          id: 'user-achievement-1',
          unlocked_at: '2024-01-15T10:00:00Z',
          progress: 100,
          achievement_definitions: {
            id: 'first-quest',
            name: 'First Quest',
            description: 'Complete your first quest',
            category: 'quest_completion',
            icon_url: null,
            xp_reward: 25,
            rarity: 'common'
          }
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: mockDbAchievements,
            error: null
          }))
        }))
      });

      const result = await gamificationService.fetchAchievements('user-123');

      expect(result[0].iconUrl).toBe('/achievements/first-quest.png');
    });

    it('should return empty array when database error occurs', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      });

      const result = await gamificationService.fetchAchievements('user-123');
      expect(result).toEqual([]);
    });
  });

  describe('initializeGameStats', () => {
    it('should initialize game stats successfully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          data: null,
          error: null
        }))
      });

      const result = await gamificationService.initializeGameStats('user-123');

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('game_stats');
    });

    it('should return false when database error occurs', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          data: null,
          error: { message: 'Database error' }
        }))
      });

      const result = await gamificationService.initializeGameStats('user-123');
      expect(result).toBe(false);
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Connection error');
      });

      const result = await gamificationService.initializeGameStats('user-123');
      expect(result).toBe(false);
    });
  });

  describe('handleStudyActivity', () => {
    beforeEach(() => {
      // Reset mocks for handleStudyActivity tests
      mockSupabase.rpc.mockResolvedValue({
        data: [{
          oldLevel: 2,
          newLevel: 2,
          totalXP: 250,
          levelUp: false
        }],
        error: null
      });

      mockPetStore.updateFromStudyActivity.mockResolvedValue(undefined);
    });

    it('should handle study session activity', async () => {
      const result = await gamificationService.handleStudyActivity(
        'user-123',
        'study_session',
        60,
        'medium'
      );

      expect(result.xpAwarded).toBe(12); // 60 minutes / 5
      expect(result.levelUp).toBe(false);
      expect(result.petUpdated).toBe(true);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('award_xp', {
        p_user_id: 'user-123',
        p_xp_amount: 12,
        p_source: 'Study Session (60min)'
      });

      expect(mockPetStore.updateFromStudyActivity).toHaveBeenCalledWith(
        'user-123',
        'study_session',
        60
      );
    });

    it('should handle quest completion activity', async () => {
      const result = await gamificationService.handleStudyActivity(
        'user-123',
        'quest_complete',
        undefined,
        'hard'
      );

      expect(result.xpAwarded).toBe(60); // Hard difficulty quest
      expect(result.levelUp).toBe(false);
      expect(result.petUpdated).toBe(true);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('award_xp', {
        p_user_id: 'user-123',
        p_xp_amount: 60,
        p_source: 'Quest Completed'
      });
    });

    it('should handle todo completion activity', async () => {
      const result = await gamificationService.handleStudyActivity(
        'user-123',
        'todo_complete',
        undefined,
        'easy'
      );

      expect(result.xpAwarded).toBe(5); // Easy difficulty todo
      expect(result.levelUp).toBe(false);
      expect(result.petUpdated).toBe(true);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('award_xp', {
        p_user_id: 'user-123',
        p_xp_amount: 5,
        p_source: 'Todo Completed'
      });
    });

    it('should detect level up', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [{
          oldLevel: 2,
          newLevel: 3,
          totalXP: 350,
          levelUp: true
        }],
        error: null
      });

      const result = await gamificationService.handleStudyActivity(
        'user-123',
        'quest_complete',
        undefined,
        'hard'
      );

      expect(result.levelUp).toBe(true);
    });

    it('should handle pet update failure gracefully', async () => {
      mockPetStore.updateFromStudyActivity.mockRejectedValue(new Error('Pet update failed'));

      const result = await gamificationService.handleStudyActivity(
        'user-123',
        'study_session',
        30,
        'medium'
      );

      expect(result.xpAwarded).toBe(6);
      expect(result.levelUp).toBe(false);
      expect(result.petUpdated).toBe(false);
    });

    it('should handle XP award failure', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await gamificationService.handleStudyActivity(
        'user-123',
        'study_session',
        30,
        'medium'
      );

      expect(result.xpAwarded).toBe(6);
      expect(result.levelUp).toBe(false);
      expect(result.petUpdated).toBe(true);
    });

    it('should handle complete failure gracefully', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Complete failure'));

      const result = await gamificationService.handleStudyActivity(
        'user-123',
        'study_session',
        30,
        'medium'
      );

      expect(result.xpAwarded).toBe(0);
      expect(result.levelUp).toBe(false);
      expect(result.petUpdated).toBe(false);
    });

    it('should use default duration for study sessions when not provided', async () => {
      const result = await gamificationService.handleStudyActivity(
        'user-123',
        'study_session',
        undefined,
        'medium'
      );

      expect(result.xpAwarded).toBe(10); // Default XP when no duration
      expect(mockSupabase.rpc).toHaveBeenCalledWith('award_xp', {
        p_user_id: 'user-123',
        p_xp_amount: 10,
        p_source: 'Study Session (undefinedmin)'
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null user ID gracefully', async () => {
      const result = await gamificationService.fetchGameStats('');
      expect(result).toBeNull();
    });

    it('should handle negative XP amounts', async () => {
      const result = await gamificationService.awardXP('user-123', -50, 'Test');
      // Should still call the database function - let the database handle validation
      expect(mockSupabase.rpc).toHaveBeenCalledWith('award_xp', {
        p_user_id: 'user-123',
        p_xp_amount: -50,
        p_source: 'Test'
      });
    });

    it('should handle very large XP amounts', async () => {
      const largeXP = 999999;
      await gamificationService.awardXP('user-123', largeXP, 'Test');
      
      expect(mockSupabase.rpc).toHaveBeenCalledWith('award_xp', {
        p_user_id: 'user-123',
        p_xp_amount: largeXP,
        p_source: 'Test'
      });
    });

    it('should handle malformed database responses', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { invalid: 'data' },
              error: null
            }))
          }))
        }))
      });

      const result = await gamificationService.fetchGameStats('user-123');
      // Should handle missing required fields gracefully
      expect(result).toBeTruthy();
    });
  });
});