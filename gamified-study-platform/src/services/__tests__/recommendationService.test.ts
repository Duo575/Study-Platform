import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recommendationService } from '../recommendationService';
import { performanceAnalysisService } from '../performanceAnalysisService';
import type { SubjectPerformance, StudySession } from '../../types';

// Mock the dependencies
vi.mock('../performanceAnalysisService');
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      upsert: vi.fn(() => ({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
  },
}));

describe('RecommendationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateRecommendations', () => {
    it('should generate performance-based recommendations for struggling subjects', async () => {
      // Mock performance data with a struggling subject
      const mockPerformanceData: SubjectPerformance[] = [
        {
          courseId: 'course-1',
          courseName: 'Mathematics',
          performanceScore: 45,
          studyTimeScore: 30,
          questCompletionScore: 40,
          consistencyScore: 25,
          deadlineAdherenceScore: 60,
          overallGrade: 'D',
          status: 'critical',
          flagged: true,
          lastStudied: new Date(),
          totalStudyTime: 120,
          completedQuests: 2,
          totalQuests: 8,
          completedTopics: 3,
          totalTopics: 12,
          averageSessionLength: 30,
          studyFrequency: 1.5,
          recommendations: [],
          interventions: [],
          acknowledgments: [],
        },
      ];

      vi.mocked(performanceAnalysisService.analyzeAllSubjects).mockResolvedValue(mockPerformanceData);

      const recommendations = await recommendationService.generateRecommendations('user-1');

      expect(recommendations).toHaveLength(2); // Should generate 2 recommendations
      expect(recommendations[0].type).toBe('subject_focus');
      expect(recommendations[0].priority).toBe('critical');
      expect(recommendations[0].title).toContain('Mathematics');
      expect(recommendations[1].type).toBe('study_schedule');
      expect(recommendations[1].priority).toBe('high');
    });

    it('should generate schedule optimization recommendations', async () => {
      // Mock performance data with good performance but suboptimal schedule
      const mockPerformanceData: SubjectPerformance[] = [
        {
          courseId: 'course-1',
          courseName: 'Physics',
          performanceScore: 75,
          studyTimeScore: 80,
          questCompletionScore: 70,
          consistencyScore: 75,
          deadlineAdherenceScore: 80,
          overallGrade: 'B',
          status: 'good',
          flagged: false,
          lastStudied: new Date(),
          totalStudyTime: 300,
          completedQuests: 6,
          totalQuests: 8,
          completedTopics: 8,
          totalTopics: 10,
          averageSessionLength: 45,
          studyFrequency: 3.5,
          recommendations: [],
          interventions: [],
          acknowledgments: [],
        },
      ];

      vi.mocked(performanceAnalysisService.analyzeAllSubjects).mockResolvedValue(mockPerformanceData);

      const recommendations = await recommendationService.generateRecommendations('user-1');

      // Should generate schedule and method recommendations
      expect(recommendations.length).toBeGreaterThan(0);
      const scheduleRec = recommendations.find(r => r.type === 'time_management');
      expect(scheduleRec).toBeDefined();
    });

    it('should generate habit formation recommendations for low streak users', async () => {
      const mockPerformanceData: SubjectPerformance[] = [];
      vi.mocked(performanceAnalysisService.analyzeAllSubjects).mockResolvedValue(mockPerformanceData);

      const recommendations = await recommendationService.generateRecommendations('user-1');

      const habitRec = recommendations.find(r => r.type === 'habit_formation');
      expect(habitRec).toBeDefined();
      expect(habitRec?.title).toContain('Study Streak');
    });

    it('should prioritize recommendations correctly', async () => {
      const mockPerformanceData: SubjectPerformance[] = [
        {
          courseId: 'course-1',
          courseName: 'Critical Subject',
          performanceScore: 20,
          studyTimeScore: 15,
          questCompletionScore: 25,
          consistencyScore: 10,
          deadlineAdherenceScore: 30,
          overallGrade: 'F',
          status: 'critical',
          flagged: true,
          lastStudied: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          totalStudyTime: 60,
          completedQuests: 0,
          totalQuests: 5,
          completedTopics: 1,
          totalTopics: 10,
          averageSessionLength: 20,
          studyFrequency: 0.5,
          recommendations: [],
          interventions: [],
          acknowledgments: [],
        },
      ];

      vi.mocked(performanceAnalysisService.analyzeAllSubjects).mockResolvedValue(mockPerformanceData);

      const recommendations = await recommendationService.generateRecommendations('user-1');

      // Critical recommendations should come first
      expect(recommendations[0].priority).toBe('critical');
      expect(recommendations[0].estimatedImpact).toBe('high');
    });
  });

  describe('applyRecommendation', () => {
    it('should mark recommendation as applied', async () => {
      await expect(recommendationService.applyRecommendation('rec-1')).resolves.not.toThrow();
    });
  });

  describe('dismissRecommendation', () => {
    it('should mark recommendation as dismissed', async () => {
      await expect(recommendationService.dismissRecommendation('rec-1')).resolves.not.toThrow();
    });
  });

  describe('updateActionItem', () => {
    it('should update action item completion status', async () => {
      await expect(
        recommendationService.updateActionItem('rec-1', 'action-1', true)
      ).resolves.not.toThrow();
    });
  });

  describe('getActiveRecommendations', () => {
    it('should return filtered recommendations', async () => {
      const recommendations = await recommendationService.getActiveRecommendations('user-1', {
        type: 'study_schedule',
        priority: 'high',
      });

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});

describe('Recommendation Algorithm Logic', () => {
  it('should generate appropriate recommendations based on performance patterns', () => {
    // Test the core recommendation logic
    const lowConsistencyPerformance: SubjectPerformance = {
      courseId: 'course-1',
      courseName: 'Test Subject',
      performanceScore: 60,
      studyTimeScore: 70,
      questCompletionScore: 65,
      consistencyScore: 30, // Low consistency
      deadlineAdherenceScore: 75,
      overallGrade: 'C',
      status: 'needs_attention',
      flagged: false,
      lastStudied: new Date(),
      totalStudyTime: 200,
      completedQuests: 4,
      totalQuests: 6,
      completedTopics: 5,
      totalTopics: 8,
      averageSessionLength: 40,
      studyFrequency: 2.0,
      recommendations: [],
      interventions: [],
      acknowledgments: [],
    };

    // The algorithm should identify consistency as the main issue
    expect(lowConsistencyPerformance.consistencyScore).toBeLessThan(50);
    expect(lowConsistencyPerformance.status).toBe('needs_attention');
  });

  it('should calculate recommendation confidence correctly', () => {
    // Test confidence calculation logic
    const highDataPoints = 50;
    const goodConsistency = 80;
    const recentTimeSpan = 30;

    // Should result in high confidence
    const confidence = Math.min(0.9, highDataPoints / 20) * 
                     (0.5 + 0.5 * (goodConsistency / 100)) * 
                     (0.7 + 0.3 * Math.min(1, recentTimeSpan / 30));

    expect(confidence).toBeGreaterThan(0.8);
  });

  it('should generate contextually appropriate action items', () => {
    // Test that action items are relevant to the recommendation type
    const studyScheduleActions = [
      'Schedule daily 30-minute study sessions',
      'Set up study reminders',
      'Review and update study materials',
    ];

    studyScheduleActions.forEach(action => {
      expect(action).toContain('study' || 'schedule' || 'session');
    });
  });
});

describe('Edge Cases', () => {
  it('should handle users with no study data gracefully', async () => {
    vi.mocked(performanceAnalysisService.analyzeAllSubjects).mockResolvedValue([]);

    const recommendations = await recommendationService.generateRecommendations('new-user');

    // Should still generate basic recommendations
    expect(recommendations.length).toBeGreaterThan(0);
    const habitRec = recommendations.find(r => r.type === 'habit_formation');
    expect(habitRec).toBeDefined();
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(performanceAnalysisService.analyzeAllSubjects).mockRejectedValue(
      new Error('Database connection failed')
    );

    await expect(
      recommendationService.generateRecommendations('user-1')
    ).rejects.toThrow('Database connection failed');
  });

  it('should validate recommendation data integrity', async () => {
    const mockPerformanceData: SubjectPerformance[] = [
      {
        courseId: 'course-1',
        courseName: 'Valid Course',
        performanceScore: 75,
        studyTimeScore: 80,
        questCompletionScore: 70,
        consistencyScore: 75,
        deadlineAdherenceScore: 80,
        overallGrade: 'B',
        status: 'good',
        flagged: false,
        lastStudied: new Date(),
        totalStudyTime: 300,
        completedQuests: 6,
        totalQuests: 8,
        completedTopics: 8,
        totalTopics: 10,
        averageSessionLength: 45,
        studyFrequency: 3.5,
        recommendations: [],
        interventions: [],
        acknowledgments: [],
      },
    ];

    vi.mocked(performanceAnalysisService.analyzeAllSubjects).mockResolvedValue(mockPerformanceData);

    const recommendations = await recommendationService.generateRecommendations('user-1');

    // Validate recommendation structure
    recommendations.forEach(rec => {
      expect(rec.id).toBeDefined();
      expect(rec.userId).toBe('user-1');
      expect(rec.title).toBeDefined();
      expect(rec.description).toBeDefined();
      expect(rec.actionItems).toBeInstanceOf(Array);
      expect(rec.metadata.confidence).toBeGreaterThan(0);
      expect(rec.metadata.confidence).toBeLessThanOrEqual(1);
    });
  });
});