/**
 * Gamification Engine - Core calculation functions for XP, levels, and streaks
 * 
 * This module provides the core logic for the gamification system, including:
 * - XP calculation for different activity types
 * - Level progression with dynamic XP requirements
 * - Streak tracking and validation
 * - Achievement progress tracking
 */

import { 
  XP_REWARDS, 
  DIFFICULTY_MULTIPLIERS, 
  TIME_MULTIPLIERS,
  LEVEL_XP_REQUIREMENTS
} from './constants';
import type { 
  GameStats, 
  QuestDifficulty, 
  QuestType,
  StudySession
} from '../types';

/**
 * Calculate XP for a study session based on duration, difficulty, and bonuses
 */
export function calculateStudySessionXP(
  durationMinutes: number,
  difficulty: QuestDifficulty = 'medium',
  hasBonus: boolean = false,
  focusPercentage: number = 100
): number {
  const baseXP = XP_REWARDS.STUDY_SESSION_BASE;
  const timeXP = durationMinutes * XP_REWARDS.STUDY_SESSION_PER_MINUTE;
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  
  // Apply time-based multipliers for session length
  let timeMultiplier = TIME_MULTIPLIERS.SHORT_SESSION;
  if (durationMinutes >= 90) {
    timeMultiplier = TIME_MULTIPLIERS.MARATHON_SESSION;
  } else if (durationMinutes >= 45) {
    timeMultiplier = TIME_MULTIPLIERS.LONG_SESSION;
  } else if (durationMinutes >= 15) {
    timeMultiplier = TIME_MULTIPLIERS.MEDIUM_SESSION;
  }

  // Calculate raw XP
  let totalXP = Math.floor((baseXP + timeXP) * difficultyMultiplier * timeMultiplier);
  
  // Apply focus percentage (for Pomodoro sessions)
  totalXP = Math.floor(totalXP * (focusPercentage / 100));
  
  // Apply bonus if applicable
  if (hasBonus) {
    totalXP += XP_REWARDS.FOCUS_SESSION_BONUS;
  }

  return Math.max(totalXP, 1); // Minimum 1 XP
}

/**
 * Calculate XP for completing a quest based on type and difficulty
 */
export function calculateQuestXP(
  questType: QuestType,
  difficulty: QuestDifficulty = 'medium',
  isEarly: boolean = false
): number {
  // Get base XP for quest type
  const questTypeKey = `${questType.toUpperCase()}_QUEST` as keyof typeof XP_REWARDS;
  const baseXP = XP_REWARDS[questTypeKey] || XP_REWARDS.QUEST_COMPLETION_BASE;
  
  // Apply difficulty multiplier
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  
  // Calculate XP
  let totalXP = Math.floor(baseXP * difficultyMultiplier);
  
  // Apply early completion bonus if applicable
  if (isEarly) {
    totalXP = Math.floor(totalXP * 1.25); // 25% bonus for early completion
  }
  
  return totalXP;
}

/**
 * Calculate XP for completing a todo item
 */
export function calculateTodoXP(
  estimatedMinutes: number,
  completedEarly: boolean = false,
  completedOnTime: boolean = true
): number {
  // Base XP depends on completion timing
  let baseXP = XP_REWARDS.TODO_COMPLETION;
  
  if (completedEarly) {
    baseXP = XP_REWARDS.TODO_COMPLETION_EARLY;
  } else if (completedOnTime) {
    baseXP = XP_REWARDS.TODO_COMPLETION_ON_TIME;
  }

  // Add bonus for longer tasks (2 XP per 30 minutes)
  const timeBonus = Math.floor(estimatedMinutes / 30) * 2;
  
  return baseXP + timeBonus;
}

/**
 * Calculate streak bonus XP based on streak length
 */
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 30) {
    return XP_REWARDS.MONTHLY_STREAK_BONUS;
  } else if (streakDays >= 7) {
    return XP_REWARDS.WEEKLY_STREAK_BONUS;
  } else if (streakDays >= 3) {
    return XP_REWARDS.STREAK_BONUS;
  }
  return 0;
}

/**
 * Calculate level based on total XP
 */
export function calculateLevelFromXP(totalXP: number): number {
  // Start from highest level and work down for efficiency
  for (let level = LEVEL_XP_REQUIREMENTS.length - 1; level >= 0; level--) {
    if (totalXP >= LEVEL_XP_REQUIREMENTS[level]) {
      return level;
    }
  }
  return 0; // Default to level 0
}

/**
 * Calculate XP required for a specific level
 */
