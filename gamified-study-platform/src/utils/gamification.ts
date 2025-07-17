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
  const difficultyMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1 : 1.2;
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
    case 'daily':
      baseXP = 20;
      break;
    case 'weekly':
      baseXP = 50;
      break;
    case 'milestone':
      baseXP = 100;
      break;
    case 'bonus':
      baseXP = 30;
      break;
  }
  
  // Apply difficulty multiplier
  const difficultyMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'medium' ? 1 : 1.5;
  
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
  if (streakDays === 7) return 50;  // One week
  if (streakDays === 30) return 200; // One month
  if (streakDays === 100) return 500; // 100 days
  if (streakDays === 365) return 1000; // One year
  
  // Regular bonuses
  if (streakDays % 10 === 0) return 30; // Every 10 days
  if (streakDays % 5 === 0) return 15;  // Every 5 days
  if (streakDays % 3 === 0) return 5;   // Every 3 days
  
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