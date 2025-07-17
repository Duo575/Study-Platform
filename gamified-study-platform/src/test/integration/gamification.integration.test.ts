import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gamificationService } from '../../services/gamificationService';
import { questService } from '../../services/questService';
import { petService } from '../../services/petService';
import questUtils from '../../utils/questUtils';
import { calculateLevelFromXP, calculateXPToNextLevel } from '../../utils/gamification';
import type { Course, SyllabusItem, GameStats, StudyPet } from '../../types';

// Mock the database and external dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          order: vi.fn(() => ({ data: [], error: null }))
        })),
        insert: vi.fn(() => ({ data: null, error: null }))
      }))
    })),
    rpc: vi.fn(() => ({ data: [], error: null }))
  },
  getCurrentUser: vi.fn(() => Promise.resolve({ id: 'test-user-id' }))
}));

vi.mock('../../services/database', () => ({
  questService: {
    create: vi.fn(),
    getByUserId: vi.fn(),
    update: vi.fn(),
    complete: vi.fn()
  },
  studyPetService: {
    create: vi.fn(),
    getByUserId: vi.fn(),
    update: vi.fn()
  },
  petSpeciesService: {
    getById: vi.fn(),
    getAll: vi.fn()
  }
}));

vi.mock('../../store/petStore', () => ({
  usePetStore: {
    getState: () => ({
      updateFromStudyActivity: vi.fn().mockResolvedValue(undefined)
    })
  }
}));

vi.mock('../../utils/mappers', () => ({
  mapDatabasePetToStudyPet: vi.fn((pet) => pet)
}));