export function calculateXPForLevel(targetLevel: number): number {
  if (targetLevel < 0) return 0;
  
  if (targetLevel >= LEVEL_XP_REQUIREMENTS.length) {
    // For levels beyond our defined requirements, use exponential growth
    const lastLevel = LEVEL_XP_REQUIREMENTS.length - 1;
    const lastXP = LEVEL_XP_REQUIREMENTS[lastLevel];
    const extraLevels = targetLevel - lastLevel;
    
    // Each level beyond defined levels requires 10% more XP than the previous
    let additionalXP = 0;
    let previousLevelXP = lastXP;
    
    for (let i = 0; i < extraLevels; i++) {
      const nextLevelXP = Math.floor(previousLevelXP * 1.1);
      additionalXP += (nextLevelXP - previousLevelXP);
      previousLevelXP = nextLevelXP;
    }
    
    return lastXP + additionalXP;
  }
  
  return LEVEL_XP_REQUIREMENTS[targetLevel];
}

/**
 * Calculate current XP within the current level
 */
export function calculateCurrentLevelXP(totalXP: number): number {
  const currentLevel = calculateLevelFromXP(totalXP);
  const currentLevelXP = calculateXPForLevel(currentLevel);
  return totalXP - currentLevelXP;
}

/**
 * Calculate XP needed to reach the next level
 */
export function calculateXPToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevelFromXP(totalXP);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  const currentLevelXP = calculateXPForLevel(currentLevel);
  return nextLevelXP - currentLevelXP;
}

/**
 * Update game stats with new XP
 */
export function updateGameStats(
  currentStats: GameStats,
  xpGained: number,
  activityType?: string
): { stats: GameStats; leveledUp: boolean; newLevel?: number } {
  const newTotalXP = currentStats.totalXP + xpGained;
  const oldLevel = currentStats.level;
  const newLevel = calculateLevelFromXP(newTotalXP);
  const leveledUp = newLevel > oldLevel;

  // Update weekly stats
  const weeklyStats = { ...currentStats.weeklyStats };
  weeklyStats.xpEarned += xpGained;
  
  // Update activity-specific stats
  if (activityType === 'quest') {
    weeklyStats.questsCompleted += 1;
  } else if (activityType === 'study') {
    // Assuming study sessions are tracked in minutes
    weeklyStats.studyHours += xpGained / (XP_REWARDS.STUDY_SESSION_PER_MINUTE * 60);
  }

  const updatedStats: GameStats = {
    ...currentStats,
    totalXP: newTotalXP,
    level: newLevel,
    currentXP: calculateCurrentLevelXP(newTotalXP),
    xpToNextLevel: calculateXPToNextLevel(newTotalXP),
    lastActivity: new Date(),
    weeklyStats,
  };

  return {
    stats: updatedStats,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  };
}

/**
 * Calculate study streak from an array of study sessions
 */
export function calculateStudyStreak(studySessions: Date[]): number {
  if (studySessions.length === 0) return 0;

  // Sort sessions by date (most recent first)
  const sortedSessions = studySessions
    .map(date => new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    .sort((a, b) => b.getTime() - a.getTime());

  // Remove duplicates (same day sessions)
  const uniqueDays = Array.from(new Set(sortedSessions.map(date => date.getTime())))
    .map(time => new Date(time));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDays.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (uniqueDays[i].getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Check if a streak is still active based on last study date
 */
export function isStreakActive(lastStudyDate: Date): boolean {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const lastStudy = new Date(lastStudyDate);
  lastStudy.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  // Streak is active if user studied today or yesterday
  return lastStudy.getTime() === today.getTime() || lastStudy.getTime() === yesterday.getTime();
}

/**
 * Validate daily activity for streak tracking
 */
export function validateDailyActivity(
  lastActivityDate: Date | null,
  currentDate: Date = new Date()
): { 
  isValid: boolean; 
  daysDifference: number;
  streakMaintained: boolean;
} {
  if (!lastActivityDate) {
    return { isValid: true, daysDifference: 0, streakMaintained: false };
  }

  const lastDate = new Date(lastActivityDate);
  lastDate.setHours(0, 0, 0, 0);
  
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = today.getTime() - lastDate.getTime();
  const daysDifference = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // Activity is valid for streak if it's a new day (not same day)
  const isValid = daysDifference > 0;
  
  // Streak is maintained if activity is on consecutive day
  const streakMaintained = daysDifference === 1;
  
  return { isValid, daysDifference, streakMaintained };
}

/**
 * Format XP for display
 */
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

/**
 * Format level for display
 */
export function formatLevel(level: number): string {
  return `Level ${level}`;
}

/**
 * Calculate progress percentage
 */
export function getProgressPercentage(current: number, target: number): number {
  if (target <= 0) return 100;
  return Math.min(Math.floor((current / target) * 100), 100);
}