/**
 * Study Pet Integration Hook
 *
 * This hook provides integration between study sessions and pet growth,
 * implementing the reward system that connects study habits to pet development.
 */

import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePetStore } from '../store/petStore';
import { useGamificationStore } from '../store/gamificationStore';
import {
  studySessionTracker,
  type StudySessionData,
  type PetGrowthImpact,
} from '../services/studySessionTracker';
import {
  petMoodManager,
  type MoodChangeResult,
} from '../services/petMoodManager';

export interface StudyPetIntegrationState {
  isTracking: boolean;
  activeSession: StudySessionData | null;
  lastGrowthImpact: PetGrowthImpact | null;
  lastMoodChange: MoodChangeResult | null;
  streakData: {
    currentStreak: number;
    isActive: boolean;
    lastStudyDate: Date | null;
  } | null;
}

export interface StudyPetIntegrationActions {
  startStudySession: (
    courseId?: string,
    todoItemId?: string,
    questId?: string
  ) => Promise<string>; // Returns session ID
  endStudySession: (
    sessionId: string,
    quality?: 'poor' | 'average' | 'good' | 'excellent',
    notes?: string
  ) => Promise<PetGrowthImpact | null>;
  pauseStudySession: (sessionId: string) => void;
  resumeStudySession: (sessionId: string) => void;
  cancelStudySession: (sessionId: string) => void;
  updateSessionQuality: (
    sessionId: string,
    quality: 'poor' | 'average' | 'good' | 'excellent'
  ) => void;
  getPetMoodSummary: () => ReturnType<typeof petMoodManager.getPetMoodSummary>;
  celebrateMilestone: (
    type: 'streak' | 'total_hours' | 'sessions_completed' | 'level_up',
    value: number
  ) => Promise<MoodChangeResult | null>;
}

export function useStudyPetIntegration(): StudyPetIntegrationState &
  StudyPetIntegrationActions {
  const { user } = useAuth();
  const { pet } = usePetStore();
  const { gameStats } = useGamificationStore();

  const [state, setState] = useState<StudyPetIntegrationState>({
    isTracking: false,
    activeSession: null,
    lastGrowthImpact: null,
    lastMoodChange: null,
    streakData: null,
  });

  // Initialize mood monitoring when component mounts
  useEffect(() => {
    if (user?.id && pet) {
      petMoodManager.startMoodMonitoring(user.id);

      // Load initial streak data
      const streakData = studySessionTracker.getStreakData(user.id);
      setState(prev => ({ ...prev, streakData }));

      return () => {
        petMoodManager.stopMoodMonitoring();
      };
    }
  }, [user?.id, pet]);

  // Update active session state
  useEffect(() => {
    if (user?.id) {
      const activeSession = studySessionTracker.getActiveSession(user.id);
      const isTracking = studySessionTracker.hasActiveSession(user.id);

      setState(prev => ({
        ...prev,
        isTracking,
        activeSession,
      }));
    }
  }, [user?.id]);

  // Start a new study session
  const startStudySession = useCallback(
    async (
      courseId?: string,
      todoItemId?: string,
      questId?: string
    ): Promise<string> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await studySessionTracker.startStudySession({
        userId: user.id,
        sessionId,
        courseId,
        todoItemId,
        questId,
        startTime: new Date(),
        type: 'free_study', // Default type, can be overridden
      });

      // Update state
      const activeSession = studySessionTracker.getActiveSession(user.id);
      setState(prev => ({
        ...prev,
        isTracking: true,
        activeSession,
      }));

      return sessionId;
    },
    [user?.id]
  );

  // End a study session
  const endStudySession = useCallback(
    async (
      sessionId: string,
      quality: 'poor' | 'average' | 'good' | 'excellent' = 'average',
      notes?: string
    ): Promise<PetGrowthImpact | null> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // End the session and get pet growth impact
      const growthImpact = await studySessionTracker.endStudySession(
        user.id,
        sessionId,
        quality,
        notes
      );

      // Get updated streak data
      const streakData = studySessionTracker.getStreakData(user.id);
      const isStreakContinued =
        streakData?.isActive && streakData.currentStreak > 0;

      // Handle mood response to session completion
      let moodChange: MoodChangeResult | null = null;
      if (growthImpact) {
        const activeSession = studySessionTracker.getActiveSession(user.id);
        const sessionDuration = activeSession?.duration || 0;

        moodChange = await petMoodManager.handleStudySessionMoodResponse(
          user.id,
          sessionDuration,
          quality,
          isStreakContinued || false
        );
      }

      // Update state
      setState(prev => ({
        ...prev,
        isTracking: false,
        activeSession: null,
        lastGrowthImpact: growthImpact,
        lastMoodChange: moodChange,
        streakData,
      }));

      return growthImpact;
    },
    [user?.id]
  );

  // Pause study session (for breaks)
  const pauseStudySession = useCallback((sessionId: string) => {
    // This would be implemented to pause the session timer
    // For now, we'll just log it
    console.log(`Pausing study session: ${sessionId}`);
  }, []);

  // Resume study session
  const resumeStudySession = useCallback((sessionId: string) => {
    // This would be implemented to resume the session timer
    // For now, we'll just log it
    console.log(`Resuming study session: ${sessionId}`);
  }, []);

  // Cancel study session
  const cancelStudySession = useCallback(
    async (sessionId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // End session with poor quality to indicate cancellation
      await endStudySession(sessionId, 'poor', 'Session cancelled');
    },
    [user?.id, endStudySession]
  );

  // Update session quality during the session
  const updateSessionQuality = useCallback(
    (sessionId: string, quality: 'poor' | 'average' | 'good' | 'excellent') => {
      // This would update the session quality in real-time
      // For now, we'll just log it
      console.log(`Updating session ${sessionId} quality to: ${quality}`);
    },
    []
  );

  // Get pet mood summary
  const getPetMoodSummary = useCallback(() => {
    if (!user?.id) {
      return null;
    }
    return petMoodManager.getPetMoodSummary(user.id);
  }, [user?.id]);

  // Celebrate milestone achievements
  const celebrateMilestone = useCallback(
    async (
      type: 'streak' | 'total_hours' | 'sessions_completed' | 'level_up',
      value: number
    ): Promise<MoodChangeResult | null> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const moodChange = await petMoodManager.handleMilestoneMoodResponse(
        user.id,
        type,
        value
      );

      setState(prev => ({
        ...prev,
        lastMoodChange: moodChange,
      }));

      return moodChange;
    },
    [user?.id]
  );

  return {
    ...state,
    startStudySession,
    endStudySession,
    pauseStudySession,
    resumeStudySession,
    cancelStudySession,
    updateSessionQuality,
    getPetMoodSummary,
    celebrateMilestone,
  };
}

