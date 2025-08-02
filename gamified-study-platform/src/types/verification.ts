// Type verification file to ensure all types work correctly
// This file should compile without errors if all types are properly defined

import {
  // Type guards
  isString,
  isNumber,
  isBoolean,
  isDate,
  isQuestType,
  isQuestDifficulty,
  isQuestStatus,
  isAchievementCategory,
  isPriorityLevel,
  isGameStats,
  isUser,
  isCourse,
  isQuest,
  isStudyPet,
  isAchievement,
  isTodoItem,
  isStudySession,
  // Validators
  validateEmail,
  validatePassword,
  validateUsername,
  validateLoginForm,
  validateRegisterForm,
  validateCourseForm,
  validateTodoForm,
  validateUser,
  validateCourse,
  validateQuest,
  validateStudyPet,
  validateAchievement,
  sanitizeString,
  sanitizeEmail,
  sanitizeUsername,
  // Main types
  User,
  GameStats,
  Course,
  Quest,
  StudyPet,
  Achievement,
  TodoItem,
  StudySession,
  APIResponse,
  PaginatedResponse,
  LoginForm,
  RegisterForm,
  CourseForm,
  TodoForm,
  Optional,
  RequiredFields,
  DeepPartial,
  NonEmptyArray,
  ValueOf,
  KeysOfType,
} from './index';

// Gamification utilities
import {
  calculateStudySessionXP,
  calculateQuestXP,
  calculateTodoXP,
  calculateStreakBonus,
  calculateLevelFromXP,
  calculateXPForLevel,
  calculateCurrentLevelXP,
  calculateXPToNextLevel,
  updateGameStats,
  calculatePetEvolutionProgress,
  calculatePetStatDecay,
  calculatePetInteractionBonus,
  checkAchievementProgress,
  getUnlockedAchievements,
  formatXP,
  formatLevel,
  getProgressPercentage,
  calculateStudyStreak,
  isStreakActive,
} from '../utils/gamification';

// Constants
import {
  XP_REWARDS,
  DIFFICULTY_MULTIPLIERS,
  TIME_MULTIPLIERS,
  LEVEL_XP_REQUIREMENTS,
  PET_STATS,
  PET_EVOLUTION_STAGES,
  PET_SPECIES,
  QUEST_TYPES,
  QUEST_DIFFICULTIES,
  POMODORO_DEFAULTS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_DEFINITIONS,
  COURSE_COLORS,
  PRIORITY_LEVELS,
  THEMES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../utils/constants';

// Verification functions to test type safety
export function verifyTypeGuards(): void {
  // Test basic type guards
  console.log('String validation:', isString('test'));
  console.log('Number validation:', isNumber(123));
  console.log('Boolean validation:', isBoolean(true));
  console.log('Date validation:', isDate(new Date()));

  // Test enum type guards
  console.log('Quest type validation:', isQuestType('daily'));
  console.log('Quest difficulty validation:', isQuestDifficulty('medium'));
  console.log('Quest status validation:', isQuestStatus('active'));
  console.log(
    'Achievement category validation:',
    isAchievementCategory('study_time')
  );
  console.log('Priority level validation:', isPriorityLevel('high'));

  // Test complex type guards
  const mockGameStats = {
    level: 5,
    totalXP: 1000,
    currentXP: 200,
    xpToNextLevel: 300,
    streakDays: 7,
    achievements: [],
    lastActivity: new Date(),
    weeklyStats: {},
  };
  console.log('GameStats validation:', isGameStats(mockGameStats));

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    profile: {},
    gameStats: mockGameStats,
    preferences: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  console.log('User validation:', isUser(mockUser));
}

export function verifyValidators(): void {
  // Test basic validators
  console.log('Email validation:', validateEmail('test@example.com'));
  console.log('Password validation:', validatePassword('Password123'));
  console.log('Username validation:', validateUsername('testuser'));

  // Test form validators
  const loginForm: LoginForm = {
    email: 'test@example.com',
    password: 'password123',
  };
  console.log('Login form validation:', validateLoginForm(loginForm));

  const registerForm: RegisterForm = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'Password123',
    confirmPassword: 'Password123',
    acceptTerms: true,
  };
  console.log('Register form validation:', validateRegisterForm(registerForm));

  // Test sanitization
  console.log('String sanitization:', sanitizeString('  hello world  '));
  console.log('Email sanitization:', sanitizeEmail('  TEST@EXAMPLE.COM  '));
  console.log('Username sanitization:', sanitizeUsername('  Test_User  '));
}