describe('Gamification Integration Tests', () => {
  const mockUser = { id: 'test-user-id' };
  
  const mockCourse: Course = {
    id: 'course-1',
    name: 'JavaScript Fundamentals',
    description: 'Learn JavaScript basics',
    color: '#3B82F6',
    syllabus: [
      {
        id: '1',
        title: 'Variables and Data Types',
        description: 'Learn about JavaScript variables',
        topics: ['let', 'const', 'var', 'string', 'number', 'boolean'],
        estimatedHours: 4,
        priority: 'high',
        completed: false,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Functions',
        description: 'Learn about JavaScript functions',
        topics: ['function declaration', 'arrow functions', 'parameters'],
        estimatedHours: 6,
        priority: 'medium',
        completed: false
      }
    ],
    progress: {
      completionPercentage: 25,
      hoursStudied: 2,
      topicsCompleted: 2,
      totalTopics: 9,
      lastStudied: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockGameStats: GameStats = {
    level: 3,
    totalXP: 450,
    currentXP: 50,
    xpToNextLevel: 450,
    streakDays: 5,
    achievements: [],
    lastActivity: new Date(),
    weeklyStats: {
      studyHours: 12,
      questsCompleted: 5,
      streakMaintained: true,
      xpEarned: 200
    }
  };

  const mockPet: StudyPet = {
    id: 'pet-123',
    userId: 'test-user-id',
    name: 'Buddy',
    speciesId: 'dragon',
    level: 2,
    happiness: 70,
    health: 80,
    evolutionStage: 'baby',
    accessories: [],
    lastFed: new Date(),
    lastPlayed: new Date(),
    lastInteraction: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Study Session Workflow', () => {
    it('should handle a complete study session with XP, level up, pet update, and achievement check', async () => {
      // Mock the gamification service responses
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock XP award with level up
      mockSupabase.supabase.rpc.mockResolvedValueOnce({
        data: [{
          oldLevel: 3,
          newLevel: 4,
          totalXP: 550,
          levelUp: true
        }],
        error: null
      });

      // Mock achievement check
      mockSupabase.supabase.rpc.mockResolvedValueOnce({
        data: [{
          achievementId: 'level-up-4',
          achievementName: 'Level 4 Reached',
          xpAwarded: 50
        }],
        error: null
      });

      // Mock pet store update
      const mockPetStore = await import('../../store/petStore');
      mockPetStore.usePetStore.getState().updateFromStudyActivity.mockResolvedValue(undefined);

      // Execute the study activity
      const result = await gamificationService.handleStudyActivity(
        'test-user-id',
        'study_session',
        60, // 60 minutes
        'medium'
      );

      // Verify the complete workflow
      expect(result.xpAwarded).toBe(12); // 60 minutes / 5
      expect(result.levelUp).toBe(true);
      expect(result.petUpdated).toBe(true);

      // Verify all services were called correctly
      expect(mockSupabase.supabase.rpc).toHaveBeenCalledWith('award_xp', {
        p_user_id: 'test-user-id',
        p_xp_amount: 12,
        p_source: 'Study Session (60min)'
      });

      expect(mockSupabase.supabase.rpc).toHaveBeenCalledWith('check_and_award_achievements', {
        p_user_id: 'test-user-id'
      });

      expect(mockPetStore.usePetStore.getState().updateFromStudyActivity).toHaveBeenCalledWith(
        'test-user-id',
        'study_session',
        60
      );
    });

    it('should handle study session without level up', async () => {
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock XP award without level up
      mockSupabase.supabase.rpc.mockResolvedValueOnce({
        data: [{
          oldLevel: 3,
          newLevel: 3,
          totalXP: 470,
          levelUp: false
        }],
        error: null
      });

      // Mock no new achievements
      mockSupabase.supabase.rpc.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const result = await gamificationService.handleStudyActivity(
        'test-user-id',
        'study_session',
        30,
        'easy'
      );

      expect(result.xpAwarded).toBe(6); // 30 minutes / 5
      expect(result.levelUp).toBe(false);
      expect(result.petUpdated).toBe(true);
    });
  });

  describe('Quest Generation and Completion Workflow', () => {
    it('should generate quests from syllabus and complete them', async () => {
      const mockDbService = await import('../../services/database');
      
      // Mock quest creation
      mockDbService.questService.create.mockResolvedValue({
        id: 'quest-123',
        title: 'Daily Study Challenge: Variables and Data Types',
        type: 'daily',
        difficulty: 'easy',
        xp_reward: 20,
        created_at: new Date().toISOString()
      });

      // Generate quests from syllabus
      const generatedQuests = await questService.generateQuestsFromSyllabus(
        'course-1',
        mockCourse.syllabus
      );

      expect(generatedQuests.length).toBeGreaterThan(0);
      expect(generatedQuests[0].title).toContain('Variables and Data Types');
      expect(generatedQuests[0].type).toBe('daily');

      // Mock quest completion
      mockDbService.questService.complete.mockResolvedValue({
        data: {
          id: 'quest-123',
          user_id: 'test-user-id',
          difficulty: 'easy'
        }
      });

      const mockSupabase = await import('../../lib/supabase');
      mockSupabase.supabase.rpc.mockResolvedValueOnce({
        data: [{
          oldLevel: 3,
          newLevel: 3,
          totalXP: 470,
          levelUp: false
        }],
        error: null
      });

      // Complete the quest
      const completionResult = await questService.completeQuest('quest-123');

      expect(completionResult.xpAwarded).toBeGreaterThan(0);
      expect(completionResult.petUpdated).toBe(true);
    });

    it('should generate balanced quests across multiple courses', async () => {
      const courses = [mockCourse];
      const balancedQuests = questUtils.generateBalancedQuests(courses);

      expect(balancedQuests.length).toBeGreaterThan(0);
      
      // Should have different types of quests
      const questTypes = [...new Set(balancedQuests.map(q => q.type))];
      expect(questTypes.length).toBeGreaterThan(1);
      expect(questTypes).toContain('daily');
      expect(questTypes).toContain('weekly');
      expect(questTypes).toContain('milestone');

      // All quests should be properly formed
      balancedQuests.forEach(quest => {
        expect(quest.title).toBeTruthy();
        expect(quest.description).toBeTruthy();
        expect(quest.xpReward).toBeGreaterThan(0);
        expect(quest.requirements).toBeDefined();
        expect(quest.expiresAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('Pet Care and Evolution Workflow', () => {
    it('should handle pet adoption and care workflow', async () => {
      const mockDbService = await import('../../services/database');
      
      // Mock species data
      mockDbService.petSpeciesService.getById.mockResolvedValue({
        id: 'dragon',
        name: 'Study Dragon',
        base_happiness: 50,
        base_health: 50,
        evolution_stages: [
          { name: 'baby', requirements: { level: 1 } },
          { name: 'teen', requirements: { level: 5 } },
          { name: 'adult', requirements: { level: 10 } }
        ]
      });

      // Mock pet creation
      mockDbService.studyPetService.create.mockResolvedValue({
        id: 'pet-123',
        user_id: 'test-user-id',
        name: 'Buddy',
        species_id: 'dragon',
        level: 1,
        happiness: 50,
        health: 50,
        evolution_stage: 'baby'
      });

      // Adopt pet
      const adoptedPet = await petService.adoptPet('test-user-id', {
        name: 'Buddy',
        speciesId: 'dragon'
      });

      expect(adoptedPet.name).toBe('Buddy');
      expect(adoptedPet.speciesId).toBe('dragon');
      expect(adoptedPet.evolutionStage).toBe('baby');

      // Mock pet feeding
      mockDbService.studyPetService.getByUserId.mockResolvedValue({
        ...mockPet,
        happiness: 60,
        health: 70
      });

      mockDbService.studyPetService.update.mockResolvedValue({
        ...mockPet,
        happiness: 75,
        health: 80
      });

      // Feed pet
      const fedPet = await petService.feedPet('test-user-id');
      expect(fedPet.happiness).toBeGreaterThan(60);
      expect(fedPet.health).toBeGreaterThan(70);
    });

    it('should handle pet evolution when requirements are met', async () => {
      const mockDbService = await import('../../services/database');
      
      // Mock pet with evolution requirements met
      mockDbService.studyPetService.getByUserId.mockResolvedValue({
        ...mockPet,
        level: 5,
        evolution_stage: 'baby'
      });

      // Mock species with evolution stages
      mockDbService.petSpeciesService.getById.mockResolvedValue({
        id: 'dragon',
        evolution_stages: [
          { name: 'baby', requirements: { level: 1 } },
          { name: 'teen', requirements: { level: 5 } },
          { name: 'adult', requirements: { level: 10 } }
        ]
      });

      // Mock evolution update
      mockDbService.studyPetService.update.mockResolvedValue({
        ...mockPet,
        level: 5,
        evolution_stage: 'teen',
        happiness: 95 // Bonus happiness
      });

      // Check evolution
      const evolutionResult = await petService.checkAndEvolvePet('test-user-id');

      expect(evolutionResult.evolved).toBe(true);
      expect(evolutionResult.newStage).toBe('teen');
      expect(evolutionResult.pet.evolutionStage).toBe('teen');
    });
  });

  describe('Achievement System Integration', () => {
    it('should unlock achievements based on user activity', async () => {
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock achievement check returning new achievements
      mockSupabase.supabase.rpc.mockResolvedValue({
        data: [
          {
            achievementId: 'first-study-session',
            achievementName: 'First Steps',
            xpAwarded: 25
          },
          {
            achievementId: 'study-streak-3',
            achievementName: 'Getting Started',
            xpAwarded: 50
          }
        ],
        error: null
      });

      const newAchievements = await gamificationService.checkAchievements('test-user-id');

      expect(newAchievements).toHaveLength(2);
      expect(newAchievements[0].achievementName).toBe('First Steps');
      expect(newAchievements[1].achievementName).toBe('Getting Started');
      expect(newAchievements[0].xpAwarded).toBe(25);
      expect(newAchievements[1].xpAwarded).toBe(50);
    });

    it('should fetch user achievements with proper formatting', async () => {
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock achievement fetch
      mockSupabase.supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [
              {
                id: 'user-achievement-1',
                unlocked_at: '2024-01-15T10:00:00Z',
                progress: 100,
                achievement_definitions: {
                  id: 'first-study-session',
                  name: 'First Steps',
                  description: 'Complete your first study session',
                  category: 'study_time',
                  icon_url: '/achievements/first-steps.png',
                  xp_reward: 25,
                  rarity: 'common'
                }
              }
            ],
            error: null
          }))
        }))
      });

      const achievements = await gamificationService.fetchAchievements('test-user-id');

      expect(achievements).toHaveLength(1);
      expect(achievements[0].title).toBe('First Steps');
      expect(achievements[0].category).toBe('study_time');
      expect(achievements[0].xpReward).toBe(25);
      expect(achievements[0].unlockedAt).toBeInstanceOf(Date);
    });
  });

  describe('Streak Management Integration', () => {
    it('should update streak and award bonuses', async () => {
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock streak update with bonus
      mockSupabase.supabase.rpc.mockResolvedValue({
        data: [{
          streak_days: 7,
          bonus_awarded: true,
          bonus_xp: 50
        }],
        error: null
      });

      const streakResult = await gamificationService.updateStreak('test-user-id');

      expect(streakResult.streakDays).toBe(7);
      expect(streakResult.bonusAwarded).toBe(true);
      expect(streakResult.bonusXP).toBe(50);
    });

    it('should maintain streak without bonus for regular days', async () => {
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock streak update without bonus
      mockSupabase.supabase.rpc.mockResolvedValue({
        data: [{
          streak_days: 4,
          bonus_awarded: false,
          bonus_xp: 0
        }],
        error: null
      });

      const streakResult = await gamificationService.updateStreak('test-user-id');

      expect(streakResult.streakDays).toBe(4);
      expect(streakResult.bonusAwarded).toBe(false);
      expect(streakResult.bonusXP).toBe(0);
    });
  });

  describe('Level Progression Integration', () => {
    it('should calculate level progression correctly', () => {
      // Test level calculations
      expect(calculateLevelFromXP(0)).toBe(1);
      expect(calculateLevelFromXP(100)).toBe(2);
      expect(calculateLevelFromXP(400)).toBe(3);
      expect(calculateLevelFromXP(900)).toBe(4);

      // Test XP to next level
      expect(calculateXPToNextLevel(150)).toBe(250); // Level 2, need 250 more for level 3
      expect(calculateXPToNextLevel(500)).toBe(400); // Level 3, need 400 more for level 4
    });

    it('should handle level up notifications and rewards', async () => {
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock level up scenario
      mockSupabase.supabase.rpc.mockResolvedValueOnce({
        data: [{
          oldLevel: 4,
          newLevel: 5,
          totalXP: 1600,
          levelUp: true
        }],
        error: null
      });

      // Mock achievement for level up
      mockSupabase.supabase.rpc.mockResolvedValueOnce({
        data: [{
          achievementId: 'level-5',
          achievementName: 'Level 5 Master',
          xpAwarded: 100
        }],
        error: null
      });

      const result = await gamificationService.handleStudyActivity(
        'test-user-id',
        'quest_complete',
        undefined,
        'hard'
      );

      expect(result.levelUp).toBe(true);
      expect(result.xpAwarded).toBe(60); // Hard quest XP
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database errors gracefully', async () => {
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock database error
      mockSupabase.supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const result = await gamificationService.awardXP('test-user-id', 50, 'Test');
      expect(result).toBeNull();

      const streakResult = await gamificationService.updateStreak('test-user-id');
      expect(streakResult).toBeNull();
    });

    it('should handle missing user data', async () => {
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock no user data
      mockSupabase.supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      });

      const gameStats = await gamificationService.fetchGameStats('nonexistent-user');
      expect(gameStats).toBeNull();
    });

    it('should handle pet service failures gracefully', async () => {
      const mockPetStore = await import('../../store/petStore');
      
      // Mock pet update failure
      mockPetStore.usePetStore.getState().updateFromStudyActivity.mockRejectedValue(
        new Error('Pet update failed')
      );

      const mockSupabase = await import('../../lib/supabase');
      mockSupabase.supabase.rpc.mockResolvedValue({
        data: [{
          oldLevel: 3,
          newLevel: 3,
          totalXP: 470,
          levelUp: false
        }],
        error: null
      });

      const result = await gamificationService.handleStudyActivity(
        'test-user-id',
        'study_session',
        30,
        'medium'
      );

      expect(result.xpAwarded).toBe(6);
      expect(result.levelUp).toBe(false);
      expect(result.petUpdated).toBe(false); // Should handle failure gracefully
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent operations', async () => {
      const mockSupabase = await import('../../lib/supabase');
      
      // Mock successful responses for concurrent operations
      mockSupabase.supabase.rpc.mockResolvedValue({
        data: [{
          oldLevel: 3,
          newLevel: 3,
          totalXP: 500,
          levelUp: false
        }],
        error: null
      });

      // Execute multiple operations concurrently
      const operations = [
        gamificationService.handleStudyActivity('test-user-id', 'study_session', 30, 'medium'),
        gamificationService.handleStudyActivity('test-user-id', 'quest_complete', undefined, 'easy'),
        gamificationService.handleStudyActivity('test-user-id', 'todo_complete', undefined, 'medium')
      ];

      const results = await Promise.all(operations);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.xpAwarded).toBeGreaterThan(0);
        expect(typeof result.levelUp).toBe('boolean');
        expect(typeof result.petUpdated).toBe('boolean');
      });
    });

    it('should handle large quest generation efficiently', () => {
      // Create a course with many syllabus items
      const largeCourse: Course = {
        ...mockCourse,
        syllabus: Array.from({ length: 50 }, (_, i) => ({
          id: `item-${i}`,
          title: `Topic ${i}`,
          description: `Description for topic ${i}`,
          topics: [`subtopic-${i}-1`, `subtopic-${i}-2`],
          estimatedHours: Math.floor(Math.random() * 10) + 1,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          completed: Math.random() > 0.7
        }))
      };

      const startTime = Date.now();
      const quests = questUtils.generateBalancedQuests([largeCourse]);
      const endTime = Date.now();

      expect(quests.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});