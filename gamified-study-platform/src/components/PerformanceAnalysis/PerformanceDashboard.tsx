import React from 'react';
import { usePerformanceAnalysis } from '../../hooks/usePerformanceAnalysis';
import { formatPerformanceScore, getPerformanceStatusColor, getGradeColor } from '../../utils/performanceAnalysis';
import type { SubjectPerformance } from '../../types';

interface PerformanceDashboardProps {
  userId: string;
  className?: string;
}

/**
 * Performance Dashboard Component
 * Displays overall performance metrics and subject-specific analysis
 */
export function PerformanceDashboard({ userId, className = '' }: PerformanceDashboardProps) {
  const {
    performances,
    priorities,
    summary,
    isLoading,
    error,
    refresh,
    getFlaggedSubjects,
    getSubjectsByStatus
  } = usePerformanceAnalysis(userId);

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Performance Data</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => refresh()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const flaggedSubjects = getFlaggedSubjects();
  const criticalSubjects = getSubjectsByStatus('critical');
  const excellentSubjects = getSubjectsByStatus('excellent');

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Analysis</h2>
        <button
          onClick={() => refresh()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Refresh Analysis
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{summary.overallGPA.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Overall GPA</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{summary.subjectsNeedingAttention}</div>
            <div className="text-sm text-gray-600">Need Attention</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{summary.flaggedSubjects}</div>
            <div className="text-sm text-gray-600">Flagged Subjects</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{summary.consistencyScore}%</div>
            <div className="text-sm text-gray-600">Consistency Score</div>
          </div>
        </div>
      )}

      {/* Flagged Subjects Alert */}
      {flaggedSubjects.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-medium mb-2">⚠️ Subjects Requiring Immediate Attention</h3>
          <div className="space-y-2">
            {flaggedSubjects.map(subject => (
              <div key={subject.courseId} className="text-red-700 text-sm">
                <span className="font-medium">{subject.courseName}</span> - 
                Performance: {subject.performanceScore}/100
                {subject.lastStudied && (
                  <span className="ml-2 text-red-600">
                    (Last studied: {Math.floor((Date.now() - subject.lastStudied.getTime()) / (24 * 60 * 60 * 1000))} days ago)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Performance List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Subject Performance Overview</h3>
        </div>
        
        {performances.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No subjects found. Add some courses to see performance analysis.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {performances.map(performance => (
              <SubjectPerformanceCard key={performance.courseId} performance={performance} />
            ))}
          </div>
        )}
      </div>

      {/* Priority Subjects */}
      {priorities.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Study Priority Recommendations</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {priorities.slice(0, 5).map(priority => (
                <div key={priority.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{priority.courseName}</div>
                    <div className="text-sm text-gray-600">{priority.recommendedAction}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      priority.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                      priority.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      priority.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {priority.urgencyLevel.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{priority.timeAllocation}% of study time</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Subject Performance Card
 */
function SubjectPerformanceCard({ performance }: { performance: SubjectPerformance }) {
  const scoreFormatted = formatPerformanceScore(performance.performanceScore);
  
  return (
    <div className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{performance.courseName}</h4>
          <div className="flex items-center space-x-4 mt-1">
            <span className={`text-sm ${scoreFormatted.color}`}>
              {scoreFormatted.value}
            </span>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPerformanceStatusColor(performance.status)}`}>
              {performance.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`text-lg font-bold ${getGradeColor(performance.overallGrade)}`}>
              {performance.overallGrade}
            </span>
          </div>
        </div>
        
        {performance.flagged && (
          <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
            FLAGGED
          </div>
        )}
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{performance.studyTimeScore}/100</div>
          <div className="text-xs text-gray-600">Study Time</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{performance.questCompletionScore}/100</div>
          <div className="text-xs text-gray-600">Quest Completion</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{performance.consistencyScore}/100</div>
          <div className="text-xs text-gray-600">Consistency</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{performance.deadlineAdherenceScore}/100</div>
          <div className="text-xs text-gray-600">Deadlines</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center space-x-6 text-sm text-gray-600">
        <span>📚 {Math.round(performance.totalStudyTime / 60)}h studied</span>
        <span>✅ {performance.completedQuests}/{performance.totalQuests} quests</span>
        <span>📖 {performance.completedTopics}/{performance.totalTopics} topics</span>
        <span>📊 {performance.studyFrequency.toFixed(1)}x/week</span>
      </div>

      {/* High Priority Recommendations */}
      {performance.recommendations.filter(r => r.priority === 'high').length > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-sm font-medium text-yellow-800 mb-1">High Priority Recommendations:</div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {performance.recommendations
              .filter(r => r.priority === 'high')
              .slice(0, 2)
              .map(rec => (
                <li key={rec.id}>• {rec.title}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Interventions for Critical Subjects */}
      {performance.interventions.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-medium text-red-800 mb-1">Intervention Required:</div>
          <div className="text-sm text-red-700">
            {performance.interventions[0].title} - {performance.interventions[0].timeframe}
          </div>
        </div>
      )}

      {/* Positive Acknowledgments */}
      {performance.acknowledgments.length > 0 && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-sm font-medium text-green-800 mb-1">🎉 Recent Achievement:</div>
          <div className="text-sm text-green-700">
            {performance.acknowledgments[0].message}
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceDashboard;