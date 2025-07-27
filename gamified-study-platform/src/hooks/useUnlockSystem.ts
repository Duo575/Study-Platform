/**
 * Unlock System Hook
 *
 * This hook provides integration with the unlock system for environments,
 * themes, and other content based on study achievements and milestones.
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGamificationStore } from '../store/gamificationStore';
import {
  unlockManager,
  type UnlockableContent,
  type UnlockProgress,
  type UnlockResult,
} from '../services/unlockManager';

export interface UnlockSystemState {
  availableContent: UnlockableContent[];
  environmentProgress: UnlockProgress[];
  themeProgress: UnlockProgress[];
  accessoryProgress: UnlockProgress[];
  recentUnlocks: UnlockResult[];
  isLoading: boolean;
  error: string | null;
}

export interface UnlockSystemActions {
  refreshProgress: () => Promise<void>;
  unlockContent: (contentId: string) => Promise<UnlockResult>;
  checkForAutoUnlocks: () => Promise<UnlockResult[]>;
  getUnlockProgress: (contentId: string) => Promise<UnlockProgress | null>;
  dismissUnlock: (contentId: string) => void;
  getContentByType: (type: UnlockableContent['type']) => UnlockableContent[];
}

export function useUnlockSystem(): UnlockSystemState & UnlockSystemActions {
  const { user } = useAuth();
  const { gameStats } = useGamificationStore();

  const [state, setState] = useState<UnlockSystemState>({
    availableContent: [],
    environmentProgress: [],
    themeProgress: [],
    accessoryProgress: [],
    recentUnlocks: [],
    isLoading: false,
    error: null,
  });

  // Initialize and load content
  useEffect(() => {
    if (user?.id) {
      loadUnlockableContent();
      refreshProgress();
    }
  }, [user?.id]);

  // Check for auto-unlocks when game stats change
  useEffect(() => {
    if (user?.id && gameStats) {
      checkForAutoUnlocks();
    }
  }, [user?.id, gameStats?.level, gameStats?.streakDays, gameStats?.totalXP]);

  /**
   * Load all unlockable content
   */
  const loadUnlockableContent = useCallback(() => {
    try {
      const content = unlockManager.getAllUnlockableContent();
      setState(prev => ({
        ...prev,
        availableContent: content,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to load content',
      }));
    }
  }, []);

  /**
   * Refresh unlock progress for all content types
   */
  const refreshProgress = useCallback(async () => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [environmentProgress, themeProgress, accessoryProgress] =
        await Promise.all([
          unlockManager.getUnlockProgressByType(user.id, 'environment'),
          unlockManager.getUnlockProgressByType(user.id, 'theme'),
          unlockManager.getUnlockProgressByType(user.id, 'pet_accessory'),
        ]);

      setState(prev => ({
        ...prev,
        environmentProgress,
        themeProgress,
        accessoryProgress,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to refresh progress',
        isLoading: false,
      }));
    }
  }, [user?.id]);

  /**
   * Unlock specific content
   */
  const unlockContent = useCallback(
    async (contentId: string): Promise<UnlockResult> => {
      if (!user?.id) {
        return {
          success: false,
          content: {} as UnlockableContent,
          celebrationLevel: 'small',
          message: 'User not authenticated',
          error: 'User not authenticated',
        };
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await unlockManager.unlockContent(user.id, contentId);

        if (result.success) {
          // Add to recent unlocks
          setState(prev => ({
            ...prev,
            recentUnlocks: [result, ...prev.recentUnlocks.slice(0, 4)], // Keep last 5
          }));

          // Refresh progress
          await refreshProgress();
        }

        setState(prev => ({ ...prev, isLoading: false }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to unlock content';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));

        return {
          success: false,
          content: {} as UnlockableContent,
          celebrationLevel: 'small',
          message: errorMessage,
          error: errorMessage,
        };
      }
    },
    [user?.id, refreshProgress]
  );

  /**
   * Check for automatic unlocks
   */
  const checkForAutoUnlocks = useCallback(async (): Promise<UnlockResult[]> => {
    if (!user?.id) return [];

    try {
      const autoUnlocks = await unlockManager.checkForAutoUnlocks(user.id);

      if (autoUnlocks.length > 0) {
        setState(prev => ({
          ...prev,
          recentUnlocks: [...autoUnlocks, ...prev.recentUnlocks].slice(0, 5),
        }));

        // Refresh progress after auto-unlocks
        await refreshProgress();
      }

      return autoUnlocks;
    } catch (error) {
      console.error('Error checking for auto-unlocks:', error);
      return [];
    }
  }, [user?.id, refreshProgress]);

  /**
   * Get unlock progress for specific content
   */
  const getUnlockProgress = useCallback(
    async (contentId: string): Promise<UnlockProgress | null> => {
      if (!user?.id) return null;

      try {
        return await unlockManager.getUnlockProgress(user.id, contentId);
      } catch (error) {
        console.error('Error getting unlock progress:', error);
        return null;
      }
    },
    [user?.id]
  );

  /**
   * Dismiss a recent unlock notification
   */
  const dismissUnlock = useCallback((contentId: string) => {
    setState(prev => ({
      ...prev,
      recentUnlocks: prev.recentUnlocks.filter(
        unlock => unlock.content.id !== contentId
      ),
    }));
  }, []);

  /**
   * Get content by type
   */
  const getContentByType = useCallback(
    (type: UnlockableContent['type']): UnlockableContent[] => {
      return state.availableContent.filter(content => content.type === type);
    },
    [state.availableContent]
  );

  return {
    ...state,
    refreshProgress,
    unlockContent,
    checkForAutoUnlocks,
    getUnlockProgress,
    dismissUnlock,
    getContentByType,
  };
}

// Hook for tracking specific content type progress
export function useContentUnlockProgress(type: UnlockableContent['type']) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UnlockProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const loadProgress = async () => {
        setIsLoading(true);
        try {
          const progressData = await unlockManager.getUnlockProgressByType(
            user.id,
            type
          );
          setProgress(progressData);
        } catch (error) {
          console.error(`Error loading ${type} progress:`, error);
        } finally {
          setIsLoading(false);
        }
      };

      loadProgress();
    }
  }, [user?.id, type]);

  return { progress, isLoading };
}

