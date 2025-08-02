import { supabase } from '../lib/supabase';
import { courseService, studySessionService, questService } from './database';
import type { Course, StudySession, Quest, User, SyllabusItem } from '../types';

/**
 * Performance metrics for a subject/course
 */
export interface SubjectPerformance {
  courseId: string;
  courseName: string;
  performanceScore: number; // 0-100
  studyTimeScore: number; // 0-100
  questCompletionScore: number; // 0-100
  consistencyScore: number; // 0-100
  deadlineAdherenceScore: number; // 0-100
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
  flagged: boolean;
  lastStudied: Date | null;
  totalStudyTime: number; // in minutes
  completedQuests: number;
  totalQuests: number;
  completedTopics: number;
  totalTopics: number;
  averageSessionLength: number; // in minutes
  studyFrequency: number; // sessions per week
  recommendations: PerformanceRecommendation[];
  interventions: InterventionStrategy[];
  acknowledgments: ProgressAcknowledgment[];
}

/**
 * Performance recommendation
 */
export interface PerformanceRecommendation {
  id: string;
  type:
    | 'study_time'
    | 'consistency'
    | 'quest_focus'
    | 'deadline_management'
    | 'break_schedule';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
  timeToImplement: string;
  category: 'immediate' | 'short_term' | 'long_term';
}

/**
 * Intervention strategy for struggling subjects
 */
export interface InterventionStrategy {
  id: string;
  type:
    | 'intensive_study'
    | 'schedule_adjustment'
    | 'goal_modification'
    | 'resource_addition'
    | 'peer_support';
  urgency: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  steps: InterventionStep[];
  expectedOutcome: string;
  timeframe: string;
  successMetrics: string[];
}

/**
 * Individual step in an intervention strategy
 */
export interface InterventionStep {
  order: number;
  action: string;
  duration: string;
  resources?: string[];
  checkpoints?: string[];
}

/**
 * Progress acknowledgment for positive reinforcement
 */
export interface ProgressAcknowledgment {
  id: string;
  type: 'improvement' | 'milestone' | 'consistency' | 'achievement';
  title: string;
  message: string;
  celebrationLevel: 'small' | 'medium' | 'large';
  xpBonus?: number;
  badgeEarned?: string;
  createdAt: Date;
}

/**
 * Subject prioritization data
 */
export interface SubjectPriority {
  courseId: string;
  courseName: string;
  priorityScore: number; // 0-100
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  factors: PriorityFactor[];
  recommendedAction: string;
  timeAllocation: number; // percentage of total study time
}

/**
 * Factor contributing to subject priority
 */
export interface PriorityFactor {
  type:
    | 'deadline_proximity'
    | 'performance_gap'
    | 'importance_weight'
    | 'prerequisite_dependency';
  impact: number; // 0-100
  description: string;
}

/**
 * Performance analysis configuration
 */
export interface PerformanceConfig {
  thresholds: {
    excellent: number;
    good: number;
    needsAttention: number;
    critical: number;
  };
  weights: {
    studyTime: number;
    questCompletion: number;
    consistency: number;
    deadlineAdherence: number;
  };
  flaggingCriteria: {
    minPerformanceScore: number;
    maxDaysSinceLastStudy: number;
    minQuestCompletionRate: number;
    minConsistencyScore: number;
  };
}

/**
 * Default performance analysis configuration
 */
const DEFAULT_CONFIG: PerformanceConfig = {
  thresholds: {
    excellent: 85,
    good: 70,
    needsAttention: 50,
    critical: 30,
  },
  weights: {
    studyTime: 0.3,
    questCompletion: 0.25,
    consistency: 0.25,
    deadlineAdherence: 0.2,
  },
  flaggingCriteria: {
    minPerformanceScore: 60,
    maxDaysSinceLastStudy: 7,
    minQuestCompletionRate: 0.4,
    minConsistencyScore: 50,
  },
};

/**
 * Service for analyzing subject performance and providing recommendations
 */
