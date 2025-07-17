import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronRight, X, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recommendationService } from '../../services/recommendationService';
import type { StudyRecommendation } from '../../services/recommendationService';

interface RecommendationWidgetProps {
  userId: string;
  maxRecommendations?: number;
  showActions?: boolean;
  className?: string;
}

const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  userId,
  maxRecommendations = 3,
  showActions = true,
  className = '',
}) => {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await recommendationService.getActiveRecommendations(userId);
      // Sort by priority and take the top recommendations
      const sortedData = data
        .sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, maxRecommendations);
      setRecommendations(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async (recommendationId: string) => {
    try {
      await recommendationService.dismissRecommendation(recommendationId);
      setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
    } catch (err) {
      console.error('Error dismissing recommendation:', err);
    }
  };

  const handleQuickApply = async (recommendationId: string) => {
    try {
      await recommendationService.applyRecommendation(recommendationId);
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, isApplied: true, appliedAt: new Date() }
            : rec
        )
      );
    } catch (err) {
      console.error('Error applying recommendation:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const iconClass = "w-4 h-4";
    switch (priority) {
      case 'critical': return <Lightbulb className={`${iconClass} text-red-500`} />;
      case 'high': return <Lightbulb className={`${iconClass} text-orange-500`} />;
      case 'medium': return <Lightbulb className={`${iconClass} text-yellow-500`} />;
      case 'low': return <Lightbulb className={`${iconClass} text-blue-500`} />;
      default: return <Lightbulb className={`${iconClass} text-gray-500`} />;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Study Recommendations</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Study Recommendations</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={loadRecommendations}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Study Recommendations</h3>
          </div>
          <Link
            to="/recommendations"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm mb-3">No recommendations available</p>
          <Link
            to="/recommendations"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Recommendations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Study Recommendations</h3>
        </div>
        <Link
          to="/recommendations"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getPriorityIcon(recommendation.priority)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {recommendation.title}
                  </h4>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                    {recommendation.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      recommendation.estimatedImpact === 'high' ? 'bg-green-100 text-green-700' :
                      recommendation.estimatedImpact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {recommendation.estimatedImpact.toUpperCase()} IMPACT
                    </span>
                    <span className="text-gray-500 capitalize">
                      {recommendation.priority}
                    </span>
                  </div>
                </div>
              </div>
              
              {showActions && (
                <div className="flex items-center space-x-1 ml-2">
                  {!recommendation.isApplied && (
                    <button
                      onClick={() => handleQuickApply(recommendation.id)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title="Apply recommendation"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(recommendation.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Dismiss recommendation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {recommendation.isApplied && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span>Applied</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <Link
            to="/recommendations"
            className="block w-full text-center px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            View All Recommendations
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecommendationWidget;