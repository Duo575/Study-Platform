import { miniGameService } from './miniGameService';
import { PomodoroService } from './pomodoroService';
import type {
  MiniGame,
  GameSession,
  GameResult,
  BreakActivity,
} from '../types';

export interface StudyBreakSession {
  id: string;
  userId: string;
  breakType: 'short' | 'long';
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  activityType: 'mini-game' | 'traditional' | 'rest';
  gameId?: string;
  gameSessionId?: string;
  gameResult?: GameResult;
  breakActivityId?: string;
  completed: boolean;
  xpEarned: number;
  coinsEarned: number;
  pomodoroSessionId?: string;
}

export interface BreakTimeTracker {
  dailyGameTime: number; // in minutes
  weeklyGameTime: number; // in minutes
  consecutiveBreaks: number;
  lastBreakTime: Date;
  maxDailyGameTime: number;
  maxConsecutiveBreaks: number;
}

export class StudyBreakManager {
  private breakSessions: StudyBreakSession[] = [];
  private timeTrackers: Record<string, BreakTimeTracker> = {};

  constructor() {
    this.initializeTimeTrackers();
  }

  private initializeTimeTrackers(): void {
    // Initialize with default limits
    const defaultTracker: BreakTimeTracker = {
      dailyGameTime: 0,
      weeklyGameTime: 0,
      consecutiveBreaks: 0,
      lastBreakTime: new Date(0),
      maxDailyGameTime: 30, // 30 minutes per day
      maxConsecutiveBreaks: 3, // Max 3 consecutive game breaks
    };

    // In a real app, this would load from user preferences/database
    this.timeTrackers['default'] = { ...defaultTracker };
  }

