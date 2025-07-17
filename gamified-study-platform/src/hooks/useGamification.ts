import { useCallback, useEffect } from 'react';
import { useGamificationStore } from '../store/gamificationStore';
import { gamificationService } from '../services/gamificationService';
import { useAuth } from './useAuth';
import type { QuestType, QuestDifficulty } from '../types';

/**
 * Hook for accessing gamification functionality throughout the application
 */
export const useGamification = () => {
  const { user } = useAuth();
  const {
    gameStats,
    streakData,
    isLevelUpModalOpen,
    levelUpData,
    xpAnimationQueue,
    isLoading,
    error,
    
    // Actions
    initializeGameStats,
    awardXP,
    awardStudySessionXP,
    awardQuestXP,
    awardTodoXP,
    openLevelUpModal,
    closeLevelUpModal,
    addXPAnimation,
    removeXPAnimation,
    clearXPAnimations,
    updateStreak,
    checkStreakStatus,
    setLoading,
    setError,
    reset,
  } = useGamificationStore();
  
  /**
   * Load user's game stats from the database
   */
  const loadGameStats = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const stats = await gamificationService.fetchGameStats(user.id);
      if (stats) {
        // Also fetch achievements
        const achievements = await gamificationService.fetchAchievements(user.id);
        
        // Initialize store with fetched data
        initializeGameStats({
          ...stats,
          achievements,
        });
      } else {
        // If no stats exist, initialize them
        await gamificationService.initializeGameStats(user.id);
        const newStats = await gamificationService.fetchGameStats(user.id);
        if (newStats) {
          initializeGameStats({
            ...newStats,
            achievements: [],
          });
        }
      }
    } catch (err) {
      console.error('Error loading game stats:', err);
      setError('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  }, [user, initializeGameStats, setLoading, setError]);
  
  /**
   * Award XP to the user with backend synchronization
   */
  const awardXPWithSync = useCallback(async (amount: number, source: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First update local state for immediate feedback
      await awardXP(amount, source);
      
      // Then sync with backend
      const result = await gamificationService.awardXP(user.id, amount, source);
      
      if (result && result.levelUp) {
        // Check for new achievements
        const newAchievements = await gamificationService.checkAchievements(user.id);
        
        // Show level up modal
        openLevelUpModal({
          oldLevel: result.oldLevel,
          newLevel: result.newLevel,
          xpGained: amount,
          newAchievements: [], // TODO: Map the achievements properly
        });
      }
      
      // Refresh game stats to ensure consistency
      await loadGameStats();
      
    } catch (err) {
      console.error('Error awarding XP with sync:', err);
      setError('Failed to award XP');
    } finally {
      setLoading(false);
    }
  }, [user, awardXP, openLevelUpModal, loadGameStats, setLoading, setError]);
  
  /**
   * Update user's streak with backend synchronization
   */
  const updateStreakWithSync = useCallback(async () => {
    if (!user) return;
    
    try {
      // First update local state
      updateStreak();
      
      // Then sync with backend
      const result = await gamificationService.updateStreak(user.id);
      
      if (result && result.bonusAwarded) {
        // Show XP animation for streak bonus
        addXPAnimation(result.bonusXP, `${result.streakDays}-Day Streak Bonus`);
      }
      
      // Refresh game stats
      await loadGameStats();
      
    } catch (err) {
      console.error('Error updating streak with sync:', err);
    }
  }, [user, updateStreak, addXPAnimation, loadGameStats]);
  
  // Load game stats when user changes
  useEffect(() => {
    if (user) {
      loadGameStats();
    } else {
      reset();
    }
  }, [user, loadGameStats, reset]);
  
  return {
    // State
    gameStats,
    streakData,
    isLevelUpModalOpen,
    levelUpData,
    xpAnimationQueue,
    isLoading,
    error,
    
    // Actions
    awardXP: awardXPWithSync,
    awardStudySessionXP,
    awardQuestXP,
    awardTodoXP,
    closeLevelUpModal,
    updateStreak: updateStreakWithSync,
    checkStreakStatus,
    
    // Utility
    loadGameStats,
  };
};

export default useGamification;