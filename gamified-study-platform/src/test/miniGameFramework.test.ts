import { describe, it, expect, beforeEach, vi } from 'vitest';
import { miniGameService } from '../services/miniGameService';
import type { MiniGame, GameSession } from '../types';

describe('Mini-Game Framework', () => {
  beforeEach(() => {
    // Reset service state before each test
    vi.clearAllMocks();
  });

  describe('MiniGameService', () => {
    it('should initialize with available games', () => {
      const games = miniGameService.getAvailableGames();
      expect(games).toBeDefined();
      expect(games.length).toBeGreaterThan(0);

      // Check that games have required properties
      games.forEach(game => {
        expect(game).toHaveProperty('id');
        expect(game).toHaveProperty('name');
        expect(game).toHaveProperty('description');
        expect(game).toHaveProperty('category');
        expect(game).toHaveProperty('difficulty');
        expect(game).toHaveProperty('estimatedDuration');
        expect(game).toHaveProperty('coinReward');
        expect(game).toHaveProperty('instructions');
      });
    });

    it('should filter games by category', () => {
      const breathingGames = miniGameService.getGamesByCategory('breathing');
      const memoryGames = miniGameService.getGamesByCategory('memory');

      expect(breathingGames.every(game => game.category === 'breathing')).toBe(
        true
      );
      expect(memoryGames.every(game => game.category === 'memory')).toBe(true);
    });

    it('should filter games by difficulty', () => {
      const easyGames = miniGameService.getGamesByDifficulty('easy');
      const hardGames = miniGameService.getGamesByDifficulty('hard');

      expect(easyGames.every(game => game.difficulty === 'easy')).toBe(true);
      expect(hardGames.every(game => game.difficulty === 'hard')).toBe(true);
    });

    it('should start a game session', async () => {
      const games = miniGameService.getAvailableGames();
      const testGame = games[0];

      const session = await miniGameService.startGame(testGame.id);

      expect(session).toBeDefined();
      expect(session.gameId).toBe(testGame.id);
      expect(session.userId).toBeDefined();
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.completed).toBe(false);
      expect(session.difficulty).toBe(testGame.difficulty);
    });

    it('should end a game session and calculate results', async () => {
      const games = miniGameService.getAvailableGames();
      const testGame = games[0];

      const session = await miniGameService.startGame(testGame.id);
      const testScore = 85;

      const result = await miniGameService.endGame(session.id, testScore);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.score).toBe(testScore);
      expect(result.coinsEarned).toBeGreaterThan(0);
      expect(result.timeSpent).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.newAchievements)).toBe(true);
      expect(typeof result.personalBest).toBe('boolean');
    });

    it('should track game progress', async () => {
      const games = miniGameService.getAvailableGames();
      const testGame = games[0];

      // Play a game
      const session = await miniGameService.startGame(testGame.id);
      await miniGameService.endGame(session.id, 75);

      const progress = miniGameService.getGameProgress(testGame.id);

      expect(progress).toBeDefined();
      expect(progress.gameId).toBe(testGame.id);
      expect(progress.bestScore).toBe(75);
      expect(progress.totalPlays).toBe(1);
      expect(progress.averageScore).toBe(75);
    });

    it('should provide game recommendations', () => {
      const recommendations = miniGameService.getRecommendedGames(
        'test-user',
        3
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeLessThanOrEqual(3);
      expect(recommendations.every(game => game.difficulty === 'easy')).toBe(
        true
      ); // New user gets easy games
    });

    it('should validate active sessions', async () => {
      const games = miniGameService.getAvailableGames();
      const testGame = games[0];

      const session = await miniGameService.startGame(testGame.id);

      expect(miniGameService.validateSession(session.id)).toBe(true);
      expect(miniGameService.validateSession('invalid-session')).toBe(false);

      // After ending the session, it should no longer be valid
      await miniGameService.endGame(session.id, 50);
      expect(miniGameService.validateSession(session.id)).toBe(false);
    });

    it('should calculate overall statistics', async () => {
      const games = miniGameService.getAvailableGames();
      const userId = 'test-user';

      // Play multiple games
      for (let i = 0; i < 3; i++) {
        const session = await miniGameService.startGame(
          games[i % games.length].id
        );
        await miniGameService.endGame(session.id, 60 + i * 10);
      }

      const stats = miniGameService.getOverallStats(userId);

      expect(stats).toBeDefined();
      expect(stats.totalGamesPlayed).toBe(3);
      expect(stats.totalCoinsEarned).toBeGreaterThan(0);
      expect(stats.averageScore).toBeGreaterThan(0);
      expect(stats.favoriteCategory).toBeDefined();
    });

    it('should handle coin reward calculation correctly', async () => {
      const games = miniGameService.getAvailableGames();
      const easyGame = games.find(g => g.difficulty === 'easy');
      const hardGame = games.find(g => g.difficulty === 'hard');

      if (easyGame && hardGame) {
        // Test easy game
        const easySession = await miniGameService.startGame(easyGame.id);
        const easyResult = await miniGameService.endGame(easySession.id, 100);

        // Test hard game
        const hardSession = await miniGameService.startGame(hardGame.id);
        const hardResult = await miniGameService.endGame(hardSession.id, 100);

        // Hard game should give more coins for same score
        expect(hardResult.coinsEarned).toBeGreaterThan(easyResult.coinsEarned);
      }
    });

    it('should award achievements for milestones', async () => {
      const games = miniGameService.getAvailableGames();
      const testGame = games[0];

      // First play should award beginner achievement
      const session1 = await miniGameService.startGame(testGame.id);
      const result1 = await miniGameService.endGame(session1.id, 50);

      expect(result1.newAchievements.length).toBeGreaterThan(0);
      expect(result1.newAchievements.some(a => a.includes('Beginner'))).toBe(
        true
      );

      // Perfect score should award perfect achievement
      const session2 = await miniGameService.startGame(testGame.id);
      const result2 = await miniGameService.endGame(session2.id, 100);

      expect(result2.newAchievements.some(a => a.includes('Perfect'))).toBe(
        true
      );
    });
  });

  describe('Game Categories', () => {
    it('should have breathing games', () => {
      const breathingGames = miniGameService.getGamesByCategory('breathing');
      expect(breathingGames.length).toBeGreaterThan(0);

      const breathingGame = breathingGames[0];
      expect(breathingGame.category).toBe('breathing');
      expect(breathingGame.instructions).toContain('breath');
    });

    it('should have memory games', () => {
      const memoryGames = miniGameService.getGamesByCategory('memory');
      expect(memoryGames.length).toBeGreaterThan(0);

      const memoryGame = memoryGames[0];
      expect(memoryGame.category).toBe('memory');
      expect(memoryGame.instructions).toContain('memory');
    });

    it('should have puzzle games', () => {
      const puzzleGames = miniGameService.getGamesByCategory('puzzle');
      expect(puzzleGames.length).toBeGreaterThan(0);

      const puzzleGame = puzzleGames[0];
      expect(puzzleGame.category).toBe('puzzle');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid game ID', async () => {
      await expect(
        miniGameService.startGame('invalid-game-id')
      ).rejects.toThrow();
    });

    it('should handle invalid session ID', async () => {
      await expect(
        miniGameService.endGame('invalid-session-id', 50)
      ).rejects.toThrow();
    });

    it('should handle ending already completed session', async () => {
      const games = miniGameService.getAvailableGames();
      const session = await miniGameService.startGame(games[0].id);

      // End the session once
      await miniGameService.endGame(session.id, 50);

      // Trying to end it again should throw
      await expect(miniGameService.endGame(session.id, 75)).rejects.toThrow();
    });
  });
});
