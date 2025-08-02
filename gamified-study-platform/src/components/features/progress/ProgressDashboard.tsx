import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

import { ProgressBar } from '../../ui/ProgressBar';
import { StudyTimeChart } from './StudyTimeChart';
import { CourseProgressChart } from './CourseProgressChart';
import { StreakCalendar } from './StreakCalendar';
import { AchievementProgress } from './AchievementProgress';
import { WeeklyGoals } from './WeeklyGoals';
import {
  StudyAnalytics,
  Course,
  Achievement,
  StudySession,
} from '../../../types';
import { formatDuration } from '../../../utils/dateUtils';

interface ProgressDashboardProps {
  analytics: StudyAnalytics;
  courses: Course[];
  achievements: Achievement[];
  studySessions: StudySession[];
  onTimeRangeChange?: (range: string) => void;
}

export function ProgressDashboard({
  analytics,
  courses,
  achievements,
  studySessions,
  onTimeRangeChange,
}: ProgressDashboardProps) {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>(
    'overview'
  );

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    onTimeRangeChange?.(newRange);
  };

  const progressStats = useMemo(() => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      c => c.progress.completionPercentage === 100
    ).length;
    const inProgressCourses = courses.filter(
      c =>
        c.progress.completionPercentage > 0 &&
        c.progress.completionPercentage < 100
    ).length;

    const totalAchievements = achievements.length;
    const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalAchievements,
      unlockedAchievements,
      averageCourseProgress:
        totalCourses > 0
          ? courses.reduce(
              (sum, c) => sum + c.progress.completionPercentage,
              0
            ) / totalCourses
          : 0,
    };
  }, [courses, achievements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Progress Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your learning journey and achievements
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={e => handleTimeRangeChange(e.target.value)}
            className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">3 Months</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            <Button
              variant={selectedView === 'overview' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('overview')}
              className="rounded-r-none"
            >
              Overview
            </Button>
            <Button
              variant={selectedView === 'detailed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('detailed')}
              className="rounded-l-none"
            >
              Detailed
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Study Time
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(analytics.totalStudyTime)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Avg: {formatDuration(analytics.averageSessionLength)} per
                session
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Streak
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.streakDays} days
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Best: {analytics.longestStreak} days
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Level Progress
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                Level {analytics.levelProgress.currentLevel}
              </p>
              <div className="mt-2">
                <ProgressBar
                  progress={
                    (analytics.levelProgress.xpProgress /
                      analytics.levelProgress.xpToNextLevel) *
                    100
                  }
                  color="purple"
                  height="h-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {analytics.levelProgress.xpProgress} /{' '}
                  {analytics.levelProgress.xpToNextLevel} XP
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Achievements
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {progressStats.unlockedAchievements}/
                {progressStats.totalAchievements}
              </p>
              <div className="mt-2">
                <ProgressBar
                  progress={
                    (progressStats.unlockedAchievements /
                      progressStats.totalAchievements) *
                    100
                  }
                  color="green"
                  height="h-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {Math.round(
                    (progressStats.unlockedAchievements /
                      progressStats.totalAchievements) *
                      100
                  )}
                  % unlocked
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {selectedView === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Study Time Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <StudyTimeChart
                data={analytics.weeklyProgress}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>

          {/* Course Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseProgressChart
                courses={courses}
                subjectBreakdown={analytics.subjectBreakdown}
              />
            </CardContent>
          </Card>

          {/* Weekly Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyGoals
                currentWeekStats={{
                  studyTime:
                    analytics.weeklyProgress[
                      analytics.weeklyProgress.length - 1
                    ]?.studyTime || 0,
                  questsCompleted:
                    analytics.weeklyProgress[
                      analytics.weeklyProgress.length - 1
                    ]?.questsCompleted || 0,
                  xpEarned:
                    analytics.weeklyProgress[
                      analytics.weeklyProgress.length - 1
                    ]?.xpEarned || 0,
                }}
              />
            </CardContent>
          </Card>

          {/* Achievement Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <AchievementProgress achievements={achievements} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Study Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <StudyTimeChart
                  data={analytics.weeklyProgress}
                  timeRange={timeRange}
                  detailed={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Streak Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <StreakCalendar studySessions={studySessions} />
              </CardContent>
            </Card>
          </div>

          {/* Course Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Course Progress Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map(course => (
                  <div
                    key={course.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {course.name}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(course.progress.completionPercentage)}%
                      </span>
                    </div>
                    <ProgressBar
                      progress={course.progress.completionPercentage}
                      color={course.color}
                      height="h-3"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>
                        {course.progress.topicsCompleted}/
                        {course.progress.totalTopics} topics
                      </span>
                      <span>
                        {formatDuration(course.progress.hoursStudied)} studied
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
