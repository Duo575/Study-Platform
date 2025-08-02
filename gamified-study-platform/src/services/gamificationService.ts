import { supabase } from '../lib/supabase';
import type { GameStats, Achievement } from '../types';
import {
  calculateLevelFromXP,
  calculateCurrentLevelXP,
  calculateXPToNextLevel,
} from '../utils/gamification';
import { usePetStore } from '../store/petStore';

/**
 * Service for handling gamification-related API calls and data synchronization
 */
export const gamificationService = {
  /**
   * Fetch a user's game stats from the database
   */
  async fetchGameStats(userId: string): Promise<GameStats | null> {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching game stats:', error);
        return null;
      }

      if (!data) return null;

      // Convert database format to application format
      return {
        level: data.level,
        totalXP: data.total_xp,
        currentXP: calculateCurrentLevelXP(data.total_xp),
        xpToNextLevel: calculateXPToNextLevel(data.total_xp),
        streakDays: data.streak_days,
        achievements: [], // Achievements are fetched separately
        lastActivity: new Date(data.last_activity),
        weeklyStats: data.weekly_stats as any,
      };
    } catch (error) {
      console.error('Error in fetchGameStats:', error);
      return null;
    }
  },

  /**
   * Award XP to a user and update their stats
   */
  async awardXP(
    userId: string,
    amount: number,
    source: string
  ): Promise<{
    oldLevel: number;
    newLevel: number;
    totalXP: number;
    levelUp: boolean;
  } | null> {
    try {
      // Call the database function to award XP
      const { data, error } = await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_xp_amount: amount,
        p_source: source,
      });

      if (error) {
        console.error('Error awarding XP:', error);
        return null;
      }

      if (!data || data.length === 0) return null;

      return data[0];
    } catch (error) {
      console.error('Error in awardXP:', error);
      return null;
    }
  },

  /**
   * Update a user's streak and check for streak bonuses
   */
  async updateStreak(userId: string): Promise<{
    streakDays: number;
    bonusAwarded: boolean;
    bonusXP: number;
  } | null> {
    try {
      const { data, error } = await supabase.rpc('update_streak', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error updating streak:', error);
        return null;
      }

      if (!data || data.length === 0) return null;

      return {
        streakDays: data[0].streak_days,
        bonusAwarded: data[0].bonus_awarded,
        bonusXP: data[0].bonus_xp,
      };
    } catch (error) {
      console.error('Error in updateStreak:', error);
      return null;
    }
  },

  /**
   * Check for and award any newly unlocked achievements
   */
  async checkAchievements(userId: string): Promise<
    | {
        achievementId: string;
        achievementName: string;
        xpAwarded: number;
      }[]
    | null
  > {
    try {
      const { data, error } = await supabase.rpc(
        'check_and_award_achievements',
        {
          p_user_id: userId,
        }
      );

      if (error) {
        console.error('Error checking achievements:', error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error('Error in checkAchievements:', error);
      return null;
    }
  },

  /**
   * Fetch a user's unlocked achievements
   */
  async fetchAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(
          `
          id,
          unlocked_at,
          progress,
          achievement_definitions (
            id,
            name,
            description,
            category,
            icon_url,
            xp_reward,
            rarity
          )
        `
        )
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      if (!data) return [];

      // Map database format to application format
      return data.map((item: any) => {
        const def = item.achievement_definitions;
        return {
          id: def.id,
          title: def.name,
          description: def.description,
          category: def.category,
          rarity: def.rarity,
          xpReward: def.xp_reward,
          iconUrl: def.icon_url || `/achievements/${def.id}.png`,
          unlockedAt: new Date(item.unlocked_at),
          progress: item.progress,
        };
      });
    } catch (error) {
      console.error('Error in fetchAchievements:', error);
      return [];
    }
  },

  /**
   * Initialize game stats for a new user
   */
  async initializeGameStats(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('game_stats').insert({
        user_id: userId,
        level: 1,
        total_xp: 0,
        current_xp: 0,
        streak_days: 0,
        last_activity: new Date().toISOString(),
        weekly_stats: {
          studyHours: 0,
          questsCompleted: 0,
          streakMaintained: false,
          xpEarned: 0,
        },
      });

      if (error) {
        console.error('Error initializing game stats:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in initializeGameStats:', error);
      return false;
    }
  },
  /**
   * Handle study activity and update both XP and pet stats
   */
  async handleStudyActivity(
    userId: string,
    activityType: 'study_session' | 'quest_complete' | 'todo_complete',
    durationMinutes?: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<{
    xpAwarded: number;
    levelUp: boolean;
    petUpdated: boolean;
  }> {
    try {
      // Calculate XP based on activity type
      let xpAmount = 0;
      let source = '';

      switch (activityType) {
        case 'study_session':
          xpAmount = durationMinutes ? Math.floor(durationMinutes / 5) : 10;
          source = `Study Session (${durationMinutes}min)`;
          break;
        case 'quest_complete':
          xpAmount =
            difficulty === 'easy' ? 20 : difficulty === 'medium' ? 40 : 60;
          source = 'Quest Completed';
          break;
        case 'todo_complete':
          xpAmount =
            difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
          source = 'Todo Completed';
          break;
      }

      // Award XP
      const xpResult = await this.awardXP(userId, xpAmount, source);

      // Update pet stats
      try {
        // Get the pet store instance
        const petStore = usePetStore.getState();

        // Update pet based on activity
        await petStore.updateFromStudyActivity(
          userId,
          activityType,
          durationMinutes
        );

        // Check for achievements
        await this.checkAchievements(userId);

        return {
          xpAwarded: xpAmount,
          levelUp: xpResult ? xpResult.levelUp : false,
          petUpdated: true,
        };
      } catch (petError) {
        console.error('Error updating pet stats:', petError);

        return {
          xpAwarded: xpAmount,
          levelUp: xpResult ? xpResult.levelUp : false,
          petUpdated: false,
        };
      }
    } catch (error) {
      console.error('Error in handleStudyActivity:', error);
      return {
        xpAwarded: 0,
        levelUp: false,
        petUpdated: false,
      };
    }
  },
};

export default gamificationService;
