import type {
  MiniGameManager,
  MiniGame,
  GameSession,
  GameResult,
  MiniGameProgress,
  Achievement,
} from '../types';

/**
 * Service for managing mini-games and relaxation activities
 */
export class MiniGameManagerService implements MiniGameManager {
  private games: MiniGame[] = [];
  private sessions: GameSession[] = [];
  private progress: Record<string, MiniGameProgress> = {};

  constructor() {
    this.initializeGames();
  }

  /**
   * Initialize available mini-games
   */
  private initializeGames(): void {
    this.games = [
      // Breathing Exercise
      {
        id: 'breathing-exercise',
        name: 'Breathing Exercise',
        description:
          'A guided breathing exercise to help you relax and refocus',
        category: 'breathing',
        difficulty: 'easy',
        estimatedDuration: 5,
        coinReward: 10,
        xpReward: 15,
        instructions:
          'Follow the visual guide to breathe in and out slowly. Focus on your breath and let your mind relax.',
        imageUrl: '/games/breathing-exercise.png',
      },
      {
        id: 'deep-breathing',
        name: 'Deep Breathing',
        description: 'Advanced breathing technique for stress relief',
        category: 'breathing',
        difficulty: 'medium',
        estimatedDuration: 10,
        coinReward: 20,
        xpReward: 25,
        instructions:
          'Practice the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.',
        imageUrl: '/games/deep-breathing.png',
      },

      // Memory Games
      {
        id: 'color-memory',
        name: 'Color Memory',
        description: 'Remember the sequence of colors to improve your memory',
        category: 'memory',
        difficulty: 'easy',
        estimatedDuration: 3,
        coinReward: 15,
        xpReward: 20,
        instructions:
          'Watch the sequence of colors and repeat it back in the same order.',
        imageUrl: '/games/color-memory.png',
      },
      {
        id: 'pattern-memory',
        name: 'Pattern Memory',
        description: 'Advanced pattern recognition and memory challenge',
        category: 'memory',
        difficulty: 'hard',
        estimatedDuration: 8,
        coinReward: 35,
        xpReward: 40,
        instructions:
          'Study the complex patterns and recreate them from memory.',
        imageUrl: '/games/pattern-memory.png',
      },

      // Puzzle Games
      {
        id: 'sliding-puzzle',
        name: 'Sliding Puzzle',
        description: 'Solve the sliding tile puzzle to reveal the image',
        category: 'puzzle',
        difficulty: 'medium',
        estimatedDuration: 7,
        coinReward: 25,
        xpReward: 30,
        instructions: 'Slide the tiles to arrange them in the correct order.',
        imageUrl: '/games/sliding-puzzle.png',
      },
      {
        id: 'jigsaw-puzzle',
        name: 'Jigsaw Puzzle',
        description: 'Piece together a beautiful jigsaw puzzle',
        category: 'puzzle',
        difficulty: 'medium',
        estimatedDuration: 10,
        coinReward: 30,
        xpReward: 35,
        instructions: 'Drag and drop puzzle pieces to complete the image.',
        imageUrl: '/games/jigsaw-puzzle.png',
      },

      // Reflex Games
      {
        id: 'reaction-time',
        name: 'Reaction Time',
        description: 'Test and improve your reaction speed',
        category: 'reflex',
        difficulty: 'easy',
        estimatedDuration: 2,
        coinReward: 12,
        xpReward: 18,
        instructions:
          'Click as quickly as possible when the screen changes color.',
        imageUrl: '/games/reaction-time.png',
      },
      {
        id: 'whack-a-mole',
        name: 'Whack-a-Mole',
        description: 'Quick reflexes game to improve hand-eye coordination',
        category: 'reflex',
        difficulty: 'medium',
        estimatedDuration: 5,
        coinReward: 20,
        xpReward: 25,
        instructions: 'Click on the moles as they appear, but be quick!',
        imageUrl: '/games/whack-a-mole.png',
      },

      // Creativity Games
      {
        id: 'drawing-pad',
        name: 'Digital Drawing',
        description: 'Express your creativity with digital drawing',
        category: 'creativity',
        difficulty: 'easy',
        estimatedDuration: 15,
        coinReward: 25,
        xpReward: 30,
        instructions: 'Use the drawing tools to create whatever comes to mind.',
        imageUrl: '/games/drawing-pad.png',
      },
      {
        id: 'word-association',
        name: 'Word Association',
        description: 'Creative word game to stimulate your imagination',
        category: 'creativity',
        difficulty: 'medium',
        estimatedDuration: 8,
        coinReward: 22,
        xpReward: 28,
        instructions:
          'Create chains of associated words and explore connections.',
        imageUrl: '/games/word-association.png',
      },
    ];

    // Initialize progress for each game
    this.games.forEach(game => {
      this.progress[game.id] = {
        id: `progress-${game.id}`,
        gameId: game.id,
        gameType: game.category,
        score: 0,
        bestScore: 0,
        level: 1,
        timestamp: new Date(),
        completed: false,
        totalPlays: 0,
        averageScore: 0,
        achievements: [],
        totalTimeSpent: 0,
        completionRate: 0,
      };
    });
  }

