import { supabase } from '../lib/supabase';
import { gamificationService } from './gamificationService';
import { ACHIEVEMENT_DEFINITIONS } from '../utils/constants';
import type { 
  Achievement, 
  AchievementCategory, 
  AchievementProgress,
  User,
  GameStats,
  StudySession
} from '../types';

/**
 * Achievement definition with unlock conditions
 */
export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  iconUrl?: string;
  requirements: AchievementRequirement;
  isHidden?: boolean; // Hidden until unlocked
  isSeasonalEvent?: boolean;
  eventEndDate?: Date;
}

/**
 * Achievement requirement conditions
 */
export interface AchievementRequirement {
  type: 'study_time' | 'consistency' | 'quest_completion' | 'pet_care' | 'social' | 'special_event' | 'composite';
  conditions: AchievementCondition[];
  operator?: 'AND' | 'OR'; // For composite requirements
}

/**
 * Individual achievement condition
 */
export interface AchievementCondition {
  metric: string;
  operator: '>=' | '<=' | '=' | '>' | '<';
  value: number | string | boolean;
  timeframe?: 'all_time' | 'daily' | 'weekly' | 'monthly';
}

/**
 * Achievement unlock result
 */
export interface AchievementUnlock {
  achievement: AchievementDefinition;
  unlockedAt: Date;
  xpAwarded: number;
  isNew: boolean;
}

/**
 * Seasonal event definition
 */
export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  achievements: string[]; // Achievement IDs
  specialRewards: {
    xpMultiplier?: number;
    exclusiveBadges?: string[];
    limitedTimeItems?: string[];
  };
}

/**
 * Badge information
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  unlockedAt?: Date;
  isLimitedEdition?: boolean;
  eventId?: string;
}

/**
 * Service for managing achievements and badges
 */