  /**
   * Start a study break session
   */
  async startBreak(
    userId: string,
    breakType: 'short' | 'long',
    duration: number,
    pomodoroSessionId?: string
  ): Promise<StudyBreakSession> {
    const session: StudyBreakSession = {
      id: `break-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      breakType,
      startTime: new Date(),
      duration,
      activityType: 'rest', // Default to rest
      completed: false,
      xpEarned: 0,
      coinsEarned: 0,
      pomodoroSessionId,
    };

    this.breakSessions.push(session);
    return session;
  }

  /**
   * Get available break activities including mini-games
   */
  getAvailableBreakActivities(
    userId: string,
    breakType: 'short' | 'long',
    duration: number
  ): {
    miniGames: MiniGame[];
    traditionalActivities: BreakActivity[];
    canPlayGames: boolean;
    gameTimeRemaining: number;
  } {
    const tracker = this.getTimeTracker(userId);
    const canPlayGames = this.canPlayGames(userId, breakType);
    const gameTimeRemaining = Math.max(
      0,
      tracker.maxDailyGameTime - tracker.dailyGameTime
    );

    // Get suitable mini-games based on break duration
    const allGames = miniGameService.getAvailableGames();
    const suitableGames = allGames.filter(game => {
      const maxDuration = breakType === 'short' ? duration - 1 : duration - 2; // Leave buffer time
      return game.estimatedDuration <= maxDuration;
    });

    // Get recommended games for relaxation
    const relaxationGames = suitableGames.filter(
      game =>
        game.category === 'breathing' ||
        game.category === 'memory' ||
        (game.category === 'puzzle' && game.difficulty === 'easy')
    );

    const traditionalActivities = PomodoroService.getBreakActivities().filter(
      activity => activity.duration <= duration
    );

    return {
      miniGames: canPlayGames ? relaxationGames : [],
      traditionalActivities,
      canPlayGames,
      gameTimeRemaining,
    };
  }

  /**
   * Start a mini-game during break
   */
  async startBreakGame(
    breakSessionId: string,
    gameId: string
  ): Promise<{ breakSession: StudyBreakSession; gameSession: GameSession }> {
    const breakSession = this.breakSessions.find(s => s.id === breakSessionId);
    if (!breakSession) {
      throw new Error('Break session not found');
    }

    if (breakSession.completed) {
      throw new Error('Break session already completed');
    }

    const userId = breakSession.userId;
    if (!this.canPlayGames(userId, breakSession.breakType)) {
      throw new Error('Game time limit exceeded for today');
    }

    // Start the mini-game
    const gameSession = await miniGameService.startGame(gameId);

    // Update break session
    breakSession.activityType = 'mini-game';
    breakSession.gameId = gameId;
    breakSession.gameSessionId = gameSession.id;

    return { breakSession, gameSession };
  }

  /**
   * Complete a break session with game results
   */
  async completeBreakWithGame(
    breakSessionId: string,
    gameScore: number
  ): Promise<StudyBreakSession> {
    const breakSession = this.breakSessions.find(s => s.id === breakSessionId);
    if (!breakSession || !breakSession.gameSessionId) {
      throw new Error('Break session or game session not found');
    }

    // End the mini-game
    const gameResult = await miniGameService.endGame(
      breakSession.gameSessionId,
      gameScore
    );

    // Calculate break rewards
    const breakXP = this.calculateBreakXP(breakSession.breakType, true);
    const totalXP = breakXP + gameResult.coinsEarned * 0.1; // Small XP bonus from coins

    // Update break session
    breakSession.endTime = new Date();
    breakSession.completed = true;
    breakSession.gameResult = gameResult;
    breakSession.xpEarned = Math.floor(totalXP);
    breakSession.coinsEarned = gameResult.coinsEarned;

    // Update time tracking
    this.updateTimeTracker(breakSession.userId, breakSession, gameResult);

    return breakSession;
  }

  /**
   * Complete a break session with traditional activity
   */
  async completeBreakWithActivity(
    breakSessionId: string,
    activityId: string
  ): Promise<StudyBreakSession> {
    const breakSession = this.breakSessions.find(s => s.id === breakSessionId);
    if (!breakSession) {
      throw new Error('Break session not found');
    }

    const activities = PomodoroService.getBreakActivities();
    const activity = activities.find(a => a.id === activityId);

    if (!activity) {
      throw new Error('Activity not found');
    }

    // Update break session
    breakSession.endTime = new Date();
    breakSession.completed = true;
    breakSession.activityType = 'traditional';
    breakSession.breakActivityId = activityId;
    breakSession.xpEarned =
      this.calculateBreakXP(breakSession.breakType, false) +
      (activity.xpBonus || 0);
    breakSession.coinsEarned = Math.floor((activity.xpBonus || 0) * 2); // Small coin reward

    // Update time tracking (reset consecutive game breaks)
    const tracker = this.getTimeTracker(breakSession.userId);
    tracker.consecutiveBreaks = 0;
    tracker.lastBreakTime = new Date();

    return breakSession;
  }

  /**
   * Complete a break session with just rest
   */
  async completeBreakWithRest(
    breakSessionId: string
  ): Promise<StudyBreakSession> {
    const breakSession = this.breakSessions.find(s => s.id === breakSessionId);
    if (!breakSession) {
      throw new Error('Break session not found');
    }

    // Update break session
    breakSession.endTime = new Date();
    breakSession.completed = true;
    breakSession.activityType = 'rest';
    breakSession.xpEarned = this.calculateBreakXP(
      breakSession.breakType,
      false
    );
    breakSession.coinsEarned = 1; // Minimal reward for rest

    // Update time tracking (reset consecutive game breaks)
    const tracker = this.getTimeTracker(breakSession.userId);
    tracker.consecutiveBreaks = 0;
    tracker.lastBreakTime = new Date();

    return breakSession;
  }

  /**
   * Check if user can play games during break
   */
  canPlayGames(userId: string, breakType: 'short' | 'long'): boolean {
    const tracker = this.getTimeTracker(userId);

    // Check daily game time limit
    if (tracker.dailyGameTime >= tracker.maxDailyGameTime) {
      return false;
    }

    // Check consecutive break limit (prevent excessive gaming)
    if (tracker.consecutiveBreaks >= tracker.maxConsecutiveBreaks) {
      return false;
    }

    // For short breaks, be more restrictive
    if (breakType === 'short' && tracker.consecutiveBreaks >= 2) {
      return false;
    }

    return true;
  }

  /**
   * Get break time statistics for user
   */
  getBreakStats(userId: string): {
    dailyGameTime: number;
    weeklyGameTime: number;
    totalBreaks: number;
    gameBreaks: number;
    traditionalBreaks: number;
    restBreaks: number;
    averageBreakScore: number;
    favoriteBreakActivity: string;
  } {
    const userBreaks = this.breakSessions.filter(
      s => s.userId === userId && s.completed
    );
    const tracker = this.getTimeTracker(userId);

    const gameBreaks = userBreaks.filter(s => s.activityType === 'mini-game');
    const traditionalBreaks = userBreaks.filter(
      s => s.activityType === 'traditional'
    );
    const restBreaks = userBreaks.filter(s => s.activityType === 'rest');

    const averageBreakScore =
      gameBreaks.length > 0
        ? gameBreaks.reduce((sum, b) => sum + (b.gameResult?.score || 0), 0) /
          gameBreaks.length
        : 0;

    // Find favorite activity
    const activityCounts: Record<string, number> = {};
    userBreaks.forEach(breakSession => {
      const key = breakSession.gameId || breakSession.breakActivityId || 'rest';
      activityCounts[key] = (activityCounts[key] || 0) + 1;
    });

    const favoriteBreakActivity =
      Object.entries(activityCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'none';

    return {
      dailyGameTime: tracker.dailyGameTime,
      weeklyGameTime: tracker.weeklyGameTime,
      totalBreaks: userBreaks.length,
      gameBreaks: gameBreaks.length,
      traditionalBreaks: traditionalBreaks.length,
      restBreaks: restBreaks.length,
      averageBreakScore,
      favoriteBreakActivity,
    };
  }

  /**
   * Reset daily tracking (should be called daily)
   */
  resetDailyTracking(userId: string): void {
    const tracker = this.getTimeTracker(userId);
    tracker.dailyGameTime = 0;
    tracker.consecutiveBreaks = 0;
  }

  /**
   * Reset weekly tracking (should be called weekly)
   */
  resetWeeklyTracking(userId: string): void {
    const tracker = this.getTimeTracker(userId);
    tracker.weeklyGameTime = 0;
  }

  /**
   * Update user's game time limits
   */
  updateGameLimits(
    userId: string,
    maxDailyGameTime: number,
    maxConsecutiveBreaks: number
  ): void {
    const tracker = this.getTimeTracker(userId);
    tracker.maxDailyGameTime = Math.max(10, Math.min(60, maxDailyGameTime)); // 10-60 minutes
    tracker.maxConsecutiveBreaks = Math.max(
      1,
      Math.min(5, maxConsecutiveBreaks)
    ); // 1-5 breaks
  }

  /**
   * Get user's break history
   */
  getBreakHistory(userId: string, limit: number = 20): StudyBreakSession[] {
    return this.breakSessions
      .filter(s => s.userId === userId && s.completed)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  private getTimeTracker(userId: string): BreakTimeTracker {
    if (!this.timeTrackers[userId]) {
      this.timeTrackers[userId] = { ...this.timeTrackers['default'] };
    }
    return this.timeTrackers[userId];
  }

  private calculateBreakXP(
    breakType: 'short' | 'long',
    withGame: boolean
  ): number {
    const baseXP = breakType === 'short' ? 3 : 5;
    const gameBonus = withGame ? 2 : 0;
    return baseXP + gameBonus;
  }

  private updateTimeTracker(
    userId: string,
    breakSession: StudyBreakSession,
    gameResult: GameResult
  ): void {
    const tracker = this.getTimeTracker(userId);
    const gameTime = gameResult.timeSpent;

    tracker.dailyGameTime += gameTime;
    tracker.weeklyGameTime += gameTime;
    tracker.consecutiveBreaks += 1;
    tracker.lastBreakTime = new Date();
  }
}

// Create and export singleton instance
export const studyBreakManager = new StudyBreakManager();