export const performanceAnalysisService = {
  /**
   * Analyze performance for all user's subjects
   */
  async analyzeAllSubjects(
    userId: string,
    config: PerformanceConfig = DEFAULT_CONFIG
  ): Promise<SubjectPerformance[]> {
    try {
      // Get user's courses
      const courses = await courseService.getByUserId(userId);

      if (!courses || courses.length === 0) {
        return [];
      }

      // Analyze each course
      const performances: SubjectPerformance[] = [];

      for (const course of courses) {
        const performance = await this.analyzeSubjectPerformance(
          userId,
          course,
          config
        );
        performances.push(performance);
      }

      return performances.sort(
        (a, b) => b.performanceScore - a.performanceScore
      );
    } catch (error) {
      console.error('Error analyzing all subjects:', error);
      throw error;
    }
  },

  /**
   * Analyze performance for a specific subject
   */
  async analyzeSubjectPerformance(
    userId: string,
    course: any,
    config: PerformanceConfig = DEFAULT_CONFIG
  ): Promise<SubjectPerformance> {
    try {
      // Get study sessions for this course
      const studySessions = await this.getCourseStudySessions(
        userId,
        course.id
      );

      // Get quests for this course
      const quests = await this.getCourseQuests(userId, course.id);

      // Calculate individual scores
      const studyTimeScore = this.calculateStudyTimeScore(
        course,
        studySessions
      );
      const questCompletionScore = this.calculateQuestCompletionScore(quests);
      const consistencyScore = this.calculateConsistencyScore(studySessions);
      const deadlineAdherenceScore =
        this.calculateDeadlineAdherenceScore(course);

      // Calculate overall performance score
      const performanceScore = this.calculateOverallScore(
        studyTimeScore,
        questCompletionScore,
        consistencyScore,
        deadlineAdherenceScore,
        config.weights
      );

      // Determine status and grade
      const { status, grade } = this.determinePerformanceStatus(
        performanceScore,
        config.thresholds
      );

      // Check if subject should be flagged
      const flagged = this.shouldFlagSubject(
        performanceScore,
        studySessions,
        quests,
        config.flaggingCriteria
      );

      // Calculate additional metrics
      const totalStudyTime = studySessions.reduce(
        (total, session) => total + session.duration,
        0
      );
      const completedQuests = quests.filter(
        q => q.status === 'completed'
      ).length;
      const completedTopics =
        course.syllabus?.filter((item: SyllabusItem) => item.completed)
          .length || 0;
      const totalTopics = course.syllabus?.length || 0;
      const averageSessionLength =
        studySessions.length > 0 ? totalStudyTime / studySessions.length : 0;
      const studyFrequency = this.calculateStudyFrequency(studySessions);
      const lastStudied =
        studySessions.length > 0
          ? new Date(
              Math.max(
                ...studySessions.map(s => new Date(s.started_at).getTime())
              )
            )
          : null;

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        course,
        studySessions,
        quests,
        performanceScore,
        {
          studyTimeScore,
          questCompletionScore,
          consistencyScore,
          deadlineAdherenceScore,
        }
      );

      // Generate interventions if needed
      const interventions = flagged
        ? await this.generateInterventionStrategies(
            course,
            studySessions,
            quests,
            performanceScore
          )
        : [];

      // Generate acknowledgments for positive progress
      const acknowledgments = await this.generateProgressAcknowledgments(
        course,
        studySessions,
        quests,
        performanceScore
      );

      return {
        courseId: course.id,
        courseName: course.name,
        performanceScore,
        studyTimeScore,
        questCompletionScore,
        consistencyScore,
        deadlineAdherenceScore,
        overallGrade: grade,
        status,
        flagged,
        lastStudied,
        totalStudyTime,
        completedQuests,
        totalQuests: quests.length,
        completedTopics,
        totalTopics,
        averageSessionLength,
        studyFrequency,
        recommendations,
        interventions,
        acknowledgments,
      };
    } catch (error) {
      console.error('Error analyzing subject performance:', error);
      throw error;
    }
  },

  /**
   * Get study sessions for a specific course
   */
  async getCourseStudySessions(
    userId: string,
    courseId: string
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching course study sessions:', error);
      return [];
    }
  },

  /**
   * Get quests for a specific course
   */
  async getCourseQuests(userId: string, courseId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching course quests:', error);
      return [];
    }
  },

  /**
   * Calculate study time score based on expected vs actual study time
   */
  calculateStudyTimeScore(course: any, studySessions: any[]): number {
    const totalStudyTime = studySessions.reduce(
      (total, session) => total + session.duration,
      0
    );
    const totalEstimatedTime =
      course.syllabus?.reduce(
        (total: number, item: SyllabusItem) => total + item.estimatedHours * 60,
        0
      ) || 0;

    if (totalEstimatedTime === 0) return 50; // Default score if no estimate

    const ratio = totalStudyTime / totalEstimatedTime;

    // Score based on how close to estimated time
    if (ratio >= 0.8 && ratio <= 1.2) return 100; // Within 20% of estimate
    if (ratio >= 0.6 && ratio <= 1.4) return 80; // Within 40% of estimate
    if (ratio >= 0.4 && ratio <= 1.6) return 60; // Within 60% of estimate
    if (ratio >= 0.2 && ratio <= 1.8) return 40; // Within 80% of estimate
    return 20; // Far from estimate
  },

  /**
   * Calculate quest completion score
   */
  calculateQuestCompletionScore(quests: any[]): number {
    if (quests.length === 0) return 50; // Default score if no quests

    const completedQuests = quests.filter(q => q.status === 'completed').length;
    const completionRate = completedQuests / quests.length;

    return Math.round(completionRate * 100);
  },

  /**
   * Calculate consistency score based on study frequency and regularity
   */
  calculateConsistencyScore(studySessions: any[]): number {
    if (studySessions.length === 0) return 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get sessions from last 30 days
    const recentSessions = studySessions.filter(
      session => new Date(session.started_at) >= thirtyDaysAgo
    );

    if (recentSessions.length === 0) return 0;

    // Calculate study days
    const studyDays = new Set(
      recentSessions.map(session => new Date(session.started_at).toDateString())
    ).size;

    // Calculate consistency score (study days out of 30)
    const consistencyRatio = studyDays / 30;

    // Bonus for recent activity
    const daysSinceLastStudy = Math.floor(
      (now.getTime() - new Date(recentSessions[0].started_at).getTime()) /
        (24 * 60 * 60 * 1000)
    );

    let score = consistencyRatio * 100;

    // Penalty for gaps in studying
    if (daysSinceLastStudy > 7) score *= 0.5;
    else if (daysSinceLastStudy > 3) score *= 0.8;

    return Math.round(Math.min(100, score));
  },

  /**
   * Calculate deadline adherence score
   */
  calculateDeadlineAdherenceScore(course: any): number {
    if (!course.syllabus || course.syllabus.length === 0) return 50;

    const itemsWithDeadlines = course.syllabus.filter(
      (item: SyllabusItem) => item.deadline
    );

    if (itemsWithDeadlines.length === 0) return 50; // No deadlines to evaluate

    let totalScore = 0;
    const now = new Date();

    for (const item of itemsWithDeadlines) {
      const deadline = new Date(item.deadline!);
      const isOverdue = now > deadline;

      if (item.completed) {
        totalScore += 100; // Completed on time
      } else if (isOverdue) {
        totalScore += 0; // Overdue and not completed
      } else {
        // Not completed but not overdue - score based on time remaining
        const timeRemaining = deadline.getTime() - now.getTime();
        const totalTime =
          deadline.getTime() - new Date(course.created_at).getTime();
        const timeRatio = timeRemaining / totalTime;

        if (timeRatio > 0.5)
          totalScore += 80; // Plenty of time
        else if (timeRatio > 0.25)
          totalScore += 60; // Some time left
        else totalScore += 30; // Running out of time
      }
    }

    return Math.round(totalScore / itemsWithDeadlines.length);
  },

  /**
   * Calculate overall performance score using weighted average
   */
  calculateOverallScore(
    studyTimeScore: number,
    questCompletionScore: number,
    consistencyScore: number,
    deadlineAdherenceScore: number,
    weights: PerformanceConfig['weights']
  ): number {
    const weightedScore =
      studyTimeScore * weights.studyTime +
      questCompletionScore * weights.questCompletion +
      consistencyScore * weights.consistency +
      deadlineAdherenceScore * weights.deadlineAdherence;

    return Math.round(weightedScore);
  },

  /**
   * Determine performance status and grade
   */
  determinePerformanceStatus(
    score: number,
    thresholds: PerformanceConfig['thresholds']
  ): {
    status: SubjectPerformance['status'];
    grade: SubjectPerformance['overallGrade'];
  } {
    if (score >= thresholds.excellent) {
      return { status: 'excellent', grade: 'A' };
    } else if (score >= thresholds.good) {
      return { status: 'good', grade: 'B' };
    } else if (score >= thresholds.needsAttention) {
      return { status: 'needs_attention', grade: 'C' };
    } else if (score >= thresholds.critical) {
      return { status: 'critical', grade: 'D' };
    } else {
      return { status: 'critical', grade: 'F' };
    }
  },

  /**
   * Check if subject should be flagged for attention
   */
  shouldFlagSubject(
    performanceScore: number,
    studySessions: any[],
    quests: any[],
    criteria: PerformanceConfig['flaggingCriteria']
  ): boolean {
    // Flag if performance score is below threshold
    if (performanceScore < criteria.minPerformanceScore) return true;

    // Flag if no recent study activity
    if (studySessions.length > 0) {
      const daysSinceLastStudy = Math.floor(
        (Date.now() - new Date(studySessions[0].started_at).getTime()) /
          (24 * 60 * 60 * 1000)
      );
      if (daysSinceLastStudy > criteria.maxDaysSinceLastStudy) return true;
    } else {
      return true; // No study sessions at all
    }

    // Flag if quest completion rate is too low
    if (quests.length > 0) {
      const completionRate =
        quests.filter(q => q.status === 'completed').length / quests.length;
      if (completionRate < criteria.minQuestCompletionRate) return true;
    }

    return false;
  },

  /**
   * Calculate study frequency (sessions per week)
   */
  calculateStudyFrequency(studySessions: any[]): number {
    if (studySessions.length === 0) return 0;

    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const recentSessions = studySessions.filter(
      session => new Date(session.started_at) >= fourWeeksAgo
    );

    return Math.round((recentSessions.length / 4) * 10) / 10; // Sessions per week
  },

  /**
   * Generate performance recommendations
   */
  async generateRecommendations(
    course: any,
    studySessions: any[],
    quests: any[],
    performanceScore: number,
    scores: {
      studyTimeScore: number;
      questCompletionScore: number;
      consistencyScore: number;
      deadlineAdherenceScore: number;
    }
  ): Promise<PerformanceRecommendation[]> {
    const recommendations: PerformanceRecommendation[] = [];

    // Study time recommendations
    if (scores.studyTimeScore < 60) {
      recommendations.push({
        id: `study-time-${course.id}`,
        type: 'study_time',
        priority: 'high',
        title: 'Increase Study Time',
        description:
          'Your study time is below the recommended amount for this subject.',
        actionItems: [
          'Schedule dedicated study blocks for this subject',
          'Use the Pomodoro technique for focused sessions',
          'Set daily study time goals',
          'Track your progress to stay motivated',
        ],
        estimatedImpact: 'high',
        timeToImplement: '1-2 weeks',
        category: 'immediate',
      });
    }

    // Consistency recommendations
    if (scores.consistencyScore < 50) {
      recommendations.push({
        id: `consistency-${course.id}`,
        type: 'consistency',
        priority: 'high',
        title: 'Improve Study Consistency',
        description:
          'Regular study sessions will improve retention and reduce cramming.',
        actionItems: [
          'Create a weekly study schedule',
          'Set up study reminders',
          'Start with shorter, more frequent sessions',
          'Use habit stacking to build consistency',
        ],
        estimatedImpact: 'high',
        timeToImplement: '2-3 weeks',
        category: 'short_term',
      });
    }

    return recommendations;
  },

  /**
   * Generate intervention strategies for struggling subjects
   */
  async generateInterventionStrategies(
    course: any,
    studySessions: any[],
    quests: any[],
    performanceScore: number
  ): Promise<InterventionStrategy[]> {
    const interventions: InterventionStrategy[] = [];

    if (performanceScore < 30) {
      interventions.push({
        id: `critical-${course.id}`,
        type: 'intensive_study',
        urgency: 'critical',
        title: 'Intensive Study Recovery Plan',
        description:
          'This subject requires immediate attention with an intensive recovery approach.',
        steps: [
          {
            order: 1,
            action: 'Conduct a comprehensive subject assessment',
            duration: '1 day',
          },
        ],
        expectedOutcome: 'Bring performance score above 50 within 3 weeks',
        timeframe: '3 weeks',
        successMetrics: ['Performance score increase of 25+ points'],
      });
    }

    return interventions;
  },

  /**
   * Generate progress acknowledgments
   */
  async generateProgressAcknowledgments(
    course: any,
    studySessions: any[],
    quests: any[],
    performanceScore: number
  ): Promise<ProgressAcknowledgment[]> {
    const acknowledgments: ProgressAcknowledgment[] = [];

    if (performanceScore > 85) {
      acknowledgments.push({
        id: `excellent-${course.id}`,
        type: 'achievement',
        title: 'Excellent Performance!',
        message: `Outstanding work in ${course.name}! You're performing at an excellent level.`,
        celebrationLevel: 'large',
        xpBonus: 50,
        createdAt: new Date(),
      });
    }

    return acknowledgments;
  },

  /**
   * Calculate consecutive study days
   */
  calculateConsistentStudyDays(studySessions: any[]): number {
    if (studySessions.length === 0) return 0;

    const studyDates = [
      ...new Set(
        studySessions.map(session =>
          new Date(session.started_at).toDateString()
        )
      ),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let consecutiveDays = 1;
    const today = new Date().toDateString();

    if (studyDates[0] !== today) {
      const yesterday = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toDateString();
      if (studyDates[0] !== yesterday) return 0;
    }

    for (let i = 1; i < studyDates.length; i++) {
      const currentDate = new Date(studyDates[i - 1]);
      const previousDate = new Date(studyDates[i]);
      const dayDiff = Math.floor(
        (currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (dayDiff === 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays;
  },

  /**
   * Prioritize subjects based on performance and urgency
   */
  async prioritizeSubjects(
    performances: SubjectPerformance[]
  ): Promise<SubjectPriority[]> {
    const priorities: SubjectPriority[] = [];

    for (const performance of performances) {
      const factors: PriorityFactor[] = [];
      let priorityScore = 0;

      // Factor 1: Performance gap (lower performance = higher priority)
      const performanceGap = 100 - performance.performanceScore;
      const performanceImpact = performanceGap * 0.4;
      factors.push({
        type: 'performance_gap',
        impact: performanceImpact,
        description: `Performance score is ${performance.performanceScore}/100`,
      });
      priorityScore += performanceImpact;

      // Determine urgency level
      let urgencyLevel: SubjectPriority['urgencyLevel'];
      if (priorityScore >= 80) urgencyLevel = 'critical';
      else if (priorityScore >= 60) urgencyLevel = 'high';
      else if (priorityScore >= 40) urgencyLevel = 'medium';
      else urgencyLevel = 'low';

      // Generate recommended action
      let recommendedAction: string;
      if (urgencyLevel === 'critical') {
        recommendedAction = 'Immediate intensive study required';
      } else if (urgencyLevel === 'high') {
        recommendedAction = 'Increase focus and study time';
      } else {
        recommendedAction = 'Continue current approach';
      }

      // Calculate time allocation percentage
      const totalPriorityScore = performances.reduce(
        (sum, p) => sum + (100 - p.performanceScore),
        0
      );
      const timeAllocation =
        totalPriorityScore > 0
          ? Math.round((performanceGap / totalPriorityScore) * 100)
          : Math.round(100 / performances.length);

      priorities.push({
        courseId: performance.courseId,
        courseName: performance.courseName,
        priorityScore: Math.round(priorityScore),
        urgencyLevel,
        factors,
        recommendedAction,
        timeAllocation: Math.min(50, Math.max(10, timeAllocation)),
      });
    }

    return priorities.sort((a, b) => b.priorityScore - a.priorityScore);
  },

  /**
   * Get performance summary for dashboard
   */
  async getPerformanceSummary(userId: string): Promise<{
    overallGPA: number;
    subjectsNeedingAttention: number;
    flaggedSubjects: number;
    totalRecommendations: number;
    consistencyScore: number;
    improvementTrend: 'improving' | 'stable' | 'declining';
  }> {
    try {
      const performances = await this.analyzeAllSubjects(userId);

      if (performances.length === 0) {
        return {
          overallGPA: 0,
          subjectsNeedingAttention: 0,
          flaggedSubjects: 0,
          totalRecommendations: 0,
          consistencyScore: 0,
          improvementTrend: 'stable',
        };
      }

      // Calculate GPA (A=4, B=3, C=2, D=1, F=0)
      const gradePoints = performances.map(p => {
        switch (p.overallGrade) {
          case 'A':
            return 4;
          case 'B':
            return 3;
          case 'C':
            return 2;
          case 'D':
            return 1;
          case 'F':
            return 0;
          default:
            return 0;
        }
      });
      const overallGPA =
        gradePoints.reduce((sum: number, points) => sum + points, 0) /
        gradePoints.length;

      const subjectsNeedingAttention = performances.filter(
        p => p.status === 'needs_attention' || p.status === 'critical'
      ).length;

      const flaggedSubjects = performances.filter(p => p.flagged).length;

      const totalRecommendations = performances.reduce(
        (sum, p) => sum + p.recommendations.length,
        0
      );

      const consistencyScore = Math.round(
        performances.reduce((sum, p) => sum + p.consistencyScore, 0) /
          performances.length
      );

      // Simple trend calculation
      const averageScore =
        performances.reduce((sum, p) => sum + p.performanceScore, 0) /
        performances.length;
      let improvementTrend: 'improving' | 'stable' | 'declining';
      if (averageScore >= 75) improvementTrend = 'improving';
      else if (averageScore >= 60) improvementTrend = 'stable';
      else improvementTrend = 'declining';

      return {
        overallGPA: Math.round(overallGPA * 100) / 100,
        subjectsNeedingAttention,
        flaggedSubjects,
        totalRecommendations,
        consistencyScore,
        improvementTrend,
      };
    } catch (error) {
      console.error('Error getting performance summary:', error);
      throw error;
    }
  },
};

export default performanceAnalysisService;
