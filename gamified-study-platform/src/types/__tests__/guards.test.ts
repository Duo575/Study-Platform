import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidStudySession,
  isValidQuest,
  isValidCourse,
  isValidGameStats,
  isValidPet,
  isValidAchievement,
  isValidTodo,
  isValidUser,
  isValidDate,
  isValidUUID,
  isValidXPAmount,
  isValidLevel,
  isValidDifficulty,
  isValidQuestType,
  isValidPriority,
  isValidEvolutionStage,
} from '../guards';
import type {
  StudySession,
  Quest,
  Course,
  GameStats,
  StudyPet,
  Achievement,
  Todo,
  User,
} from '../index';

describe('Type Guards', () => {
  describe('Basic Validation Guards', () => {
    describe('isValidEmail', () => {
      it('should validate correct email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(isValidEmail('test+tag@example.org')).toBe(true);
        expect(isValidEmail('123@456.com')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid-email')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('test..test@example.com')).toBe(false);
        expect(isValidEmail('')).toBe(false);
        expect(isValidEmail('test@example')).toBe(false);
      });

      it('should handle edge cases', () => {
        expect(isValidEmail(null as any)).toBe(false);
        expect(isValidEmail(undefined as any)).toBe(false);
        expect(isValidEmail(123 as any)).toBe(false);
        expect(isValidEmail({} as any)).toBe(false);
      });
    });

    describe('isValidPassword', () => {
      it('should validate strong passwords', () => {
        expect(isValidPassword('StrongPass123!')).toBe(true);
        expect(isValidPassword('MySecure@Pass1')).toBe(true);
        expect(isValidPassword('Complex#Password9')).toBe(true);
      });

      it('should reject weak passwords', () => {
        expect(isValidPassword('weak')).toBe(false); // Too short
        expect(isValidPassword('password')).toBe(false); // No uppercase, numbers, symbols
        expect(isValidPassword('PASSWORD')).toBe(false); // No lowercase, numbers, symbols
        expect(isValidPassword('Password')).toBe(false); // No numbers, symbols
        expect(isValidPassword('Password123')).toBe(false); // No symbols
        expect(isValidPassword('12345678')).toBe(false); // Only numbers
      });

      it('should handle edge cases', () => {
        expect(isValidPassword('')).toBe(false);
        expect(isValidPassword(null as any)).toBe(false);
        expect(isValidPassword(undefined as any)).toBe(false);
      });
    });

    describe('isValidDate', () => {
      it('should validate valid dates', () => {
        expect(isValidDate(new Date())).toBe(true);
        expect(isValidDate(new Date('2024-01-15'))).toBe(true);
        expect(isValidDate(new Date(2024, 0, 15))).toBe(true);
      });

      it('should reject invalid dates', () => {
        expect(isValidDate(new Date('invalid'))).toBe(false);
        expect(isValidDate(new Date('2024-13-01'))).toBe(false);
        expect(isValidDate(new Date('2024-02-30'))).toBe(false);
      });

      it('should handle edge cases', () => {
        expect(isValidDate(null as any)).toBe(false);
        expect(isValidDate(undefined as any)).toBe(false);
        expect(isValidDate('2024-01-15' as any)).toBe(false);
        expect(isValidDate(1642204800000 as any)).toBe(false);
      });
    });

    describe('isValidUUID', () => {
      it('should validate correct UUIDs', () => {
        expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
        expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
        expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
      });

      it('should reject invalid UUIDs', () => {
        expect(isValidUUID('invalid-uuid')).toBe(false);
        expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
        expect(isValidUUID('123e4567-e89b-12d3-a456-42661417400g')).toBe(false);
        expect(isValidUUID('')).toBe(false);
      });

      it('should handle edge cases', () => {
        expect(isValidUUID(null as any)).toBe(false);
        expect(isValidUUID(undefined as any)).toBe(false);
        expect(isValidUUID(123 as any)).toBe(false);
      });
    });
  });

  describe('Gamification Guards', () => {
    describe('isValidXPAmount', () => {
      it('should validate positive XP amounts', () => {
        expect(isValidXPAmount(0)).toBe(true);
        expect(isValidXPAmount(100)).toBe(true);
        expect(isValidXPAmount(9999)).toBe(true);
      });

      it('should reject invalid XP amounts', () => {
        expect(isValidXPAmount(-1)).toBe(false);
        expect(isValidXPAmount(-100)).toBe(false);
        expect(isValidXPAmount(NaN)).toBe(false);
        expect(isValidXPAmount(Infinity)).toBe(false);
      });

      it('should handle edge cases', () => {
        expect(isValidXPAmount(null as any)).toBe(false);
        expect(isValidXPAmount(undefined as any)).toBe(false);
        expect(isValidXPAmount('100' as any)).toBe(false);
      });
    });

    describe('isValidLevel', () => {
      it('should validate positive levels', () => {
        expect(isValidLevel(1)).toBe(true);
        expect(isValidLevel(50)).toBe(true);
        expect(isValidLevel(100)).toBe(true);
      });

      it('should reject invalid levels', () => {
        expect(isValidLevel(0)).toBe(false);
        expect(isValidLevel(-1)).toBe(false);
        expect(isValidLevel(NaN)).toBe(false);
        expect(isValidLevel(Infinity)).toBe(false);
      });
    });

    describe('isValidDifficulty', () => {
      it('should validate correct difficulty levels', () => {
        expect(isValidDifficulty('easy')).toBe(true);
        expect(isValidDifficulty('medium')).toBe(true);
        expect(isValidDifficulty('hard')).toBe(true);
      });

      it('should reject invalid difficulty levels', () => {
        expect(isValidDifficulty('invalid')).toBe(false);
        expect(isValidDifficulty('Easy')).toBe(false);
        expect(isValidDifficulty('')).toBe(false);
        expect(isValidDifficulty(null as any)).toBe(false);
      });
    });

    describe('isValidQuestType', () => {
      it('should validate correct quest types', () => {
        expect(isValidQuestType('daily')).toBe(true);
        expect(isValidQuestType('weekly')).toBe(true);
        expect(isValidQuestType('milestone')).toBe(true);
        expect(isValidQuestType('bonus')).toBe(true);
      });

      it('should reject invalid quest types', () => {
        expect(isValidQuestType('invalid')).toBe(false);
        expect(isValidQuestType('Daily')).toBe(false);
        expect(isValidQuestType('')).toBe(false);
        expect(isValidQuestType(null as any)).toBe(false);
      });
    });

    describe('isValidPriority', () => {
      it('should validate correct priority levels', () => {
        expect(isValidPriority('low')).toBe(true);
        expect(isValidPriority('medium')).toBe(true);
        expect(isValidPriority('high')).toBe(true);
      });

      it('should reject invalid priority levels', () => {
        expect(isValidPriority('invalid')).toBe(false);
        expect(isValidPriority('Low')).toBe(false);
        expect(isValidPriority('')).toBe(false);
        expect(isValidPriority(null as any)).toBe(false);
      });
    });

    describe('isValidEvolutionStage', () => {
      it('should validate correct evolution stages', () => {
        expect(isValidEvolutionStage('egg')).toBe(true);
        expect(isValidEvolutionStage('baby')).toBe(true);
        expect(isValidEvolutionStage('teen')).toBe(true);
        expect(isValidEvolutionStage('adult')).toBe(true);
        expect(isValidEvolutionStage('master')).toBe(true);
      });

      it('should reject invalid evolution stages', () => {
        expect(isValidEvolutionStage('invalid')).toBe(false);
        expect(isValidEvolutionStage('Baby')).toBe(false);
        expect(isValidEvolutionStage('')).toBe(false);
        expect(isValidEvolutionStage(null as any)).toBe(false);
      });
    });
  });

  describe('Complex Object Guards', () => {
    describe('isValidUser', () => {
      const validUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: 'https://example.com/avatar.jpg',
          timezone: 'UTC',
        },
        gameStats: {
          level: 1,
          totalXP: 0,
          currentXP: 0,
          xpToNextLevel: 100,
          streakDays: 0,
          achievements: [],
          lastActivity: new Date(),
          weeklyStats: {
            studyHours: 0,
            questsCompleted: 0,
            streakMaintained: false,
            xpEarned: 0,
            averageScore: 0,
          },
        },
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            inApp: true,
            studyReminders: true,
            achievementUnlocks: true,
            petReminders: true,
          },
          studyReminders: true,
          pomodoroSettings: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsUntilLongBreak: 4,
            soundEnabled: true,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('should validate correct user objects', () => {
        expect(isValidUser(validUser)).toBe(true);

        // Test with optional fields
        const minimalUser = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(isValidUser(minimalUser)).toBe(true);
      });

      it('should reject invalid user objects', () => {
        expect(isValidUser({ ...validUser, id: 'invalid-id' })).toBe(false);
        expect(isValidUser({ ...validUser, email: 'invalid-email' })).toBe(
          false
        );
        expect(isValidUser({ ...validUser, createdAt: 'invalid-date' })).toBe(
          false
        );
        expect(isValidUser({ ...validUser, id: undefined })).toBe(false);
      });

      it('should handle edge cases', () => {
        expect(isValidUser(null)).toBe(false);
        expect(isValidUser(undefined)).toBe(false);
        expect(isValidUser({})).toBe(false);
        expect(isValidUser('user')).toBe(false);
      });
    });

    describe('isValidStudySession', () => {
      const validSession: StudySession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        courseId: '123e4567-e89b-12d3-a456-426614174002',
        duration: 60,
        startTime: new Date(),
        endTime: new Date(),
        type: 'pomodoro',
        xpEarned: 50,
      };

      it('should validate correct study session objects', () => {
        expect(isValidStudySession(validSession)).toBe(true);

        // Test with optional fields
        const minimalSession = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          duration: 60,
          startTime: new Date(),
          type: 'free_study',
          xpEarned: 0,
        };
        expect(isValidStudySession(minimalSession)).toBe(true);
      });

      it('should reject invalid study session objects', () => {
        expect(isValidStudySession({ ...validSession, duration: -1 })).toBe(
          false
        );
        expect(isValidStudySession({ ...validSession, xpEarned: -10 })).toBe(
          false
        );
        expect(
          isValidStudySession({ ...validSession, focusPercentage: 150 })
        ).toBe(false);
        expect(isValidStudySession({ ...validSession, id: 'invalid' })).toBe(
          false
        );
      });
    });

    describe('isValidQuest', () => {
      const validQuest: Quest = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Daily Study Challenge',
        description: 'Complete 30 minutes of study',
        type: 'daily',
        difficulty: 'medium',
        xpReward: 50,
        requirements: [
          {
            type: 'study_time',
            target: 30,
            current: 15,
            description: 'Study for 30 minutes',
          },
        ],
        status: 'active',
        courseId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      it('should validate correct quest objects', () => {
        expect(isValidQuest(validQuest)).toBe(true);

        // Test with minimal required fields
        const minimalQuest = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Quest',
          description: 'Test description',
          type: 'daily',
          difficulty: 'easy',
          xpReward: 20,
          requirements: [],
          status: 'available',
          createdAt: new Date(),
        };
        expect(isValidQuest(minimalQuest)).toBe(true);
      });

      it('should reject invalid quest objects', () => {
        expect(isValidQuest({ ...validQuest, type: 'invalid' })).toBe(false);
        expect(isValidQuest({ ...validQuest, difficulty: 'invalid' })).toBe(
          false
        );
        expect(isValidQuest({ ...validQuest, xpReward: -10 })).toBe(false);
        expect(isValidQuest({ ...validQuest, title: '' })).toBe(false);
      });
    });

    describe('isValidCourse', () => {
      const validCourse: Course = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'JavaScript Fundamentals',
        description: 'Learn JavaScript basics',
        color: '#3B82F6',
        syllabus: [
          {
            id: '1',
            title: 'Variables',
            description: 'Learn about variables',
            topics: ['let', 'const', 'var'],
            estimatedHours: 2,
            priority: 'high',
            completed: false,
          },
        ],
        progress: {
          completionPercentage: 25,
          hoursStudied: 5,
          topicsCompleted: 2,
          totalTopics: 8,
          lastStudied: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('should validate correct course objects', () => {
        expect(isValidCourse(validCourse)).toBe(true);
      });

      it('should reject invalid course objects', () => {
        expect(isValidCourse({ ...validCourse, name: '' })).toBe(false);
        expect(isValidCourse({ ...validCourse, color: 'invalid-color' })).toBe(
          false
        );
        expect(isValidCourse({ ...validCourse, progress: null })).toBe(false);
      });
    });

    describe('isValidGameStats', () => {
      const validGameStats: GameStats = {
        level: 5,
        totalXP: 1250,
        currentXP: 50,
        xpToNextLevel: 150,
        streakDays: 7,
        achievements: [],
        lastActivity: new Date(),
        weeklyStats: {
          studyHours: 15,
          questsCompleted: 8,
          streakMaintained: true,
          xpEarned: 300,
          averageScore: 85,
        },
      };

      it('should validate correct game stats objects', () => {
        expect(isValidGameStats(validGameStats)).toBe(true);
      });

      it('should reject invalid game stats objects', () => {
        expect(isValidGameStats({ ...validGameStats, level: 0 })).toBe(false);
        expect(isValidGameStats({ ...validGameStats, totalXP: -100 })).toBe(
          false
        );
        expect(isValidGameStats({ ...validGameStats, streakDays: -1 })).toBe(
          false
        );
      });
    });

    describe('isValidPet', () => {
      const validPet: StudyPet = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Buddy',
        species: {
          id: 'dragon',
          name: 'Dragon',
          description: 'A magical dragon companion',
          baseStats: {
            happiness: 50,
            health: 50,
            intelligence: 50,
          },
          evolutionStages: [],
        },
        level: 3,
        happiness: 75,
        health: 80,
        evolution: {
          stage: {
            id: 'teen',
            name: 'Teen',
            description: 'A teenage dragon',
            imageUrl: '/pets/dragon-teen.png',
            requiredLevel: 5,
            stats: {
              happiness: 75,
              health: 80,
              intelligence: 70,
            },
            unlockedAbilities: ['fly', 'breathe_fire'],
          },
          progress: 60,
          nextStageRequirements: [
            {
              id: 'level-req-1',
              type: 'level_reached',
              target: 10,
              current: 3,
              description: 'Reach level 10',
              completed: false,
            },
          ],
        },
        accessories: [],
        lastFed: new Date(),
        lastPlayed: new Date(),
        createdAt: new Date(),
      };

      it('should validate correct pet objects', () => {
        expect(isValidPet(validPet)).toBe(true);
      });

      it('should reject invalid pet objects', () => {
        expect(isValidPet({ ...validPet, level: 0 })).toBe(false);
        expect(isValidPet({ ...validPet, happiness: -10 })).toBe(false);
        expect(isValidPet({ ...validPet, happiness: 150 })).toBe(false);
        expect(isValidPet({ ...validPet, health: -10 })).toBe(false);
        expect(isValidPet({ ...validPet, health: 150 })).toBe(false);
        expect(isValidPet({ ...validPet, evolutionStage: 'invalid' })).toBe(
          false
        );
      });
    });

    describe('isValidAchievement', () => {
      const validAchievement: Achievement = {
        id: 'first-quest',
        title: 'First Quest',
        description: 'Complete your first quest',
        category: 'quest_completion',
        rarity: 'common',
        xpReward: 25,
        iconUrl: '/achievements/first-quest.png',
        unlockedAt: new Date(),
        progress: {
          current: 100,
          target: 100,
          description: 'Complete your first quest',
        },
      };

      it('should validate correct achievement objects', () => {
        expect(isValidAchievement(validAchievement)).toBe(true);
      });

      it('should reject invalid achievement objects', () => {
        expect(isValidAchievement({ ...validAchievement, xpReward: -10 })).toBe(
          false
        );
        expect(
          isValidAchievement({
            ...validAchievement,
            progress: {
              current: -10,
              target: 100,
              description: 'Invalid progress',
            },
          })
        ).toBe(false);
        expect(
          isValidAchievement({
            ...validAchievement,
            progress: {
              current: 150,
              target: 100,
              description: 'Invalid progress',
            },
          })
        ).toBe(false);
        expect(isValidAchievement({ ...validAchievement, title: '' })).toBe(
          false
        );
      });
    });

    describe('isValidTodo', () => {
      const validTodo: Todo = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Complete assignment',
        description: 'Finish the JavaScript assignment',
        completed: false,
        priority: 'high',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedMinutes: 120,
        courseId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('should validate correct todo objects', () => {
        expect(isValidTodo(validTodo)).toBe(true);

        // Test with minimal fields
        const minimalTodo = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Simple todo',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(isValidTodo(minimalTodo)).toBe(true);
      });

      it('should reject invalid todo objects', () => {
        expect(isValidTodo({ ...validTodo, title: '' })).toBe(false);
        expect(isValidTodo({ ...validTodo, priority: 'invalid' })).toBe(false);
        expect(isValidTodo({ ...validTodo, estimatedMinutes: -10 })).toBe(
          false
        );
        expect(isValidTodo({ ...validTodo, completed: 'yes' })).toBe(false);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined inputs', () => {
      expect(isValidUser(null)).toBe(false);
      expect(isValidUser(undefined)).toBe(false);
      expect(isValidQuest(null)).toBe(false);
      expect(isValidQuest(undefined)).toBe(false);
      expect(isValidCourse(null)).toBe(false);
      expect(isValidCourse(undefined)).toBe(false);
    });

    it('should handle primitive types', () => {
      expect(isValidUser('user')).toBe(false);
      expect(isValidUser(123)).toBe(false);
      expect(isValidUser(true)).toBe(false);
      expect(isValidQuest('quest')).toBe(false);
      expect(isValidQuest([])).toBe(false);
    });

    it('should handle empty objects', () => {
      expect(isValidUser({})).toBe(false);
      expect(isValidQuest({})).toBe(false);
      expect(isValidCourse({})).toBe(false);
      expect(isValidGameStats({})).toBe(false);
    });

    it('should handle objects with extra properties', () => {
      const userWithExtra = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        extraProperty: 'should not affect validation',
      };

      expect(isValidUser(userWithExtra)).toBe(true);
    });

    it('should handle circular references', () => {
      const circular: any = { id: '123e4567-e89b-12d3-a456-426614174000' };
      circular.self = circular;

      expect(isValidUser(circular)).toBe(false);
    });

    it('should handle very large objects', () => {
      const largeUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'A'.repeat(10000), // Very long name
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isValidUser(largeUser)).toBe(true);
    });
  });
});
