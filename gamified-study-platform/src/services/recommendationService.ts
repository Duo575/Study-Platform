import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { performanceAnalysisService } from './performanceAnalysisService';
import { aiService } from './aiService';
import type {
  User,
  Course,
  StudySession,
  Quest,
  TodoItem,
  PomodoroSession,
  StudentLearningProfile,
  SubjectPerformance,
  StudyAnalytics,
  AIInsight,
} from '../types';

/**
 * Smart study recommendation types
 */
export interface StudyRecommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  reasoning: string;
  actionItems: ActionItem[];
  estimatedImpact: ImpactLevel;
  timeToImplement: string;
  category: RecommendationCategory;
  context: RecommendationContext;
  metadata: RecommendationMetadata;
  isActive: boolean;
  isApplied: boolean;
  isDismissed: boolean;
  createdAt: Date;
  appliedAt?: Date;
  dismissedAt?: Date;
  expiresAt?: Date;
}

export type RecommendationType = 
  | 'study_schedule'
  | 'subject_focus'
  | 'study_method'
  | 'break_optimization'
  | 'goal_adjustment'
  | 'resource_suggestion'
  | 'habit_formation'
  | 'performance_boost'
  | 'time_management'
  | 'motivation_enhancement';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type ImpactLevel = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'immediate' | 'short_term' | 'long_term' | 'ongoing';

export interface ActionItem {
  id: string;
  description: string;
  type: 'task' | 'habit' | 'setting' | 'resource';
  estimatedTime?: number; // in minutes
  isCompleted: boolean;
  completedAt?: Date;
}

export interface RecommendationContext {
  courseId?: string;
  courseName?: string;
  currentPerformance?: number;
  recentActivity?: string[];
  timeOfDay?: string;
  studyStreak?: number;
  upcomingDeadlines?: Date[];
}

export interface RecommendationMetadata {
  confidence: number; // 0-1
  dataPoints: string[];
  algorithmVersion: string;
  personalizedFactors: string[];
  relatedInsights?: string[];
}

export interface RecommendationEngine {
  userId: string;
  learningProfile: StudentLearningProfile;
  performanceData: SubjectPerformance[];
  studyAnalytics: StudyAnalytics;
  recentSessions: StudySession[];
  activeGoals: string[];
  preferences: UserStudyPreferences;
}

export interface UserStudyPreferences {
  preferredStudyTimes: string[];
  maxSessionLength: number;
  breakFrequency: number;
  difficultyPreference: 'gradual' | 'challenging' | 'mixed';
  motivationStyle: 'competitive' | 'collaborative' | 'personal';
  reminderFrequency: 'high' | 'medium' | 'low';
}

export interface RecommendationFilters {
  type?: RecommendationType;
  priority?: RecommendationPriority;
  category?: RecommendationCategory;
  isActive?: boolean;
  courseId?: string;
}

/**
 * Smart Study Recommendations Service
 */
class RecommendationService {
  private readonly ALGORITHM_VERSION = '1.0.0';