// Hook for environment unlocks specifically
export function useEnvironmentUnlocks() {
  const unlockSystem = useUnlockSystem();

  const environments = unlockSystem.getContentByType('environment');
  const progress = unlockSystem.environmentProgress;

  const unlockedEnvironments = progress.filter(p => p.canUnlock);
  const lockedEnvironments = progress.filter(p => !p.canUnlock);

  return {
    environments,
    progress,
    unlockedEnvironments,
    lockedEnvironments,
    unlockEnvironment: unlockSystem.unlockContent,
    refreshProgress: unlockSystem.refreshProgress,
    isLoading: unlockSystem.isLoading,
  };
}

// Hook for theme unlocks specifically
export function useThemeUnlocks() {
  const unlockSystem = useUnlockSystem();

  const themes = unlockSystem.getContentByType('theme');
  const progress = unlockSystem.themeProgress;

  const unlockedThemes = progress.filter(p => p.canUnlock);
  const lockedThemes = progress.filter(p => !p.canUnlock);

  return {
    themes,
    progress,
    unlockedThemes,
    lockedThemes,
    unlockTheme: unlockSystem.unlockContent,
    refreshProgress: unlockSystem.refreshProgress,
    isLoading: unlockSystem.isLoading,
  };
}

// Hook for pet accessory unlocks specifically
export function usePetAccessoryUnlocks() {
  const unlockSystem = useUnlockSystem();

  const accessories = unlockSystem.getContentByType('pet_accessory');
  const progress = unlockSystem.accessoryProgress;

  const unlockedAccessories = progress.filter(p => p.canUnlock);
  const lockedAccessories = progress.filter(p => !p.canUnlock);

  return {
    accessories,
    progress,
    unlockedAccessories,
    lockedAccessories,
    unlockAccessory: unlockSystem.unlockContent,
    refreshProgress: unlockSystem.refreshProgress,
    isLoading: unlockSystem.isLoading,
  };
}
