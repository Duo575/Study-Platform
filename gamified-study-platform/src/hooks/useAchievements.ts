import { useState, useEffect, useCallback } from 'react';
import { achievementService } from '../services/achievementService';
import type { 
  Achievement, 
  AchievementDefinition, 
  AchievementUnlock, 
  AchievementProgress,
  AchievementCategory,
  Badge,
  SeasonalEvent
} from '../types';

/**
 * Hook for managing user achievements
 */
export function useAchievements(userId: string | null) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [definitions, setDefinitions] = useState<AchievementDefinition[]>([]);
  const [recentUnlocks, setRecentUnlocks] = useState<AchievementUnlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user achievements
   */
  const loadAchievements = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [userAchievements, achievementDefinitions] = await Promise.all([
        achievementService.getUserAchievements(userId),
        achievementService.getAchievementDefinitions()
      ]);

      setAchievements(userAchievements);
      setDefinitions(achievementDefinitions);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Check for new achievements
   */
  const checkForNewAchievements = useCallback(async () => {
    if (!userId) return [];

    try {
      const newUnlocks = await achievementService.checkAndAwardAchievements(userId);
      
      if (newUnlocks.length > 0) {
        setRecentUnlocks(prev => [...newUnlocks, ...prev].slice(0, 10)); // Keep last 10
        
        // Refresh achievements to include new ones
        await loadAchievements();
      }

      return newUnlocks;
    } catch (err) {
      console.error('Error checking achievements:', err);
      return [];
    }
  }, [userId, loadAchievements]);

  /**
   * Get achievement progress
   */
  const getAchievementProgress = useCallback(async (achievementId: string): Promise<AchievementProgress | null> => {
    if (!userId) return null;

    try {
      return await achievementService.getAchievementProgress(userId, achievementId);
    } catch (err) {
      console.error('Error getting achievement progress:', err);
      return null;
    }
  }, [userId]);

  /**
   * Get achievements by category
   */
  const getAchievementsByCategory = useCallback((category: AchievementCategory) => {
    const categoryDefinitions = definitions.filter(def => def.category === category);
    const unlockedIds = new Set(achievements.map(a => a.id));
    
    return categoryDefinitions.map(def => {
      const unlocked = achievements.find(a => a.id === def.id);
      return {
        definition: def,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt,
        progress: unlocked?.progress
      };
    });
  }, [achievements, definitions]);

  /**
   * Get unlocked achievements
   */
  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(a => a.unlockedAt);
  }, [achievements]);

  /**
   * Get locked achievements (not yet unlocked)
   */
  const getLockedAchievements = useCallback(() => {
    const unlockedIds = new Set(achievements.map(a => a.id));
    return definitions.filter(def => !unlockedIds.has(def.id) && !def.isHidden);
  }, [achievements, definitions]);

  /**
   * Get achievements by rarity
   */
  const getAchievementsByRarity = useCallback((rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    return achievements.filter(a => {
      const definition = definitions.find(def => def.id === a.id);
      return definition?.rarity === rarity;
    });
  }, [achievements, definitions]);

  /**
   * Calculate completion percentage
   */
  const getCompletionPercentage = useCallback(() => {
    if (definitions.length === 0) return 0;
    const visibleDefinitions = definitions.filter(def => !def.isHidden);
    return Math.round((achievements.length / visibleDefinitions.length) * 100);
  }, [achievements.length, definitions]);

  /**
   * Get recent achievements (last 7 days)
   */
  const getRecentAchievements = useCallback(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return achievements.filter(a => a.unlockedAt && a.unlockedAt > sevenDaysAgo);
  }, [achievements]);

  /**
   * Clear recent unlocks notification
   */
  const clearRecentUnlocks = useCallback(() => {
    setRecentUnlocks([]);
  }, []);

  /**
   * Dismiss a specific unlock notification
   */
  const dismissUnlock = useCallback((unlockId: string) => {
    setRecentUnlocks(prev => prev.filter(unlock => unlock.achievement.id !== unlockId));
  }, []);

  // Load achievements on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadAchievements();
    }
  }, [userId, loadAchievements]);

  return {
    // Data
    achievements,
    definitions,
    recentUnlocks,
    isLoading,
    error,

    // Actions
    loadAchievements,
    checkForNewAchievements,
    getAchievementProgress,
    clearRecentUnlocks,
    dismissUnlock,

    // Computed values
    getAchievementsByCategory,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsByRarity,
    getRecentAchievements,
    getCompletionPercentage,

    // Stats
    totalAchievements: definitions.filter(def => !def.isHidden).length,
    unlockedCount: achievements.length,
    completionPercentage: getCompletionPercentage(),
    recentUnlocksCount: recentUnlocks.length,
    
    // Rarity counts
    commonCount: getAchievementsByRarity('common').length,
    rareCount: getAchievementsByRarity('rare').length,
    epicCount: getAchievementsByRarity('epic').length,
    legendaryCount: getAchievementsByRarity('legendary').length
  };
}

