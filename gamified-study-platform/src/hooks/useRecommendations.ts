import { useState, useEffect, useCallback } from 'react';
import { recommendationService } from '../services/recommendationService';
import type { StudyRecommendation, RecommendationFilters } from '../services/recommendationService';

interface UseRecommendationsOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseRecommendationsReturn {
  recommendations: StudyRecommendation[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  stats: {
    total: number;
    critical: number;
    high: number;
    applied: number;
    dismissed: number;
  };
  actions: {
    loadRecommendations: (filters?: RecommendationFilters) => Promise<void>;
    generateRecommendations: () => Promise<void>;
    applyRecommendation: (id: string) => Promise<void>;
    dismissRecommendation: (id: string) => Promise<void>;
    updateActionItem: (recommendationId: string, actionItemId: string, isCompleted: boolean) => Promise<void>;
    clearError: () => void;
  };
}

export const useRecommendations = (options: UseRecommendationsOptions): UseRecommendationsReturn => {
  const { userId, autoRefresh = false, refreshInterval = 300000 } = options; // 5 minutes default
  
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recommendations from the service
  const loadRecommendations = useCallback(async (filters?: RecommendationFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await recommendationService.getActiveRecommendations(userId, filters);
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      console.error('Error loading recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Generate new recommendations
  const generateRecommendations = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const newRecommendations = await recommendationService.generateRecommendations(userId);
      setRecommendations(newRecommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
      console.error('Error generating recommendations:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [userId]);

  // Apply a recommendation
  const applyRecommendation = useCallback(async (id: string) => {
    try {
      setError(null);
      await recommendationService.applyRecommendation(id);
      
      // Update local state
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id 
            ? { ...rec, isApplied: true, appliedAt: new Date() }
            : rec
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply recommendation');
      console.error('Error applying recommendation:', err);
    }
  }, []);

  // Dismiss a recommendation
  const dismissRecommendation = useCallback(async (id: string) => {
    try {
      setError(null);
      await recommendationService.dismissRecommendation(id);
      
      // Remove from local state
      setRecommendations(prev => prev.filter(rec => rec.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss recommendation');
      console.error('Error dismissing recommendation:', err);
    }
  }, []);

  // Update action item completion
  const updateActionItem = useCallback(async (recommendationId: string, actionItemId: string, isCompleted: boolean) => {
    try {
      setError(null);
      await recommendationService.updateActionItem(recommendationId, actionItemId, isCompleted);
      
      // Update local state
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId
            ? {
                ...rec,
                actionItems: rec.actionItems.map(item =>
                  item.id === actionItemId
                    ? { ...item, isCompleted, completedAt: isCompleted ? new Date() : undefined }
                    : item
                )
              }
            : rec
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update action item');
      console.error('Error updating action item:', err);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calculate statistics
  const stats = {
    total: recommendations.length,
    critical: recommendations.filter(r => r.priority === 'critical').length,
    high: recommendations.filter(r => r.priority === 'high').length,
    applied: recommendations.filter(r => r.isApplied).length,
    dismissed: recommendations.filter(r => r.isDismissed).length,
  };

  // Initial load
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadRecommendations();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadRecommendations]);

  return {
    recommendations,
    isLoading,
    isGenerating,
    error,
    stats,
    actions: {
      loadRecommendations,
      generateRecommendations,
      applyRecommendation,
      dismissRecommendation,
      updateActionItem,
      clearError,
    },
  };
};

export default useRecommendations;