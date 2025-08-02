/**
 * Utility functions for gamification features
 */

/**
 * Calculate the level based on total XP
 * @param totalXP Total XP accumulated
 * @returns The current level
 */
export function calculateLevelFromXP(totalXP: number): number {
  // Simple formula: level = 1 + sqrt(totalXP / 100)
  return Math.floor(1 + Math.sqrt(totalXP / 100));
}

/**
 * Calculate the XP required for a specific level
 * @param level Target level
 * @returns XP required to reach this level
 */
export function calculateXPForLevel(level: number): number {
  // Inverse of the level formula: xp = 100 * (level - 1)^2
  return 100 * Math.pow(level - 1, 2);
}

/**
 * Calculate the current level's XP (XP since last level up)
 * @param totalXP Total XP accumulated
 * @returns Current level XP
 */
export function calculateCurrentLevelXP(totalXP: number): number {
  const currentLevel = calculateLevelFromXP(totalXP);
  const currentLevelMinXP = calculateXPForLevel(currentLevel);
  return totalXP - currentLevelMinXP;
}

/**
 * Calculate XP needed to reach the next level
 * @param totalXP Total XP accumulated
 * @returns XP needed for next level
 */
export function calculateXPToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevelFromXP(totalXP);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  return nextLevelXP - totalXP;
}

/**
 * Calculate XP reward for a study session
 * @param durationMinutes Duration in minutes
 * @param difficulty Difficulty level
 * @param hasBonus Whether bonus multiplier should be applied
 * @returns XP reward
 */
export function calculateStudySessionXP(
  durationMinutes: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  hasBonus: boolean = false
): number {
  // Base XP: 1 XP per minute
  let xp = durationMinutes;

  // Apply difficulty multiplier
  const difficultyMultiplier =
    difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1 : 1.2;
  xp *= difficultyMultiplier;

  // Apply bonus if applicable (e.g., streak bonus)
  if (hasBonus) {
    xp *= 1.25;
  }

  return Math.floor(xp);
}

/**
 * Calculate XP reward for completing a quest
 * @param questType Type of quest
 * @param difficulty Difficulty level
 * @returns XP reward
 */
export function calculateQuestXP(
  questType: 'daily' | 'weekly' | 'milestone' | 'bonus',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): number {
  // Base XP by quest type
  let baseXP = 0;
  switch (questType) {
    case 'daily': {
      baseXP = 20;
      break;
    }
    case 'weekly': {
      baseXP = 50;
      break;
    }
    case 'milestone': {
      baseXP = 100;
      break;
    }
    case 'bonus': {
      baseXP = 30;
      break;
    }
  }

  // Apply difficulty multiplier
  const difficultyMultiplier =
    difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1 : 1.5;

  return Math.floor(baseXP * difficultyMultiplier);
}

/**
 * Calculate XP reward for completing a todo item
 * @param estimatedMinutes Estimated time in minutes
 * @param completedEarly Whether completed before estimated time
 * @param completedOnTime Whether completed on time
 * @returns XP reward
 */
export function calculateTodoXP(
  estimatedMinutes: number,
  completedEarly: boolean = false,
  completedOnTime: boolean = true
): number {
  // Base XP: 1 XP per 5 minutes estimated
  let xp = Math.floor(estimatedMinutes / 5);

  // Minimum XP
  xp = Math.max(xp, 1);

  // Apply bonus for early completion
  if (completedEarly) {
    xp = Math.floor(xp * 1.5);
  }
  // Apply penalty for late completion
  else if (!completedOnTime) {
    xp = Math.floor(xp * 0.7);
  }

  return xp;
}

/**
 * Calculate streak bonus XP
 * @param streakDays Current streak in days
 * @returns Bonus XP
 */
export function calculateStreakBonus(streakDays: number): number {
  // No bonus for streaks less than 3 days
  if (streakDays < 3) return 0;

  // Milestone bonuses
  if (streakDays === 7) return 50; // One week
  if (streakDays === 30) return 200; // One month
  if (streakDays === 100) return 500; // 100 days
  if (streakDays === 365) return 1000; // One year

  // Regular bonuses
  if (streakDays % 10 === 0) return 30; // Every 10 days
  if (streakDays % 5 === 0) return 15; // Every 5 days
  if (streakDays % 3 === 0) return 5; // Every 3 days

  return 0;
}

/**
 * Update game stats with new XP
 * @param gameStats Current game stats
 * @param xpAmount XP to add
 * @returns Updated stats and level up info
 */
export function updateGameStats(
  gameStats: any,
  xpAmount: number
): { stats: any; leveledUp: boolean; newLevel: number | null } {
  const oldLevel = gameStats.level;
  const newTotalXP = gameStats.totalXP + xpAmount;
  const newLevel = calculateLevelFromXP(newTotalXP);
  const leveledUp = newLevel > oldLevel;

  const updatedStats = {
    ...gameStats,
    totalXP: newTotalXP,
    currentXP: calculateCurrentLevelXP(newTotalXP),
    xpToNextLevel: calculateXPToNextLevel(newTotalXP),
    level: newLevel,
  };

  return {
    stats: updatedStats,
    leveledUp,
    newLevel: leveledUp ? newLevel : null,
  };
}

/**
 * Check if a streak is still active
 * @param lastActivity Date of last activity
 * @returns Whether streak is still active
 */
export function isStreakActive(lastActivity: Date | string): boolean {
  const now = new Date();
  const lastDate = new Date(lastActivity);

  // Reset hours to compare dates only
  now.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);

  // Calculate days difference
  const diffTime = now.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Streak is active if last activity was today or yesterday
  return diffDays <= 1;
}

