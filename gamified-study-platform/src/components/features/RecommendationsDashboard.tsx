import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import { recommendationService } from '../../services/recommendationService';
import type {
  StudyRecommendation,
  RecommendationFilters,
} from '../../services/recommendationService';

interface RecommendationsDashboardProps {
  userId: string;
}

const RecommendationsDashboard: React.FC<RecommendationsDashboardProps> = ({
  userId,
}) => {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filters, setFilters] = useState<RecommendationFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [userId, filters]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await recommendationService.getActiveRecommendations(
        userId,
        filters
      );
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewRecommendations = async () => {
    try {
      setIsGenerating(true);
      const newRecommendations =
        await recommendationService.generateRecommendations(userId);
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyRecommendation = async (recommendationId: string) => {
    try {
      await recommendationService.applyRecommendation(recommendationId);
      await loadRecommendations();
    } catch (error) {
      console.error('Error applying recommendation:', error);
    }
  };

  const handleDismissRecommendation = async (recommendationId: string) => {
    try {
      await recommendationService.dismissRecommendation(recommendationId);
      await loadRecommendations();
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  const handleUpdateActionItem = async (
    recommendationId: string,
    actionItemId: string,
    isCompleted: boolean
  ) => {
    try {
      await recommendationService.updateActionItem(
        recommendationId,
        actionItemId,
        isCompleted
      );
      await loadRecommendations();
    } catch (error) {
      console.error('Error updating action item:', error);
    }
  };

  const getRecommendationStats = () => {
    const total = recommendations.length;
    const critical = recommendations.filter(
      r => r.priority === 'critical'
    ).length;
    const high = recommendations.filter(r => r.priority === 'high').length;
    const applied = recommendations.filter(r => r.isApplied).length;

    return { total, critical, high, applied };
  };

  const stats = getRecommendationStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Smart Study Recommendations
          </h2>
          <p className="text-gray-600 mt-1">
            Personalized suggestions to improve your study performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={generateNewRecommendations}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`}
            />
            <span>{isGenerating ? 'Generating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {stats.critical}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">
              High Priority
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {stats.high}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Applied</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.applied}
          </p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={e =>
                  setFilters({ ...filters, type: e.target.value as any })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="study_schedule">Study Schedule</option>
                <option value="subject_focus">Subject Focus</option>
                <option value="study_method">Study Method</option>
                <option value="habit_formation">Habit Formation</option>
                <option value="goal_adjustment">Goal Adjustment</option>
                <option value="time_management">Time Management</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={e =>
                  setFilters({ ...filters, priority: e.target.value as any })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={e =>
                  setFilters({ ...filters, category: e.target.value as any })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="immediate">Immediate</option>
                <option value="short_term">Short Term</option>
                <option value="long_term">Long Term</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No recommendations available
          </h3>
          <p className="text-gray-600 mb-4">
            Generate new recommendations based on your current study patterns.
          </p>
          <button
            onClick={generateNewRecommendations}
            disabled={isGenerating}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Recommendations'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(recommendation => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onApply={handleApplyRecommendation}
              onDismiss={handleDismissRecommendation}
              onUpdateActionItem={handleUpdateActionItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsDashboard;
