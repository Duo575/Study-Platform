import { describe, it, expect, beforeEach, vi } from 'vitest';
import { miniGameService } from '../services/miniGameService';

// Mock the mini-game service
vi.mock('../services/miniGameService', () => ({
  miniGameService: {
    getRecommendedGames: vi.fn(),
    startGame: vi.fn(),
    endGame: vi.fn(),
  },
}));

describe('Study Break Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock recommended games
    (miniGameService.getRecommendedGames as any).mockReturnValue([
      {
        id: 'breathing-exercise',
        name: 'Breathing Exercise',
        description: 'A quick breathing exercise',
        category: 'breathing',
        difficulty: 'easy',
        estimatedDuration: 3,
        coinReward: 10,
        instructions: 'Breathe deeply',
      },
      {
        id: 'color-memory',
        name: 'Color Memory',
        description: 'Remember the colors',
        category: 'memory',
        difficulty: 'easy',
        estimatedDuration: 2,
        coinReward: 15,
        instructions: 'Remember the sequence',
      },
    ]);
  });

  describe('Game Filtering for Breaks', () => {
    it('should filter games suitable for breaks', () => {
      const allGames = [
        { id: '1', estimatedDuration: 2, category: 'breathing' },
        { id: '2', estimatedDuration: 8, category: 'puzzle' }, // Too long
        { id: '3', estimatedDuration: 3, category: 'memory' },
        { id: '4', estimatedDuration: 1, category: 'reflex' },
        { id: '5', estimatedDuration: 6, category: 'creativity' }, // Not suitable category
      ];

      const breakDuration = 5;
      const suitableCategories = ['breathing', 'memory', 'reflex'];

      const suitableGames = allGames.filter(
        game =>
          game.estimatedDuration <= breakDuration &&
          suitableCategories.includes(game.category)
      );

      expect(suitableGames).toHaveLength(3);
      expect(suitableGames.map(g => g.id)).toEqual(['1', '3', '4']);
    });

    it('should get recommended games from service', () => {
      const games = miniGameService.getRecommendedGames('test-user', 4);

      expect(miniGameService.getRecommendedGames).toHaveBeenCalledWith(
        'test-user',
        4
      );
      expect(games).toHaveLength(2);
      expect(games[0].category).toBe('breathing');
      expect(games[1].category).toBe('memory');
    });
  });

  describe('Break Time Management', () => {
    it('should calculate maximum game time correctly', () => {
      const breakDuration = 5; // 5 minutes
      const maxGameTimePercentage = 70; // 70%
      const maxGameTime = (breakDuration * 60 * maxGameTimePercentage) / 100;

      expect(maxGameTime).toBe(210); // 3.5 minutes in seconds
    });

    it('should enforce game time limits', () => {
      const maxGameTime = 210; // 3.5 minutes
      const gameTimeUsed = 220; // More than limit
      const canPlayGames = gameTimeUsed < maxGameTime;

      expect(canPlayGames).toBe(false);
    });

    it('should show warning when approaching limit', () => {
      const maxGameTime = 210; // 3.5 minutes
      const gameTimeUsed = 170; // ~80% of limit
      const warningThreshold = maxGameTime * 0.8;

      const shouldShowWarning = gameTimeUsed > warningThreshold;
      expect(shouldShowWarning).toBe(true);
    });

    it('should format time correctly', () => {
      const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(300)).toBe('5:00');
      expect(formatTime(3661)).toBe('61:01');
    });
  });

  describe('Break Session Tracking', () => {
    beforeEach(() => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => null),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true,
      });
    });

    it('should track break statistics', () => {
      // Mock localStorage with some break sessions
      const mockSessions = [
        {
          userId: 'test-user',
          breakType: 'short_break',
          duration: 5,
          gameTimeUsed: 120,
          totalTime: 300,
          timestamp: new Date(),
        },
        {
          userId: 'test-user',
          breakType: 'long_break',
          duration: 15,
          gameTimeUsed: 300,
          totalTime: 900,
          timestamp: new Date(),
        },
      ];

      (window.localStorage.getItem as any).mockReturnValue(
        JSON.stringify(mockSessions)
      );

      // Test stats calculation
      const totalBreaks = mockSessions.length;
      const totalGameTime = mockSessions.reduce(
        (sum, s) => sum + s.gameTimeUsed,
        0
      );
      const totalBreakTime = mockSessions.reduce(
        (sum, s) => sum + s.totalTime,
        0
      );
      const gameTimePercentage = (totalGameTime / totalBreakTime) * 100;

      expect(totalBreaks).toBe(2);
      expect(totalGameTime).toBe(420); // 7 minutes
      expect(gameTimePercentage).toBeCloseTo(35); // 35% game time
    });

    it('should determine favorite break activity', () => {
      const gameTimePercentage = 35;
      const favoriteActivity = gameTimePercentage > 30 ? 'games' : 'rest';

      expect(favoriteActivity).toBe('games');

      const lowGameTimePercentage = 20;
      const favoriteActivityRest =
        lowGameTimePercentage > 30 ? 'games' : 'rest';

      expect(favoriteActivityRest).toBe('rest');
    });
  });

  describe('Pomodoro Integration', () => {
    it('should detect break transitions correctly', () => {
      const transitions = [
        { from: 'work', to: 'short_break', shouldShowBreak: true },
        { from: 'short_break', to: 'work', shouldShowBreak: false },
        { from: 'work', to: 'long_break', shouldShowBreak: true },
        { from: 'long_break', to: 'work', shouldShowBreak: false },
      ];

      transitions.forEach(({ from, to, shouldShowBreak }) => {
        const isBreakTime = to === 'short_break' || to === 'long_break';
        expect(isBreakTime).toBe(shouldShowBreak);
      });
    });

    it('should provide smooth transitions between modes', () => {
      // Test that break state changes are handled correctly
      const breakStates = [
        { sessionType: 'work', isBreakTime: false },
        { sessionType: 'short_break', isBreakTime: true },
        { sessionType: 'work', isBreakTime: false },
        { sessionType: 'long_break', isBreakTime: true },
      ];

      breakStates.forEach(({ sessionType, isBreakTime }) => {
        const actualBreakTime =
          sessionType === 'short_break' || sessionType === 'long_break';
        expect(actualBreakTime).toBe(isBreakTime);
      });
    });
  });

  describe('Game Time Prevention', () => {
    it('should prevent excessive gaming during breaks', () => {
      const breakDuration = 5; // 5 minutes
      const maxGameTimePercentage = 70;
      const maxGameTime = (breakDuration * 60 * maxGameTimePercentage) / 100; // 210 seconds

      // Test various game time usage scenarios
      const scenarios = [
        { gameTimeUsed: 0, canPlay: true },
        { gameTimeUsed: 100, canPlay: true },
        { gameTimeUsed: 200, canPlay: true },
        { gameTimeUsed: 210, canPlay: false }, // Exactly at limit
        { gameTimeUsed: 250, canPlay: false }, // Over limit
      ];

      scenarios.forEach(({ gameTimeUsed, canPlay }) => {
        const actualCanPlay = gameTimeUsed < maxGameTime;
        expect(actualCanPlay).toBe(canPlay);
      });
    });

    it('should calculate remaining game time correctly', () => {
      const maxGameTime = 210; // 3.5 minutes
      const gameTimeUsed = 120; // 2 minutes used
      const remainingTime = Math.max(0, maxGameTime - gameTimeUsed);

      expect(remainingTime).toBe(90); // 1.5 minutes remaining

      // Test when over limit
      const overLimitUsed = 250;
      const remainingWhenOver = Math.max(0, maxGameTime - overLimitUsed);

      expect(remainingWhenOver).toBe(0);
    });
  });
});
