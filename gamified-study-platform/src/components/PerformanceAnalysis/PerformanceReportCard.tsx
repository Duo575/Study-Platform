import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { usePerformanceRecommendations } from '../../hooks/usePerformanceAnalysis';
import {
  formatPerformanceScore,
  getPerformanceStatusColor,
  getGradeColor,
  formatStudyTime,
  formatStudyFrequency,
  generatePerformanceInsights,
  calculateImprovementPotential,
} from '../../utils/performanceAnalysis';
import type { SubjectPerformance } from '../../types';

interface PerformanceReportCardProps {
  performance: SubjectPerformance;
  onViewDetails?: () => void;
  className?: string;
}

/**
 * Detailed Performance Report Card Component
 * Shows comprehensive performance analysis for a single subject
 */
export function PerformanceReportCard({
  performance,
  onViewDetails,
  className = '',
}: PerformanceReportCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'recommendations' | 'insights'
  >('overview');

  const {
    activeRecommendations,
    dismissRecommendation,
    highPriorityRecommendations,
    mediumPriorityRecommendations,
    lowPriorityRecommendations,
  } = usePerformanceRecommendations(performance);

  const scoreFormatted = formatPerformanceScore(performance.performanceScore);
  const insights = generatePerformanceInsights(performance);
  const improvementPotential = calculateImprovementPotential(performance);

  return (
    <Card className={`${className} overflow-hidden`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {performance.courseName}
              </h3>
              {performance.flagged && (
                <Badge variant="destructive" size="sm">
                  ⚠️ FLAGGED
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${scoreFormatted.color}`}>
                  {scoreFormatted.value}
                </span>
                <Badge
                  className={getPerformanceStatusColor(performance.status)}
                  size="sm"
                >
                  {performance.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div
                className={`text-3xl font-bold ${getGradeColor(performance.overallGrade)}`}
              >
                {performance.overallGrade}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
            {onViewDetails && (
              <Button variant="primary" size="sm" onClick={onViewDetails}>
                Full Report
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatStudyTime(performance.totalStudyTime)}
            </div>
            <div className="text-sm text-gray-600">Total Study Time</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {performance.completedQuests}/{performance.totalQuests}
            </div>
            <div className="text-sm text-gray-600">Quests Completed</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {performance.completedTopics}/{performance.totalTopics}
            </div>
            <div className="text-sm text-gray-600">Topics Completed</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatStudyFrequency(performance.studyFrequency)}
            </div>
            <div className="text-sm text-gray-600">Study Frequency</div>
          </div>
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-gray-200">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {[
              { key: 'overview', label: 'Overview' },
              {
                key: 'recommendations',
                label: `Recommendations (${activeRecommendations.length})`,
              },
              { key: 'insights', label: 'Insights' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab
                performance={performance}
                improvementPotential={improvementPotential}
              />
            )}

            {activeTab === 'recommendations' && (
              <RecommendationsTab
                highPriority={highPriorityRecommendations}
                mediumPriority={mediumPriorityRecommendations}
                lowPriority={lowPriorityRecommendations}
                onDismiss={dismissRecommendation}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsTab
                insights={insights}
                performance={performance}
                improvementPotential={improvementPotential}
              />
            )}
          </div>
        </div>
      )}

      {/* Critical Alerts */}
      {performance.interventions.length > 0 && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-start space-x-3">
            <div className="text-red-500 text-xl">🚨</div>
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-1">
                Intervention Required
              </h4>
              <p className="text-sm text-red-700">
                {performance.interventions[0].title} -{' '}
                {performance.interventions[0].timeframe}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Positive Acknowledgments */}
      {performance.acknowledgments.length > 0 && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <div className="flex items-start space-x-3">
            <div className="text-green-500 text-xl">🎉</div>
            <div className="flex-1">
              <h4 className="font-medium text-green-800 mb-1">
                {performance.acknowledgments[0].title}
              </h4>
              <p className="text-sm text-green-700">
                {performance.acknowledgments[0].message}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Overview Tab Component
 */
function OverviewTab({
  performance,
  improvementPotential,
}: {
  performance: SubjectPerformance;
  improvementPotential: ReturnType<typeof calculateImprovementPotential>;
}) {
  return (
    <div className="space-y-6">
      {/* Performance Breakdown */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">
          Performance Breakdown
        </h4>
        <div className="space-y-3">
          {[
            { label: 'Study Time', score: performance.studyTimeScore },
            {
              label: 'Quest Completion',
              score: performance.questCompletionScore,
            },
            { label: 'Consistency', score: performance.consistencyScore },
            {
              label: 'Deadline Adherence',
              score: performance.deadlineAdherenceScore,
            },
          ].map(item => (
            <div key={item.label} className="flex items-center space-x-4">
              <div className="w-32 text-sm text-gray-600">{item.label}</div>
              <div className="flex-1">
                <ProgressBar
                  value={item.score}
                  max={100}
                  className="h-2"
                  color={
                    item.score >= 70
                      ? 'green'
                      : item.score >= 50
                        ? 'yellow'
                        : 'red'
                  }
                />
              </div>
              <div className="w-12 text-sm font-medium text-gray-900">
                {item.score}/100
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Potential */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">
          Improvement Potential
        </h4>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-blue-700">
              Potential Score Increase
            </span>
            <span className="text-lg font-bold text-blue-800">
              +{improvementPotential.potential} points
            </span>
          </div>

          {improvementPotential.quickWins.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-blue-800 mb-2">
                Quick Wins:
              </h5>
              <ul className="text-sm text-blue-700 space-y-1">
                {improvementPotential.quickWins.map((win, index) => (
                  <li key={index}>• {win}</li>
                ))}
              </ul>
            </div>
          )}

          {improvementPotential.longTermGoals.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-blue-800 mb-2">
                Long-term Goals:
              </h5>
              <ul className="text-sm text-blue-700 space-y-1">
                {improvementPotential.longTermGoals.map((goal, index) => (
                  <li key={index}>• {goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Recommendations Tab Component
 */
function RecommendationsTab({
  highPriority,
  mediumPriority,
  lowPriority,
  onDismiss,
}: {
  highPriority: any[];
  mediumPriority: any[];
  lowPriority: any[];
  onDismiss: (id: string) => void;
}) {
  const renderRecommendations = (
    recommendations: any[],
    title: string,
    color: string
  ) => {
    if (recommendations.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className={`font-medium mb-3 ${color}`}>{title}</h4>
        <div className="space-y-3">
          {recommendations.map(rec => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-900">{rec.title}</h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(rec.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
              <div className="space-y-2">
                <div className="text-xs text-gray-500">
                  Impact: {rec.estimatedImpact} • Time: {rec.timeToImplement}
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {rec.actionItems.map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderRecommendations(highPriority, 'High Priority', 'text-red-700')}
      {renderRecommendations(
        mediumPriority,
        'Medium Priority',
        'text-yellow-700'
      )}
      {renderRecommendations(lowPriority, 'Low Priority', 'text-green-700')}

      {highPriority.length === 0 &&
        mediumPriority.length === 0 &&
        lowPriority.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <p>No recommendations at this time. Great job!</p>
          </div>
        )}
    </div>
  );
}

/**
 * Insights Tab Component
 */
function InsightsTab({
  insights,
  performance,
  improvementPotential: _improvementPotential,
}: {
  insights: string[];
  performance: SubjectPerformance;
  improvementPotential: ReturnType<typeof calculateImprovementPotential>;
}) {
  return (
    <div className="space-y-6">
      {/* Performance Insights */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Performance Insights</h4>
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-blue-500 mt-0.5">💡</div>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No specific insights available at this time.
          </p>
        )}
      </div>

      {/* Study Pattern Analysis */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">
          Study Pattern Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2">Session Length</h5>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(performance.averageSessionLength)} min
            </p>
            <p className="text-sm text-gray-600">Average per session</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2">Study Frequency</h5>
            <p className="text-2xl font-bold text-gray-900">
              {performance.studyFrequency.toFixed(1)}x
            </p>
            <p className="text-sm text-gray-600">Sessions per week</p>
          </div>
        </div>
      </div>

      {/* Last Activity */}
      {performance.lastStudied && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Last studied</p>
            <p className="text-lg font-medium text-gray-900">
              {Math.floor(
                (Date.now() - performance.lastStudied.getTime()) /
                  (24 * 60 * 60 * 1000)
              )}{' '}
              days ago
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceReportCard;
