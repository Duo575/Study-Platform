import { useState, useEffect, useCallback } from 'react';
import { usePomodoroStore } from '../store/pomodoroStore';

interface StudyBreakState {
  isBreakTime: boolean;
  breakType: 'short_break' | 'long_break' | null;
  breakDuration: number;
  showBreakManager: boolean;
  canAccessGames: boolean;
}

interface StudyBreakSettings {
  enableGamesDuringBreaks: boolean;
  maxGameTimePercentage: number; // 0-100, percentage of break time allowed for games
  allowedGameCategories: string[];
  autoStartBreaks: boolean;
}

export const useStudyBreaks = (userId: string) => {
  const { timer } = usePomodoroStore();
  const [breakState, setBreakState] = useState<StudyBreakState>({
    isBreakTime: false,
    breakType: null,
    breakDuration: 0,
    showBreakManager: false,
    canAccessGames: true,
  });

  const [breakSettings, setBreakSettings] = useState<StudyBreakSettings>({
    enableGamesDuringBreaks: true,
    maxGameTimePercentage: 70,
    allowedGameCategories: ['breathing', 'memory', 'reflex'],
    autoStartBreaks: false,
  });

  // Track break session data
  const [breakSession, setBreakSession] = useState<{
    startTime: Date | null;
    gameTimeUsed: number;
    totalBreakTime: number;
  }>({
    startTime: null,
    gameTimeUsed: 0,
    totalBreakTime: 0,
  });

  // Monitor Pomodoro timer state changes
  useEffect(() => {
    const isCurrentlyBreakTime =
      timer.sessionType === 'short_break' || timer.sessionType === 'long_break';

    if (isCurrentlyBreakTime && !breakState.isBreakTime) {
      // Break just started
      const duration =
        timer.sessionType === 'short_break'
          ? timer.settings.shortBreakDuration
          : timer.settings.longBreakDuration;

      setBreakState({
        isBreakTime: true,
        breakType: timer.sessionType,
        breakDuration: duration,
        showBreakManager: breakSettings.autoStartBreaks,
        canAccessGames: breakSettings.enableGamesDuringBreaks,
      });

      setBreakSession({
        startTime: new Date(),
        gameTimeUsed: 0,
        totalBreakTime: 0,
      });
    } else if (!isCurrentlyBreakTime && breakState.isBreakTime) {
      // Break just ended
      setBreakState({
        isBreakTime: false,
        breakType: null,
        breakDuration: 0,
        showBreakManager: false,
        canAccessGames: true,
      });

      // Log break session data
      logBreakSession();
    }
  }, [
    timer.sessionType,
    timer.settings,
    breakState.isBreakTime,
    breakSettings,
  ]);

  const startBreakManager = useCallback(() => {
    if (breakState.isBreakTime) {
      setBreakState(prev => ({ ...prev, showBreakManager: true }));
    }
  }, [breakState.isBreakTime]);

  const endBreakManager = useCallback(() => {
    setBreakState(prev => ({ ...prev, showBreakManager: false }));
  }, []);

  const updateBreakSettings = useCallback(
    (newSettings: Partial<StudyBreakSettings>) => {
      setBreakSettings(prev => ({ ...prev, ...newSettings }));

      // Save to localStorage or user preferences
      localStorage.setItem(
        'studyBreakSettings',
        JSON.stringify({ ...breakSettings, ...newSettings })
      );
    },
    [breakSettings]
  );

  const trackGameTime = useCallback((timeSpent: number) => {
    setBreakSession(prev => ({
      ...prev,
      gameTimeUsed: prev.gameTimeUsed + timeSpent,
    }));
  }, []);

  const getGameTimeRemaining = useCallback(() => {
    if (!breakState.isBreakTime || !breakSettings.enableGamesDuringBreaks) {
      return 0;
    }

    const maxGameTime =
      (breakState.breakDuration * 60 * breakSettings.maxGameTimePercentage) /
      100;
    return Math.max(0, maxGameTime - breakSession.gameTimeUsed);
  }, [breakState, breakSettings, breakSession.gameTimeUsed]);

  const canPlayGames = useCallback(() => {
    return (
      breakState.isBreakTime &&
      breakSettings.enableGamesDuringBreaks &&
      getGameTimeRemaining() > 0
    );
  }, [
    breakState.isBreakTime,
    breakSettings.enableGamesDuringBreaks,
    getGameTimeRemaining,
  ]);

  const logBreakSession = useCallback(() => {
    if (!breakSession.startTime) return;

    const sessionData = {
      userId,
      breakType: breakState.breakType,
      duration: breakState.breakDuration,
      gameTimeUsed: breakSession.gameTimeUsed,
      totalTime: Math.floor(
        (Date.now() - breakSession.startTime.getTime()) / 1000
      ),
      timestamp: new Date(),
    };

    // Store break session data (could be sent to analytics service)
    const existingSessions = JSON.parse(
      localStorage.getItem('breakSessions') || '[]'
    );
    existingSessions.push(sessionData);

    // Keep only last 100 sessions
    if (existingSessions.length > 100) {
      existingSessions.splice(0, existingSessions.length - 100);
    }

    localStorage.setItem('breakSessions', JSON.stringify(existingSessions));
  }, [userId, breakState, breakSession]);

  const getBreakStats = useCallback(() => {
    const sessions = JSON.parse(localStorage.getItem('breakSessions') || '[]');
    const userSessions = sessions.filter((s: any) => s.userId === userId);

    if (userSessions.length === 0) {
      return {
        totalBreaks: 0,
        totalGameTime: 0,
        averageGameTime: 0,
        favoriteBreakActivity: 'rest',
        gameTimePercentage: 0,
      };
    }

    const totalBreaks = userSessions.length;
    const totalGameTime = userSessions.reduce(
      (sum: number, s: any) => sum + s.gameTimeUsed,
      0
    );
    const totalBreakTime = userSessions.reduce(
      (sum: number, s: any) => sum + s.totalTime,
      0
    );
    const averageGameTime = totalGameTime / totalBreaks;
    const gameTimePercentage =
      totalBreakTime > 0 ? (totalGameTime / totalBreakTime) * 100 : 0;

    return {
      totalBreaks,
      totalGameTime,
      averageGameTime,
      favoriteBreakActivity: gameTimePercentage > 30 ? 'games' : 'rest',
      gameTimePercentage,
    };
  }, [userId]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('studyBreakSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setBreakSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load break settings:', error);
      }
    }
  }, []);

  return {
    // State
    breakState,
    breakSettings,
    breakSession,

    // Actions
    startBreakManager,
    endBreakManager,
    updateBreakSettings,
    trackGameTime,

    // Computed values
    gameTimeRemaining: getGameTimeRemaining(),
    canPlayGames: canPlayGames(),
    breakStats: getBreakStats(),

    // Utilities
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
  };
};