export function verifyGamificationUtils(): void {
  // Test XP calculations
  console.log('Study session XP:', calculateStudySessionXP(30, 'medium', true));
  console.log('Quest XP:', calculateQuestXP('daily', 'hard'));
  console.log('Todo XP:', calculateTodoXP(60, true, true));
  console.log('Streak bonus:', calculateStreakBonus(7));

  // Test level calculations
  console.log('Level from XP:', calculateLevelFromXP(1500));
  console.log('XP for level:', calculateXPForLevel(10));
  console.log('Current level XP:', calculateCurrentLevelXP(1500));
  console.log('XP to next level:', calculateXPToNextLevel(1500));

  // Test formatting
  console.log('Format XP:', formatXP(12500));
  console.log('Format level:', formatLevel(15));
  console.log('Progress percentage:', getProgressPercentage(75));

  // Test streak calculation
  const studySessions = [
    new Date(),
    new Date(Date.now() - 86400000), // yesterday
    new Date(Date.now() - 172800000), // 2 days ago
  ];
  console.log('Study streak:', calculateStudyStreak(studySessions));
  console.log('Streak active:', isStreakActive(new Date()));
}

export function verifyUtilityTypes(): void {
  // Test utility types
  type PartialUser = Optional<User, 'profile' | 'preferences'>;
  type RequiredUser = RequiredFields<User, 'email' | 'username'>;
  type PartialDeepUser = DeepPartial<User>;
  type NonEmptyUsers = NonEmptyArray<User>;
  type UserValues = ValueOf<User>;
  type StringKeys = KeysOfType<User, string>;

  // Test API response types
  const apiResponse: APIResponse<User> = {
    data: {} as User,
    message: 'Success',
    success: true,
    timestamp: new Date().toISOString(),
    requestId: 'req-123',
  };

  const paginatedResponse: PaginatedResponse<Course> = {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
      hasNext: true,
      hasPrev: false,
    },
    meta: {
      filters: {},
      sort: 'name',
      order: 'asc',
    },
  };

  console.log('API Response type verified');
  console.log('Paginated Response type verified');
}

export function verifyConstants(): void {
  // Test XP rewards
  console.log('Study session base XP:', XP_REWARDS.STUDY_SESSION_BASE);
  console.log('Quest completion XP:', XP_REWARDS.QUEST_COMPLETION_BASE);
  console.log('Achievement unlock XP:', XP_REWARDS.ACHIEVEMENT_UNLOCK);

  // Test difficulty multipliers
  console.log('Easy multiplier:', DIFFICULTY_MULTIPLIERS.easy);
  console.log('Medium multiplier:', DIFFICULTY_MULTIPLIERS.medium);
  console.log('Hard multiplier:', DIFFICULTY_MULTIPLIERS.hard);

  // Test level requirements
  console.log('Level 1 XP requirement:', LEVEL_XP_REQUIREMENTS[1]);
  console.log('Level 10 XP requirement:', LEVEL_XP_REQUIREMENTS[10]);

  // Test pet system constants
  console.log('Max pet happiness:', PET_STATS.MAX_HAPPINESS);
  console.log('Pet decay rate:', PET_STATS.DECAY_RATE_PER_HOUR);

  // Test pet species
  console.log('Available pet species:', PET_SPECIES.length);
  console.log('First pet species:', PET_SPECIES[0].name);

  // Test evolution stages
  console.log(
    'Baby stage requirements:',
    PET_EVOLUTION_STAGES.BABY.requirements
  );
  console.log(
    'Adult stage requirements:',
    PET_EVOLUTION_STAGES.ADULT.requirements
  );

  // Test achievement definitions
  console.log(
    'First steps achievement:',
    ACHIEVEMENT_DEFINITIONS.FIRST_STEPS.title
  );
  console.log(
    'Master scholar achievement:',
    ACHIEVEMENT_DEFINITIONS.MASTER_SCHOLAR.xpReward
  );

  // Test other constants
  console.log('Available course colors:', COURSE_COLORS.length);
  console.log('Pomodoro work duration:', POMODORO_DEFAULTS.WORK_DURATION);
  console.log('Available themes:', Object.values(THEMES));
}

// Main verification function
export function runAllVerifications(): void {
  console.log('=== Running Type System Verification ===');

  try {
    console.log('\n1. Verifying Type Guards...');
    verifyTypeGuards();

    console.log('\n2. Verifying Validators...');
    verifyValidators();

    console.log('\n3. Verifying Gamification Utils...');
    verifyGamificationUtils();

    console.log('\n4. Verifying Utility Types...');
    verifyUtilityTypes();

    console.log('\n5. Verifying Constants...');
    verifyConstants();

    console.log('\n=== All Verifications Completed Successfully ===');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

// Export everything for potential use in other files
export * from './index';
export * from '../utils/gamification';
export * from '../utils/constants';