  /**
   * Generate personalized study recommendations for a user
   */
  async generateRecommendations(userId: string): Promise<StudyRecommendation[]> {
    try {
      // Gather user data
      const engine = await this.buildRecommendationEngine(userId);
      
      // Generate different types of recommendations
      const recommendations: StudyRecommendation[] = [];
      
      // Performance-based recommendations
      const performanceRecs = await this.generatePerformanceRecommendations(engine);
      recommendations.push(...performanceRecs);
      
      // Schedule optimization recommendations
      const scheduleRecs = await this.generateScheduleRecommendations(engine);
      recommendations.push(...scheduleRecs);
      
      // Study method recommendations
      const methodRecs = await this.generateStudyMethodRecommendations(engine);
      recommendations.push(...methodRecs);
      
      // Habit formation recommendations
      const habitRecs = await this.generateHabitRecommendations(engine);
      recommendations.push(...habitRecs);
      
      // Goal adjustment recommendations
      const goalRecs = await this.generateGoalRecommendations(engine);
      recommendations.push(...goalRecs);
      
      // Sort by priority and impact
      const sortedRecommendations = this.prioritizeRecommendations(recommendations);
      
      // Store recommendations in database
      await this.storeRecommendations(sortedRecommendations);
      
      return sortedRecommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Build recommendation engine with user data
   */
  private async buildRecommendationEngine(userId: string): Promise<RecommendationEngine> {
    // Get performance data
    const performanceData = await performanceAnalysisService.analyzeAllSubjects(userId);
    
    // Get study analytics
    const studyAnalytics = await this.getStudyAnalytics(userId);
    
    // Get recent study sessions
    const recentSessions = await this.getRecentStudySessions(userId, 30);
    
    // Get user learning profile (mock for now)
    const learningProfile = await this.getUserLearningProfile(userId);
    
    // Get user preferences
    const preferences = await this.getUserStudyPreferences(userId);
    
    // Get active goals
    const activeGoals = await this.getActiveGoals(userId);

    return {
      userId,
      learningProfile,
      performanceData,
      studyAnalytics,
      recentSessions,
      activeGoals,
      preferences,
    };
  }

  /**
   * Generate performance-based recommendations
   */
  private async generatePerformanceRecommendations(engine: RecommendationEngine): Promise<StudyRecommendation[]> {
    const recommendations: StudyRecommendation[] = [];
    
    // Find struggling subjects
    const strugglingSubjects = engine.performanceData.filter(p => p.status === 'critical' || p.status === 'needs_attention');
    
    for (const subject of strugglingSubjects) {
      if (subject.consistencyScore < 50) {
        recommendations.push({
          id: uuidv4(),
          userId: engine.userId,
          type: 'subject_focus',
          priority: subject.status === 'critical' ? 'critical' : 'high',
          title: `Boost ${subject.courseName} Performance`,
          description: `Your ${subject.courseName} performance needs attention. Focus on consistency and regular study sessions.`,
          reasoning: `Consistency score is ${subject.consistencyScore}/100, which is below the recommended threshold.`,
          actionItems: [
            {
              id: uuidv4(),
              description: `Schedule daily 30-minute study sessions for ${subject.courseName}`,
              type: 'habit',
              estimatedTime: 30,
              isCompleted: false,
            },
            {
              id: uuidv4(),
              description: 'Set up study reminders for this subject',
              type: 'setting',
              isCompleted: false,
            },
            {
              id: uuidv4(),
              description: 'Review and update study materials',
              type: 'task',
              estimatedTime: 15,
              isCompleted: false,
            },
          ],
          estimatedImpact: 'high',
          timeToImplement: '1-2 weeks',
          category: 'immediate',
          context: {
            courseId: subject.courseId,
            courseName: subject.courseName,
            currentPerformance: subject.performanceScore,
          },
          metadata: {
            confidence: 0.85,
            dataPoints: ['consistency_score', 'performance_score', 'study_frequency'],
            algorithmVersion: this.ALGORITHM_VERSION,
            personalizedFactors: ['low_consistency', 'irregular_study_pattern'],
          },
          isActive: true,
          isApplied: false,
          isDismissed: false,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        });
      }
      
      if (subject.studyFrequency < 2) {
        recommendations.push({
          id: uuidv4(),
          userId: engine.userId,
          type: 'study_schedule',
          priority: 'high',
          title: `Increase Study Frequency for ${subject.courseName}`,
          description: `You're only studying ${subject.courseName} ${subject.studyFrequency} times per week. Aim for at least 3-4 sessions.`,
          reasoning: `Research shows that frequent, shorter study sessions are more effective than infrequent, long sessions.`,
          actionItems: [
            {
              id: uuidv4(),
              description: 'Add 2 more study sessions per week',
              type: 'habit',
              isCompleted: false,
            },
            {
              id: uuidv4(),
              description: 'Use spaced repetition for better retention',
              type: 'task',
              isCompleted: false,
            },
          ],
          estimatedImpact: 'high',
          timeToImplement: '1 week',
          category: 'short_term',
          context: {
            courseId: subject.courseId,
            courseName: subject.courseName,
            currentPerformance: subject.performanceScore,
          },
          metadata: {
            confidence: 0.9,
            dataPoints: ['study_frequency', 'session_distribution'],
            algorithmVersion: this.ALGORITHM_VERSION,
            personalizedFactors: ['low_frequency', 'spaced_repetition_opportunity'],
          },
          isActive: true,
          isApplied: false,
          isDismissed: false,
          createdAt: new Date(),
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Generate schedule optimization recommendations
   */
  private async generateScheduleRecommendations(engine: RecommendationEngine): Promise<StudyRecommendation[]> {
    const recommendations: StudyRecommendation[] = [];
    
    // Analyze study patterns
    const studyTimes = this.analyzeStudyTimes(engine.recentSessions);
    const peakHours = this.identifyPeakPerformanceHours(engine.recentSessions);
    
    if (peakHours.length > 0 && !this.isStudyingDuringPeakHours(studyTimes, peakHours)) {
      recommendations.push({
        id: uuidv4(),
        userId: engine.userId,
        type: 'time_management',
        priority: 'medium',
        title: 'Optimize Your Study Schedule',
        description: `Your peak performance hours are ${peakHours.join(', ')}:00. Consider scheduling important subjects during these times.`,
        reasoning: 'Data shows you perform better during specific hours of the day.',
        actionItems: [
          {
            id: uuidv4(),
            description: `Schedule challenging subjects between ${peakHours[0]}:00-${peakHours[0] + 2}:00`,
            type: 'task',
            isCompleted: false,
          },
          {
            id: uuidv4(),
            description: 'Move review sessions to lower-energy hours',
            type: 'task',
            isCompleted: false,
          },
        ],
        estimatedImpact: 'medium',
        timeToImplement: '3-5 days',
        category: 'short_term',
        context: {
          timeOfDay: peakHours.join(', '),
        },
        metadata: {
          confidence: 0.75,
          dataPoints: ['session_performance', 'time_analysis'],
          algorithmVersion: this.ALGORITHM_VERSION,
          personalizedFactors: ['peak_hours_identified', 'schedule_optimization'],
        },
        isActive: true,
        isApplied: false,
        isDismissed: false,
        createdAt: new Date(),
      });
    }
    
    // Check for study session length optimization
    const avgSessionLength = engine.studyAnalytics.averageSessionLength;
    const optimalLength = engine.learningProfile.attentionSpan || 45;
    
    if (Math.abs(avgSessionLength - optimalLength) > 15) {
      const isSessionsTooLong = avgSessionLength > optimalLength;
      
      recommendations.push({
        id: uuidv4(),
        userId: engine.userId,
        type: 'study_method',
        priority: 'medium',
        title: isSessionsTooLong ? 'Shorten Study Sessions' : 'Extend Study Sessions',
        description: isSessionsTooLong 
          ? `Your average session length (${avgSessionLength} min) exceeds your optimal attention span. Consider shorter, more focused sessions.`
          : `Your sessions (${avgSessionLength} min) are shorter than optimal. Try extending them for better deep work.`,
        reasoning: 'Matching session length to attention span improves focus and retention.',
        actionItems: [
          {
            id: uuidv4(),
            description: isSessionsTooLong 
              ? `Aim for ${optimalLength}-minute study sessions`
              : `Gradually increase sessions to ${optimalLength} minutes`,
            type: 'habit',
            isCompleted: false,
          },
          {
            id: uuidv4(),
            description: 'Use the Pomodoro technique for better time management',
            type: 'task',
            isCompleted: false,
          },
        ],
        estimatedImpact: 'medium',
        timeToImplement: '1 week',
        category: 'short_term',
        context: {},
        metadata: {
          confidence: 0.8,
          dataPoints: ['session_length', 'attention_span'],
          algorithmVersion: this.ALGORITHM_VERSION,
          personalizedFactors: ['session_optimization', 'attention_span_matching'],
        },
        isActive: true,
        isApplied: false,
        isDismissed: false,
        createdAt: new Date(),
      });
    }
    
    return recommendations;
  }

  /**
   * Generate study method recommendations
   */
  private async generateStudyMethodRecommendations(engine: RecommendationEngine): Promise<StudyRecommendation[]> {
    const recommendations: StudyRecommendation[] = [];
    
    // Analyze learning style preferences
    const learningStyles = engine.learningProfile.learningStyle;
    
    if (learningStyles.includes('visual') && !this.isUsingVisualMethods(engine)) {
      recommendations.push({
        id: uuidv4(),
        userId: engine.userId,
        type: 'study_method',
        priority: 'medium',
        title: 'Incorporate Visual Learning Techniques',
        description: 'Your learning profile indicates visual learning preferences. Try incorporating more visual study methods.',
        reasoning: 'Visual learners retain information better through diagrams, charts, and visual representations.',
        actionItems: [
          {
            id: uuidv4(),
            description: 'Create mind maps for complex topics',
            type: 'task',
            estimatedTime: 20,
            isCompleted: false,
          },
          {
            id: uuidv4(),
            description: 'Use color-coding in your notes',
            type: 'habit',
            isCompleted: false,
          },
          {
            id: uuidv4(),
            description: 'Find video resources for difficult concepts',
            type: 'resource',
            isCompleted: false,
          },
        ],
        estimatedImpact: 'medium',
        timeToImplement: '1-2 weeks',
        category: 'ongoing',
        context: {},
        metadata: {
          confidence: 0.7,
          dataPoints: ['learning_style', 'study_methods'],
          algorithmVersion: this.ALGORITHM_VERSION,
          personalizedFactors: ['visual_learner', 'method_optimization'],
        },
        isActive: true,
        isApplied: false,
        isDismissed: false,
        createdAt: new Date(),
      });
    }
    
    return recommendations;
  }

  /**
   * Generate habit formation recommendations
   */
  private async generateHabitRecommendations(engine: RecommendationEngine): Promise<StudyRecommendation[]> {
    const recommendations: StudyRecommendation[] = [];
    
    // Check study streak
    if (engine.studyAnalytics.streakDays < 7) {
      recommendations.push({
        id: uuidv4(),
        userId: engine.userId,
        type: 'habit_formation',
        priority: 'medium',
        title: 'Build a Consistent Study Streak',
        description: `Your current study streak is ${engine.studyAnalytics.streakDays} days. Let's work on building consistency.`,
        reasoning: 'Consistent daily study habits lead to better long-term retention and academic performance.',
        actionItems: [
          {
            id: uuidv4(),
            description: 'Study for at least 15 minutes every day',
            type: 'habit',
            estimatedTime: 15,
            isCompleted: false,
          },
          {
            id: uuidv4(),
            description: 'Set a daily study reminder',
            type: 'setting',
            isCompleted: false,
          },
          {
            id: uuidv4(),
            description: 'Track your streak in the app',
            type: 'task',
            isCompleted: false,
          },
        ],
        estimatedImpact: 'high',
        timeToImplement: '2-3 weeks',
        category: 'long_term',
        context: {
          studyStreak: engine.studyAnalytics.streakDays,
        },
        metadata: {
          confidence: 0.85,
          dataPoints: ['streak_days', 'consistency_pattern'],
          algorithmVersion: this.ALGORITHM_VERSION,
          personalizedFactors: ['habit_building', 'consistency_improvement'],
        },
        isActive: true,
        isApplied: false,
        isDismissed: false,
        createdAt: new Date(),
      });
    }
    
    return recommendations;
  }

  /**
   * Generate goal adjustment recommendations
   */
  private async generateGoalRecommendations(engine: RecommendationEngine): Promise<StudyRecommendation[]> {
    const recommendations: StudyRecommendation[] = [];
    
    // Check if goals are realistic based on current performance
    const averagePerformance = engine.performanceData.reduce((sum, p) => sum + p.performanceScore, 0) / engine.performanceData.length;
    
    if (averagePerformance < 60 && engine.activeGoals.length > 3) {
      recommendations.push({
        id: uuidv4(),
        userId: engine.userId,
        type: 'goal_adjustment',
        priority: 'high',
        title: 'Simplify Your Study Goals',
        description: 'You have many active goals but current performance suggests focusing on fewer, more achievable objectives.',
        reasoning: 'Focusing on fewer goals increases the likelihood of success and reduces overwhelm.',
        actionItems: [
          {
            id: uuidv4(),
            description: 'Identify your top 2 priority subjects',
            type: 'task',
            estimatedTime: 10,
            isCompleted: false,
          },
          {
            id: uuidv4(),
            description: 'Pause non-critical goals temporarily',
            type: 'task',
            isCompleted: false,
          },
          {
            id: uuidv4(),
            description: 'Set smaller, achievable milestones',
            type: 'task',
            estimatedTime: 15,
            isCompleted: false,
          },
        ],
        estimatedImpact: 'high',
        timeToImplement: '1 week',
        category: 'immediate',
        context: {
          currentPerformance: averagePerformance,
        },
        metadata: {
          confidence: 0.8,
          dataPoints: ['performance_average', 'active_goals_count'],
          algorithmVersion: this.ALGORITHM_VERSION,
          personalizedFactors: ['goal_overload', 'focus_optimization'],
        },
        isActive: true,
        isApplied: false,
        isDismissed: false,
        createdAt: new Date(),
      });
    }
    
    return recommendations;
  }

  /**
   * Prioritize recommendations based on impact and urgency
   */
  private prioritizeRecommendations(recommendations: StudyRecommendation[]): StudyRecommendation[] {
    return recommendations.sort((a, b) => {
      // Priority order: critical > high > medium > low
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Impact order: high > medium > low
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.estimatedImpact] - impactOrder[a.estimatedImpact];
      
      if (impactDiff !== 0) return impactDiff;
      
      // Confidence score
      return (b.metadata.confidence || 0) - (a.metadata.confidence || 0);
    });
  }

  /**
   * Store recommendations in database
   */
  private async storeRecommendations(recommendations: StudyRecommendation[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_recommendations')
        .upsert(recommendations.map(rec => ({
          id: rec.id,
          user_id: rec.userId,
          type: rec.type,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          reasoning: rec.reasoning,
          action_items: rec.actionItems,
          estimated_impact: rec.estimatedImpact,
          time_to_implement: rec.timeToImplement,
          category: rec.category,
          context: rec.context,
          metadata: rec.metadata,
          is_active: rec.isActive,
          is_applied: rec.isApplied,
          is_dismissed: rec.isDismissed,
          created_at: rec.createdAt.toISOString(),
          expires_at: rec.expiresAt?.toISOString(),
        })));

      if (error) throw error;
    } catch (error) {
      console.error('Error storing recommendations:', error);
      // Don't throw - recommendations can still be returned even if storage fails
    }
  }

  /**
   * Get user's active recommendations
   */
  async getActiveRecommendations(userId: string, filters?: RecommendationFilters): Promise<StudyRecommendation[]> {
    try {
      let query = supabase
        .from('study_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.type) query = query.eq('type', filters.type);
        if (filters.priority) query = query.eq('priority', filters.priority);
        if (filters.category) query = query.eq('category', filters.category);
        if (filters.courseId) query = query.contains('context', { courseId: filters.courseId });
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapDatabaseToRecommendation);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  /**
   * Apply a recommendation
   */
  async applyRecommendation(recommendationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_recommendations')
        .update({
          is_applied: true,
          applied_at: new Date().toISOString(),
        })
        .eq('id', recommendationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error applying recommendation:', error);
      throw error;
    }
  }

  /**
   * Dismiss a recommendation
   */
  async dismissRecommendation(recommendationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_recommendations')
        .update({
          is_dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', recommendationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      throw error;
    }
  }

  /**
   * Update action item completion
   */
  async updateActionItem(recommendationId: string, actionItemId: string, isCompleted: boolean): Promise<void> {
    try {
      // Get current recommendation
      const { data, error: fetchError } = await supabase
        .from('study_recommendations')
        .select('action_items')
        .eq('id', recommendationId)
        .single();

      if (fetchError) throw fetchError;

      // Update action item
      const actionItems = data.action_items.map((item: ActionItem) => 
        item.id === actionItemId 
          ? { ...item, isCompleted, completedAt: isCompleted ? new Date() : undefined }
          : item
      );

      // Update in database
      const { error: updateError } = await supabase
        .from('study_recommendations')
        .update({ action_items: actionItems })
        .eq('id', recommendationId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating action item:', error);
      throw error;
    }
  }

  // Helper methods
  private async getStudyAnalytics(userId: string): Promise<StudyAnalytics> {
    // Mock implementation - in real app, this would fetch from database
    return {
      totalStudyTime: 1200,
      averageSessionLength: 45,
      streakDays: 5,
      longestStreak: 12,
      questsCompleted: 15,
      achievementsUnlocked: 8,
      levelProgress: {
        currentLevel: 3,
        xpProgress: 750,
        xpToNextLevel: 1000,
      },
      subjectBreakdown: [],
      weeklyProgress: [],
    };
  }

  private async getRecentStudySessions(userId: string, days: number): Promise<StudySession[]> {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent study sessions:', error);
      return [];
    }
  }

  private async getUserLearningProfile(userId: string): Promise<StudentLearningProfile> {
    // Mock implementation
    return {
      learningStyle: ['visual', 'reading_writing'],
      preferredExplanationTypes: ['step_by_step', 'examples'],
      difficultyPreference: 'gradual',
      attentionSpan: 45,
      bestStudyTimes: ['09:00-11:00', '14:00-16:00'],
      motivationTriggers: [
        { type: 'progress_tracking', effectiveness: 8, description: 'Seeing progress motivates' },
      ],
      knowledgeGaps: [],
      strengths: ['analytical thinking', 'problem solving'],
      improvementAreas: ['time management', 'consistency'],
    };
  }

  private async getUserStudyPreferences(userId: string): Promise<UserStudyPreferences> {
    // Mock implementation
    return {
      preferredStudyTimes: ['09:00-11:00', '19:00-21:00'],
      maxSessionLength: 60,
      breakFrequency: 25,
      difficultyPreference: 'gradual',
      motivationStyle: 'personal',
      reminderFrequency: 'medium',
    };
  }

  private async getActiveGoals(userId: string): Promise<string[]> {
    // Mock implementation
    return ['Complete Math Course', 'Improve Physics Grade', 'Master Chemistry Basics'];
  }

  private analyzeStudyTimes(sessions: StudySession[]): number[] {
    return sessions.map(session => new Date(session.startTime).getHours());
  }

  private identifyPeakPerformanceHours(sessions: StudySession[]): number[] {
    const hourCounts: { [hour: number]: number } = {};
    
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([hour]) => parseInt(hour));
  }

  private isStudyingDuringPeakHours(studyTimes: number[], peakHours: number[]): boolean {
    return peakHours.some(hour => studyTimes.includes(hour));
  }

  private isUsingVisualMethods(engine: RecommendationEngine): boolean {
    // Mock implementation - would check user's study methods
    return false;
  }

  private mapDatabaseToRecommendation(data: any): StudyRecommendation {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      priority: data.priority,
      title: data.title,
      description: data.description,
      reasoning: data.reasoning,
      actionItems: data.action_items,
      estimatedImpact: data.estimated_impact,
      timeToImplement: data.time_to_implement,
      category: data.category,
      context: data.context,
      metadata: data.metadata,
      isActive: data.is_active,
      isApplied: data.is_applied,
      isDismissed: data.is_dismissed,
      createdAt: new Date(data.created_at),
      appliedAt: data.applied_at ? new Date(data.applied_at) : undefined,
      dismissedAt: data.dismissed_at ? new Date(data.dismissed_at) : undefined,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    };
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;