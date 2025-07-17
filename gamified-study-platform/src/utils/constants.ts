// Application constants

// XP System
export const XP_REWARDS = {
  // Study activities
  STUDY_SESSION_BASE: 10,
  STUDY_SESSION_PER_MINUTE: 0.5,
  POMODORO_COMPLETION: 15,
  FOCUS_SESSION_BONUS: 5,
  
  // Quest system
  QUEST_COMPLETION_BASE: 25,
  DAILY_QUEST: 20,
  WEEKLY_QUEST: 75,
  MILESTONE_QUEST: 150,
  BONUS_QUEST: 50,
  
  // Task management
  TODO_COMPLETION: 5,
  TODO_COMPLETION_ON_TIME: 8,
  TODO_COMPLETION_EARLY: 12,
  
  // Consistency rewards
  STREAK_BONUS: 15,
  WEEKLY_STREAK_BONUS: 50,
  MONTHLY_STREAK_BONUS: 200,
  
  // Achievement system
  ACHIEVEMENT_UNLOCK: 50,
  RARE_ACHIEVEMENT: 100,
  EPIC_ACHIEVEMENT: 200,
  LEGENDARY_ACHIEVEMENT: 500,
  
  // Pet interactions
  PET_INTERACTION: 2,
  PET_FEEDING: 3,
  PET_PLAYING: 5,
  PET_EVOLUTION: 100,
  
  // Social features
  GROUP_QUEST_COMPLETION: 30,
  HELPING_PEER: 10,
  GROUP_STUDY_SESSION: 20,
} as const;

export const DIFFICULTY_MULTIPLIERS = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
  expert: 2.5,
} as const;

export const TIME_MULTIPLIERS = {
  // Bonus multipliers based on study session length
  SHORT_SESSION: 1.0,    // < 15 minutes
  MEDIUM_SESSION: 1.2,   // 15-45 minutes
  LONG_SESSION: 1.5,     // 45-90 minutes
  MARATHON_SESSION: 2.0, // > 90 minutes
} as const;

// Level progression (XP required for each level)
export const LEVEL_XP_REQUIREMENTS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250,
  3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450, 11500,
  12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200, 24750,
  26350, 28000, 29700, 31450, 33250, 35100, 37000, 38950, 40950, 43000,
  45100, 47250, 49450, 51700, 54000, 56350, 58750, 61200, 63700, 66250,
];

// Pet System
export const PET_STATS = {
  MAX_HAPPINESS: 100,
  MAX_HEALTH: 100,
  MAX_INTELLIGENCE: 100,
  DECAY_RATE_PER_HOUR: 2,
  INTERACTION_BOOST: 10,
  FEEDING_BOOST: 15,
  PLAYING_BOOST: 20,
  NEGLECT_THRESHOLD: 24, // hours
  CRITICAL_THRESHOLD: 20, // stat value below which pet is in critical condition
} as const;

export const PET_EVOLUTION_STAGES = {
  EGG: {
    id: 'egg',
    name: 'Egg',
    description: 'A mysterious egg waiting to hatch',
    requirements: { studyHours: 0, streakDays: 0, questsCompleted: 0 },
    duration: 1, // days
  },
  BABY: {
    id: 'baby',
    name: 'Baby',
    description: 'A cute baby companion just starting to learn',
    requirements: { studyHours: 5, streakDays: 3, questsCompleted: 5 },
    duration: 7,
  },
  TEEN: {
    id: 'teen',
    name: 'Teen',
    description: 'An energetic teenager eager to help with studies',
    requirements: { studyHours: 25, streakDays: 7, questsCompleted: 20 },
    duration: 14,
  },
  ADULT: {
    id: 'adult',
    name: 'Adult',
    description: 'A mature companion with developed study skills',
    requirements: { studyHours: 75, streakDays: 14, questsCompleted: 50 },
    duration: 30,
  },
  MASTER: {
    id: 'master',
    name: 'Master',
    description: 'A wise master who has achieved study enlightenment',
    requirements: { studyHours: 200, streakDays: 30, questsCompleted: 150 },
    duration: -1, // permanent
  },
} as const;

