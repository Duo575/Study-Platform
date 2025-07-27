import { create } from 'zustand';
import {
  PomodoroTimer,
  PomodoroSession,
  PomodoroSettings,
  PomodoroAnalytics,
  BreakActivity,
} from '../types';
import { PomodoroService } from '../services/pomodoroService';
import { calculateStudySessionXP } from '../utils/gamification';
import { useGamificationStore } from './gamificationStore';
import { studySessionTracker } from '../services/studySessionTracker';
import { studyPetIntegrationService } from '../services/studyPetIntegrationService';

interface PomodoroState {
  // Timer state
  timer: PomodoroTimer;

  // Session data
  sessions: PomodoroSession[];
  analytics: PomodoroAnalytics | null;
  breakActivities: BreakActivity[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  startTimer: (
    userId: string,
    courseId?: string,
    todoItemId?: string,
    questId?: string
  ) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (userId: string, completed?: boolean) => Promise<void>;
  skipSession: (userId: string) => Promise<void>;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;

  // Data actions
  loadSessions: (userId: string) => Promise<void>;
  loadAnalytics: (userId: string) => Promise<void>;

  // Timer tick (called every second)
  tick: () => void;

  // Reset state
  reset: () => void;
}

const getInitialTimer = (): PomodoroTimer => ({
  isActive: false,
  isPaused: false,
  currentSession: null,
  timeRemaining: 25 * 60, // 25 minutes in seconds
  sessionType: 'work',
  sessionNumber: 1,
  cycleId: crypto.randomUUID(),
  settings: PomodoroService.getDefaultSettings(),
});

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  // Initial state
  timer: getInitialTimer(),
  sessions: [],
  analytics: null,
  breakActivities: PomodoroService.getBreakActivities(),
  isLoading: false,
  error: null,