/**
 * Hook for managing badges
 */
export function useBadges(userId: string | null) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user badges
   */
  const loadBadges = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const userBadges = await achievementService.getUserBadges(userId);
      setBadges(userBadges);
    } catch (err) {
      console.error('Error loading badges:', err);
      setError(err instanceof Error ? err.message : 'Failed to load badges');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Get badges by category
   */
  const getBadgesByCategory = useCallback((category: string) => {
    return badges.filter(badge => badge.category === category);
  }, [badges]);

  /**
   * Get badges by rarity
   */
  const getBadgesByRarity = useCallback((rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    return badges.filter(badge => badge.rarity === rarity);
  }, [badges]);

  /**
   * Get limited edition badges
   */
  const getLimitedEditionBadges = useCallback(() => {
    return badges.filter(badge => badge.isLimitedEdition);
  }, [badges]);

  // Load badges on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadBadges();
    }
  }, [userId, loadBadges]);

  return {
    // Data
    badges,
    isLoading,
    error,

    // Actions
    loadBadges,

    // Computed values
    getBadgesByCategory,
    getBadgesByRarity,
    getLimitedEditionBadges,

    // Stats
    totalBadges: badges.length,
    limitedEditionCount: getLimitedEditionBadges().length
  };
}

/**
 * Hook for managing seasonal events
 */
export function useSeasonalEvents() {
  const [events, setEvents] = useState<SeasonalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load seasonal events
   */
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const seasonalEvents = await achievementService.getSeasonalEvents();
      setEvents(seasonalEvents);
    } catch (err) {
      console.error('Error loading seasonal events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load seasonal events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get active events
   */
  const getActiveEvents = useCallback(() => {
    const now = new Date();
    return events.filter(event => event.startDate <= now && event.endDate >= now);
  }, [events]);

  /**
   * Get upcoming events
   */
  const getUpcomingEvents = useCallback(() => {
    const now = new Date();
    return events.filter(event => event.startDate > now);
  }, [events]);

  /**
   * Check if an event is active
   */
  const isEventActive = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return false;

    const now = new Date();
    return event.startDate <= now && event.endDate >= now;
  }, [events]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    // Data
    events,
    isLoading,
    error,

    // Actions
    loadEvents,

    // Computed values
    getActiveEvents,
    getUpcomingEvents,
    isEventActive,

    // Stats
    totalEvents: events.length,
    activeEventsCount: getActiveEvents().length,
    upcomingEventsCount: getUpcomingEvents().length
  };
}

/**
 * Hook for achievement notifications
 */
export function useAchievementNotifications() {
  const [notifications, setNotifications] = useState<AchievementUnlock[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Show achievement unlock notification
   */
  const showUnlockNotification = useCallback((unlock: AchievementUnlock) => {
    setNotifications(prev => [unlock, ...prev]);
    setIsVisible(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.achievement.id !== unlock.achievement.id));
      }, 300); // Wait for animation to complete
    }, 5000);
  }, []);

  /**
   * Dismiss notification
   */
  const dismissNotification = useCallback((achievementId: string) => {
    setNotifications(prev => prev.filter(n => n.achievement.id !== achievementId));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  }, [notifications.length]);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setIsVisible(false);
  }, []);

  return {
    notifications,
    isVisible,
    showUnlockNotification,
    dismissNotification,
    clearAllNotifications,
    hasNotifications: notifications.length > 0
  };
}

export default useAchievements;