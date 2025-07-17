# TypeScript Types and Interfaces Documentation

This directory contains comprehensive TypeScript type definitions for the Gamified Study Platform. The type system is designed to provide strong type safety, runtime validation, and excellent developer experience.

## File Structure

```
src/types/
├── index.ts           # Main type definitions and exports
├── guards.ts          # Runtime type guards for type checking
├── validators.ts      # Validation functions for forms and data
├── database.ts        # Supabase database type definitions
├── verification.ts    # Type system verification utilities
└── README.md         # This documentation file
```

## Core Type Definitions

### User System Types

#### `User`
The main user interface containing all user-related information.

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  profile: UserProfile;
  gameStats: GameStats;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `UserProfile`
Extended user profile information.

```typescript
interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  timezone: string;
  bio?: string;
}
```

#### `GameStats`
Gamification statistics for each user.

```typescript
interface GameStats {
  level: number;
  totalXP: number;
  currentXP: number;
  xpToNextLevel: number;
  streakDays: number;
  achievements: Achievement[];
  lastActivity: Date;
  weeklyStats: WeeklyStats;
}
```

### Study System Types

#### `Course`
Course/subject information and progress tracking.

```typescript
interface Course {
  id: string;
  name: string;
  description: string;
  color: string;
  syllabus: SyllabusItem[];
  progress: CourseProgress;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `Quest`
Gamified study tasks and challenges.

```typescript
interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType; // 'daily' | 'weekly' | 'milestone' | 'bonus'
  xpReward: number;
  difficulty: QuestDifficulty; // 'easy' | 'medium' | 'hard'
  requirements: QuestRequirement[];
  status: QuestStatus; // 'available' | 'active' | 'completed' | 'expired'
  courseId?: string;
  createdAt: Date;
  expiresAt?: Date;
  completedAt?: Date;
}
```

#### `TodoItem`
Task management with gamification integration.

```typescript
interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  courseId?: string;
  questId?: string;
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
}
```

### Pet System Types

#### `StudyPet`
Virtual study companion with evolution mechanics.

```typescript
interface StudyPet {
  id: string;
  name: string;
  species: PetSpecies;
  level: number;
  happiness: number;
  health: number;
  evolution: PetEvolution;
  accessories: PetAccessory[];
  lastFed: Date;
  lastPlayed: Date;
  createdAt: Date;
}
```

#### `PetSpecies`
Pet species definitions with base stats and abilities.

```typescript
interface PetSpecies {
  id: string;
  name: string;
  description: string;
  baseStats: PetStats;
  evolutionStages: PetEvolutionStage[];
}
```

### Achievement System Types

#### `Achievement`
Achievement/badge system for motivation.

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  iconUrl: string;
  unlockedAt?: Date;
  progress?: AchievementProgress;
}
```

## Utility Types

### Generic Utility Types

```typescript
// Make specific properties optional
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep partial for nested objects
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Non-empty array type
type NonEmptyArray<T> = [T, ...T[]];

// Extract all possible values from an object type
type ValueOf<T> = T[keyof T];

// Get keys of a specific type
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
```

### API Response Types

```typescript
interface APIResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp?: string;
  requestId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    filters?: Record<string, any>;
    sort?: string;
    order?: 'asc' | 'desc';
  };
}
```

### Form Types

```typescript
interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface CourseForm {
  name: string;
  description: string;
  color: string;
  syllabus: string;
  estimatedHours?: number;
  deadline?: Date;
}
```

## Type Guards

Type guards provide runtime type checking to ensure data integrity.

### Basic Type Guards

```typescript
function isString(value: unknown): value is string;
function isNumber(value: unknown): value is number;
function isBoolean(value: unknown): value is boolean;
function isDate(value: unknown): value is Date;
```

### Enum Type Guards

```typescript
function isQuestType(value: unknown): value is QuestType;
function isQuestDifficulty(value: unknown): value is QuestDifficulty;
function isQuestStatus(value: unknown): value is QuestStatus;
function isAchievementCategory(value: unknown): value is AchievementCategory;
function isPriorityLevel(value: unknown): value is 'low' | 'medium' | 'high';
```

