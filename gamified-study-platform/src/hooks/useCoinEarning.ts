/**
 * Coin Earning Hook
 *
 * This hook provides integration with the coin earning system,
 * allowing components to award coins and track earning progress.
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStoreStore } from '../store/storeStore';
import {
  coinEarningSystem,
  type CoinEarningResult,
  type EarningLimits,
} from '../services/coinEarningSystem';

export interface CoinEarningState {
  todayEarnings: number;
  weeklyEarnings: number;
  dailyLimit: number;
  weeklyLimit: number;
  recentEarnings: CoinEarningResult[];
  earningStats: {
    todayTotal: number;
    weekTotal: number;
    averagePerSession: number;
    topSource: string;
    streakBonus: number;
    petCareBonus: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface CoinEarningActions {
  awardStudySessionCoins: (
    durationMinutes: number,
    quality?: 'poor' | 'average' | 'good' | 'excellent',
    courseId?: string
  ) => Promise<CoinEarningResult>;
  awardQuestCompletionCoins: (
    questType: 'daily' | 'weekly' | 'milestone' | 'bonus',
    difficulty?: 'easy' | 'medium' | 'hard'
  ) => Promise<CoinEarningResult>;
  awardStreakBonusCoins: (streakDays: number) => Promise<CoinEarningResult>;
  awardPetCareCoins: (
    careType: 'feed' | 'play' | 'evolve' | 'accessory_equip',
    petHappinessIncrease?: number
  ) => Promise<CoinEarningResult>;
  awardEnvironmentUsageCoins: (
    environmentId: string,
    usageDurationMinutes: number
  ) => Promise<CoinEarningResult>;
  awardDailyBonusCoins: () => Promise<CoinEarningResult>;
  awardMiniGameCoins: (
    gameId: string,
    score: number,
    difficulty?: 'easy' | 'medium' | 'hard'
  ) => Promise<CoinEarningResult>;
  refreshEarningData: () => void;
  createBonusOpportunity: (
    type:
      | 'double_coins'
      | 'bonus_multiplier'
      | 'streak_protection'
      | 'pet_happiness_boost',
    multiplier: number,
    durationMinutes: number
  ) => void;
}

export function useCoinEarning(): CoinEarningState & CoinEarningActions {
  const { user } = useAuth();
  const { coins } = useStoreStore();

  const [state, setState] = useState<CoinEarningState>({
    todayEarnings: 0,
    weeklyEarnings: 0,
    dailyLimit: 500,
    weeklyLimit: 2500,
    recentEarnings: [],
    earningStats: {
      todayTotal: 0,
      weekTotal: 0,
      averagePerSession: 0,
      topSource: 'None',
      streakBonus: 0,
      petCareBonus: 0,
    },
    isLoading: false,
    error: null,
  });

  // Load earning data when user changes
  useEffect(() => {
    if (user?.id) {
      refreshEarningData();
    }
  }, [user?.id]);

  // Refresh earning data
  const refreshEarningData = useCallback(() => {
    if (!user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const recentEarnings = coinEarningSystem.getEarningHistory(user.id, 20);
      const earningStats = coinEarningSystem.getEarningStats(user.id);

      // Calculate current limits (this would typically come from the service)
      const today = new Date();
      const todayEarnings = recentEarnings
        .filter(e => {
          const earningDate = new Date(e.timestamp);
          return earningDate.toDateString() === today.toDateString();
        })
        .reduce((sum, e) => sum + e.totalCoins, 0);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weeklyEarnings = recentEarnings
        .filter(e => new Date(e.timestamp) >= weekStart)
        .reduce((sum, e) => sum + e.totalCoins, 0);

      setState(prev => ({
        ...prev,
        todayEarnings,
        weeklyEarnings,
        recentEarnings,
        earningStats,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load earning data',
        isLoading: false,
      }));
    }
  }, [user?.id]);

  // Award study session coins
  const awardStudySessionCoins = useCallback(
    async (
      durationMinutes: number,
      quality: 'poor' | 'average' | 'good' | 'excellent' = 'average',
      courseId?: string
    ): Promise<CoinEarningResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const result = await coinEarningSystem.awardStudySessionCoins(
          user.id,
          durationMinutes,
          quality,
          courseId
        );

        // Refresh data after awarding coins
        refreshEarningData();

        setState(prev => ({ ...prev, isLoading: false }));
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to award study session coins',
          isLoading: false,
        }));
        throw error;
      }
    },
    [user?.id, refreshEarningData]
  );

  // Award quest completion coins
  const awardQuestCompletionCoins = useCallback(
    async (
      questType: 'daily' | 'weekly' | 'milestone' | 'bonus',
      difficulty: 'easy' | 'medium' | 'hard' = 'medium'
    ): Promise<CoinEarningResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const result = await coinEarningSystem.awardQuestCompletionCoins(
          user.id,
          questType,
          difficulty
        );

        refreshEarningData();
        setState(prev => ({ ...prev, isLoading: false }));
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to award quest coins',
          isLoading: false,
        }));
        throw error;
      }
    },
    [user?.id, refreshEarningData]
  );

  // Award streak bonus coins
  const awardStreakBonusCoins = useCallback(
    async (streakDays: number): Promise<CoinEarningResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await coinEarningSystem.awardStreakBonusCoins(
          user.id,
          streakDays
        );
        refreshEarningData();
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to award streak bonus',
        }));
        throw error;
      }
    },
    [user?.id, refreshEarningData]
  );

  // Award pet care coins
  const awardPetCareCoins = useCallback(
    async (
      careType: 'feed' | 'play' | 'evolve' | 'accessory_equip',
      petHappinessIncrease: number = 0
    ): Promise<CoinEarningResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await coinEarningSystem.awardPetCareCoins(
          user.id,
          careType,
          petHappinessIncrease
        );
        refreshEarningData();
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to award pet care coins',
        }));
        throw error;
      }
    },
    [user?.id, refreshEarningData]
  );

  // Award environment usage coins
  const awardEnvironmentUsageCoins = useCallback(
    async (
      environmentId: string,
      usageDurationMinutes: number
    ): Promise<CoinEarningResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await coinEarningSystem.awardEnvironmentUsageCoins(
          user.id,
          environmentId,
          usageDurationMinutes
        );
        refreshEarningData();
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to award environment coins',
        }));
        throw error;
      }
    },
    [user?.id, refreshEarningData]
  );

  // Award daily bonus coins
  const awardDailyBonusCoins =
    useCallback(async (): Promise<CoinEarningResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await coinEarningSystem.awardDailyBonusCoins(user.id);
        refreshEarningData();
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to award daily bonus',
        }));
        throw error;
      }
    }, [user?.id, refreshEarningData]);

  // Award mini-game coins
  const awardMiniGameCoins = useCallback(
    async (
      gameId: string,
      score: number,
      difficulty: 'easy' | 'medium' | 'hard' = 'medium'
    ): Promise<CoinEarningResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await coinEarningSystem.awardMiniGameCoins(
          user.id,
          gameId,
          score,
          difficulty
        );
        refreshEarningData();
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to award mini-game coins',
        }));
        throw error;
      }
    },
    [user?.id, refreshEarningData]
  );

  // Create bonus opportunity
  const createBonusOpportunity = useCallback(
    (
      type:
        | 'double_coins'
        | 'bonus_multiplier'
        | 'streak_protection'
        | 'pet_happiness_boost',
      multiplier: number,
      durationMinutes: number
    ) => {
      if (!user?.id) return;

      coinEarningSystem.createBonusOpportunity(
        user.id,
        type,
        multiplier,
        durationMinutes
      );
      refreshEarningData();
    },
    [user?.id, refreshEarningData]
  );

  return {
    ...state,
    awardStudySessionCoins,
    awardQuestCompletionCoins,
    awardStreakBonusCoins,
    awardPetCareCoins,
    awardEnvironmentUsageCoins,
    awardDailyBonusCoins,
    awardMiniGameCoins,
    refreshEarningData,
    createBonusOpportunity,
  };
}

// Hook for tracking earning progress
export function useEarningProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({
    dailyProgress: 0,
    weeklyProgress: 0,
    canEarnMore: true,
    nextResetTime: new Date(),
  });

  useEffect(() => {
    if (user?.id) {
      const stats = coinEarningSystem.getEarningStats(user.id);
      const dailyLimit = 500;
      const weeklyLimit = 2500;

      setProgress({
        dailyProgress: Math.min(100, (stats.todayTotal / dailyLimit) * 100),
        weeklyProgress: Math.min(100, (stats.weekTotal / weeklyLimit) * 100),
        canEarnMore:
          stats.todayTotal < dailyLimit && stats.weekTotal < weeklyLimit,
        nextResetTime: new Date(new Date().setHours(24, 0, 0, 0)), // Next midnight
      });
    }
  }, [user?.id]);

  return progress;
}

// Hook for earning notifications
export function useEarningNotifications() {
  const [notifications, setNotifications] = useState<
    {
      id: string;
      message: string;
      amount: number;
      type: 'success' | 'warning' | 'info';
      timestamp: Date;
    }[]
  >([]);

  const addNotification = useCallback(
    (
      message: string,
      amount: number,
      type: 'success' | 'warning' | 'info' = 'success'
    ) => {
      const notification = {
        id: `earning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message,
        amount,
        type,
        timestamp: new Date(),
      };

      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
  };
}