export const PET_SPECIES = [
  {
    id: 'dragon',
    name: 'Study Dragon',
    description: 'A wise dragon that grows stronger with knowledge',
    baseStats: { happiness: 50, health: 50, intelligence: 70 },
    specialAbility: 'XP Boost',
    abilityDescription: 'Provides 10% bonus XP for all study activities',
  },
  {
    id: 'owl',
    name: 'Scholar Owl',
    description: 'A nocturnal companion perfect for late-night study sessions',
    baseStats: { happiness: 60, health: 40, intelligence: 80 },
    specialAbility: 'Night Focus',
    abilityDescription: 'Reduces distraction during evening study sessions',
  },
  {
    id: 'fox',
    name: 'Clever Fox',
    description: 'A cunning fox that helps you stay focused and organized',
    baseStats: { happiness: 70, health: 60, intelligence: 60 },
    specialAbility: 'Task Optimizer',
    abilityDescription: 'Suggests optimal task ordering for maximum efficiency',
  },
  {
    id: 'cat',
    name: 'Study Cat',
    description: 'A calm and focused feline that promotes concentration',
    baseStats: { happiness: 65, health: 55, intelligence: 65 },
    specialAbility: 'Zen Mode',
    abilityDescription: 'Extends Pomodoro focus sessions by 5 minutes',
  },
  {
    id: 'phoenix',
    name: 'Phoenix Scholar',
    description: 'A mythical bird that rises from academic challenges',
    baseStats: { happiness: 45, health: 70, intelligence: 85 },
    specialAbility: 'Resilience',
    abilityDescription: 'Provides streak protection when study goals are missed',
  },
] as const;

// Quest System
export const QUEST_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MILESTONE: 'milestone',
  BONUS: 'bonus',
} as const;

export const QUEST_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// Pomodoro defaults
export const POMODORO_DEFAULTS = {
  WORK_DURATION: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
  SESSIONS_UNTIL_LONG_BREAK: 4,
} as const;