export const achievementService = {
  /**
   * Get all achievement definitions
   */
  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    try {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      return data.map(this.mapDatabaseToDefinition);
    } catch (error) {
      console.error('Error fetching achievement definitions:', error);
      return this.getDefaultAchievements();
    }
  },

  /**
   * Get user's unlocked achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
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
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.achievement_definitions.id,
        title: item.achievement_definitions.name,
        description: item.achievement_definitions.description,
        category: item.achievement_definitions.category,
        rarity: item.achievement_definitions.rarity,
        xpReward: item.achievement_definitions.xp_reward,
        iconUrl: item.achievement_definitions.icon_url || `/achievements/${item.achievement_definitions.id}.png`,
        unlockedAt: new Date(item.unlocked_at),
        progress: item.progress
      }));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  },

  /**
   * Check and award achievements for a user
   */
  async checkAndAwardAchievements(userId: string): Promise<AchievementUnlock[]> {
    try {
      // Get user's current stats and data
      const [gameStats, studySessions, userAchievements] = await Promise.all([
        this.getUserGameStats(userId),
        this.getUserStudySessions(userId),
        this.getUserAchievements(userId)
      ]);

      if (!gameStats) return [];

      const definitions = await this.getAchievementDefinitions();
      const unlockedAchievementIds = new Set(userAchievements.map(a => a.id));
      const newUnlocks: AchievementUnlock[] = [];

      // Check each achievement definition
      for (const definition of definitions) {
        if (unlockedAchievementIds.has(definition.id)) continue;

        // Skip seasonal achievements that are expired
        if (definition.isSeasonalEvent && definition.eventEndDate && definition.eventEndDate < new Date()) {
          continue;
        }

        const isUnlocked = await this.checkAchievementRequirement(
          definition.requirements,
          { gameStats, studySessions, userId }
        );

        if (isUnlocked) {
          const unlock = await this.unlockAchievement(userId, definition);
          if (unlock) {
            newUnlocks.push(unlock);
          }
        }
      }

      return newUnlocks;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  },

  /**
   * Unlock a specific achievement for a user
   */
  async unlockAchievement(userId: string, definition: AchievementDefinition): Promise<AchievementUnlock | null> {
    try {
      // Insert the achievement unlock
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: definition.id,
          unlocked_at: new Date().toISOString(),
          progress: { completed: true }
        })
        .select()
        .single();

      if (error) throw error;

      // Award XP
      await gamificationService.awardXP(userId, definition.xpReward, `Achievement: ${definition.title}`);

      return {
        achievement: definition,
        unlockedAt: new Date(data.unlocked_at),
        xpAwarded: definition.xpReward,
        isNew: true
      };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return null;
    }
  },

  /**
   * Get achievement progress for a user
   */
  async getAchievementProgress(userId: string, achievementId: string): Promise<AchievementProgress | null> {
    try {
      const definition = (await this.getAchievementDefinitions()).find(d => d.id === achievementId);
      if (!definition) return null;

      // Get user data
      const [gameStats, studySessions] = await Promise.all([
        this.getUserGameStats(userId),
        this.getUserStudySessions(userId)
      ]);

      if (!gameStats) return null;

      return this.calculateAchievementProgress(
        definition.requirements,
        { gameStats, studySessions, userId }
      );
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return null;
    }
  },

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(category: AchievementCategory): Promise<AchievementDefinition[]> {
    const definitions = await this.getAchievementDefinitions();
    return definitions.filter(d => d.category === category);
  },

  /**
   * Get seasonal events
   */
  async getSeasonalEvents(): Promise<SeasonalEvent[]> {
    try {
      const { data, error } = await supabase
        .from('seasonal_events')
        .select('*')
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;

      return data.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        startDate: new Date(event.start_date),
        endDate: new Date(event.end_date),
        achievements: event.achievement_ids || [],
        specialRewards: event.special_rewards || {}
      }));
    } catch (error) {
      console.error('Error fetching seasonal events:', error);
      return [];
    }
  },

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          unlocked_at,
          badges (
            id,
            name,
            description,
            icon_url,
            rarity,
            category,
            is_limited_edition,
            event_id
          )
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.badges.id,
        name: item.badges.name,
        description: item.badges.description,
        iconUrl: item.badges.icon_url,
        rarity: item.badges.rarity,
        category: item.badges.category,
        unlockedAt: new Date(item.unlocked_at),
        isLimitedEdition: item.badges.is_limited_edition,
        eventId: item.badges.event_id
      }));
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  },

  /**
   * Award a badge to a user
   */
  async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          unlocked_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  },

  /**
   * Check if achievement requirement is met
   */
  async checkAchievementRequirement(
    requirement: AchievementRequirement,
    context: { gameStats: any; studySessions: any[]; userId: string }
  ): Promise<boolean> {
    const { conditions, operator = 'AND' } = requirement;
    const results = await Promise.all(
      conditions.map(condition => this.checkCondition(condition, context))
    );

    return operator === 'AND' ? results.every(r => r) : results.some(r => r);
  },

  /**
   * Check individual condition
   */
  async checkCondition(
    condition: AchievementCondition,
    context: { gameStats: any; studySessions: any[]; userId: string }
  ): Promise<boolean> {
    const { metric, operator, value, timeframe = 'all_time' } = condition;
    const { gameStats, studySessions } = context;

    let actualValue: number | string | boolean;

    // Get the actual value based on metric
    switch (metric) {
      case 'total_study_time':
        actualValue = this.calculateTotalStudyTime(studySessions, timeframe);
        break;
      case 'streak_days':
        actualValue = gameStats.streak_days || 0;
        break;
      case 'level':
        actualValue = gameStats.level || 1;
        break;
      case 'total_xp':
        actualValue = gameStats.total_xp || 0;
        break;
      case 'quests_completed':
        actualValue = await this.getQuestsCompleted(context.userId, timeframe);
        break;
      case 'study_sessions':
        actualValue = this.getStudySessionCount(studySessions, timeframe);
        break;
      case 'consecutive_days':
        actualValue = this.calculateConsecutiveStudyDays(studySessions);
        break;
      case 'early_morning_sessions':
        actualValue = this.getEarlyMorningSessions(studySessions, timeframe);
        break;
      case 'late_night_sessions':
        actualValue = this.getLateNightSessions(studySessions, timeframe);
        break;
      case 'weekend_sessions':
        actualValue = this.getWeekendSessions(studySessions, timeframe);
        break;
      default:
        actualValue = 0;
    }

    // Compare values based on operator
    switch (operator) {
      case '>=':
        return Number(actualValue) >= Number(value);
      case '<=':
        return Number(actualValue) <= Number(value);
      case '>':
        return Number(actualValue) > Number(value);
      case '<':
        return Number(actualValue) < Number(value);
      case '=':
        return actualValue === value;
      default:
        return false;
    }
  },

  /**
   * Calculate achievement progress
   */
  calculateAchievementProgress(
    requirement: AchievementRequirement,
    context: { gameStats: any; studySessions: any[]; userId: string }
  ): AchievementProgress {
    // For simplicity, we'll calculate progress for the first condition
    // In a real implementation, you'd handle composite requirements
    const condition = requirement.conditions[0];
    if (!condition) {
      return { current: 0, target: 1, description: 'No conditions defined' };
    }

    const { metric, value } = condition;
    const { gameStats, studySessions } = context;

    let current: number;
    let target = Number(value);
    let description = '';

    switch (metric) {
      case 'total_study_time':
        current = this.calculateTotalStudyTime(studySessions, condition.timeframe);
        description = `Study for ${target} minutes total`;
        break;
      case 'streak_days':
        current = gameStats.streak_days || 0;
        description = `Maintain a ${target}-day study streak`;
        break;
      case 'level':
        current = gameStats.level || 1;
        description = `Reach level ${target}`;
        break;
      case 'study_sessions':
        current = this.getStudySessionCount(studySessions, condition.timeframe);
        description = `Complete ${target} study sessions`;
        break;
      default:
        current = 0;
        description = 'Progress tracking not available';
    }

    return {
      current: Math.min(current, target),
      target,
      description
    };
  },

  // Helper methods for calculating metrics
  calculateTotalStudyTime(sessions: any[], timeframe: string = 'all_time'): number {
    const filteredSessions = this.filterSessionsByTimeframe(sessions, timeframe);
    return filteredSessions.reduce((total, session) => total + (session.duration || 0), 0);
  },

  getStudySessionCount(sessions: any[], timeframe: string = 'all_time'): number {
    return this.filterSessionsByTimeframe(sessions, timeframe).length;
  },

  calculateConsecutiveStudyDays(sessions: any[]): number {
    if (sessions.length === 0) return 0;

    const studyDates = [...new Set(
      sessions.map(session => new Date(session.started_at).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let consecutive = 1;
    const today = new Date().toDateString();

    if (studyDates[0] !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      if (studyDates[0] !== yesterday) return 0;
    }

    for (let i = 1; i < studyDates.length; i++) {
      const current = new Date(studyDates[i - 1]);
      const previous = new Date(studyDates[i]);
      const dayDiff = Math.floor((current.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000));

      if (dayDiff === 1) {
        consecutive++;
      } else {
        break;
      }
    }

    return consecutive;
  },

  getEarlyMorningSessions(sessions: any[], timeframe: string = 'all_time'): number {
    const filteredSessions = this.filterSessionsByTimeframe(sessions, timeframe);
    return filteredSessions.filter(session => {
      const hour = new Date(session.started_at).getHours();
      return hour >= 5 && hour < 7; // 5 AM to 7 AM
    }).length;
  },

  getLateNightSessions(sessions: any[], timeframe: string = 'all_time'): number {
    const filteredSessions = this.filterSessionsByTimeframe(sessions, timeframe);
    return filteredSessions.filter(session => {
      const hour = new Date(session.started_at).getHours();
      return hour >= 22 || hour < 2; // 10 PM to 2 AM
    }).length;
  },

  getWeekendSessions(sessions: any[], timeframe: string = 'all_time'): number {
    const filteredSessions = this.filterSessionsByTimeframe(sessions, timeframe);
    return filteredSessions.filter(session => {
      const day = new Date(session.started_at).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length;
  },

  filterSessionsByTimeframe(sessions: any[], timeframe: string): any[] {
    if (timeframe === 'all_time') return sessions;

    const now = new Date();
    let cutoffDate: Date;

    switch (timeframe) {
      case 'daily':
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return sessions;
    }

    return sessions.filter(session => new Date(session.started_at) >= cutoffDate);
  },

  async getQuestsCompleted(userId: string, timeframe: string = 'all_time'): Promise<number> {
    try {
      let query = supabase
        .from('quests')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .not('completed_at', 'is', null);

      if (timeframe !== 'all_time') {
        const cutoffDate = this.getTimeframeCutoff(timeframe);
        query = query.gte('completed_at', cutoffDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error getting completed quests:', error);
      return 0;
    }
  },

  getTimeframeCutoff(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(0);
    }
  },

  async getUserGameStats(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching game stats:', error);
      return null;
    }
  },

  async getUserStudySessions(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      return [];
    }
  },

  mapDatabaseToDefinition(dbItem: any): AchievementDefinition {
    return {
      id: dbItem.id,
      title: dbItem.name,
      description: dbItem.description,
      category: dbItem.category,
      rarity: dbItem.rarity,
      xpReward: dbItem.xp_reward,
      iconUrl: dbItem.icon_url,
      requirements: dbItem.requirements || { type: 'study_time', conditions: [] },
      isHidden: dbItem.is_hidden,
      isSeasonalEvent: dbItem.is_seasonal_event,
      eventEndDate: dbItem.event_end_date ? new Date(dbItem.event_end_date) : undefined
    };
  },

  getDefaultAchievements(): AchievementDefinition[] {
    return Object.values(ACHIEVEMENT_DEFINITIONS).map(def => ({
      id: def.id,
      title: def.title,
      description: def.description,
      category: def.category as AchievementCategory,
      rarity: def.rarity as 'common' | 'rare' | 'epic' | 'legendary',
      xpReward: def.xpReward,
      iconUrl: `/achievements/${def.id}.png`,
      requirements: {
        type: 'study_time',
        conditions: [
          {
            metric: Object.keys(def.requirements)[0],
            operator: '>=',
            value: Object.values(def.requirements)[0] as number
          }
        ]
      }
    }));
  }
};

export default achievementService;