### Complex Type Guards

```typescript
function isUser(value: unknown): value is User;
function isCourse(value: unknown): value is Course;
function isQuest(value: unknown): value is Quest;
function isStudyPet(value: unknown): value is StudyPet;
function isAchievement(value: unknown): value is Achievement;
```

## Validation Functions

Validation functions provide comprehensive data validation with detailed error reporting.

### Basic Validators

```typescript
function validateEmail(email: string): boolean;
function validatePassword(password: string): boolean;
function validateUsername(username: string): boolean;
```

### Form Validators

```typescript
function validateLoginForm(form: Partial<LoginForm>): ValidationResult;
function validateRegisterForm(form: Partial<RegisterForm>): ValidationResult;
function validateCourseForm(form: Partial<CourseForm>): ValidationResult;
function validateTodoForm(form: Partial<TodoForm>): ValidationResult;
```

### Entity Validators

```typescript
function validateUser(user: Partial<User>): ValidationResult;
function validateCourse(course: Partial<Course>): ValidationResult;
function validateQuest(quest: Partial<Quest>): ValidationResult;
function validateStudyPet(pet: Partial<StudyPet>): ValidationResult;
function validateAchievement(achievement: Partial<Achievement>): ValidationResult;
```

### Validation Result

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

## Constants and Configuration

### XP System Constants

```typescript
const XP_REWARDS = {
  STUDY_SESSION_BASE: 10,
  QUEST_COMPLETION_BASE: 25,
  ACHIEVEMENT_UNLOCK: 50,
  STREAK_BONUS: 15,
  // ... more XP rewards
} as const;

const DIFFICULTY_MULTIPLIERS = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
} as const;
```

### Pet System Constants

```typescript
const PET_STATS = {
  MAX_HAPPINESS: 100,
  MAX_HEALTH: 100,
  DECAY_RATE_PER_HOUR: 2,
  INTERACTION_BOOST: 10,
  // ... more pet constants
} as const;

const PET_EVOLUTION_STAGES = {
  EGG: { /* evolution stage definition */ },
  BABY: { /* evolution stage definition */ },
  TEEN: { /* evolution stage definition */ },
  ADULT: { /* evolution stage definition */ },
  MASTER: { /* evolution stage definition */ },
} as const;
```

### Achievement Definitions

```typescript
const ACHIEVEMENT_DEFINITIONS = {
  FIRST_STEPS: {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first study session',
    category: 'study_time',
    rarity: 'common',
    xpReward: 25,
    requirements: { studyMinutes: 1 },
  },
  // ... more achievement definitions
} as const;
```

## Gamification Utilities

### XP Calculation Functions

```typescript
function calculateStudySessionXP(
  durationMinutes: number,
  difficulty?: QuestDifficulty,
  hasBonus?: boolean
): number;

function calculateQuestXP(
  questType: 'daily' | 'weekly' | 'milestone' | 'bonus',
  difficulty?: QuestDifficulty
): number;

function calculateTodoXP(
  estimatedMinutes: number,
  completedEarly?: boolean,
  completedOnTime?: boolean
): number;
```

### Level Progression Functions

```typescript
function calculateLevelFromXP(totalXP: number): number;
function calculateXPForLevel(targetLevel: number): number;
function calculateCurrentLevelXP(totalXP: number): number;
function calculateXPToNextLevel(totalXP: number): number;
```

### Pet System Functions

```typescript
function calculatePetEvolutionProgress(
  pet: StudyPet,
  userStats: UserStats
): EvolutionProgress;

function calculatePetStatDecay(
  pet: StudyPet,
  hoursSinceLastInteraction: number
): PetStats;
```

### Achievement Functions

```typescript
function checkAchievementProgress(
  achievementId: string,
  userStats: UserStats
): AchievementProgress;

function getUnlockedAchievements(userStats: UserStats): Achievement[];
```

## Usage Examples