// Achievement categories
export const ACHIEVEMENT_CATEGORIES = {
  STUDY_TIME: 'study_time',
  CONSISTENCY: 'consistency',
  QUEST_COMPLETION: 'quest_completion',
  PET_CARE: 'pet_care',
  SOCIAL: 'social',
  SPECIAL_EVENT: 'special_event',
} as const;

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = {
  // Study Time Achievements
  FIRST_STEPS: {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first study session',
    category: 'study_time',
    rarity: 'common',
    xpReward: 25,
    requirements: { studyMinutes: 1 },
  },
  DEDICATED_LEARNER: {
    id: 'dedicated_learner',
    title: 'Dedicated Learner',
    description: 'Study for 10 hours total',
    category: 'study_time',
    rarity: 'common',
    xpReward: 100,
    requirements: { studyMinutes: 600 },
  },
  STUDY_WARRIOR: {
    id: 'study_warrior',
    title: 'Study Warrior',
    description: 'Study for 50 hours total',
    category: 'study_time',
    rarity: 'rare',
    xpReward: 250,
    requirements: { studyMinutes: 3000 },
  },
  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Study for 100 hours total',
    category: 'study_time',
    rarity: 'epic',
    xpReward: 500,
    requirements: { studyMinutes: 6000 },
  },
  MASTER_SCHOLAR: {
    id: 'master_scholar',
    title: 'Master Scholar',
    description: 'Study for 500 hours total',
    category: 'study_time',
    rarity: 'legendary',
    xpReward: 1000,
    requirements: { studyMinutes: 30000 },
  },

  // Consistency Achievements
  GETTING_STARTED: {
    id: 'getting_started',
    title: 'Getting Started',
    description: 'Maintain a 3-day study streak',
    category: 'consistency',
    rarity: 'common',
    xpReward: 50,
    requirements: { streakDays: 3 },
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    category: 'consistency',
    rarity: 'common',
    xpReward: 100,
    requirements: { streakDays: 7 },
  },
  CONSISTENCY_KING: {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Maintain a 30-day study streak',
    category: 'consistency',
    rarity: 'rare',
    xpReward: 300,
    requirements: { streakDays: 30 },
  },
  UNSTOPPABLE: {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Maintain a 100-day study streak',
    category: 'consistency',
    rarity: 'epic',
    xpReward: 750,
    requirements: { streakDays: 100 },
  },
  LEGENDARY_DEDICATION: {
    id: 'legendary_dedication',
    title: 'Legendary Dedication',
    description: 'Maintain a 365-day study streak',
    category: 'consistency',
    rarity: 'legendary',
    xpReward: 2000,
    requirements: { streakDays: 365 },
  },

  // Quest Completion Achievements
  QUEST_BEGINNER: {
    id: 'quest_beginner',
    title: 'Quest Beginner',
    description: 'Complete your first quest',
    category: 'quest_completion',
    rarity: 'common',
    xpReward: 25,
    requirements: { questsCompleted: 1 },
  },
  QUEST_HUNTER: {
    id: 'quest_hunter',
    title: 'Quest Hunter',
    description: 'Complete 25 quests',
    category: 'quest_completion',
    rarity: 'common',
    xpReward: 150,
    requirements: { questsCompleted: 25 },
  },
  QUEST_MASTER: {
    id: 'quest_master',
    title: 'Quest Master',
    description: 'Complete 100 quests',
    category: 'quest_completion',
    rarity: 'rare',
    xpReward: 400,
    requirements: { questsCompleted: 100 },
  },
  QUEST_LEGEND: {
    id: 'quest_legend',
    title: 'Quest Legend',
    description: 'Complete 500 quests',
    category: 'quest_completion',
    rarity: 'epic',
    xpReward: 1000,
    requirements: { questsCompleted: 500 },
  },

  // Pet Care Achievements
  PET_PARENT: {
    id: 'pet_parent',
    title: 'Pet Parent',
    description: 'Adopt your first study pet',
    category: 'pet_care',
    rarity: 'common',
    xpReward: 50,
    requirements: { petAdopted: true },
  },
  CARING_OWNER: {
    id: 'caring_owner',
    title: 'Caring Owner',
    description: 'Keep your pet happy for 7 days straight',
    category: 'pet_care',
    rarity: 'common',
    xpReward: 100,
    requirements: { petHappyDays: 7 },
  },
  PET_WHISPERER: {
    id: 'pet_whisperer',
    title: 'Pet Whisperer',
    description: 'Evolve your pet to Adult stage',
    category: 'pet_care',
    rarity: 'rare',
    xpReward: 300,
    requirements: { petEvolutionStage: 'adult' },
  },
  MASTER_TRAINER: {
    id: 'master_trainer',
    title: 'Master Trainer',
    description: 'Evolve your pet to Master stage',
    category: 'pet_care',
    rarity: 'legendary',
    xpReward: 1000,
    requirements: { petEvolutionStage: 'master' },
  },

  // Social Achievements
  TEAM_PLAYER: {
    id: 'team_player',
    title: 'Team Player',
    description: 'Join your first study group',
    category: 'social',
    rarity: 'common',
    xpReward: 75,
    requirements: { studyGroupsJoined: 1 },
  },
  GROUP_LEADER: {
    id: 'group_leader',
    title: 'Group Leader',
    description: 'Create a study group',
    category: 'social',
    rarity: 'common',
    xpReward: 100,
    requirements: { studyGroupsCreated: 1 },
  },
  HELPFUL_PEER: {
    id: 'helpful_peer',
    title: 'Helpful Peer',
    description: 'Help 10 group members with their studies',
    category: 'social',
    rarity: 'rare',
    xpReward: 200,
    requirements: { peersHelped: 10 },
  },
  COMMUNITY_CHAMPION: {
    id: 'community_champion',
    title: 'Community Champion',
    description: 'Complete 50 group quests',
    category: 'social',
    rarity: 'epic',
    xpReward: 500,
    requirements: { groupQuestsCompleted: 50 },
  },

  // Special Event Achievements
  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Study before 7 AM for 5 days',
    category: 'special_event',
    rarity: 'rare',
    xpReward: 200,
    requirements: { earlyMorningStudySessions: 5 },
  },
  NIGHT_OWL: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Study after 10 PM for 5 days',
    category: 'special_event',
    rarity: 'rare',
    xpReward: 200,
    requirements: { lateNightStudySessions: 5 },
  },
  WEEKEND_WARRIOR: {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Study on 10 weekends',
    category: 'special_event',
    rarity: 'rare',
    xpReward: 250,
    requirements: { weekendStudySessions: 10 },
  },
  HOLIDAY_SCHOLAR: {
    id: 'holiday_scholar',
    title: 'Holiday Scholar',
    description: 'Study during a holiday',
    category: 'special_event',
    rarity: 'epic',
    xpReward: 300,
    requirements: { holidayStudySessions: 1 },
  },
  PERFECTIONIST: {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete all daily quests for 30 days',
    category: 'special_event',
    rarity: 'legendary',
    xpReward: 1500,
    requirements: { perfectDays: 30 },
  },
} as const;

// Color palette for courses
export const COURSE_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
] as const;

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  POMODORO_SETTINGS: 'pomodoro_settings',
} as const;

// API endpoints (will be configured based on environment)
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  COURSES: '/courses',
  QUESTS: '/quests',
  TODOS: '/todos',
  PETS: '/pets',
  ACHIEVEMENTS: '/achievements',
  STUDY_SESSIONS: '/study-sessions',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  QUEST_COMPLETED: 'Quest completed! XP earned.',
  LEVEL_UP: 'Congratulations! You leveled up!',
  ACHIEVEMENT_UNLOCKED: 'Achievement unlocked!',
  PET_EVOLVED: 'Your pet has evolved!',
} as const;