/**
 * Format XP amount for display
 * @param xp XP amount
 * @returns Formatted XP string
 */
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M XP`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K XP`;
  }
  return `${xp} XP`;
}

/**
 * Format level for display
 * @param level Level number
 * @returns Formatted level string
 */
export function formatLevel(level: number): string {
  return `Level ${level}`;
}

/**
 * Get progress percentage between current and next level
 * @param totalXP Total XP accumulated
 * @returns Progress percentage (0-100)
 */
export function getProgressPercentage(totalXP: number): number {
  const currentLevel = calculateLevelFromXP(totalXP);
  const currentLevelXP = calculateCurrentLevelXP(totalXP);
  const xpForNextLevel =
    calculateXPForLevel(currentLevel + 1) - calculateXPForLevel(currentLevel);

  return Math.min(100, Math.max(0, (currentLevelXP / xpForNextLevel) * 100));
}

/**
 * Calculate study streak from activity dates
 * @param activityDates Array of activity dates
 * @returns Current streak count
 */
export function calculateStudyStreak(activityDates: (Date | string)[]): number {
  if (!activityDates.length) return 0;

  // Sort dates in descending order
  const sortedDates = activityDates
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime())
    .map(date => {
      date.setHours(0, 0, 0, 0);
      return date;
    });

  // Remove duplicates
  const uniqueDates = sortedDates.filter(
    (date, index) =>
      index === 0 || date.getTime() !== sortedDates[index - 1].getTime()
  );

  if (!uniqueDates.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = today;

  for (const activityDate of uniqueDates) {
    const diffTime = currentDate.getTime() - activityDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || (streak === 0 && diffDays === 1)) {
      streak++;
      currentDate = new Date(activityDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (diffDays === 1) {
      streak++;
      currentDate = new Date(activityDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate pet evolution progress
 * @param petStats Current pet stats
 * @returns Evolution progress (0-100)
 */
export function calculatePetEvolutionProgress(
  petStats: Record<string, unknown>
): number {
  const happiness =
    typeof petStats.happiness === 'number' ? petStats.happiness : 0;
  const health = typeof petStats.health === 'number' ? petStats.health : 0;
  const level = typeof petStats.level === 'number' ? petStats.level : 1;
  const averageStats = (happiness + health) / 2;
  const levelBonus = Math.min(level * 5, 50);
  return Math.min(100, averageStats + levelBonus);
}

/**
 * Calculate pet stat decay over time
 * @param lastInteraction Date of last interaction
 * @param currentStats Current pet stats
 * @returns Decayed stats
 */
export function calculatePetStatDecay(
  lastInteraction: Date | string,
  currentStats: any
): any {
  const now = new Date();
  const lastDate = new Date(lastInteraction);
  const hoursSinceInteraction =
    (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

  // Decay rate: 1 point per 6 hours
  const decayAmount = Math.floor(hoursSinceInteraction / 6);

  return {
    ...currentStats,
    happiness: Math.max(0, currentStats.happiness - decayAmount),
    health: Math.max(0, currentStats.health - decayAmount),
  };
}

/**
 * Calculate bonus from pet interaction
 * @param interactionType Type of interaction
 * @param petStats Current pet stats
 * @returns Interaction bonus
 */
export function calculatePetInteractionBonus(
  interactionType: string,
  petStats: any
): number {
  const { happiness = 0, level = 1 } = petStats;
  let baseBonus = 0;

  switch (interactionType) {
    case 'feed': {
      baseBonus = 5;
      break;
    }
    case 'play': {
      baseBonus = 3;
      break;
    }
    case 'pet': {
      baseBonus = 2;
      break;
    }
    default:
      baseBonus = 1;
  }

  // Bonus increases with happiness and level
  const happinessMultiplier = 1 + happiness / 100;
  const levelMultiplier = 1 + level * 0.1;

  return Math.floor(baseBonus * happinessMultiplier * levelMultiplier);
}

/**
 * Check achievement progress
 * @param achievement Achievement to check
 * @param userStats User statistics
 * @returns Updated achievement progress
 */
export function checkAchievementProgress(
  achievement: Record<string, unknown>,
  userStats: Record<string, unknown>
): { current: number; target: number; progress: number; completed: boolean } {
  const { type, target } = achievement;
  const targetNum = typeof target === 'number' ? target : 1;
  let current = 0;

  switch (type) {
    case 'study_hours': {
      current =
        typeof userStats.totalStudyHours === 'number'
          ? userStats.totalStudyHours
          : 0;
      break;
    }
    case 'quests_completed': {
      current =
        typeof userStats.questsCompleted === 'number'
          ? userStats.questsCompleted
          : 0;
      break;
    }
    case 'level': {
      current = typeof userStats.level === 'number' ? userStats.level : 1;
      break;
    }
    case 'streak': {
      current =
        typeof userStats.currentStreak === 'number'
          ? userStats.currentStreak
          : 0;
      break;
    }
    default:
      current = 0;
  }

  const progress = Math.min(100, (current / targetNum) * 100);
  const completed = current >= targetNum;

  return {
    current,
    target: targetNum,
    progress,
    completed,
  };
}

/**
 * Get unlocked achievements
 * @param achievements Array of achievements
 * @param userStats User statistics
 * @returns Array of unlocked achievements
 */
export function getUnlockedAchievements(
  achievements: any[],
  userStats: any
): any[] {
  return achievements
    .map(achievement => checkAchievementProgress(achievement, userStats))
    .filter(achievement => achievement.completed);
}