  /**
   * Get all available games
   */
  getAvailableGames(): MiniGame[] {
    return [...this.games];
  }

  /**
   * Get games by category
   */
  getGamesByCategory(category: MiniGame['category']): MiniGame[] {
    return this.games.filter(game => game.category === category);
  }

  /**
   * Get games by difficulty
   */
  getGamesByDifficulty(difficulty: MiniGame['difficulty']): MiniGame[] {
    return this.games.filter(game => game.difficulty === difficulty);
  }

  /**
   * Start a new game session
   */
  async startGame(gameId: string): Promise<GameSession> {
    try {
      const game = this.games.find(g => g.id === gameId);
      if (!game) {
        throw new Error(`Game not found: ${gameId}`);
      }

      const session: GameSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        gameId,
        userId: 'current-user', // In real app, this would come from auth
        startTime: new Date(),
        score: 0,
        xpEarned: 0,
        completed: false,
        duration: 0,
        difficulty: game.difficulty,
        coinsEarned: 0,
      };

      this.sessions.push(session);
      return session;
    } catch (error) {
      console.error('Error starting game:', error);
      throw new Error(`Failed to start game: ${gameId}`);
    }
  }

  /**
   * End a game session and calculate results
   */
  async endGame(sessionId: string, score: number): Promise<GameResult> {
    try {
      const session = this.sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const game = this.games.find(g => g.id === session.gameId);
      if (!game) {
        throw new Error(`Game not found: ${session.gameId}`);
      }

      // Calculate session duration
      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - session.startTime.getTime()) / 1000
      ); // seconds

      // Calculate rewards based on score and difficulty
      const baseCoins = Math.floor(score / 10);
      const difficultyMultiplier =
        game.difficulty === 'hard' ? 2 : game.difficulty === 'medium' ? 1.5 : 1;
      const coinsEarned = Math.floor(baseCoins * difficultyMultiplier);

      // Update session with result data
      session.endTime = endTime;
      session.score = score;
      session.coinsEarned = coinsEarned;
      session.completed = true;
      session.duration = duration;

      // Update progress
      const progress = this.progress[session.gameId];
      const isPersonalBest = score > progress.bestScore;

      if (isPersonalBest) {
        progress.bestScore = score;
      }

      progress.totalPlays++;
      progress.totalTimeSpent += duration;
      progress.averageScore =
        (progress.averageScore * (progress.totalPlays - 1) + score) /
        progress.totalPlays;
      progress.completionRate =
        progress.totalPlays > 0
          ? (this.sessions.filter(
              s => s.gameId === session.gameId && s.completed
            ).length /
              progress.totalPlays) *
            100
          : 0;

      // Check for new achievements (simplified)
      const newAchievements: Achievement[] = [];
      if (progress.totalPlays === 1) {
        newAchievements.push({
          id: 'first-play',
          title: 'Beginner',
          description: 'Played your first game',
          category: 'games',
          rarity: 'common',
          xpReward: 10,
          iconUrl: '/achievements/beginner.png',
        });
      }
      if (score === 100) {
        newAchievements.push({
          id: 'perfect-score',
          title: 'Perfect Score',
          description: 'Achieved a perfect score',
          category: 'games',
          rarity: 'epic',
          xpReward: 50,
          iconUrl: '/achievements/perfect.png',
        });
      }

      return {
        success: true,
        score,
        coinsEarned,
        newAchievements,
        personalBest: isPersonalBest,
        timeSpent: duration,
      };
    } catch (error) {
      console.error('Error ending game:', error);
      throw new Error(`Failed to end game session: ${sessionId}`);
    }
  }

  /**
   * Get game history for a user
   */
  getGameHistory(userId: string): GameSession[] {
    return this.sessions
      .filter(session => session.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Get progress for a specific game
   */
  getGameProgress(gameId: string, userId?: string): MiniGameProgress {
    return (
      this.progress[gameId] || {
        id: `progress-${gameId}`,
        gameId,
        gameType: 'unknown',
        score: 0,
        bestScore: 0,
        level: 1,
        timestamp: new Date(),
        completed: false,
        totalPlays: 0,
        averageScore: 0,
        achievements: [],
        totalTimeSpent: 0,
        completionRate: 0,
      }
    );
  }

  /**
   * Get overall game statistics
   */
  getOverallStats(userId: string): {
    totalGamesPlayed: number;
    totalTimeSpent: number;
    totalCoinsEarned: number;
    favoriteCategory: string;
    averageScore: number;
  } {
    const userSessions = this.getGameHistory(userId);
    const completedSessions = userSessions.filter(s => s.completed);

    const totalGamesPlayed = completedSessions.length;
    const totalTimeSpent = completedSessions.reduce((sum, session) => {
      const duration =
        session.endTime && session.startTime
          ? Math.floor(
              (session.endTime.getTime() - session.startTime.getTime()) /
                1000 /
                60
            )
          : 0;
      return sum + duration;
    }, 0);
    const totalCoinsEarned = completedSessions.reduce(
      (sum, session) => sum + (session.coinsEarned || 0),
      0
    );

    // Find favorite category
    const categoryCount: Record<string, number> = {};
    completedSessions.forEach(session => {
      const game = this.games.find(g => g.id === session.gameId);
      if (game) {
        categoryCount[game.category] = (categoryCount[game.category] || 0) + 1;
      }
    });

    const favoriteCategory =
      Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'none';

    const averageScore =
      completedSessions.length > 0
        ? completedSessions.reduce(
            (sum, session) => sum + (session.score || 0),
            0
          ) / completedSessions.length
        : 0;

    return {
      totalGamesPlayed,
      totalTimeSpent,
      totalCoinsEarned,
      favoriteCategory,
      averageScore,
    };
  }

  /**
   * Check for achievements based on game performance
   */
  private checkAchievements(
    gameId: string,
    score: number,
    progress: MiniGameProgress
  ): Achievement[] {
    // TODO: Implement proper achievement creation
    // For now, return empty array to fix build errors
    return [];
  }

  /**
   * Get recommended games based on user preferences and history
   */
  getRecommendedGames(userId: string, limit: number = 3): MiniGame[] {
    const userSessions = this.getGameHistory(userId);

    if (userSessions.length === 0) {
      // New user - recommend easy games from different categories
      return this.games
        .filter(game => game.difficulty === 'easy')
        .slice(0, limit);
    }

    // Get user's favorite categories and difficulties
    const categoryPreference: Record<string, number> = {};
    const difficultyPreference: Record<string, number> = {};

    userSessions.forEach(session => {
      const game = this.games.find(g => g.id === session.gameId);
      if (game) {
        categoryPreference[game.category] =
          (categoryPreference[game.category] || 0) + 1;
        difficultyPreference[game.difficulty] =
          (difficultyPreference[game.difficulty] || 0) + 1;
      }
    });

    // Sort games by preference score
    const scoredGames = this.games.map(game => {
      const categoryScore = categoryPreference[game.category] || 0;
      const difficultyScore = difficultyPreference[game.difficulty] || 0;
      const playCount = userSessions.filter(s => s.gameId === game.id).length;

      // Prefer games from liked categories but not overplayed
      const score = categoryScore * 2 + difficultyScore - playCount * 0.5;

      return { game, score };
    });

    return scoredGames
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.game);
  }

  /**
   * Validate game session
   */
  validateSession(sessionId: string): boolean {
    const session = this.sessions.find(s => s.id === sessionId);
    return session !== undefined && !session.completed;
  }

  /**
   * Clean up old sessions
   */
  cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoffTime = new Date(Date.now() - maxAge);
    this.sessions = this.sessions.filter(
      session => session.startTime > cutoffTime || session.completed
    );
  }

  /**
   * Update progress for a specific game
   */
  async updateProgress(
    gameId: string,
    userId: string,
    progress: Partial<MiniGameProgress>
  ): Promise<void> {
    if (this.progress[gameId]) {
      this.progress[gameId] = { ...this.progress[gameId], ...progress };
    }
  }

  /**
   * Get leaderboard for a specific game
   */
  async getLeaderboard(gameId: string): Promise<any[]> {
    const gameSessions = this.sessions.filter(
      s => s.gameId === gameId && s.completed
    );
    return gameSessions
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10)
      .map(session => ({
        userId: session.userId,
        score: session.score,
        timestamp: session.endTime,
      }));
  }

  /**
   * Export game data for analytics
   */
  exportGameData(userId: string): {
    sessions: GameSession[];
    progress: Record<string, MiniGameProgress>;
    stats: any;
  } {
    return {
      sessions: this.getGameHistory(userId),
      progress: { ...this.progress },
      stats: this.getOverallStats(userId),
    };
  }
}

// Create and export a singleton instance
export const miniGameService = new MiniGameManagerService();
