import { useState, useEffect, useCallback } from 'react';
import { performanceAnalysisService } from '../services/performanceAnalysisService';
import type { 
  SubjectPerformance, 
  SubjectPriority, 
  PerformanceSummary,
  PerformanceConfig 
} from '../types';

/**
 * Hook for managing performance analysis data and operations
 */
export function usePerformanceAnalysis(userId: string | null) {
  const [performances, setPerformances] = useState<SubjectPerformance[]>([]);
  const [priorities, setPriorities] = useState<SubjectPriority[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /**
   * Analyze all subjects for the user
   */
  const analyzeAllSubjects = useCallback(async (config?: PerformanceConfig) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await performanceAnalysisService.analyzeAllSubjects(userId, config);
      setPerformances(results);
      
      // Generate priorities based on performance results
      const priorityResults = await performanceAnalysisService.prioritizeSubjects(results);
      setPriorities(priorityResults);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error analyzing subjects:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze subjects');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Get performance summary
   */
  const getPerformanceSummary = useCallback(async () => {
    if (!userId) return;

    try {
      const summaryResult = await performanceAnalysisService.getPerformanceSummary(userId);
      setSummary(summaryResult);
    } catch (err) {
      console.error('Error getting performance summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to get performance summary');
    }
  }, [userId]);

  /**
   * Analyze a specific subject
   */
  const analyzeSubject = useCallback(async (courseId: string, config?: PerformanceConfig) => {
    if (!userId) return null;

    setIsLoading(true);
    setError(null);

    try {
      // This would need the course data - simplified for now
      // In a real implementation, you'd fetch the course first
      const course = { id: courseId, name: 'Course', syllabus: [] };
      const result = await performanceAnalysisService.analyzeSubjectPerformance(userId, course, config);
      
      // Update the specific performance in the array
      setPerformances(prev => {
        const index = prev.findIndex(p => p.courseId === courseId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = result;
          return updated;
        } else {
          return [...prev, result];
        }
      });

      return result;
    } catch (err) {
      console.error('Error analyzing subject:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze subject');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Refresh all performance data
   */
  const refresh = useCallback(async (config?: PerformanceConfig) => {
    await Promise.all([
      analyzeAllSubjects(config),
      getPerformanceSummary()
    ]);
  }, [analyzeAllSubjects, getPerformanceSummary]);

  /**
   * Get flagged subjects that need attention
   */
  const getFlaggedSubjects = useCallback(() => {
    return performances.filter(p => p.flagged);
  }, [performances]);

  /**
   * Get subjects by status
   */
  const getSubjectsByStatus = useCallback((status: SubjectPerformance['status']) => {
    return performances.filter(p => p.status === status);
  }, [performances]);

  /**
   * Get high priority subjects
   */
  const getHighPrioritySubjects = useCallback(() => {
    return priorities.filter(p => p.urgencyLevel === 'critical' || p.urgencyLevel === 'high');
  }, [priorities]);

  /**
   * Get performance for a specific subject
   */
  const getSubjectPerformance = useCallback((courseId: string) => {
    return performances.find(p => p.courseId === courseId);
  }, [performances]);

  /**
   * Get subject priority
   */
  const getSubjectPriority = useCallback((courseId: string) => {
    return priorities.find(p => p.courseId === courseId);
  }, [priorities]);

  /**
   * Check if data needs refresh (older than 1 hour)
   */
  const needsRefresh = useCallback(() => {
    if (!lastUpdated) return true;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return lastUpdated < oneHourAgo;
  }, [lastUpdated]);

  // Auto-refresh on mount and when userId changes
  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  return {
    // Data
    performances,
    priorities,
    summary,
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    analyzeAllSubjects,
    analyzeSubject,
    getPerformanceSummary,
    refresh,
    
    // Computed values
    getFlaggedSubjects,
    getSubjectsByStatus,
    getHighPrioritySubjects,
    getSubjectPerformance,
    getSubjectPriority,
    needsRefresh,
    
    // Stats
    totalSubjects: performances.length,
    flaggedCount: performances.filter(p => p.flagged).length,
    criticalCount: performances.filter(p => p.status === 'critical').length,
    excellentCount: performances.filter(p => p.status === 'excellent').length
  };
}

/**
 * Hook for performance analysis configuration
 */
export function usePerformanceConfig() {
  const [config, setConfig] = useState<PerformanceConfig>({
    thresholds: {
      excellent: 85,
      good: 70,
      needsAttention: 50,
      critical: 30
    },
    weights: {
      studyTime: 0.3,
      questCompletion: 0.25,
      consistency: 0.25,
      deadlineAdherence: 0.2
    },
    flaggingCriteria: {
      minPerformanceScore: 60,
      maxDaysSinceLastStudy: 7,
      minQuestCompletionRate: 0.4,
      minConsistencyScore: 50
    }
  });

  const updateConfig = useCallback((updates: Partial<PerformanceConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates,
      thresholds: { ...prev.thresholds, ...updates.thresholds },
      weights: { ...prev.weights, ...updates.weights },
      flaggingCriteria: { ...prev.flaggingCriteria, ...updates.flaggingCriteria }
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({
      thresholds: {
        excellent: 85,
        good: 70,
        needsAttention: 50,
        critical: 30
      },
      weights: {
        studyTime: 0.3,
        questCompletion: 0.25,
        consistency: 0.25,
        deadlineAdherence: 0.2
      },
      flaggingCriteria: {
        minPerformanceScore: 60,
        maxDaysSinceLastStudy: 7,
        minQuestCompletionRate: 0.4,
        minConsistencyScore: 50
      }
    });
  }, []);

  return {
    config,
    updateConfig,
    resetConfig
  };
}

/**
 * Hook for performance recommendations
 */
export function usePerformanceRecommendations(performance: SubjectPerformance | null) {
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  const activeRecommendations = performance?.recommendations.filter(
    rec => !dismissedRecommendations.has(rec.id)
  ) || [];

  const dismissRecommendation = useCallback((recommendationId: string) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
  }, []);

  const restoreRecommendation = useCallback((recommendationId: string) => {
    setDismissedRecommendations(prev => {
      const newSet = new Set(prev);
      newSet.delete(recommendationId);
      return newSet;
    });
  }, []);

  const clearDismissed = useCallback(() => {
    setDismissedRecommendations(new Set());
  }, []);

  const getRecommendationsByPriority = useCallback((priority: 'high' | 'medium' | 'low') => {
    return activeRecommendations.filter(rec => rec.priority === priority);
  }, [activeRecommendations]);

  const getRecommendationsByCategory = useCallback((category: 'immediate' | 'short_term' | 'long_term') => {
    return activeRecommendations.filter(rec => rec.category === category);
  }, [activeRecommendations]);

  return {
    activeRecommendations,
    dismissedCount: dismissedRecommendations.size,
    dismissRecommendation,
    restoreRecommendation,
    clearDismissed,
    getRecommendationsByPriority,
    getRecommendationsByCategory,
    
    // Quick access to priority recommendations
    highPriorityRecommendations: getRecommendationsByPriority('high'),
    mediumPriorityRecommendations: getRecommendationsByPriority('medium'),
    lowPriorityRecommendations: getRecommendationsByPriority('low'),
    
    // Quick access to category recommendations
    immediateRecommendations: getRecommendationsByCategory('immediate'),
    shortTermRecommendations: getRecommendationsByCategory('short_term'),
    longTermRecommendations: getRecommendationsByCategory('long_term')
  };
}

export default usePerformanceAnalysis;