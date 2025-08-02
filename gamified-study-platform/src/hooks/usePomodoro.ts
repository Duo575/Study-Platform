import { useEffect, useRef } from 'react';
import { usePomodoroStore } from '../store/pomodoroStore';
import { useAuthContext } from '../contexts/AuthContext';

export const usePomodoro = () => {
  const { user } = useAuthContext();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    timer,
    sessions,
    analytics,
    breakActivities,
    isLoading,
    error,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipSession,
    updateSettings,
    loadSessions,
    loadAnalytics,
    tick,
    reset,
  } = usePomodoroStore();

  // Start timer interval when timer becomes active
  useEffect(() => {
    if (timer.isActive && !timer.isPaused) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isActive, timer.isPaused, tick, user?.id]);

  // Load initial data when user is available
  useEffect(() => {
    if (user?.id) {
      loadSessions(user.id);
      loadAnalytics(user.id);
    }
  }, [user?.id, loadSessions, loadAnalytics]);

  // Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const getProgress = (): number => {
    const totalTime =
      timer.sessionType === 'work'
        ? timer.settings.workDuration * 60
        : timer.sessionType === 'short_break'
          ? timer.settings.shortBreakDuration * 60
          : timer.settings.longBreakDuration * 60;

    return ((totalTime - timer.timeRemaining) / totalTime) * 100;
  };

  // Get current session info
  const getCurrentSessionInfo = () => {
    const sessionTypeLabels = {
      work: 'Focus Time',
      short_break: 'Short Break',
      long_break: 'Long Break',
    };

    return {
      label: sessionTypeLabels[timer.sessionType],
      sessionNumber: timer.sessionNumber,
      cycleProgress: `${timer.sessionNumber}/${timer.settings.sessionsUntilLongBreak}`,
      isWorkSession: timer.sessionType === 'work',
      isBreakSession: timer.sessionType !== 'work',
    };
  };

  // Get today's stats
  const getTodayStats = () => {
    if (!analytics) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayStats = analytics.dailyStats.find(stat => stat.date === today);

    return (
      todayStats || {
        date: today,
        sessionsCompleted: 0,
        focusTime: 0,
        completionRate: 0,
        xpEarned: 0,
      }
    );
  };

  // Get this week's stats
  const getWeekStats = () => {
    if (!analytics) return null;

    const thisWeek = analytics.weeklyStats[analytics.weeklyStats.length - 1];
    return (
      thisWeek || {
        weekStart: new Date().toISOString().split('T')[0],
        sessionsCompleted: 0,
        focusTime: 0,
        averageCompletionRate: 0,
        xpEarned: 0,
      }
    );
  };

  // Start timer with context
  const startTimerWithContext = async (context?: {
    courseId?: string;
    todoItemId?: string;
    questId?: string;
  }) => {
    if (!user?.id) return;

    await startTimer(
      user.id,
      context?.courseId,
      context?.todoItemId,
      context?.questId
    );
  };

  // Complete current session
  const completeSession = async () => {
    if (!user?.id) return;
    await stopTimer(user.id, true);
  };

  // Skip current session
  const skipCurrentSession = async () => {
    if (!user?.id) return;
    await skipSession(user.id);
  };

  return {
    // Timer state
    timer,
    isActive: timer.isActive,
    isPaused: timer.isPaused,
    timeRemaining: timer.timeRemaining,
    formattedTime: formatTime(timer.timeRemaining),
    progress: getProgress(),
    sessionInfo: getCurrentSessionInfo(),

    // Session data
    sessions,
    analytics,
    breakActivities,
    todayStats: getTodayStats(),
    weekStats: getWeekStats(),

    // UI state
    isLoading,
    error,

    // Actions
    startTimer: startTimerWithContext,
    pauseTimer,
    resumeTimer,
    completeSession,
    skipSession: skipCurrentSession,
    updateSettings,
    reset,

    // Data refresh
    refreshData: () => {
      if (user?.id) {
        loadSessions(user.id);
        loadAnalytics(user.id);
      }
    },
  };
};
