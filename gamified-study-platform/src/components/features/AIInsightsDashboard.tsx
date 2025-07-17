import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../../hooks/useAI';
import { AIInsight, InsightCategory } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface AIInsightsDashboardProps {
  userId: string;
  studyData?: any;
  className?: string;
}

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  userId,
  studyData,
  className = '',
}) => {
  const {
    insights,
    isLoading,
    error,
    getInsights,
    acknowledgeInsight,
    applyInsight,
    unacknowledgedInsights,
  } = useAI();

  useEffect(() => {
    if (studyData) {
      getInsights(userId, studyData);
    }
  }, [userId, studyData, getInsights]);

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.category]) {
      acc[insight.category] = [];
    }
    acc[insight.category].push(insight);
    return acc;
  }, {} as Record<InsightCategory, AIInsight[]>);

  const categoryIcons = {
    productivity: '⚡',
    learning_efficiency: '🎯',
    motivation: '💪',
    time_management: '⏰',
    content_mastery: '📚',
    goal_achievement: '🏆',
  };

  const categoryColors = {
    productivity: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    learning_efficiency: 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    motivation: 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    time_management: 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    content_mastery: 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    goal_achievement: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  };

  const priorityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-green-600 dark:text-green-400',
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AI Study Insights
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Personalized insights to help you study more effectively
        </p>
        {unacknowledgedInsights.length > 0 && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
            {unacknowledgedInsights.length} new insight{unacknowledgedInsights.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No insights yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Keep studying and I'll analyze your patterns to provide personalized insights!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">{categoryIcons[category as InsightCategory]}</span>
                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({categoryInsights.length})
                </span>
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    categoryColor={categoryColors[insight.category]}
                    priorityColor={priorityColors[insight.priority]}
                    onAcknowledge={() => acknowledgeInsight(insight.id)}
                    onApply={() => applyInsight(insight.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface InsightCardProps {
  insight: AIInsight;
  categoryColor: string;
  priorityColor: string;
  onAcknowledge: () => void;
  onApply: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  categoryColor,
  priorityColor,
  onAcknowledge,
  onApply,
}) => {
  const timeAgo = formatDistanceToNow(insight.generatedAt, { addSuffix: true });
  const isNew = !insight.acknowledgedAt;
  const isApplied = !!insight.appliedAt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-lg border ${categoryColor} ${
        isNew ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            {insight.title}
          </h4>
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-medium ${priorityColor}`}>
              {insight.priority.toUpperCase()}
            </span>
            <span className="text-gray-500 dark:text-gray-400">•</span>
            <span className="text-gray-500 dark:text-gray-400">{timeAgo}</span>
          </div>
        </div>
        
        {insight.type === 'performance_pattern' && (
          <div className="text-xl">📊</div>
        )}
        {insight.type === 'study_habit' && (
          <div className="text-xl">📝</div>
        )}
        {insight.type === 'knowledge_gap' && (
          <div className="text-xl">🎯</div>
        )}
        {insight.type === 'motivation_trend' && (
          <div className="text-xl">📈</div>
        )}
        {insight.type === 'time_optimization' && (
          <div className="text-xl">⏱️</div>
        )}
        {insight.type === 'resource_recommendation' && (
          <div className="text-xl">📚</div>
        )}
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {insight.description}
      </p>

      {insight.suggestedActions && insight.suggestedActions.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Suggested Actions:
          </h5>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {insight.suggestedActions.map((action, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        {!insight.acknowledgedAt && (
          <button
            onClick={onAcknowledge}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Got it
          </button>
        )}
        
        {insight.actionable && !isApplied && (
          <button
            onClick={onApply}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        )}
        
        {isApplied && (
          <div className="flex-1 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-center">
            ✓ Applied
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIInsightsDashboard;