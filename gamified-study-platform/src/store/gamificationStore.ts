import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GameStats, Achievement } from '../types';
import {
  calculateStudySessionXP,
  calculateQuestXP,
  calculateTodoXP,
  calculateStreakBonus,
  updateGameStats,
  calculateStudyStreak,
  isStreakActive,
} from '../utils/gamification';

interface GamificationState {
  // Current user's game stats
  gameStats: GameStats | null;

  // Level up state
  isLevelUpModalOpen: boolean;
  levelUpData: {
    oldLevel: number;
    newLevel: number;
    xpGained: number;
    newAchievements: Achievement[];
  } | null;

  // XP animation state
  xpAnimationQueue: Array<{
    id: string;
    amount: number;
    source: string;
    timestamp: number;
  }>;

  // Streak state
  streakData: {
    currentStreak: number;
    isActive: boolean;
    lastStudyDate: Date | null;
    streakBonusEarned: boolean;
  };

  // Additional properties for pet evolution
  totalStudyTime: number;
  streakDays: number;
  level: number;
  questsCompleted: number;
  coins: number;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface GamificationActions {
  // Initialize game stats
  initializeGameStats: (stats: GameStats) => void;

  // XP and leveling actions
  awardXP: (amount: number, source: string) => Promise<void>;
  awardStudySessionXP: (
    durationMinutes: number,
    difficulty?: 'easy' | 'medium' | 'hard',
    hasBonus?: boolean
  ) => Promise<void>;
  awardQuestXP: (
    questType: 'daily' | 'weekly' | 'milestone' | 'bonus',
    difficulty?: 'easy' | 'medium' | 'hard'
  ) => Promise<void>;
  awardTodoXP: (
    estimatedMinutes: number,
    completedEarly?: boolean,
    completedOnTime?: boolean
  ) => Promise<void>;

  // Level up modal actions
  openLevelUpModal: (data: GamificationState['levelUpData']) => void;
  closeLevelUpModal: () => void;

  // XP animation actions
  addXPAnimation: (amount: number, source: string) => void;
  removeXPAnimation: (id: string) => void;
  clearXPAnimations: () => void;

  // Streak actions
  updateStreak: (studyDate?: Date) => void;
  checkStreakStatus: () => boolean;

  // Coin actions
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: GamificationState = {
  gameStats: null,
  isLevelUpModalOpen: false,
  levelUpData: null,
  xpAnimationQueue: [],
  streakData: {
    currentStreak: 0,
    isActive: false,
    lastStudyDate: null,
    streakBonusEarned: false,
  },
  totalStudyTime: 0,
  streakDays: 0,
  level: 1,
  questsCompleted: 0,
  coins: 100,
  isLoading: false,
  error: null,
};

export const useGamificationStore = create<
  GamificationState & GamificationActions
>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        initializeGameStats: (stats: GameStats) => {
          set({
            gameStats: stats,
            streakData: {
              currentStreak: stats.streakDays,
              isActive: isStreakActive(stats.lastActivity),
              lastStudyDate: stats.lastActivity,
              streakBonusEarned: false,
            },
          });
        },

        awardXP: async (amount: number, source: string) => {
          const { gameStats } = get();
          if (!gameStats) return;

          try {
            set({ isLoading: true, error: null });

            // Update game stats
            const {
              stats: newStats,
              leveledUp,
              newLevel,
            } = updateGameStats(gameStats, amount);

            // Add XP animation
            const animationId = `xp-${Date.now()}-${Math.random()}`;
            get().addXPAnimation(amount, source);

            // Update state
            set({ gameStats: newStats });

            // Handle level up
            if (leveledUp && newLevel) {
              get().openLevelUpModal({
                oldLevel: gameStats.level,
                newLevel,
                xpGained: amount,
                newAchievements: [], // TODO: Check for new achievements
              });
            }

            // TODO: Sync with backend
            // await syncGameStatsWithBackend(newStats);
          } catch (error) {
            console.error('Error awarding XP:', error);
            set({ error: 'Failed to award XP' });
          } finally {
            set({ isLoading: false });
          }
        },

        awardStudySessionXP: async (
          durationMinutes: number,
          difficulty = 'medium' as const,
          hasBonus = false
        ) => {
          const xp = calculateStudySessionXP(
            durationMinutes,
            difficulty,
            hasBonus
          );
          await get().awardXP(xp, `Study Session (${durationMinutes}min)`);

          // Trigger pet mood update for study session
          try {
            const { studyPetIntegrationService } = await import(
              '../services/studyPetIntegrationService'
            );
            // This would be called with proper user context in a real implementation
            // For now, we'll skip the direct integration here to avoid circular dependencies
          } catch (error) {
            console.error(
              'Error integrating study session with pet system:',
              error
            );
          }
        },

        awardQuestXP: async (
          questType: 'daily' | 'weekly' | 'milestone' | 'bonus',
          difficulty = 'medium' as const
        ) => {
          const xp = calculateQuestXP(questType, difficulty);
          await get().awardXP(
            xp,
            `${questType.charAt(0).toUpperCase() + questType.slice(1)} Quest`
          );

          // Integrate quest completion with pet system
          try {
            const { studyPetIntegrationService } = await import(
              '../services/studyPetIntegrationService'
            );
            // This would be called with proper user context in a real implementation
            // For now, we'll skip the direct integration here to avoid circular dependencies
          } catch (error) {
            console.error(
              'Error integrating quest completion with pet system:',
              error
            );
          }
        },

        awardTodoXP: async (
          estimatedMinutes: number,
          completedEarly = false,
          completedOnTime = true
        ) => {
          const xp = calculateTodoXP(
            estimatedMinutes,
            completedEarly,
            completedOnTime
          );
          const source = completedEarly
            ? 'Todo (Early)'
            : completedOnTime
              ? 'Todo (On Time)'
              : 'Todo (Late)';
          await get().awardXP(xp, source);
        },

        openLevelUpModal: (data: GamificationState['levelUpData']) => {
          set({ isLevelUpModalOpen: true, levelUpData: data });
        },

        closeLevelUpModal: () => {
          set({ isLevelUpModalOpen: false, levelUpData: null });
        },

        addXPAnimation: (amount: number, source: string) => {
          const animation = {
            id: `xp-${Date.now()}-${Math.random()}`,
            amount,
            source,
            timestamp: Date.now(),
          };

          set(state => ({
            xpAnimationQueue: [...state.xpAnimationQueue, animation],
          }));

          // Auto-remove animation after 3 seconds
          setTimeout(() => {
            get().removeXPAnimation(animation.id);
          }, 3000);
        },

        removeXPAnimation: (id: string) => {
          set(state => ({
            xpAnimationQueue: state.xpAnimationQueue.filter(
              anim => anim.id !== id
            ),
          }));
        },

        clearXPAnimations: () => {
          set({ xpAnimationQueue: [] });
        },

        updateStreak: (studyDate = new Date()) => {
          const { gameStats, streakData } = get();
          if (!gameStats) return;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const studyDateNormalized = new Date(studyDate);
          studyDateNormalized.setHours(0, 0, 0, 0);

          const lastStudyDate = streakData.lastStudyDate
            ? new Date(streakData.lastStudyDate)
            : null;
          if (lastStudyDate) {
            lastStudyDate.setHours(0, 0, 0, 0);
          }

          let newStreak = streakData.currentStreak;
          let streakBonusEarned = false;

          // Check if this is a new day of studying
          if (
            !lastStudyDate ||
            studyDateNormalized.getTime() !== lastStudyDate.getTime()
          ) {
            if (lastStudyDate) {
              const daysDiff = Math.floor(
                (studyDateNormalized.getTime() - lastStudyDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              if (daysDiff === 1) {
                // Consecutive day - increment streak
                newStreak += 1;
                const bonusXP = calculateStreakBonus(newStreak);
                if (bonusXP > 0) {
                  get().awardXP(bonusXP, `${newStreak}-Day Streak Bonus`);
                  streakBonusEarned = true;
                }
              } else if (daysDiff > 1) {
                // Streak broken - reset to 1
                newStreak = 1;
              }
            } else {
              // First study session
              newStreak = 1;
            }

            // Update game stats
            const updatedStats = {
              ...gameStats,
              streakDays: newStreak,
              lastActivity: studyDate,
            };

            set({
              gameStats: updatedStats,
              streakData: {
                currentStreak: newStreak,
                isActive: true,
                lastStudyDate: studyDate,
                streakBonusEarned,
              },
            });
          }
        },

        checkStreakStatus: () => {
          const { streakData } = get();
          if (!streakData.lastStudyDate) return false;

          return isStreakActive(streakData.lastStudyDate);
        },

        spendCoins: (amount: number) => {
          const { coins } = get();
          if (coins >= amount) {
            set({ coins: coins - amount });
            return true;
          }
          return false;
        },

        addCoins: (amount: number) => {
          const { coins } = get();
          set({ coins: coins + amount });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'gamification-store',
        partialize: state => ({
          gameStats: state.gameStats,
          streakData: state.streakData,
        }),
      }
    ),
    { name: 'GamificationStore' }
  )
);
