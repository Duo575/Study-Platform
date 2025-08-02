import React, { useState, useEffect } from 'react';
import { ProgressDashboard } from '../components/features/progress';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { StudyAnalytics, Course, Achievement, StudySession } from '../types';

// Mock data for demonstration - in a real app, this would come from your API/store
const mockAnalytics: StudyAnalytics = {
  totalStudyTime: 1250, // minutes
  averageSessionLength: 45,
  streakDays: 7,
  longestStreak: 14,
  questsCompleted: 12,
  achievementsUnlocked: 8,
  levelProgress: {
    currentLevel: 3,
    xpProgress: 750,
    xpToNextLevel: 1000,
  },
  subjectBreakdown: [
    {
      courseId: '1',
      courseName: 'Mathematics',
      timeSpent: 480,
      percentage: 38.4,
    },
    { courseId: '2', courseName: 'Physics', timeSpent: 360, percentage: 28.8 },
    {
      courseId: '3',
      courseName: 'Chemistry',
      timeSpent: 250,
      percentage: 20.0,
    },
    { courseId: '4', courseName: 'Biology', timeSpent: 160, percentage: 12.8 },
  ],
  weeklyProgress: [
    { week: '2024-01-01', studyTime: 180, questsCompleted: 2, xpEarned: 150 },
    { week: '2024-01-08', studyTime: 240, questsCompleted: 3, xpEarned: 200 },
    { week: '2024-01-15', studyTime: 300, questsCompleted: 4, xpEarned: 280 },
    { week: '2024-01-22', studyTime: 280, questsCompleted: 3, xpEarned: 220 },
    { week: '2024-01-29', studyTime: 250, questsCompleted: 2, xpEarned: 180 },
  ],
};

const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Advanced Mathematics',
    description: 'Calculus and Linear Algebra',
    color: '#3B82F6',
    syllabus: [],
    progress: {
      completionPercentage: 75,
      hoursStudied: 8,
      topicsCompleted: 15,
      totalTopics: 20,
      lastStudied: new Date('2024-01-28'),
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-28'),
  },
  {
    id: '2',
    name: 'Physics Fundamentals',
    description: 'Classical Mechanics and Thermodynamics',
    color: '#10B981',
    syllabus: [],
    progress: {
      completionPercentage: 60,
      hoursStudied: 6,
      topicsCompleted: 12,
      totalTopics: 20,
      lastStudied: new Date('2024-01-27'),
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: '3',
    name: 'Organic Chemistry',
    description: 'Molecular Structure and Reactions',
    color: '#F59E0B',
    syllabus: [],
    progress: {
      completionPercentage: 45,
      hoursStudied: 4.2,
      topicsCompleted: 9,
      totalTopics: 20,
      lastStudied: new Date('2024-01-26'),
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: '4',
    name: 'Cell Biology',
    description: 'Cellular Structure and Function',
    color: '#8B5CF6',
    syllabus: [],
    progress: {
      completionPercentage: 30,
      hoursStudied: 2.7,
      topicsCompleted: 6,
      totalTopics: 20,
      lastStudied: new Date('2024-01-25'),
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25'),
  },
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first study session',
    category: 'study_time',
    rarity: 'common',
    xpReward: 50,
    iconUrl: '',
    unlockedAt: new Date('2024-01-02'),
  },
  {
    id: '2',
    title: 'Week Warrior',
    description: 'Study for 7 consecutive days',
    category: 'consistency',
    rarity: 'rare',
    xpReward: 200,
    iconUrl: '',
    unlockedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    title: 'Quest Master',
    description: 'Complete 10 quests',
    category: 'quest_completion',
    rarity: 'epic',
    xpReward: 300,
    iconUrl: '',
    unlockedAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    title: 'Study Marathon',
    description: 'Study for 20 hours in total',
    category: 'study_time',
    rarity: 'rare',
    xpReward: 250,
    iconUrl: '',
    progress: {
      current: 18,
      target: 20,
      description: 'Study for 20 hours total',
    },
  },
  {
    id: '5',
    title: 'Consistency King',
    description: 'Maintain a 30-day study streak',
    category: 'consistency',
    rarity: 'legendary',
    xpReward: 500,
    iconUrl: '',
    progress: {
      current: 7,
      target: 30,
      description: 'Study for 30 consecutive days',
    },
  },
];

const mockStudySessions: StudySession[] = [
  {
    id: '1',
    courseId: '1',
    startTime: new Date('2024-01-28T09:00:00'),
    endTime: new Date('2024-01-28T10:30:00'),
    duration: 90,
    type: 'pomodoro',
    xpEarned: 45,
  },
  {
    id: '2',
    courseId: '2',
    startTime: new Date('2024-01-27T14:00:00'),
    endTime: new Date('2024-01-27T15:00:00'),
    duration: 60,
    type: 'free_study',
    xpEarned: 30,
  },
  {
    id: '3',
    courseId: '1',
    startTime: new Date('2024-01-26T10:00:00'),
    endTime: new Date('2024-01-26T11:15:00'),
    duration: 75,
    type: 'pomodoro',
    xpEarned: 38,
  },
];

export function ProgressPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('week');

  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load progress data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Simulate retry
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ProgressDashboard
        analytics={mockAnalytics}
        courses={mockCourses}
        achievements={mockAchievements}
        studySessions={mockStudySessions}
        onTimeRangeChange={handleTimeRangeChange}
      />
    </div>
  );
}
