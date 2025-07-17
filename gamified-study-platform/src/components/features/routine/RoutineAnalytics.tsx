import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Calendar, Award } from 'lucide-react';
import { useRoutineStore } from '../../../store/routineStore';
import { Card } from '../../ui/Card';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { Badge } from '../../ui/Badge';
import type { Routine, RoutineAnalytics as RoutineAnalyticsType } from '../../../types';

interface RoutineAnalyticsProps {
  routine: Routine;
}

export const RoutineAnalytics: React.FC<RoutineAnalyticsProps> = ({ routine }) => {
  const { getRoutineAnalytics } = useRoutineStore();
  const [analytics, setAnalytics] = useState<RoutineAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getRoutineAnalytics(routine.id);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [routine.id, getRoutineAnalytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 dark:text-red-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Failed to Load Analytics</h3>
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
          <p>Start using your routine to see analytics and insights.</p>
        </div>
      </Card>
    );
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getConsistencyColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConsistencyBadge = (score: number): { variant: any; label: string } => {
    if (score >= 80) return { variant: 'success', label: 'Excellent' };
    if (score >= 60) return { variant: 'warning', label: 'Good' };
    return { variant: 'error', label: 'Needs Work' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics for {routine.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Performance insights and trends for the last 30 days
          </p>
        </div>
        
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: routine.color }}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Consistency Score
              </p>
              <p className={`text-2xl font-bold ${getConsistencyColor(analytics.consistencyScore)}`}>
                {Math.round(analytics.consistencyScore)}%
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Target className="w-8 h-8 text-gray-400" />
              <Badge {...getConsistencyBadge(analytics.consistencyScore)} size="sm">
                {getConsistencyBadge(analytics.consistencyScore).label}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg. Completion
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(analytics.averageCompletionRate)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Active Time
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(analytics.totalActiveTime)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Streak
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.streakDays} days
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Award className="w-8 h-8 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Best: {analytics.longestStreak}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weekly Trends
          </h3>
        </div>

        {analytics.weeklyTrends.length > 0 ? (
          <div className="space-y-4">
            {analytics.weeklyTrends.map((week, index) => (
              <div key={week.weekStart} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Week of {new Date(week.weekStart).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatTime(week.totalMinutes)} active time
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {Math.round(week.completionRate)}% completion
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(week.efficiencyScore)}% efficiency
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No weekly data available yet</p>
          </div>
        )}
      </Card>

      {/* Activity Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Breakdown
          </h3>
        </div>

        {analytics.activityBreakdown.length > 0 ? (
          <div className="space-y-4">
            {analytics.activityBreakdown.map((activity) => (
              <div key={activity.activityType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {activity.activityType.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(activity.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${activity.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTime(activity.totalMinutes)} total</span>
                  <span>{Math.round(activity.completionRate)}% completion</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity data available yet</p>
          </div>
        )}
      </Card>

      {/* Productivity Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Productivity Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Most Productive Day
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][analytics.mostProductiveDay]}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Peak Hour
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {analytics.mostProductiveHour}:00 - {analytics.mostProductiveHour + 1}:00
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Recommendations
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {analytics.consistencyScore < 70 && (
                  <li>• Consider reducing the number of time slots to improve consistency</li>
                )}
                {analytics.averageCompletionRate < 80 && (
                  <li>• Try shorter time blocks to increase completion rates</li>
                )}
                {analytics.streakDays < 7 && (
                  <li>• Focus on building a daily routine to improve your streak</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};