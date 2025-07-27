import type {
  MiniGameManager,
  MiniGame,
  GameSession,
  GameResult,
  MiniGameProgress,
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
        instructions:
          'Create chains of associated words and explore connections.',
        imageUrl: '/games/word-association.png',
      },
    ];

    // Initialize progress for each game
    this.games.forEach(game => {
      this.progress[game.id] = {
        gameId: game.id,
        bestScore: 0,
        totalPlays: 0,
        totalTimeSpent: 0,
        achievements: [],
        unlockedLevels: [1],
        averageScore: 0,
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
        completed: false,
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
        (endTime.getTime() - session.startTime.getTime()) / 1000 / 60
      ); // minutes

      // Calculate coins earned based on score and game difficulty
      let coinsEarned = game.coinReward;
      const scoreMultiplier = Math.max(0.5, Math.min(2, score / 100)); // 0.5x to 2x based on score
      const difficultyMultiplier =
        game.difficulty === 'easy'
          ? 1
          : game.difficulty === 'medium'
            ? 1.2
            : 1.5;

      coinsEarned = Math.floor(
        coinsEarned * scoreMultiplier * difficultyMultiplier
      );

      // Update session
      session.endTime = endTime;
      session.score = score;
      session.coinsEarned = coinsEarned;
      session.completed = true;

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

      // Check for achievements
      const newAchievements = this.checkAchievements(
        session.gameId,
        score,
        progress
      );

      const result: GameResult = {
        success: true,
        score,
        coinsEarned,
        newAchievements,
        personalBest: isPersonalBest,
        timeSpent: duration,
      };

      return result;
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
  getGameProgress(gameId: string): MiniGameProgress {
    return (
      this.progress[gameId] || {
        gameId,
        bestScore: 0,
        totalPlays: 0,
        totalTimeSpent: 0,
        achievements: [],
        unlockedLevels: [1],
        averageScore: 0,
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
  ): string[] {
    const newAchievements: string[] = [];
    const game = this.games.find(g => g.id === gameId);
    if (!game) return newAchievements;

    // First time playing achievement
    if (progress.totalPlays === 1) {
      newAchievements.push(`${game.name} Beginner`);
    }

    // Perfect score achievement
    if (score >= 100) {
      const perfectAchievement = `${game.name} Perfect`;
      if (!progress.achievements.includes(perfectAchievement)) {
        newAchievements.push(perfectAchievement);
      }
    }

    // Milestone achievements
    if (progress.totalPlays === 10) {
      newAchievements.push(`${game.name} Enthusiast`);
    } else if (progress.totalPlays === 50) {
      newAchievements.push(`${game.name} Expert`);
    } else if (progress.totalPlays === 100) {
      newAchievements.push(`${game.name} Master`);
    }

    // Category-specific achievements
    const categoryGames = this.getGamesByCategory(game.category);
    const categoryProgress = categoryGames.map(g => this.progress[g.id]);
    const totalCategoryPlays = categoryProgress.reduce(
      (sum, p) => sum + p.totalPlays,
      0
    );

    if (totalCategoryPlays === 25) {
      newAchievements.push(`${game.category} Specialist`);
    }

    // Add new achievements to progress
    newAchievements.forEach(achievement => {
      if (!progress.achievements.includes(achievement)) {
        progress.achievements.push(achievement);
      }
    });

    return newAchievements;
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
