import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performanceAnalysisService } from '../performanceAnalysisService';
import type { PerformanceConfig } from '../performanceAnalysisService';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }
}));

// Mock the database services
vi.mock('./database', () => ({
  courseService: {
    getByUserId: vi.fn()
  },
  studySessionService: {
    getByUserId: vi.fn()
  },
  questService: {
    getByUserId: vi.fn()
  }
}));

describe('PerformanceAnalysisService', () => {
  const mockUserId = 'test-user-id';
  const mockCourse = {
    id: 'course-1',
    name: 'Test Course',
    syllabus: [
      {
        id: 'topic-1',
        title: 'Topic 1',
        estimatedHours: 2,
        completed: false,
        priority: 'high',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        id: 'topic-2',
        title: 'Topic 2',
        estimatedHours: 3,
        completed: true,
        priority: 'medium'
      }
    ],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  };

  const mockStudySessions = [
    {
      id: 'session-1',
      duration: 60,
      started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      id: 'session-2',
      duration: 45,
      started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      id: 'session-3',
      duration: 90,
      started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    }
  ];

  const mockQuests = [
    {
      id: 'quest-1',
      status: 'completed',
      completed_at: new Date().toISOString()
    },
    {
      id: 'quest-2',
      status: 'completed',
      completed_at: new Date().toISOString()
    },
    {
      id: 'quest-3',
      status: 'available'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateStudyTimeScore', () => {
    it('should return 100 for study time within 20% of estimated time', () => {
      const totalEstimatedMinutes = 5 * 60; // 5 hours
      const studySessions = [
        { duration: 240 }, // 4 hours (80% of estimate)
        { duration: 60 }   // 1 hour
      ]; // Total: 5 hours (100% of estimate)

      const score = performanceAnalysisService.calculateStudyTimeScore(mockCourse, studySessions);
      expect(score).toBe(100);
    });

    it('should return 50 for courses with no estimated time', () => {
      const courseWithoutSyllabus = { ...mockCourse, syllabus: [] };
      const score = performanceAnalysisService.calculateStudyTimeScore(courseWithoutSyllabus, []);
      expect(score).toBe(50);
    });

    it('should return lower scores for study time far from estimate', () => {
      const totalEstimatedMinutes = 5 * 60; // 5 hours
      const studySessions = [{ duration: 30 }]; // 30 minutes (10% of estimate)

      const score = performanceAnalysisService.calculateStudyTimeScore(mockCourse, studySessions);
      expect(score).toBeLessThan(50);
    });
  });

  describe('calculateQuestCompletionScore', () => {
    it('should return 100 for all quests completed', () => {
      const allCompletedQuests = [
        { status: 'completed' },
        { status: 'completed' },
        { status: 'completed' }
      ];

      const score = performanceAnalysisService.calculateQuestCompletionScore(allCompletedQuests);
      expect(score).toBe(100);
    });

    it('should return 50 for no quests', () => {
      const score = performanceAnalysisService.calculateQuestCompletionScore([]);
      expect(score).toBe(50);
    });

    it('should calculate correct percentage for partial completion', () => {
      const score = performanceAnalysisService.calculateQuestCompletionScore(mockQuests);
      expect(score).toBe(67); // 2 out of 3 completed = 66.67% rounded to 67
    });
  });

  describe('calculateConsistencyScore', () => {
    it('should return 0 for no study sessions', () => {
      const score = performanceAnalysisService.calculateConsistencyScore([]);
      expect(score).toBe(0);
    });

    it('should calculate score based on study frequency', () => {
      const score = performanceAnalysisService.calculateConsistencyScore(mockStudySessions);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should apply penalty for gaps in studying', () => {
      const oldSessions = [
        {
          started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
        }
      ];

      const score = performanceAnalysisService.calculateConsistencyScore(oldSessions);
      expect(score).toBeLessThan(50); // Should be penalized for long gap
    });
  });

  describe('calculateDeadlineAdherenceScore', () => {
    it('should return 50 for courses with no deadlines', () => {
      const courseWithoutDeadlines = {
        ...mockCourse,
        syllabus: mockCourse.syllabus.map(item => ({ ...item, deadline: undefined }))
      };

      const score = performanceAnalysisService.calculateDeadlineAdherenceScore(courseWithoutDeadlines);
      expect(score).toBe(50);
    });

    it('should return 100 for completed items', () => {
      const courseWithCompletedItems = {
        ...mockCourse,
        syllabus: [
          {
            ...mockCourse.syllabus[0],
            completed: true,
            deadline: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday (would be overdue if not completed)
          }
        ]
      };

      const score = performanceAnalysisService.calculateDeadlineAdherenceScore(courseWithCompletedItems);
      expect(score).toBe(100);
    });

    it('should return 0 for overdue incomplete items', () => {
      const courseWithOverdueItems = {
        ...mockCourse,
        syllabus: [
          {
            ...mockCourse.syllabus[0],
            completed: false,
            deadline: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday (overdue)
          }
        ]
      };

      const score = performanceAnalysisService.calculateDeadlineAdherenceScore(courseWithOverdueItems);
      expect(score).toBe(0);
    });
  });

  describe('calculateOverallScore', () => {
    it('should calculate weighted average correctly', () => {
      const weights = {
        studyTime: 0.3,
        questCompletion: 0.25,
        consistency: 0.25,
        deadlineAdherence: 0.2
      };

      const score = performanceAnalysisService.calculateOverallScore(80, 70, 60, 90, weights);
      const expectedScore = (80 * 0.3) + (70 * 0.25) + (60 * 0.25) + (90 * 0.2);
      expect(score).toBe(Math.round(expectedScore));
    });
  });

  describe('determinePerformanceStatus', () => {
    const thresholds = {
      excellent: 85,
      good: 70,
      needsAttention: 50,
      critical: 30
    };

    it('should return excellent status for high scores', () => {
      const result = performanceAnalysisService.determinePerformanceStatus(90, thresholds);
      expect(result.status).toBe('excellent');
      expect(result.grade).toBe('A');
    });

    it('should return good status for medium-high scores', () => {
      const result = performanceAnalysisService.determinePerformanceStatus(75, thresholds);
      expect(result.status).toBe('good');
      expect(result.grade).toBe('B');
    });

    it('should return needs_attention status for medium scores', () => {
      const result = performanceAnalysisService.determinePerformanceStatus(55, thresholds);
      expect(result.status).toBe('needs_attention');
      expect(result.grade).toBe('C');
    });

    it('should return critical status for low scores', () => {
      const result = performanceAnalysisService.determinePerformanceStatus(25, thresholds);
      expect(result.status).toBe('critical');
      expect(result.grade).toBe('F');
    });
  });

  describe('shouldFlagSubject', () => {
    const criteria = {
      minPerformanceScore: 60,
      maxDaysSinceLastStudy: 7,
      minQuestCompletionRate: 0.4,
      minConsistencyScore: 50
    };

    it('should flag subjects with low performance scores', () => {
      const shouldFlag = performanceAnalysisService.shouldFlagSubject(50, mockStudySessions, mockQuests, criteria);
      expect(shouldFlag).toBe(true);
    });

    it('should flag subjects with no recent study activity', () => {
      const oldSessions = [
        {
          started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
        }
      ];

      const shouldFlag = performanceAnalysisService.shouldFlagSubject(70, oldSessions, mockQuests, criteria);
      expect(shouldFlag).toBe(true);
    });

    it('should flag subjects with low quest completion rates', () => {
      const lowCompletionQuests = [
        { status: 'completed' },
        { status: 'available' },
        { status: 'available' },
        { status: 'available' },
        { status: 'available' }
      ]; // 20% completion rate

      const shouldFlag = performanceAnalysisService.shouldFlagSubject(70, mockStudySessions, lowCompletionQuests, criteria);
      expect(shouldFlag).toBe(true);
    });

    it('should not flag subjects meeting all criteria', () => {
      const shouldFlag = performanceAnalysisService.shouldFlagSubject(80, mockStudySessions, mockQuests, criteria);
      expect(shouldFlag).toBe(false);
    });
  });

  describe('calculateStudyFrequency', () => {
    it('should return 0 for no study sessions', () => {
      const frequency = performanceAnalysisService.calculateStudyFrequency([]);
      expect(frequency).toBe(0);
    });

    it('should calculate sessions per week correctly', () => {
      // 3 sessions in the last 4 weeks = 0.75 sessions per week
      const frequency = performanceAnalysisService.calculateStudyFrequency(mockStudySessions);
      expect(frequency).toBeCloseTo(0.8, 1); // Rounded to 1 decimal place
    });
  });

  describe('generateRecommendations', () => {
    it('should generate study time recommendations for low scores', async () => {
      const recommendations = await performanceAnalysisService.generateRecommendations(
        mockCourse,
        mockStudySessions,
        mockQuests,
        60,
        {
          studyTimeScore: 40,
          questCompletionScore: 70,
          consistencyScore: 60,
          deadlineAdherenceScore: 80
        }
      );

      const studyTimeRec = recommendations.find(r => r.type === 'study_time');
      expect(studyTimeRec).toBeDefined();
      expect(studyTimeRec?.priority).toBe('high');
    });

    it('should generate consistency recommendations for irregular study patterns', async () => {
      const recommendations = await performanceAnalysisService.generateRecommendations(
        mockCourse,
        mockStudySessions,
        mockQuests,
        60,
        {
          studyTimeScore: 70,
          questCompletionScore: 70,
          consistencyScore: 30,
          deadlineAdherenceScore: 80
        }
      );

      const consistencyRec = recommendations.find(r => r.type === 'consistency');
      expect(consistencyRec).toBeDefined();
      expect(consistencyRec?.priority).toBe('high');
    });
  });

  describe('calculateConsistentStudyDays', () => {
    it('should calculate consecutive study days correctly', () => {
      const studySessions = [
        { started_at: new Date().toISOString() }, // Today
        { started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }, // Yesterday
        { started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }, // 2 days ago
        { started_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }  // 4 days ago (gap)
      ];

      const consecutiveDays = performanceAnalysisService.calculateConsistentStudyDays(studySessions);
      expect(consecutiveDays).toBe(3); // Today, yesterday, and 2 days ago
    });

    it('should return 0 for no recent study activity', () => {
      const oldSessions = [
        { started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() } // 10 days ago
      ];

      const consecutiveDays = performanceAnalysisService.calculateConsistentStudyDays(oldSessions);
      expect(consecutiveDays).toBe(0);
    });
  });
});

describe('Performance Analysis Integration', () => {
  it('should handle empty data gracefully', async () => {
    // Test the service with empty performances array directly
    const emptyPerformances: any[] = [];
    const priorities = await performanceAnalysisService.prioritizeSubjects(emptyPerformances);
    
    expect(priorities).toEqual([]);
    expect(priorities.length).toBe(0);
  });
});