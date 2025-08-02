import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
// import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { ProgressBar } from '../ui/ProgressBar';
import {
  // getPerformanceTrend,
  formatStudyTime,
  // PERFORMANCE_CONSTANTS
} from '../../utils/performanceAnalysis';
import type { SubjectPerformance } from '../../types';

interface PerformanceTrendsProps {
  performances: SubjectPerformance[];
  className?: string;
}

type TimeRange = '7d' | '30d' | '90d' | '1y';
type TrendMetric =
  | 'performance'
  | 'study_time'
  | 'consistency'
  | 'quest_completion';

/**
 * Performance Trends Component
 * Shows historical performance data and trends analysis
 */
export function PerformanceTrends({
  performances,
  className = '',
}: PerformanceTrendsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] =
    useState<TrendMetric>('performance');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Filter performances based on selected subject
  const filteredPerformances = useMemo(() => {
    if (selectedSubject === 'all') return performances;
    return performances.filter(p => p.courseId === selectedSubject);
  }, [performances, selectedSubject]);

  // Calculate trend data
  const trendData = useMemo(() => {
    return calculateTrendData(filteredPerformances, selectedMetric, timeRange);
  }, [filteredPerformances, selectedMetric, timeRange]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return calculateSummaryStats(filteredPerformances, selectedMetric);
  }, [filteredPerformances, selectedMetric]);

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Performance Trends
          </h3>

          <div className="flex items-center space-x-4">
            {/* Subject Filter */}
            <Select
              value={selectedSubject}
              onChange={value => setSelectedSubject(value)}
              className="w-48"
            >
              <option value="all">All Subjects</option>
              {performances.map(p => (
                <option key={p.courseId} value={p.courseId}>
                  {p.courseName}
                </option>
              ))}
            </Select>

            {/* Metric Filter */}
            <Select
              value={selectedMetric}
              onChange={value => setSelectedMetric(value as TrendMetric)}
              className="w-40"
            >
              <option value="performance">Performance</option>
              <option value="study_time">Study Time</option>
              <option value="consistency">Consistency</option>
              <option value="quest_completion">Quest Completion</option>
            </Select>

            {/* Time Range Filter */}
            <Select
              value={timeRange}
              onChange={value => setTimeRange(value as TimeRange)}
              className="w-32"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Current Average"
            value={summaryStats.current}
            metric={selectedMetric}
            trend={summaryStats.trend}
          />
          <SummaryCard
            title="Best Performance"
            value={summaryStats.best}
            metric={selectedMetric}
            isPositive={true}
          />
          <SummaryCard
            title="Improvement"
            value={summaryStats.improvement}
            metric={selectedMetric}
            trend={summaryStats.improvementTrend}
          />
          <SummaryCard
            title="Subjects Tracked"
            value={filteredPerformances.length}
            metric="count"
          />
        </div>

        {/* Trend Chart */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-4">
            {getMetricLabel(selectedMetric)} Trend
          </h4>
          <TrendChart data={trendData} metric={selectedMetric} />
        </div>

        {/* Subject Comparison */}
        {selectedSubject === 'all' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">
              Subject Comparison
            </h4>
            <SubjectComparison
              performances={performances}
              metric={selectedMetric}
            />
          </div>
        )}

        {/* Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📊 Trend Insights</h4>
          <TrendInsights
            performances={filteredPerformances}
            metric={selectedMetric}
            timeRange={timeRange}
          />
        </div>
      </div>
    </Card>
  );
}

/**
 * Summary Card Component
 */
function SummaryCard({
  title,
  value,
  metric,
  trend,
  isPositive,
}: {
  title: string;
  value: number;
  metric: TrendMetric | 'count';
  trend?: 'up' | 'down' | 'stable';
  isPositive?: boolean;
}) {
  const formatValue = (val: number, met: TrendMetric | 'count') => {
    if (met === 'count') return val.toString();
    if (met === 'study_time') return formatStudyTime(val);
    return `${Math.round(val)}${met === 'performance' || met === 'consistency' || met === 'quest_completion' ? '/100' : ''}`;
  };

  const getTrendIcon = (t?: 'up' | 'down' | 'stable') => {
    if (!t) return null;
    switch (t) {
      case 'up':
        return <span className="text-green-500">↗️</span>;
      case 'down':
        return <span className="text-red-500">↘️</span>;
      case 'stable':
        return <span className="text-gray-500">→</span>;
    }
  };

  const getValueColor = () => {
    if (isPositive) return 'text-green-600';
    if (
      metric === 'performance' ||
      metric === 'consistency' ||
      metric === 'quest_completion'
    ) {
      if (value >= 85) return 'text-green-600';
      if (value >= 70) return 'text-blue-600';
      if (value >= 50) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-900';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{title}</span>
        {getTrendIcon(trend)}
      </div>
      <div className={`text-2xl font-bold ${getValueColor()}`}>
        {formatValue(value, metric)}
      </div>
    </div>
  );
}

/**
 * Simple Trend Chart Component
 */
function TrendChart({ data, metric }: { data: any[]; metric: TrendMetric }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500">
        No trend data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="h-48 bg-gray-50 rounded-lg p-4">
      <div className="h-full flex items-end space-x-2">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${Math.max(height, 5)}%` }}
                title={`${point.label}: ${point.value}`}
              />
              <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                {point.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Subject Comparison Component
 */
function SubjectComparison({
  performances,
  metric,
}: {
  performances: SubjectPerformance[];
  metric: TrendMetric;
}) {
  const getValue = (performance: SubjectPerformance, met: TrendMetric) => {
    switch (met) {
      case 'performance':
        return performance.performanceScore;
      case 'study_time':
        return performance.totalStudyTime;
      case 'consistency':
        return performance.consistencyScore;
      case 'quest_completion':
        return performance.questCompletionScore;
    }
  };

  const sortedPerformances = [...performances].sort(
    (a, b) => getValue(b, metric) - getValue(a, metric)
  );

  const maxValue = Math.max(...performances.map(p => getValue(p, metric)));

  return (
    <div className="space-y-3">
      {sortedPerformances.map(performance => {
        const value = getValue(performance, metric);
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

        return (
          <div
            key={performance.courseId}
            className="flex items-center space-x-4"
          >
            <div className="w-32 text-sm text-gray-700 truncate">
              {performance.courseName}
            </div>
            <div className="flex-1">
              <ProgressBar
                value={percentage}
                max={100}
                className="h-3"
                color={
                  metric === 'study_time'
                    ? 'blue'
                    : value >= 85
                      ? 'green'
                      : value >= 70
                        ? 'blue'
                        : value >= 50
                          ? 'yellow'
                          : 'red'
                }
              />
            </div>
            <div className="w-16 text-sm font-medium text-gray-900 text-right">
              {metric === 'study_time'
                ? formatStudyTime(value)
                : `${Math.round(value)}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Trend Insights Component
 */
function TrendInsights({
  performances,
  metric,
  timeRange,
}: {
  performances: SubjectPerformance[];
  metric: TrendMetric;
  timeRange: TimeRange;
}) {
  const insights = useMemo(() => {
    const insights: string[] = [];

    if (performances.length === 0) {
      insights.push('No performance data available for analysis.');
      return insights;
    }

    // Calculate averages
    const avgPerformance =
      performances.reduce((sum, p) => sum + p.performanceScore, 0) /
      performances.length;
    const avgConsistency =
      performances.reduce((sum, p) => sum + p.consistencyScore, 0) /
      performances.length;

    // Performance insights
    if (avgPerformance >= 85) {
      insights.push('🎉 Excellent overall performance across subjects!');
    } else if (avgPerformance >= 70) {
      insights.push(
        '👍 Good performance with room for improvement in some areas.'
      );
    } else if (avgPerformance >= 50) {
      insights.push(
        '⚠️ Performance needs attention - consider focusing on struggling subjects.'
      );
    } else {
      insights.push(
        '🚨 Critical performance issues detected - immediate action recommended.'
      );
    }

    // Consistency insights
    if (avgConsistency >= 80) {
      insights.push(
        '📈 Great study consistency - this builds strong learning habits.'
      );
    } else if (avgConsistency < 50) {
      insights.push(
        '📉 Study consistency could be improved for better retention.'
      );
    }

    // Subject-specific insights
    const strugglingSubjects = performances.filter(
      p => p.performanceScore < 60
    );
    if (strugglingSubjects.length > 0) {
      insights.push(
        `🎯 ${strugglingSubjects.length} subject(s) need immediate attention.`
      );
    }

    const excellentSubjects = performances.filter(
      p => p.performanceScore >= 85
    );
    if (excellentSubjects.length > 0) {
      insights.push(
        `⭐ ${excellentSubjects.length} subject(s) showing excellent performance.`
      );
    }

    return insights;
  }, [performances, metric, timeRange]);

  return (
    <div className="space-y-2">
      {insights.map((insight, index) => (
        <p key={index} className="text-sm text-blue-800">
          {insight}
        </p>
      ))}
    </div>
  );
}

// Helper functions
function getMetricLabel(metric: TrendMetric): string {
  switch (metric) {
    case 'performance':
      return 'Overall Performance';
    case 'study_time':
      return 'Study Time';
    case 'consistency':
      return 'Study Consistency';
    case 'quest_completion':
      return 'Quest Completion';
  }
}

function calculateTrendData(
  performances: SubjectPerformance[],
  metric: TrendMetric,
  timeRange: TimeRange
): Array<{ label: string; value: number }> {
  // This is a simplified implementation
  // In a real app, you'd fetch historical data from the database
  const days =
    timeRange === '7d'
      ? 7
      : timeRange === '30d'
        ? 30
        : timeRange === '90d'
          ? 90
          : 365;
  const data: Array<{ label: string; value: number }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Simulate trend data based on current performance
    const baseValue =
      performances.reduce((sum, p) => {
        switch (metric) {
          case 'performance':
            return sum + p.performanceScore;
          case 'study_time':
            return sum + p.totalStudyTime;
          case 'consistency':
            return sum + p.consistencyScore;
          case 'quest_completion':
            return sum + p.questCompletionScore;
        }
      }, 0) / (performances.length || 1);

    // Add some variation to simulate historical data
    const variation = (Math.random() - 0.5) * 20;
    const value = Math.max(0, baseValue + variation);

    data.push({
      label: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: Math.round(value),
    });
  }

  return data;
}

function calculateSummaryStats(
  performances: SubjectPerformance[],
  metric: TrendMetric
): {
  current: number;
  best: number;
  improvement: number;
  trend: 'up' | 'down' | 'stable';
  improvementTrend: 'up' | 'down' | 'stable';
} {
  if (performances.length === 0) {
    return {
      current: 0,
      best: 0,
      improvement: 0,
      trend: 'stable',
      improvementTrend: 'stable',
    };
  }

  const getValue = (p: SubjectPerformance) => {
    switch (metric) {
      case 'performance':
        return p.performanceScore;
      case 'study_time':
        return p.totalStudyTime;
      case 'consistency':
        return p.consistencyScore;
      case 'quest_completion':
        return p.questCompletionScore;
    }
  };

  const values = performances.map(getValue);
  const current = values.reduce((sum, val) => sum + val, 0) / values.length;
  const best = Math.max(...values);

  // Simulate improvement calculation (would use historical data in real app)
  const improvement = Math.random() * 10 - 5; // Random improvement between -5 and +5

  return {
    current: Math.round(current),
    best: Math.round(best),
    improvement: Math.round(improvement),
    trend: improvement > 2 ? 'up' : improvement < -2 ? 'down' : 'stable',
    improvementTrend:
      improvement > 0 ? 'up' : improvement < 0 ? 'down' : 'stable',
  };
}

export default PerformanceTrends;