// Additional hook for monitoring pet evolution progress based on study habits
export function usePetEvolutionProgress() {
  const { user } = useAuth();
  const { pet } = usePetStore();
  const { gameStats } = useGamificationStore();

  const [evolutionProgress, setEvolutionProgress] = useState({
    currentProgress: 0,
    streakBonus: 0,
    totalProgress: 0,
    nextEvolutionRequirements: [] as string[],
  });

  useEffect(() => {
    if (user?.id && pet && gameStats) {
      const calculateEvolutionProgress = async () => {
        // Calculate base evolution progress from pet stats
        const baseProgress = pet.evolution?.progress || 0;

        // Calculate streak bonus
        const streakBonus =
          await studySessionTracker.calculateStreakEvolutionBonus(user.id);

        // Calculate total progress
        const totalProgress = Math.min(100, baseProgress + streakBonus);

        // Determine next evolution requirements
        const requirements: string[] = [];
        if (pet.level < 5) {
          requirements.push(`Reach level ${Math.max(5, pet.level + 1)}`);
        }
        if (pet.happiness < 80) {
          requirements.push('Maintain high happiness (80+)');
        }
        if (gameStats.streakDays < 7) {
          requirements.push('Build a 7-day study streak');
        }

        setEvolutionProgress({
          currentProgress: baseProgress,
          streakBonus,
          totalProgress,
          nextEvolutionRequirements: requirements,
        });
      };

      calculateEvolutionProgress();
    }
  }, [user?.id, pet, gameStats]);

  return evolutionProgress;
}

// Hook for tracking study session statistics
export function useStudySessionStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    sessionsToday: 0,
    totalStudyTimeToday: 0,
    averageSessionLength: 0,
    longestSession: 0,
    qualityDistribution: {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
    },
  });

  useEffect(() => {
    if (user?.id) {
      // This would fetch actual session statistics from a service
      // For now, we'll use mock data
      setStats({
        sessionsToday: 0,
        totalStudyTimeToday: 0,
        averageSessionLength: 0,
        longestSession: 0,
        qualityDistribution: {
          excellent: 0,
          good: 0,
          average: 0,
          poor: 0,
        },
      });
    }
  }, [user?.id]);

  return stats;
}
