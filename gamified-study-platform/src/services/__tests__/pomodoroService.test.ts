import { PomodoroService } from '../pomodoroService';
import { PomodoroSettings } from '../../types';

describe('PomodoroService', () => {
  describe('calculateXP', () => {
    it('should calculate correct XP for work sessions', () => {
      const xp = PomodoroService.calculateXP('work', 25);
      expect(xp).toBe(10); // Base XP for 25-minute work session
    });

    it('should calculate correct XP for short break sessions', () => {
      const xp = PomodoroService.calculateXP('short_break', 5);
      expect(xp).toBe(2); // Base XP for 5-minute break
    });

    it('should calculate correct XP for long break sessions', () => {
      const xp = PomodoroService.calculateXP('long_break', 15);
      expect(xp).toBe(3); // Scaled XP for 15-minute long break
    });

    it('should scale XP based on duration', () => {
      const xp50 = PomodoroService.calculateXP('work', 50);
      const xp25 = PomodoroService.calculateXP('work', 25);
      expect(xp50).toBe(xp25 * 2); // Double duration should give double XP
    });
  });

  describe('getDefaultSettings', () => {
    it('should return valid default Pomodoro settings', () => {
      const settings = PomodoroService.getDefaultSettings();
      
      expect(settings).toEqual({
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        soundEnabled: true,
      });
    });
  });

  describe('getBreakActivities', () => {
    it('should return a list of break activities', () => {
      const activities = PomodoroService.getBreakActivities();
      
      expect(activities).toHaveLength(5);
      expect(activities[0]).toHaveProperty('id');
      expect(activities[0]).toHaveProperty('title');
      expect(activities[0]).toHaveProperty('description');
      expect(activities[0]).toHaveProperty('duration');
      expect(activities[0]).toHaveProperty('type');
      expect(activities[0]).toHaveProperty('icon');
    });

    it('should include different types of activities', () => {
      const activities = PomodoroService.getBreakActivities();
      const types = activities.map(activity => activity.type);
      
      expect(types).toContain('physical');
      expect(types).toContain('mental');
      expect(types).toContain('creative');
    });
  });
});

// Mock tests for database operations (would require proper test setup with Supabase)
describe('PomodoroService Database Operations', () => {
  // These tests would require a proper test database setup
  // For now, we'll just test the structure of the methods
  
  it('should have createSession method', () => {
    expect(typeof PomodoroService.createSession).toBe('function');
  });

  it('should have completeSession method', () => {
    expect(typeof PomodoroService.completeSession).toBe('function');
  });

  it('should have getUserSessions method', () => {
    expect(typeof PomodoroService.getUserSessions).toBe('function');
  });

  it('should have getAnalytics method', () => {
    expect(typeof PomodoroService.getAnalytics).toBe('function');
  });
});