### Type Guards in Action

```typescript
// Runtime type checking
function processUserData(data: unknown) {
  if (isUser(data)) {
    // TypeScript now knows 'data' is of type User
    console.log(`Welcome, ${data.username}!`);
    console.log(`Level: ${data.gameStats.level}`);
  } else {
    console.error('Invalid user data');
  }
}
```

### Form Validation

```typescript
// Form validation with detailed error reporting
function handleRegistration(formData: unknown) {
  const validation = validateRegisterForm(formData);
  
  if (validation.isValid) {
    // Proceed with registration
    registerUser(formData as RegisterForm);
  } else {
    // Display validation errors
    validation.errors.forEach(error => {
      console.error(error);
    });
  }
}
```

### XP Calculation

```typescript
// Calculate XP for a study session
function awardStudySessionXP(durationMinutes: number, difficulty: QuestDifficulty) {
  const xpEarned = calculateStudySessionXP(durationMinutes, difficulty, true);
  
  // Update user's game stats
  const updatedStats = updateGameStats(currentStats, xpEarned, 'study_session');
  
  if (updatedStats.leveledUp) {
    console.log(`Congratulations! You reached level ${updatedStats.newLevel}!`);
  }
  
  return updatedStats.stats;
}
```

### Pet Evolution

```typescript
// Check if pet can evolve
function checkPetEvolution(pet: StudyPet, userStats: UserStats) {
  const evolutionProgress = calculatePetEvolutionProgress(pet, userStats);
  
  if (evolutionProgress.canEvolve) {
    console.log(`Your pet can evolve to ${evolutionProgress.nextStage}!`);
    return true;
  }
  
  console.log(`Evolution progress: ${evolutionProgress.progress}%`);
  return false;
}
```

## Best Practices

### 1. Always Use Type Guards for External Data

```typescript
// Good: Use type guards for API responses
async function fetchUser(id: string): Promise<User | null> {
  const response = await api.get(`/users/${id}`);
  
  if (isUser(response.data)) {
    return response.data;
  }
  
  console.error('Invalid user data received from API');
  return null;
}
```

### 2. Validate Forms Before Processing

```typescript
// Good: Validate forms before submission
function handleFormSubmission(formData: unknown) {
  const validation = validateCourseForm(formData);
  
  if (!validation.isValid) {
    displayErrors(validation.errors);
    return;
  }
  
  // Safe to process form data
  createCourse(formData as CourseForm);
}
```

### 3. Use Utility Types for Flexibility

```typescript
// Good: Use utility types for partial updates
type UserUpdate = Optional<User, 'profile' | 'preferences'>;

function updateUser(id: string, updates: UserUpdate): Promise<User> {
  // Implementation
}
```

### 4. Leverage Constants for Consistency

```typescript
// Good: Use constants instead of magic numbers
const xpReward = XP_REWARDS.QUEST_COMPLETION_BASE * DIFFICULTY_MULTIPLIERS.hard;

// Bad: Magic numbers
const xpReward = 25 * 2.0;
```

## Testing Type Safety

The `verification.ts` file contains comprehensive tests for all type definitions and utilities. Run the verification to ensure type safety:

```typescript
import { runAllVerifications } from './types/verification';

// Run all type system verifications
runAllVerifications();
```

This will test:
- Type guard functionality
- Validation functions
- Gamification utilities
- Utility types
- Constants and configurations

## Contributing

When adding new types or modifying existing ones:

1. Update the main type definitions in `index.ts`
2. Add corresponding type guards in `guards.ts`
3. Add validation functions in `validators.ts`
4. Update constants if needed
5. Add verification tests in `verification.ts`
6. Update this documentation

## Type Safety Benefits

This comprehensive type system provides:

- **Compile-time Safety**: Catch errors before runtime
- **Runtime Validation**: Ensure data integrity with type guards
- **Developer Experience**: Excellent IntelliSense and autocomplete
- **Maintainability**: Clear contracts between components
- **Scalability**: Easy to extend and modify
- **Documentation**: Types serve as living documentation