  // Start a new timer session
  startTimer: async (
    userId: string,
    courseId?: string,
    todoItemId?: string,
    questId?: string
  ) => {
    const { timer } = get();

    if (timer.isActive) return;

    try {
      set({ isLoading: true, error: null });

      // Create new session
      const session = await PomodoroService.createSession(userId, {
        type: timer.sessionType,
        duration:
          timer.sessionType === 'work'
            ? timer.settings.workDuration
            : timer.sessionType === 'short_break'
              ? timer.settings.shortBreakDuration
              : timer.settings.longBreakDuration,
        sessionNumber: timer.sessionNumber,
        cycleId: timer.cycleId,
        courseId,
        todoItemId,
        questId,
      });

      const timeRemaining =
        timer.sessionType === 'work'
          ? timer.settings.workDuration * 60
          : timer.sessionType === 'short_break'
            ? timer.settings.shortBreakDuration * 60
            : timer.settings.longBreakDuration * 60;

      set({
        timer: {
          ...timer,
          isActive: true,
          isPaused: false,
          currentSession: session,
          timeRemaining,
        },
        isLoading: false,
      });

      // Start the timer interval
      get().startTimerInterval();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start timer',
        isLoading: false,
      });
    }
  },

  // Pause the timer
  pauseTimer: () => {
    const { timer } = get();
    if (!timer.isActive || timer.isPaused) return;

    set({
      timer: { ...timer, isPaused: true },
    });

    get().clearTimerInterval();
  },

  // Resume the timer
  resumeTimer: () => {
    const { timer } = get();
    if (!timer.isActive || !timer.isPaused) return;

    set({
      timer: { ...timer, isPaused: false },
    });

    get().startTimerInterval();
  },

  // Stop the timer
  stopTimer: async (userId: string, completed = false) => {
    const { timer } = get();
    if (!timer.isActive || !timer.currentSession) return;

    try {
      set({ isLoading: true });

      // Calculate XP for completed work sessions and integrate with pet system
      let xpEarned = 0;
      if (completed && timer.sessionType === 'work') {
        const sessionDuration = timer.settings.workDuration;
        xpEarned = calculateStudySessionXP(sessionDuration, 'medium', true);

        // Award XP through gamification system
        const gamificationStore = useGamificationStore.getState();
        await gamificationStore.awardXP(userId, xpEarned, 'pomodoro_session', {
          sessionType: timer.sessionType,
          duration: sessionDuration,
          courseId: timer.currentSession.courseId,
          todoItemId: timer.currentSession.todoItemId,
        });

        // Integrate with pet system for pomodoro completion
        try {
          await studyPetIntegrationService.handleStudySessionComplete(
            userId,
            sessionDuration,
            'good', // Pomodoro sessions are considered good quality by default
            timer.currentSession.courseId
          );
        } catch (error) {
          console.error(
            'Error integrating pomodoro session with pet system:',
            error
          );
        }
      }

      // Complete the session with XP
      await PomodoroService.completeSession(
        timer.currentSession.id,
        completed,
        xpEarned
      );

      // Move to next session type
      const nextState = get().getNextSessionState(completed);

      set({
        timer: {
          ...timer,
          isActive: false,
          isPaused: false,
          currentSession: null,
          ...nextState,
        },
        isLoading: false,
      });

      get().clearTimerInterval();

      // Reload sessions and analytics
      await get().loadSessions(userId);
      await get().loadAnalytics(userId);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to stop timer',
        isLoading: false,
      });
    }
  },

  // Skip current session
  skipSession: async (userId: string) => {
    await get().stopTimer(userId, false);
  },

  // Update timer settings
  updateSettings: (newSettings: Partial<PomodoroSettings>) => {
    const { timer } = get();
    const settings = { ...timer.settings, ...newSettings };

    set({
      timer: { ...timer, settings },
    });
  },

  // Load user sessions
  loadSessions: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const sessions = await PomodoroService.getUserSessions(userId);
      set({ sessions, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load sessions',
        isLoading: false,
      });
    }
  },

  // Load analytics
  loadAnalytics: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const analytics = await PomodoroService.getAnalytics(userId);
      set({ analytics, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load analytics',
        isLoading: false,
      });
    }
  },

  // Timer tick function
  tick: (userId?: string) => {
    const { timer } = get();
    if (!timer.isActive || timer.isPaused || timer.timeRemaining <= 0) return;

    const newTimeRemaining = timer.timeRemaining - 1;

    if (newTimeRemaining <= 0) {
      // Session completed - need userId to complete
      if (userId) {
        get().stopTimer(userId, true);
      }

      // Play sound if enabled
      if (timer.settings.soundEnabled) {
        get().playNotificationSound();
      }
    } else {
      set({
        timer: { ...timer, timeRemaining: newTimeRemaining },
      });
    }
  },

  // Reset all state
  reset: () => {
    get().clearTimerInterval();
    set({
      timer: getInitialTimer(),
      sessions: [],
      analytics: null,
      isLoading: false,
      error: null,
    });
  },

  // Helper methods (these would be added to the store)
  startTimerInterval: () => {
    // This would be implemented with setInterval
    // For now, we'll assume it's handled by the component
  },

  clearTimerInterval: () => {
    // This would clear the interval
    // For now, we'll assume it's handled by the component
  },

  getNextSessionState: (completed: boolean) => {
    const { timer } = get();

    if (!completed) {
      // If not completed, stay on same session type
      return {
        sessionType: timer.sessionType,
        sessionNumber: timer.sessionNumber,
        timeRemaining:
          timer.sessionType === 'work'
            ? timer.settings.workDuration * 60
            : timer.sessionType === 'short_break'
              ? timer.settings.shortBreakDuration * 60
              : timer.settings.longBreakDuration * 60,
      };
    }

    // Determine next session type
    if (timer.sessionType === 'work') {
      const isLongBreak =
        timer.sessionNumber % timer.settings.sessionsUntilLongBreak === 0;
      const nextType = isLongBreak ? 'long_break' : 'short_break';
      const nextDuration = isLongBreak
        ? timer.settings.longBreakDuration
        : timer.settings.shortBreakDuration;

      return {
        sessionType: nextType,
        sessionNumber: timer.sessionNumber,
        timeRemaining: nextDuration * 60,
      };
    } else {
      // After break, go to work
      const nextSessionNumber =
        timer.sessionType === 'long_break' ? 1 : timer.sessionNumber + 1;

      return {
        sessionType: 'work' as const,
        sessionNumber: nextSessionNumber,
        timeRemaining: timer.settings.workDuration * 60,
        cycleId:
          timer.sessionType === 'long_break'
            ? crypto.randomUUID()
            : timer.cycleId,
      };
    }
  },

  playNotificationSound: () => {
    // Simple notification sound
    try {
      const audio = new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/Eeyw'
      );
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    } catch (error) {
      // Ignore audio errors
    }
  },
}));
