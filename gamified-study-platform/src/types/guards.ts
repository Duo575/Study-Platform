// Type guards for runtime type checking

// Import types directly to avoid circular dependencies
export type QuestType = 'daily' | 'weekly' | 'milestone' | 'bonus';
export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type QuestStatus = 'available' | 'active' | 'completed' | 'expired';
export type AchievementCategory =
  | 'study_time'
  | 'consistency'
  | 'quest_completion'
  | 'pet_care'
  | 'social'
  | 'special_event';

// Basic interfaces for type guards (to avoid circular imports)
interface BasicGameStats {
  level: number;
  totalXP: number;
  currentXP: number;
  xpToNextLevel: number;
  streakDays: number;
  achievements: any[];
  lastActivity: Date | string;
  weeklyStats: any;
}

interface BasicUser {
  id: string;
  email: string;
  username: string;
  profile: any;
  gameStats: BasicGameStats;
  preferences: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface BasicCourse {
  id: string;
  name: string;
  description: string;
  color: string;
  syllabus: any[];
  progress: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface BasicQuest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  xpReward: number;
  difficulty: QuestDifficulty;
  requirements: any[];
  status: QuestStatus;
  createdAt: Date | string;
}

interface BasicStudyPet {
  id: string;
  name: string;
  species: any;
  level: number;
  happiness: number;
  health: number;
  evolution: any;
  accessories: any[];
  lastFed: Date | string;
  lastPlayed: Date | string;
  createdAt: Date | string;
}

interface BasicAchievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: string;
  xpReward: number;
  iconUrl: string;
}

interface BasicTodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  createdAt: Date | string;
}

interface BasicStudySession {
  id: string;
  startTime: Date | string;
  duration: number;
  type: string;
  xpEarned: number;
}

// Utility type guard helpers
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isArray<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(itemGuard);
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

// Quest type guards
export function isQuestType(value: unknown): value is QuestType {
  return (
    isString(value) && ['daily', 'weekly', 'milestone', 'bonus'].includes(value)
  );
}

export function isQuestDifficulty(value: unknown): value is QuestDifficulty {
  return isString(value) && ['easy', 'medium', 'hard'].includes(value);
}

export function isQuestStatus(value: unknown): value is QuestStatus {
  return (
    isString(value) &&
    ['available', 'active', 'completed', 'expired'].includes(value)
  );
}

// Achievement category guard
export function isAchievementCategory(
  value: unknown
): value is AchievementCategory {
  return (
    isString(value) &&
    [
      'study_time',
      'consistency',
      'quest_completion',
      'pet_care',
      'social',
      'special_event',
    ].includes(value)
  );
}

// Priority level guard
export function isPriorityLevel(
  value: unknown
): value is 'low' | 'medium' | 'high' {
  return isString(value) && ['low', 'medium', 'high'].includes(value);
}

// Complex type guards
export function isGameStats(value: unknown): value is BasicGameStats {
  return (
    typeof value === 'object' &&
    value !== null &&
    hasProperty(value, 'level') &&
    hasProperty(value, 'totalXP') &&
    hasProperty(value, 'currentXP') &&
    hasProperty(value, 'xpToNextLevel') &&
    hasProperty(value, 'streakDays') &&
    hasProperty(value, 'achievements') &&
    hasProperty(value, 'lastActivity') &&
    hasProperty(value, 'weeklyStats') &&
    isNumber(value.level) &&
    isNumber(value.totalXP) &&
    isNumber(value.currentXP) &&
    isNumber(value.xpToNextLevel) &&
    isNumber(value.streakDays) &&
    Array.isArray(value.achievements) &&
    (isDate(value.lastActivity) || isString(value.lastActivity))
  );
}

export function isUser(value: unknown): value is BasicUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    hasProperty(value, 'id') &&
    hasProperty(value, 'email') &&
    hasProperty(value, 'username') &&
    hasProperty(value, 'profile') &&
    hasProperty(value, 'gameStats') &&
    hasProperty(value, 'preferences') &&
    hasProperty(value, 'createdAt') &&
    hasProperty(value, 'updatedAt') &&
    isString(value.id) &&
    isString(value.email) &&
    isString(value.username) &&
    typeof value.profile === 'object' &&
    isGameStats(value.gameStats)
  );
}

export function isCourse(value: unknown): value is BasicCourse {
  return (
    typeof value === 'object' &&
    value !== null &&
    hasProperty(value, 'id') &&
    hasProperty(value, 'name') &&
    hasProperty(value, 'description') &&
    hasProperty(value, 'color') &&
    hasProperty(value, 'syllabus') &&
    hasProperty(value, 'progress') &&
    hasProperty(value, 'createdAt') &&
    hasProperty(value, 'updatedAt') &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.description) &&
    isString(value.color) &&
    Array.isArray(value.syllabus) &&
    typeof value.progress === 'object'
  );
}

export function isQuest(value: unknown): value is BasicQuest {
  return (
    typeof value === 'object' &&
    value !== null &&
    hasProperty(value, 'id') &&
    hasProperty(value, 'title') &&
    hasProperty(value, 'description') &&
    hasProperty(value, 'type') &&
    hasProperty(value, 'xpReward') &&
    hasProperty(value, 'difficulty') &&
    hasProperty(value, 'requirements') &&
    hasProperty(value, 'status') &&
    hasProperty(value, 'createdAt') &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.description) &&
    isQuestType(value.type) &&
    isNumber(value.xpReward) &&
    isQuestDifficulty(value.difficulty) &&
    Array.isArray(value.requirements) &&
    isQuestStatus(value.status)
  );
}

