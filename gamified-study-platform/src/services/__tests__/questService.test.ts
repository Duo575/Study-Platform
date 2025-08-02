/*
import questService from '../questService';
import questUtils from '../../utils/questUtils';
import type { SyllabusItem, Course } from '../../types';

// Mock the database service
jest.mock('../database', () => ({
  questService: {
    create: jest.fn(),
    getByUserId: jest.fn(),
    update: jest.fn(),
    complete: jest.fn()
  }
}));

// Mock the supabase lib
jest.mock('../../lib/supabase', () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({ id: 'test-user-id' }))
}));

// Mock the gamification service
jest.mock('../gamificationService', () => ({
  default: {
    handleStudyActivity: jest.fn(() => Promise.resolve({
      xpAwarded: 50,
      levelUp: false,
      petUpdated: true
    }))
  }
}));

describe('QuestService', () => {
  const mockSyllabus: SyllabusItem[] = [
    {
      id: '1',
      title: 'Introduction to Programming',
      description: 'Basic programming concepts',
      topics: ['Variables', 'Functions', 'Loops'],
      estimatedHours: 4,
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      title: 'Data Structures',
      description: 'Arrays, objects, and more',
      topics: ['Arrays', 'Objects', 'Maps'],
      estimatedHours: 6,
      priority: 'medium',
      completed: false
    }
  ];
  
  const mockCourse: Course = {
    id: 'course-1',
    name: 'JavaScript Fundamentals',
    description: 'Learn JavaScript basics',
    color: '#3B82F6',
    syllabus: mockSyllabus,
    progress: {
      completionPercentage: 25,
      hoursStudied: 2,
      topicsCompleted: 1,
      totalTopics: 6,
      lastStudied: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('generateDailyQuests', () => {
    it('should generate daily quests for active syllabus items', () => {
      const quests = questService.generateDailyQuests('course-1', mockSyllabus);
      
      expect(quests).toHaveLength(2);
      expect(quests[0].type).toBe('daily');
      expect(quests[0].difficulty).toBe('easy');
      expect(quests[1].type).toBe('daily');
      expect(quests[1].difficulty).toBe('medium');
    });
    
    it('should return empty array for completed syllabus', () => {
      const completedSyllabus = mockSyllabus.map(item => ({ ...item, completed: true }));
      const quests = questService.generateDailyQuests('course-1', completedSyllabus);
      
      expect(quests).toHaveLength(0);
    });
  });
  
  describe('generateWeeklyQuests', () => {
    it('should generate weekly quests including consistency challenge', () => {
      const quests = questService.generateWeeklyQuests('course-1', mockSyllabus);
      
      expect(quests).toHaveLength(2);
      expect(quests.some(q => q.type === 'weekly')).toBe(true);
      expect(quests.some(q => q.title?.includes('Consistency'))).toBe(true);
    });
  });
  
  describe('generateMilestoneQuests', () => {
    it('should generate milestone quests for each syllabus item', () => {
      const quests = questService.generateMilestoneQuests('course-1', mockSyllabus);
      
      expect(quests).toHaveLength(2);
      expect(quests.every(q => q.type === 'milestone')).toBe(true);
      expect(quests[0].difficulty).toBe('hard'); // High priority item
      expect(quests[1].difficulty).toBe('medium'); // Medium priority item
    });
  });
  
  describe('generateBonusQuests', () => {
    it('should generate bonus quests with appropriate rewards', () => {
      const quests = questService.generateBonusQuests('course-1');
      
      expect(quests).toHaveLength(2);
      expect(quests.every(q => q.type === 'bonus')).toBe(true);
      expect(quests.some(q => q.title?.includes('Streak'))).toBe(true);
      expect(quests.some(q => q.title?.includes('Task'))).toBe(true);
    });
  });
  
  describe('calculateCourseWeights', () => {
    it('should calculate weights based on course progress and priorities', () => {
      const courses = [mockCourse];
      const weights = questService.calculateCourseWeights(courses);
      
      expect(weights).toHaveLength(1);
      expect(weights[0].courseId).toBe('course-1');
      expect(weights[0].weight).toBeGreaterThan(0);
    });
    
    it('should give higher weight to courses with lower completion', () => {
      const lowProgressCourse = {
        ...mockCourse,
        id: 'course-2',
        progress: { ...mockCourse.progress, completionPercentage: 10 }
      };
      
      const highProgressCourse = {
        ...mockCourse,
        id: 'course-3',
        progress: { ...mockCourse.progress, completionPercentage: 80 }
      };
      
      const weights = questService.calculateCourseWeights([lowProgressCourse, highProgressCourse]);
      
      const lowProgressWeight = weights.find(w => w.courseId === 'course-2')?.weight || 0;
      const highProgressWeight = weights.find(w => w.courseId === 'course-3')?.weight || 0;
      
      expect(lowProgressWeight).toBeGreaterThan(highProgressWeight);
    });
  });
  
  describe('handleOverdueQuests', () => {
    it('should create catch-up quests for expired daily/weekly quests', async () => {
      const mockDbService = require('../database').questService;
      
      // Mock expired quests
      mockDbService.getByUserId.mockResolvedValue([
        {
          id: 'quest-1',
          title: 'Daily Study',
          type: 'daily',
          status: 'available',
          expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired yesterday
          requirements: [{ type: 'study_time', target: 30, current: 0 }],
          xp_reward: 20
        }
      ]);
      
      mockDbService.create.mockResolvedValue({ id: 'new-quest-1' });
      mockDbService.update.mockResolvedValue({});
      
      await questService.handleOverdueQuests('test-user-id');
      
      expect(mockDbService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Catch-up'),
          difficulty: 'easy',
          xp_reward: expect.any(Number)
        })
      );
      
      expect(mockDbService.update).toHaveBeenCalledWith('quest-1', { status: 'expired' });
    });
  });
  
  describe('updateQuestProgress', () => {
    it('should update quest requirements and complete quest when all requirements met', async () => {
      const mockDbService = require('../database').questService;
      
      // Mock quest with partial progress
      const mockQuest = {
        id: 'quest-1',
        title: 'Study Quest',
        requirements: [
          { type: 'study_time', target: 30, current: 20 }
        ],
        status: 'active',
        user_id: 'test-user-id',
        difficulty: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockDbService.update.mockResolvedValue(mockQuest);
      
      const result = await questService.updateQuestProgress('quest-1', 'study_time', 10);
      
      expect(result.requirements[0].current).toBe(30);
      expect(mockDbService.update).toHaveBeenCalledWith(
        'quest-1',
        expect.objectContaining({
          requirements: expect.arrayContaining([
            expect.objectContaining({ current: 30 })
          ])
        })
      );
    });
  });
});

describe('QuestUtils Integration', () => {
  describe('generateQuest', () => {
    it('should generate a complete quest object', () => {
      const quest = questUtils.generateQuest('daily', 'medium', 'course-1', 'JavaScript Basics');
      
      expect(quest).toMatchObject({
        type: 'daily',
        difficulty: 'medium',
        courseId: 'course-1',
        status: 'available',
        title: expect.stringContaining('JavaScript Basics'),
        description: expect.any(String),
        xpReward: expect.any(Number),
        requirements: expect.any(Array),
        expiresAt: expect.any(Date)
      });
    });
  });
  
  describe('calculateXpReward', () => {
    it('should calculate appropriate XP rewards based on type and difficulty', () => {
      expect(questUtils.calculateXpReward('daily', 'easy')).toBe(20);
      expect(questUtils.calculateXpReward('daily', 'medium')).toBe(30);
      expect(questUtils.calculateXpReward('daily', 'hard')).toBe(40);
      
      expect(questUtils.calculateXpReward('weekly', 'easy')).toBe(50);
      expect(questUtils.calculateXpReward('milestone', 'hard')).toBe(200);
      expect(questUtils.calculateXpReward('bonus', 'medium')).toBeGreaterThan(75);
    });
  });
  
  describe('generateBalancedQuests', () => {
    it('should generate quests distributed across courses', () => {
      const courses = [mockCourse];
      const quests = questUtils.generateBalancedQuests(courses);
      
      expect(quests.length).toBeGreaterThan(0);
      expect(quests.every(q => q.courseId === 'course-1')).toBe(true);
      
      // Should have different types of quests
      const questTypes = [...new Set(quests.map(q => q.type))];
      expect(questTypes.length).toBeGreaterThan(1);
    });
  });
});
*/
