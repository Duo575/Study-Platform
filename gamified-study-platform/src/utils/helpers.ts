// Utility helper functions

import {
  LEVEL_XP_REQUIREMENTS,
  XP_REWARDS,
  DIFFICULTY_MULTIPLIERS,
} from './constants';
import type { QuestDifficulty } from '../types';

/**
 * Calculate XP reward for a task
 */
export function calculateXP(
  taskType: keyof typeof XP_REWARDS,
  difficulty: QuestDifficulty = 'medium',
  timeSpentMinutes: number = 30
): number {
  const baseXP = XP_REWARDS[taskType];
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const timeMultiplier = Math.max(0.5, timeSpentMinutes / 30); // Minimum 0.5x multiplier

  return Math.floor(baseXP * difficultyMultiplier * timeMultiplier);
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXP: number): number {
  for (let level = LEVEL_XP_REQUIREMENTS.length - 1; level >= 0; level--) {
    if (totalXP >= LEVEL_XP_REQUIREMENTS[level]) {
      return level;
    }
  }
  return 0;
}

/**
 * Calculate current XP and XP needed for next level
 */
export function calculateLevelProgress(totalXP: number): {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
} {
  const level = calculateLevel(totalXP);
  const currentLevelXP = LEVEL_XP_REQUIREMENTS[level] || 0;
  const nextLevelXP =
    LEVEL_XP_REQUIREMENTS[level + 1] || LEVEL_XP_REQUIREMENTS[level] + 1000;

  const currentXP = totalXP - currentLevelXP;
  const xpToNextLevel = nextLevelXP - totalXP;
  const progressPercentage = (currentXP / (nextLevelXP - currentLevelXP)) * 100;

  return {
    level,
    currentXP,
    xpToNextLevel,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
  };
}

/**
 * Format time duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
}

/**
 * Generate a random color from the course color palette
 */
export function getRandomCourseColor(): string {
  const colors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#F97316',
    '#06B6D4',
    '#84CC16',
    '#EC4899',
    '#6B7280',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate pet happiness decay based on time since last interaction
 */
export function calculatePetDecay(
  lastInteraction: Date,
  currentHappiness: number
): number {
  const now = new Date();
  const hoursSinceInteraction =
    (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
  const decayAmount = Math.floor(hoursSinceInteraction * 2); // 2 points per hour

  return clamp(currentHappiness - decayAmount, 0, 100);
}

/**
 * Check if a streak is maintained (studied within the last 24 hours)
 */
export function isStreakMaintained(lastActivity: Date): boolean {
  const now = new Date();
  const hoursSinceActivity =
    (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  return hoursSinceActivity <= 24;
}

/**
 * Calculate study streak days
 */
export function calculateStreakDays(studySessions: Date[]): number {
  if (studySessions.length === 0) return 0;

  // Sort sessions by date (most recent first)
  const sortedSessions = studySessions.sort(
    (a, b) => b.getTime() - a.getTime()
  );

  let streakDays = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of sortedSessions) {
    const sessionDate = new Date(session);
    sessionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streakDays) {
      streakDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff > streakDays) {
      break;
    }
  }

  return streakDays;
}

/**
 * Parse syllabus text into structured topics
 */
export function parseSyllabus(syllabusText: string): string[] {
  // Simple parsing - split by lines and filter out empty lines
  return syllabusText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^[-*•]\s*$/))
    .map(line => line.replace(/^[-*•]\s*/, ''));
}

/**
 * Get priority color class
 */
export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
};
