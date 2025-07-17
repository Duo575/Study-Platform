import { describe, it, expect, beforeEach, vi } from 'vitest';
import questUtils from '../questUtils';
import type { Course, SyllabusItem, Quest } from '../../types';

// Mock Math.random for consistent testing
const mockMath = Object.create(global.Math);
mockMath.random = vi.fn(() => 0.5);
global.Math = mockMath;

describe('Quest Utils', () => {
  const mockSyllabusItems: SyllabusItem[] = [
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      description: 'Learn the basics of JavaScript',
      topics: ['Variables', 'Functions', 'Objects'],
      estimatedHours: 8,
      priority: 'high',
      completed: false,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    {
      id: '2',
      title: 'React Basics',
      description: 'Introduction to React',
      topics: ['Components', 'Props', 'State'],
      estimatedHours: 12,
      priority: 'medium',
      completed: false
    },
    {
      id: '3',
      title: 'Advanced Concepts',
      description: 'Advanced JavaScript concepts',
      topics: ['Closures', 'Promises', 'Async/Await'],
      estimatedHours: 15,
      priority: 'low',
      completed: true
    }
  ];

  const mockCourse: Course = {
    id: 'course-1',
    name: 'Web Development',
    description: 'Full stack web development course',
    color: '#3B82F6',
    syllabus: mockSyllabusItems,
    progress: {
      completionPercentage: 33,
      hoursStudied: 8,
      topicsCompleted: 3,
      totalTopics: 9,
      lastStudied: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Quest Title Generation', () => {
    it('should generate appropriate titles for different quest types', () => {
      const dailyTitle = questUtils.generateQuestTitle('daily', 'medium');
      const weeklyTitle = questUtils.generateQuestTitle('weekly', 'hard');
      const milestoneTitle = questUtils.generateQuestTitle('milestone', 'easy');
      const bonusTitle = questUtils.generateQuestTitle('bonus', 'medium');

      expect(typeof dailyTitle).toBe('string');
      expect(typeof weeklyTitle).toBe('string');
      expect(typeof milestoneTitle).toBe('string');
      expect(typeof bonusTitle).toBe('string');

      expect(dailyTitle.length).toBeGreaterThan(0);
      expect(weeklyTitle.length).toBeGreaterThan(0);
      expect(milestoneTitle.length).toBeGreaterThan(0);
      expect(bonusTitle.length).toBeGreaterThan(0);
    });

    it('should include topic in title when provided', () => {
      const titleWithTopic = questUtils.generateQuestTitle('daily', 'medium', 'JavaScript');
      expect(titleWithTopic).toContain('JavaScript');
    });

    it('should return consistent titles for same inputs', () => {
      // Since we mocked Math.random to return 0.5, results should be consistent
      const title1 = questUtils.generateQuestTitle('daily', 'medium', 'React');
      const title2 = questUtils.generateQuestTitle('daily', 'medium', 'React');
      expect(title1).toBe(title2);
    });
  });

  describe('Quest Description Generation', () => {
    it('should generate appropriate descriptions for different quest types', () => {
      const requirements = [
        { type: 'study_time', target: 30, current: 0, description: 'Study for 30 minutes' }
      ];

      const dailyDesc = questUtils.generateQuestDescription('daily', 'medium', requirements);
      const weeklyDesc = questUtils.generateQuestDescription('weekly', 'hard', requirements);
      const milestoneDesc = questUtils.generateQuestDescription('milestone', 'easy', requirements);
      const bonusDesc = questUtils.generateQuestDescription('bonus', 'medium', requirements);

      expect(dailyDesc).toContain('daily');
      expect(weeklyDesc).toContain('week');
      expect(milestoneDesc).toContain('achievement');
      expect(bonusDesc).toContain('bonus');
    });

    it('should include topic information when provided', () => {
      const requirements = [
        { type: 'study_time', target: 30, current: 0, description: 'Study for 30 minutes' }
      ];
      const description = questUtils.generateQuestDescription('daily', 'medium', requirements, 'JavaScript');
      expect(description).toContain('JavaScript');
    });

    it('should include difficulty information', () => {
      const requirements = [
        { type: 'study_time', target: 30, current: 0, description: 'Study for 30 minutes' }
      ];

      const easyDesc = questUtils.generateQuestDescription('daily', 'easy', requirements);
      const mediumDesc = questUtils.generateQuestDescription('daily', 'medium', requirements);
      const hardDesc = questUtils.generateQuestDescription('daily', 'hard', requirements);

      expect(easyDesc).toContain('easy');
      expect(mediumDesc).toContain('moderate');
      expect(hardDesc).toContain('challenging');
    });
  });

  describe('XP Reward Calculation', () => {
    it('should calculate correct XP rewards for different quest types and difficulties', () => {
      // Daily quests
      expect(questUtils.calculateXpReward('daily', 'easy')).toBe(20);
      expect(questUtils.calculateXpReward('daily', 'medium')).toBe(30);
      expect(questUtils.calculateXpReward('daily', 'hard')).toBe(40);

      // Weekly quests
      expect(questUtils.calculateXpReward('weekly', 'easy')).toBe(50);
      expect(questUtils.calculateXpReward('weekly', 'medium')).toBe(75);
      expect(questUtils.calculateXpReward('weekly', 'hard')).toBe(100);

      // Milestone quests
      expect(questUtils.calculateXpReward('milestone', 'easy')).toBe(100);
      expect(questUtils.calculateXpReward('milestone', 'medium')).toBe(150);
      expect(questUtils.calculateXpReward('milestone', 'hard')).toBe(200);

      // Bonus quests
      expect(questUtils.calculateXpReward('bonus', 'easy')).toBe(75);
      expect(questUtils.calculateXpReward('bonus', 'medium')).toBe(112); // 75 * 1.5 rounded
      expect(questUtils.calculateXpReward('bonus', 'hard')).toBe(150);
    });
  });

  describe('Quest Requirements Generation', () => {
    it('should generate appropriate requirements for daily quests', () => {
      const easyReqs = questUtils.generateRequirements('daily', 'easy');
      const mediumReqs = questUtils.generateRequirements('daily', 'medium', 'JavaScript');
      const hardReqs = questUtils.generateRequirements('daily', 'hard', 'React');

      expect(easyReqs).toHaveLength(1);
      expect(easyReqs[0].type).toBe('study_time');
      expect(easyReqs[0].target).toBe(15);

      expect(mediumReqs).toHaveLength(2);
      expect(mediumReqs[0].target).toBe(30);
      expect(mediumReqs[1].type).toBe('complete_topic');

      expect(hardReqs).toHaveLength(2);
      expect(hardReqs[0].target).toBe(45);
      expect(hardReqs[1].type).toBe('complete_topic');
    });

    it('should generate appropriate requirements for weekly quests', () => {
      const easyReqs = questUtils.generateRequirements('weekly', 'easy');
      const mediumReqs = questUtils.generateRequirements('weekly', 'medium');
      const hardReqs = questUtils.generateRequirements('weekly', 'hard');

      expect(easyReqs).toHaveLength(1);
      expect(easyReqs[0].target).toBe(60);

      expect(mediumReqs).toHaveLength(2);
      expect(mediumReqs[0].target).toBe(120);
      expect(mediumReqs[1].type).toBe('maintain_streak');
      expect(mediumReqs[1].target).toBe(3);

      expect(hardReqs).toHaveLength(2);
      expect(hardReqs[0].target).toBe(180);
      expect(hardReqs[1].target).toBe(5);
    });

    it('should generate appropriate requirements for milestone quests', () => {
      const easyReqs = questUtils.generateRequirements('milestone', 'easy');
      const mediumReqs = questUtils.generateRequirements('milestone', 'medium');
      const hardReqs = questUtils.generateRequirements('milestone', 'hard');

      expect(easyReqs).toHaveLength(2);
      expect(easyReqs[0].type).toBe('complete_topic');
      expect(easyReqs[0].target).toBe(1);
      expect(easyReqs[1].type).toBe('study_time');
      expect(easyReqs[1].target).toBe(90);

      expect(mediumReqs[0].target).toBe(2);
      expect(mediumReqs[1].target).toBe(180);

      expect(hardReqs[0].target).toBe(3);
      expect(hardReqs[1].target).toBe(300);
    });

    it('should generate appropriate requirements for bonus quests', () => {
      const easyReqs = questUtils.generateRequirements('bonus', 'easy');
      const mediumReqs = questUtils.generateRequirements('bonus', 'medium');
      const hardReqs = questUtils.generateRequirements('bonus', 'hard');

      expect(easyReqs).toHaveLength(1);
      expect(easyReqs[0].type).toBe('complete_tasks');
      expect(easyReqs[0].target).toBe(3);

      expect(mediumReqs[0].target).toBe(5);

      expect(hardReqs).toHaveLength(2);
      expect(hardReqs[0].target).toBe(10);
      expect(hardReqs[1].type).toBe('maintain_streak');
      expect(hardReqs[1].target).toBe(7);
    });
  });

  describe('Expiration Date Generation', () => {
    it('should generate appropriate expiration dates for different quest types', () => {
      const now = new Date();
      
      const dailyExpiration = questUtils.generateExpirationDate('daily');
      const weeklyExpiration = questUtils.generateExpirationDate('weekly');
      const milestoneExpiration = questUtils.generateExpirationDate('milestone');
      const bonusExpiration = questUtils.generateExpirationDate('bonus');

      // Daily quests should expire tomorrow
      expect(dailyExpiration.getTime()).toBeGreaterThan(now.getTime());
      expect(dailyExpiration.getTime() - now.getTime()).toBeLessThan(2 * 24 * 60 * 60 * 1000);

      // Weekly quests should expire in about 7 days
      expect(weeklyExpiration.getTime() - now.getTime()).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
      expect(weeklyExpiration.getTime() - now.getTime()).toBeLessThan(8 * 24 * 60 * 60 * 1000);

      // Milestone quests should expire in about 30 days
      expect(milestoneExpiration.getTime() - now.getTime()).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
      expect(milestoneExpiration.getTime() - now.getTime()).toBeLessThan(31 * 24 * 60 * 60 * 1000);

      // Bonus quests should expire in about 14 days
      expect(bonusExpiration.getTime() - now.getTime()).toBeGreaterThan(13 * 24 * 60 * 60 * 1000);
      expect(bonusExpiration.getTime() - now.getTime()).toBeLessThan(15 * 24 * 60 * 60 * 1000);
    });
  });

  describe('Complete Quest Generation', () => {
    it('should generate a complete quest object', () => {
      const quest = questUtils.generateQuest('daily', 'medium', 'course-1', 'JavaScript');

      expect(quest).toHaveProperty('title');
      expect(quest).toHaveProperty('description');
      expect(quest).toHaveProperty('type', 'daily');
      expect(quest).toHaveProperty('difficulty', 'medium');
      expect(quest).toHaveProperty('xpReward');
      expect(quest).toHaveProperty('requirements');
      expect(quest).toHaveProperty('status', 'available');
      expect(quest).toHaveProperty('courseId', 'course-1');
      expect(quest).toHaveProperty('expiresAt');

      expect(quest.title).toContain('JavaScript');
      expect(quest.description).toBeTruthy();
      expect(quest.xpReward).toBeGreaterThan(0);
      expect(Array.isArray(quest.requirements)).toBe(true);
      expect(quest.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('Course Quest Generation', () => {
    it('should generate quests for a course based on syllabus', () => {
      const quests = questUtils.generateQuestsForCourse('course-1', mockSyllabusItems);

      expect(Array.isArray(quests)).toBe(true);
      expect(quests.length).toBeGreaterThan(0);

      // Should have different types of quests
      const questTypes = [...new Set(quests.map(q => q.type))];
      expect(questTypes.length).toBeGreaterThan(1);

      // Should include daily, weekly, milestone quests
      expect(questTypes).toContain('daily');
      expect(questTypes).toContain('weekly');
      expect(questTypes).toContain('milestone');

      // All quests should have the correct course ID
      expect(quests.every(q => q.courseId === 'course-1')).toBe(true);
    });

    it('should return empty array for completed syllabus', () => {
      const completedSyllabus = mockSyllabusItems.map(item => ({ ...item, completed: true }));
      const quests = questUtils.generateQuestsForCourse('course-1', completedSyllabus);

      expect(quests).toHaveLength(0);
    });

    it('should generate bonus quests for high priority items', () => {
      const quests = questUtils.generateQuestsForCourse('course-1', mockSyllabusItems);
      const bonusQuests = quests.filter(q => q.type === 'bonus');

      expect(bonusQuests.length).toBeGreaterThan(0);
    });
  });

  describe('Course Weight Calculation', () => {
    it('should calculate weights based on course progress', () => {
      const courses = [mockCourse];
      const weights = questUtils.calculateCourseWeights(courses);

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
        progress: { ...mockCourse.progress, completionPercentage: 90 }
      };

      const weights = questUtils.calculateCourseWeights([lowProgressCourse, highProgressCourse]);

      const lowWeight = weights.find(w => w.courseId === 'course-2')?.weight || 0;
      const highWeight = weights.find(w => w.courseId === 'course-3')?.weight || 0;

      expect(lowWeight).toBeGreaterThan(highWeight);
    });

    it('should consider high priority items in weight calculation', () => {
      const highPriorityCourse = {
        ...mockCourse,
        id: 'course-high',
        syllabus: mockSyllabusItems.map(item => ({ ...item, priority: 'high' as const, completed: false }))
      };

      const lowPriorityCourse = {
        ...mockCourse,
        id: 'course-low',
        syllabus: mockSyllabusItems.map(item => ({ ...item, priority: 'low' as const, completed: false }))
      };

      const weights = questUtils.calculateCourseWeights([highPriorityCourse, lowPriorityCourse]);

      const highWeight = weights.find(w => w.courseId === 'course-high')?.weight || 0;
      const lowWeight = weights.find(w => w.courseId === 'course-low')?.weight || 0;

      expect(highWeight).toBeGreaterThan(lowWeight);
    });

    it('should consider deadlines in weight calculation', () => {
      const urgentCourse = {
        ...mockCourse,
        id: 'course-urgent',
        syllabus: [{
          ...mockSyllabusItems[0],
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          completed: false
        }]
      };

      const relaxedCourse = {
        ...mockCourse,
        id: 'course-relaxed',
        syllabus: [{
          ...mockSyllabusItems[0],
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          completed: false
        }]
      };

      const weights = questUtils.calculateCourseWeights([urgentCourse, relaxedCourse]);

      const urgentWeight = weights.find(w => w.courseId === 'course-urgent')?.weight || 0;
      const relaxedWeight = weights.find(w => w.courseId === 'course-relaxed')?.weight || 0;

      expect(urgentWeight).toBeGreaterThan(relaxedWeight);
    });
  });

  describe('Balanced Quest Generation', () => {
    it('should generate balanced quests across multiple courses', () => {
      const courses = [mockCourse];
      const quests = questUtils.generateBalancedQuests(courses);

      expect(Array.isArray(quests)).toBe(true);
      expect(quests.length).toBeGreaterThan(0);

      // All quests should have valid properties
      quests.forEach(quest => {
        expect(quest.courseId).toBeTruthy();
        expect(quest.type).toBeTruthy();
        expect(quest.difficulty).toBeTruthy();
        expect(quest.title).toBeTruthy();
        expect(quest.description).toBeTruthy();
      });
    });

    it('should return empty array for empty courses', () => {
      const quests = questUtils.generateBalancedQuests([]);
      expect(quests).toHaveLength(0);
    });

    it('should distribute quests based on course weights', () => {
      const course1 = { ...mockCourse, id: 'course-1', progress: { ...mockCourse.progress, completionPercentage: 10 } };
      const course2 = { ...mockCourse, id: 'course-2', progress: { ...mockCourse.progress, completionPercentage: 90 } };

      const quests = questUtils.generateBalancedQuests([course1, course2]);

      const course1Quests = quests.filter(q => q.courseId === 'course-1');
      const course2Quests = quests.filter(q => q.courseId === 'course-2');

      // Course with lower completion should get more quests
      expect(course1Quests.length).toBeGreaterThanOrEqual(course2Quests.length);
    });
  });

  describe('Quest Utility Functions', () => {
    const mockQuest: Quest = {
      id: 'quest-1',
      title: 'Test Quest',
      description: 'A test quest',
      type: 'daily',
      difficulty: 'medium',
      xpReward: 30,
      requirements: [
        { type: 'study_time', target: 30, current: 15, description: 'Study for 30 minutes' },
        { type: 'complete_topic', target: 1, current: 0, description: 'Complete 1 topic' }
      ],
      status: 'active',
      courseId: 'course-1',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    describe('isQuestCompletable', () => {
      it('should return false for completed or expired quests', () => {
        const completedQuest = { ...mockQuest, status: 'completed' as const };
        const expiredQuest = { ...mockQuest, status: 'expired' as const };

        expect(questUtils.isQuestCompletable(completedQuest)).toBe(false);
        expect(questUtils.isQuestCompletable(expiredQuest)).toBe(false);
      });

      it('should return true for quests with no requirements', () => {
        const noReqQuest = { ...mockQuest, requirements: [] };
        expect(questUtils.isQuestCompletable(noReqQuest)).toBe(true);
      });

      it('should return true when all requirements are met', () => {
        const completableQuest = {
          ...mockQuest,
          requirements: [
            { type: 'study_time', target: 30, current: 30, description: 'Study for 30 minutes' },
            { type: 'complete_topic', target: 1, current: 1, description: 'Complete 1 topic' }
          ]
        };

        expect(questUtils.isQuestCompletable(completableQuest)).toBe(true);
      });

      it('should return false when requirements are not met', () => {
        expect(questUtils.isQuestCompletable(mockQuest)).toBe(false);
      });
    });

    describe('calculateQuestProgress', () => {
      it('should return 100% for completed quests', () => {
        const completedQuest = { ...mockQuest, status: 'completed' as const };
        expect(questUtils.calculateQuestProgress(completedQuest)).toBe(100);
      });

      it('should return 0% for quests with no requirements', () => {
        const noReqQuest = { ...mockQuest, requirements: [] };
        expect(questUtils.calculateQuestProgress(noReqQuest)).toBe(0);
      });

      it('should calculate progress correctly', () => {
        // First requirement: 15/30 = 50%
        // Second requirement: 0/1 = 0%
        // Average: (50 + 0) / 2 = 25%
        expect(questUtils.calculateQuestProgress(mockQuest)).toBe(25);
      });

      it('should cap progress at 100%', () => {
        const overProgressQuest = {
          ...mockQuest,
          requirements: [
            { type: 'study_time', target: 30, current: 45, description: 'Study for 30 minutes' }
          ]
        };

        expect(questUtils.calculateQuestProgress(overProgressQuest)).toBe(100);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty syllabus gracefully', () => {
      const quests = questUtils.generateQuestsForCourse('course-1', []);
      expect(quests).toHaveLength(0);
    });

    it('should handle invalid quest types gracefully', () => {
      // @ts-ignore - Testing invalid input
      const expiration = questUtils.generateExpirationDate('invalid');
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle courses with no active syllabus items', () => {
      const completedCourse = {
        ...mockCourse,
        syllabus: mockSyllabusItems.map(item => ({ ...item, completed: true }))
      };

      const quests = questUtils.generateBalancedQuests([completedCourse]);
      expect(quests).toHaveLength(0);
    });

    it('should handle missing or invalid course data', () => {
      const invalidCourse = {
        ...mockCourse,
        syllabus: []
      };

      const weights = questUtils.calculateCourseWeights([invalidCourse]);
      expect(weights).toHaveLength(1);
      expect(weights[0].weight).toBeGreaterThan(0);
    });
  });
});