export function isStudyPet(value: unknown): value is BasicStudyPet {
  return (
    typeof value === 'object' &&
    value !== null &&
    hasProperty(value, 'id') &&
    hasProperty(value, 'name') &&
    hasProperty(value, 'species') &&
    hasProperty(value, 'level') &&
    hasProperty(value, 'happiness') &&
    hasProperty(value, 'health') &&
    hasProperty(value, 'evolution') &&
    hasProperty(value, 'accessories') &&
    hasProperty(value, 'lastFed') &&
    hasProperty(value, 'lastPlayed') &&
    hasProperty(value, 'createdAt') &&
    isString(value.id) &&
    isString(value.name) &&
    typeof value.species === 'object' &&
    isNumber(value.level) &&
    isNumber(value.happiness) &&
    isNumber(value.health) &&
    typeof value.evolution === 'object' &&
    Array.isArray(value.accessories)
  );
}

export function isAchievement(value: unknown): value is BasicAchievement {
  return (
    typeof value === 'object' &&
    value !== null &&
    hasProperty(value, 'id') &&
    hasProperty(value, 'title') &&
    hasProperty(value, 'description') &&
    hasProperty(value, 'category') &&
    hasProperty(value, 'rarity') &&
    hasProperty(value, 'xpReward') &&
    hasProperty(value, 'iconUrl') &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.description) &&
    isAchievementCategory(value.category) &&
    isString(value.rarity) &&
    isNumber(value.xpReward) &&
    isString(value.iconUrl)
  );
}

export function isTodoItem(value: unknown): value is BasicTodoItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    hasProperty(value, 'id') &&
    hasProperty(value, 'title') &&
    hasProperty(value, 'completed') &&
    hasProperty(value, 'priority') &&
    hasProperty(value, 'estimatedMinutes') &&
    hasProperty(value, 'createdAt') &&
    isString(value.id) &&
    isString(value.title) &&
    isBoolean(value.completed) &&
    isPriorityLevel(value.priority) &&
    isNumber(value.estimatedMinutes)
  );
}

export function isStudySession(value: unknown): value is BasicStudySession {
  return (
    typeof value === 'object' &&
    value !== null &&
    hasProperty(value, 'id') &&
    hasProperty(value, 'startTime') &&
    hasProperty(value, 'duration') &&
    hasProperty(value, 'type') &&
    hasProperty(value, 'xpEarned') &&
    isString(value.id) &&
    (isDate(value.startTime) || isString(value.startTime)) &&
    isNumber(value.duration) &&
    isString(value.type) &&
    isNumber(value.xpEarned)
  );
}

// Array type guards
export function isUserArray(value: unknown): value is BasicUser[] {
  return isArray(value, isUser);
}

export function isCourseArray(value: unknown): value is BasicCourse[] {
  return isArray(value, isCourse);
}

export function isQuestArray(value: unknown): value is BasicQuest[] {
  return isArray(value, isQuest);
}

export function isAchievementArray(
  value: unknown
): value is BasicAchievement[] {
  return isArray(value, isAchievement);
}

export function isTodoItemArray(value: unknown): value is BasicTodoItem[] {
  return isArray(value, isTodoItem);
}

export function isStudySessionArray(
  value: unknown
): value is BasicStudySession[] {
  return isArray(value, isStudySession);
}

// Additional validation functions
export function isValidAchievement(value: unknown): value is BasicAchievement {
  return isAchievement(value);
}

export function isValidTodo(value: unknown): value is BasicTodoItem {
  return isTodoItem(value);
}

export function isValidUser(value: unknown): value is BasicUser {
  return isUser(value);
}

export function isValidDate(value: unknown): value is Date {
  return isDate(value);
}

export function isValidUUID(value: unknown): value is string {
  return (
    isString(value) &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

export function isValidXPAmount(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

export function isValidLevel(value: unknown): value is number {
  return isNumber(value) && value >= 1 && Number.isInteger(value);
}

export function isValidDifficulty(value: unknown): value is QuestDifficulty {
  return isQuestDifficulty(value);
}

export function isValidQuestType(value: unknown): value is QuestType {
  return isQuestType(value);
}

export function isValidPriority(
  value: unknown
): value is 'low' | 'medium' | 'high' {
  return isPriorityLevel(value);
}

export function isValidEvolutionStage(value: unknown): value is string {
  return (
    isString(value) &&
    ['egg', 'baby', 'child', 'teen', 'adult', 'elder'].includes(value)
  );
}

// Additional validation functions for tests
export function isValidPet(value: unknown): value is BasicStudyPet {
  return (
    isStudyPet(value) &&
    value.level >= 1 &&
    value.happiness >= 0 &&
    value.happiness <= 100 &&
    value.health >= 0 &&
    value.health <= 100
  );
}

export function isValidEmail(value: unknown): value is string {
  return isString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPassword(value: unknown): value is string {
  return (
    isString(value) &&
    value.length >= 8 &&
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)
  );
}

// Additional validation functions for tests
export function isValidStudySession(
  value: unknown
): value is BasicStudySession {
  return isStudySession(value);
}

export function isValidQuest(value: unknown): value is BasicQuest {
  return isQuest(value);
}

export function isValidCourse(value: unknown): value is BasicCourse {
  return isCourse(value);
}

export function isValidGameStats(value: unknown): value is BasicGameStats {
  return isGameStats(value);
}
