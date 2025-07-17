import React, { useState } from 'react';
import { CheckCircle, X, Clock, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import type { StudyRecommendation, ActionItem } from '../../services/recommendationService';

interface RecommendationCardProps {
  recommendation: StudyRecommendation;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
  onUpdateActionItem: (recommendationId: string, actionItemId: string, isCompleted: boolean) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onApply,
  onDismiss,
  onUpdateActionItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800',
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply(recommendation.id);
    } finally {
      setIsApplying(false);
    }
  };

  const handleActionItemToggle = (actionItem: ActionItem) => {
    onUpdateActionItem(recommendation.id, actionItem.id, !actionItem.isCompleted);
  };

  const completedActions = recommendation.actionItems.filter(item => item.isCompleted).length;
  const totalActions = recommendation.actionItems.length;
  const progressPercentage = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

  return (
    <div className={`border-l-4 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${getPriorityColor(recommendation.priority)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {getPriorityIcon(recommendation.priority)}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {recommendation.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {recommendation.description}
            </p>
            <div className="flex items-center space-x-3 text-xs">
              <span className={`px-2 py-1 rounded-full font-medium ${getImpactBadge(recommendation.estimatedImpact)}`}>
                {recommendation.estimatedImpact.toUpperCase()} IMPACT
              </span>
              <span className="text-gray-500">
                {recommendation.timeToImplement}
              </span>
              <span className="text-gray-500 capitalize">
                {recommendation.category}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDismiss(recommendation.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalActions > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{completedActions}/{totalActions} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="space-y-2 mb-4">
        {recommendation.actionItems.slice(0, isExpanded ? undefined : 2).map((actionItem) => (
          <div
            key={actionItem.id}
            className="flex items-center space-x-3 p-2 bg-white rounded border"
          >
            <button
              onClick={() => handleActionItemToggle(actionItem)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                actionItem.isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {actionItem.isCompleted && <CheckCircle className="w-3 h-3" />}
            </button>
            <div className="flex-1">
              <p className={`text-sm ${actionItem.isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {actionItem.description}
              </p>
              {actionItem.estimatedTime && (
                <p className="text-xs text-gray-500">
                  ~{actionItem.estimatedTime} minutes
                </p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              actionItem.type === 'habit' ? 'bg-purple-100 text-purple-700' :
              actionItem.type === 'task' ? 'bg-blue-100 text-blue-700' :
              actionItem.type === 'setting' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {actionItem.type}
            </span>
          </div>
        ))}
        
        {!isExpanded && recommendation.actionItems.length > 2 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Show {recommendation.actionItems.length - 2} more actions
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t pt-4 mt-4 space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Why this recommendation?</h4>
            <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
          </div>
          
          {recommendation.context.courseName && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Related Course</h4>
              <p className="text-sm text-gray-600">{recommendation.context.courseName}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Confidence: {Math.round((recommendation.metadata.confidence || 0) * 100)}%</span>
            <span>Algorithm v{recommendation.metadata.algorithmVersion}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-xs text-gray-500">
          Created {new Date(recommendation.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex space-x-2">
          {!recommendation.isApplied && (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isApplying ? 'Applying...' : 'Apply Recommendation'}
            </button>
          )}
          
          {recommendation.isApplied && (
            <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-md">
              Applied ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;