// Core type definitions for the Gamified Study Platform

// Re-export type guards and validators
export * from './guards';
export * from './validators';

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string; // Display name (computed from profile or username)
  profile: UserProfile;
  gameStats: GameStats;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  timezone: string;
  bio?: string;
}

export interface GameStats {
  level: number;
  totalXP: number;
  currentXP: number;
  xpToNextLevel: number;
  streakDays: number;
  achievements: Achievement[];
  lastActivity: Date;
  weeklyStats: WeeklyStats;
}

export interface WeeklyStats {
  studyHours: number;
  questsCompleted: number;
  streakMaintained: boolean;
  xpEarned: number;
  averageScore: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  studyReminders: boolean;
  pomodoroSettings: PomodoroSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  studyReminders: boolean;
  achievementUnlocks: boolean;
  petReminders: boolean;
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  color: string;
  syllabus: SyllabusItem[];
  progress: CourseProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyllabusItem {
  id: string;
  title: string;
  description?: string;
  topics: string[];
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  completed: boolean;
}

export interface CourseProgress {
  completionPercentage: number;
  hoursStudied: number;
  topicsCompleted: number;
  totalTopics: number;
  lastStudied: Date;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  xpReward: number;
  difficulty: QuestDifficulty;
  requirements: QuestRequirement[];
  status: QuestStatus;
  courseId?: string;
  createdAt: Date;
  expiresAt?: Date;
  completedAt?: Date;
}

export type QuestType = 'daily' | 'weekly' | 'milestone' | 'bonus';
export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type QuestStatus = 'available' | 'active' | 'completed' | 'expired';

export interface QuestRequirement {
  type: 'study_time' | 'complete_topic' | 'maintain_streak' | 'complete_tasks';
  target: number;
  current: number;
  description: string;
}

export interface TodoItem {
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

export interface StudyPet {
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

export interface PetSpecies {
  id: string;
  name: string;
  description: string;
  baseStats: PetStats;
  evolutionStages: PetEvolutionStage[];
}

export interface PetStats {
  happiness: number;
  health: number;
  intelligence: number;
}

export interface PetEvolution {
  stage: PetEvolutionStage;
  progress: number;
  nextStageRequirements: EvolutionRequirement[];
}

export interface PetEvolutionStage {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requiredLevel: number;
  stats: PetStats;
  unlockedAbilities: string[];
}

export interface EvolutionRequirement {
  type: 'study_hours' | 'streak_days' | 'quests_completed' | 'level_reached';
  target: number;
  current: number;
  description: string;
}

export interface PetAccessory {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
}

// Extended StudyPet interface with additional properties
export interface StudyPetExtended extends StudyPet {
  mood: PetMood;
  moodHistory: PetMoodEntry[];
  totalStudyTime: number;
  favoriteSubjects: string[];
  achievements: string[];
  evolutionStage: 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder';
}

// Pet mood system
export interface PetMood {
  current: 'excited' | 'happy' | 'content' | 'neutral' | 'sad' | 'depressed';
  factors: MoodFactor[];
  lastUpdated: Date;
  trend: 'improving' | 'stable' | 'declining';
}

export interface MoodFactor {
  type:
    | 'study_session'
    | 'feeding'
    | 'playing'
    | 'neglect'
    | 'achievement'
    | 'milestone';
  impact: number; // -100 to 100
  description: string;
  timestamp: Date;
}

export interface PetMoodEntry {
  mood: PetMood['current'];
  timestamp: Date;
  triggers: string[];
}

export interface Achievement {
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

export type AchievementCategory =
  | 'study_time'
  | 'consistency'
  | 'quest_completion'
  | 'pet_care'
  | 'social'
  | 'special_event';

export interface AchievementProgress {
  current: number;
  target: number;
  description: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  iconUrl?: string;
  requirements: AchievementRequirement;
  isHidden?: boolean;
  isSeasonalEvent?: boolean;
  eventEndDate?: Date;
}

export interface AchievementRequirement {
  type:
    | 'study_time'
    | 'consistency'
    | 'quest_completion'
    | 'pet_care'
    | 'social'
    | 'special_event'
    | 'composite';
  conditions: AchievementCondition[];
  operator?: 'AND' | 'OR';
}

export interface AchievementCondition {
  metric: string;
  operator: '>=' | '<=' | '=' | '>' | '<';
  value: number | string | boolean;
  timeframe?: 'all_time' | 'daily' | 'weekly' | 'monthly';
}

export interface AchievementUnlock {
  achievement: AchievementDefinition;
  unlockedAt: Date;
  xpAwarded: number;
  isNew: boolean;
}

export interface StudySession {
  id: string;
  courseId?: string;
  todoItemId?: string;
  questId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  type: 'pomodoro' | 'free_study' | 'break';
  xpEarned: number;
  notes?: string;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  courseId?: string;
  todoItemId?: string;
  questId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  type: 'work' | 'short_break' | 'long_break';
  completed: boolean;
  interrupted: boolean;
  xpEarned: number;
  notes?: string;
  sessionNumber: number; // Which session in the cycle (1-4 typically)
  cycleId: string; // Groups sessions into cycles
}

export interface PomodoroTimer {
  isActive: boolean;
  isPaused: boolean;
  currentSession: PomodoroSession | null;
  timeRemaining: number; // in seconds
  sessionType: 'work' | 'short_break' | 'long_break';
  sessionNumber: number;
  cycleId: string;
  settings: PomodoroSettings;
}

export interface PomodoroAnalytics {
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number; // in minutes
  averageSessionLength: number;
  completionRate: number;
  dailyStats: DailyPomodoroStats[];
  weeklyStats: WeeklyPomodoroStats[];
  peakHours: number[]; // Hours of day when most productive
  subjectBreakdown: SubjectPomodoroStats[];
  streakDays: number;
  longestStreak: number;
}

export interface DailyPomodoroStats {
  date: string;
  sessionsCompleted: number;
  focusTime: number;
  completionRate: number;
  xpEarned: number;
}

export interface WeeklyPomodoroStats {
  weekStart: string;
  sessionsCompleted: number;
  focusTime: number;
  averageCompletionRate: number;
  xpEarned: number;
}

export interface SubjectPomodoroStats {
  courseId: string;
  courseName: string;
  sessionsCompleted: number;
  focusTime: number;
  completionRate: number;
  averageSessionLength: number;
}

export interface BreakActivity {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'physical' | 'mental' | 'creative' | 'social';
  xpBonus?: number;
  icon: string;
}

// API Response types
export interface APIResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp?: string;
  requestId?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
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

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type NonEmptyArray<T> = [T, ...T[]];
export type ValueOf<T> = T[keyof T];
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface LoadingProps {
  isLoading: boolean;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface ErrorProps {
  error?: string | null;
  onRetry?: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface CourseForm {
  name: string;
  description: string;
  color: string;
  syllabus: string; // Raw syllabus text
  estimatedHours?: number;
  deadline?: Date;
}

export interface TodoForm {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  courseId?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface PetForm {
  name: string;
  speciesId: string;
}

export interface StudySessionForm {
  courseId?: string;
  todoItemId?: string;
  questId?: string;
  type: 'pomodoro' | 'free_study' | 'break';
  plannedDuration?: number;
  notes?: string;
}

export interface ProfileUpdateForm {
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
  avatarFile?: File;
}

export interface PreferencesForm {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  studyReminders: boolean;
  pomodoroSettings: PomodoroSettings;
}

// Filter and search types
export interface CourseFilters {
  search?: string;
  color?: string;
  completionStatus?: 'all' | 'completed' | 'in_progress' | 'not_started';
  sortBy?: 'name' | 'created_at' | 'progress' | 'last_studied';
  sortOrder?: 'asc' | 'desc';
}

export interface QuestFilters {
  type?: QuestType | 'all';
  difficulty?: QuestDifficulty | 'all';
  status?: QuestStatus | 'all';
  courseId?: string;
  search?: string;
  sortBy?: 'created_at' | 'xp_reward' | 'difficulty' | 'expires_at';
  sortOrder?: 'asc' | 'desc';
}

export interface TodoFilters {
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'all';
  courseId?: string;
  search?: string;
  dueDate?: 'today' | 'week' | 'overdue' | 'all';
  sortBy?: 'created_at' | 'due_date' | 'priority' | 'estimated_time';
  sortOrder?: 'asc' | 'desc';
}

export interface AchievementFilters {
  category?: AchievementCategory | 'all';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'all';
  unlocked?: boolean;
  search?: string;
  sortBy?: 'unlocked_at' | 'xp_reward' | 'rarity';
  sortOrder?: 'asc' | 'desc';
}

// State management types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CourseState {
  courses: Course[];
  activeCourse: Course | null;
  isLoading: boolean;
  error: string | null;
  filters: CourseFilters;
}

export interface QuestState {
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  isLoading: boolean;
  error: string | null;
  filters: QuestFilters;
}

export interface PetState {
  pet: StudyPet | null;
  species: PetSpecies[];
  isLoading: boolean;
  error: string | null;
  lastInteraction: Date | null;
}

// Event types
export interface StudyEvent {
  type:
    | 'session_start'
    | 'session_end'
    | 'quest_complete'
    | 'level_up'
    | 'achievement_unlock';
  timestamp: Date;
  data: Record<string, any>;
  userId: string;
}

export interface PetEvent {
  type: 'feed' | 'play' | 'evolve' | 'accessory_unlock';
  timestamp: Date;
  petId: string;
  userId: string;
  data?: Record<string, any>;
}

// Routine and Schedule Management Types
export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  templateId?: string;
  scheduleSlots: ScheduleSlot[];
  performance?: RoutinePerformance[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleSlot {
  id: string;
  routineId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  activityType: ActivityType;
  activityName?: string;
  courseId?: string;
  priority: number; // 1-5
  isFlexible: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityType = 'study' | 'break' | 'exercise' | 'meal' | 'custom';

export interface RoutineTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  templateData: ScheduleSlotTemplate[];
  isPublic: boolean;
  createdBy?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateCategory = 'study' | 'exercise' | 'personal' | 'work';

export interface ScheduleSlotTemplate {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  activityType: ActivityType;
  activityName: string;
  priority: number;
  isFlexible: boolean;
  notes?: string;
}

export interface RoutinePerformance {
  id: string;
  routineId: string;
  date: string; // YYYY-MM-DD format
  totalSlots: number;
  completedSlots: number;
  completionRate: number;
  totalPlannedMinutes: number;
  actualMinutes: number;
  efficiencyScore: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlotCompletion {
  id: string;
  slotId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
  actualDuration?: number; // in minutes
  qualityRating?: number; // 1-5
  notes?: string;
  createdAt: Date;
}

export interface RoutineShare {
  id: string;
  routineId: string;
  sharedBy: string;
  sharedWith?: string;
  shareCode?: string;
  isPublic: boolean;
  permissions: SharePermissions;
  expiresAt?: Date;
  createdAt: Date;
}

export interface SharePermissions {
  view: boolean;
  copy: boolean;
  modify: boolean;
}

export interface RoutineSuggestion {
  id: string;
  userId: string;
  routineId?: string;
  suggestionType: SuggestionType;
  title: string;
  description: string;
  suggestedChanges: Record<string, any>;
  priority: number; // 1-5
  isApplied: boolean;
  isDismissed: boolean;
  createdAt: Date;
  appliedAt?: Date;
  dismissedAt?: Date;
}

export type SuggestionType =
  | 'time_optimization'
  | 'conflict_resolution'
  | 'productivity_boost';

export interface ScheduleConflict {
  conflictingSlotId: string;
  activityName: string;
  startTime: string;
  endTime: string;
}

export interface WeeklySchedule {
  [key: number]: ScheduleSlot[]; // Day of week (0-6) to slots
}

export interface RoutineAnalytics {
  consistencyScore: number;
  averageCompletionRate: number;
  totalActiveTime: number;
  mostProductiveDay: number;
  mostProductiveHour: number;
  streakDays: number;
  longestStreak: number;
  weeklyTrends: WeeklyRoutineTrend[];
  activityBreakdown: ActivityBreakdown[];
}

export interface WeeklyRoutineTrend {
  weekStart: string;
  completionRate: number;
  totalMinutes: number;
  efficiencyScore: number;
}

export interface ActivityBreakdown {
  activityType: ActivityType;
  totalMinutes: number;
  completionRate: number;
  averageQuality: number;
  percentage: number;
}

// Form types for routine management
export interface RoutineForm {
  name: string;
  description?: string;
  color: string;
  templateId?: string;
}

export interface ScheduleSlotForm {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  activityType: ActivityType;
  activityName: string;
  courseId?: string;
  priority: number;
  isFlexible: boolean;
  notes?: string;
}

export interface RoutineFilters {
  search?: string;
  isActive?: boolean;
  category?: TemplateCategory;
  sortBy?: 'name' | 'created_at' | 'completion_rate' | 'last_used';
  sortOrder?: 'asc' | 'desc';
}

// State management types for routines
export interface RoutineState {
  routines: Routine[];
  activeRoutine: Routine | null;
  templates: RoutineTemplate[];
  suggestions: RoutineSuggestion[];
  isLoading: boolean;
  error: string | null;
  filters: RoutineFilters;
  selectedDate: Date;
  weeklyView: WeeklySchedule;
}

// Analytics types
export interface StudyAnalytics {
  totalStudyTime: number;
  averageSessionLength: number;
  streakDays: number;
  longestStreak: number;
  questsCompleted: number;
  achievementsUnlocked: number;
  levelProgress: {
    currentLevel: number;
    xpProgress: number;
    xpToNextLevel: number;
  };
  subjectBreakdown: {
    courseId: string;
    courseName: string;
    timeSpent: number;
    percentage: number;
  }[];
  weeklyProgress: {
    week: string;
    studyTime: number;
    questsCompleted: number;
    xpEarned: number;
  }[];
}

// Performance Analysis Types
export interface SubjectPerformance {
  courseId: string;
  courseName: string;
  performanceScore: number; // 0-100
  studyTimeScore: number; // 0-100
  questCompletionScore: number; // 0-100
  consistencyScore: number; // 0-100
  deadlineAdherenceScore: number; // 0-100
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
  flagged: boolean;
  lastStudied: Date | null;
  totalStudyTime: number; // in minutes
  completedQuests: number;
  totalQuests: number;
  completedTopics: number;
  totalTopics: number;
  averageSessionLength: number; // in minutes
  studyFrequency: number; // sessions per week
  recommendations: PerformanceRecommendation[];
  interventions: InterventionStrategy[];
  acknowledgments: ProgressAcknowledgment[];
}

export interface PerformanceRecommendation {
  id: string;
  type:
    | 'study_time'
    | 'consistency'
    | 'quest_focus'
    | 'deadline_management'
    | 'break_schedule';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
  timeToImplement: string;
  category: 'immediate' | 'short_term' | 'long_term';
}

export interface InterventionStrategy {
  id: string;
  type:
    | 'intensive_study'
    | 'schedule_adjustment'
    | 'goal_modification'
    | 'resource_addition'
    | 'peer_support';
  urgency: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  steps: InterventionStep[];
  expectedOutcome: string;
  timeframe: string;
  successMetrics: string[];
}

export interface InterventionStep {
  order: number;
  action: string;
  duration: string;
  resources?: string[];
  checkpoints?: string[];
}

export interface ProgressAcknowledgment {
  id: string;
  type: 'improvement' | 'milestone' | 'consistency' | 'achievement';
  title: string;
  message: string;
  celebrationLevel: 'small' | 'medium' | 'large';
  xpBonus?: number;
  badgeEarned?: string;
  createdAt: Date;
}

export interface SubjectPriority {
  courseId: string;
  courseName: string;
  priorityScore: number; // 0-100
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  factors: PriorityFactor[];
  recommendedAction: string;
  timeAllocation: number; // percentage of total study time
}

export interface PriorityFactor {
  type:
    | 'deadline_proximity'
    | 'performance_gap'
    | 'importance_weight'
    | 'prerequisite_dependency';
  impact: number; // 0-100
  description: string;
}

export interface PerformanceConfig {
  thresholds: {
    excellent: number;
    good: number;
    needsAttention: number;
    critical: number;
  };
  weights: {
    studyTime: number;
    questCompletion: number;
    consistency: number;
    deadlineAdherence: number;
  };
  flaggingCriteria: {
    minPerformanceScore: number;
    maxDaysSinceLastStudy: number;
    minQuestCompletionRate: number;
    minConsistencyScore: number;
  };
}

export interface PerformanceSummary {
  overallGPA: number;
  subjectsNeedingAttention: number;
  flaggedSubjects: number;
  totalRecommendations: number;
  consistencyScore: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

// AI Study Assistant Types
export interface AIStudyAssistant {
  id: string;
  userId: string;
  name: string;
  personality: AIPersonality;
  preferences: AIPreferences;
  conversationHistory: AIConversation[];
  learningProfile: StudentLearningProfile;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIPersonality {
  type: 'encouraging' | 'analytical' | 'casual' | 'professional';
  traits: string[];
  communicationStyle: 'formal' | 'friendly' | 'motivational' | 'direct';
  responseLength: 'brief' | 'detailed' | 'adaptive';
}

export interface AIPreferences {
  studyMethodSuggestions: boolean;
  motivationalMessages: boolean;
  progressCelebrations: boolean;
  reminderStyle: 'gentle' | 'firm' | 'playful';
  explanationDepth: 'basic' | 'intermediate' | 'advanced';
  contextAwareness: boolean;
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  context: ConversationContext;
  startedAt: Date;
  lastMessageAt: Date;
  isActive: boolean;
  tags: string[];
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: AIMessageType;
  metadata?: MessageMetadata;
  timestamp: Date;
  isEdited: boolean;
  reactions?: MessageReaction[];
}

export type AIMessageType =
  | 'question'
  | 'explanation'
  | 'suggestion'
  | 'motivation'
  | 'reminder'
  | 'celebration'
  | 'analysis'
  | 'planning';

export interface MessageMetadata {
  relatedCourseId?: string;
  relatedQuestId?: string;
  relatedTopics?: string[];
  confidence?: number;
  sources?: string[];
  suggestedActions?: string[];
}

export interface MessageReaction {
  type: 'helpful' | 'not_helpful' | 'funny' | 'motivating';
  timestamp: Date;
}

export interface ConversationContext {
  currentCourse?: string;
  currentTopic?: string;
  studySession?: string;
  userMood?: 'motivated' | 'struggling' | 'neutral' | 'frustrated';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  studyGoal?: string;
  recentActivity?: string[];
}

export interface StudentLearningProfile {
  learningStyle: LearningStyle[];
  preferredExplanationTypes: ExplanationType[];
  difficultyPreference: 'gradual' | 'challenging' | 'mixed';
  attentionSpan: number; // in minutes
  bestStudyTimes: string[]; // time ranges like "09:00-11:00"
  motivationTriggers: MotivationTrigger[];
  knowledgeGaps: KnowledgeGap[];
  strengths: string[];
  improvementAreas: string[];
}

export type LearningStyle =
  | 'visual'
  | 'auditory'
  | 'kinesthetic'
  | 'reading_writing'
  | 'logical'
  | 'social'
  | 'solitary';

export type ExplanationType =
  | 'step_by_step'
  | 'examples'
  | 'analogies'
  | 'diagrams'
  | 'practice_problems'
  | 'real_world_applications';

export interface MotivationTrigger {
  type:
    | 'progress_tracking'
    | 'competition'
    | 'rewards'
    | 'social_recognition'
    | 'personal_growth';
  effectiveness: number; // 1-10
  description: string;
}

export interface KnowledgeGap {
  courseId: string;
  topic: string;
  severity: 'minor' | 'moderate' | 'major';
  identifiedAt: Date;
  addressedAt?: Date;
  improvementPlan?: string[];
}

export interface AIStudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  courseId?: string;
  goals: StudyGoal[];
  schedule: StudyScheduleItem[];
  adaptiveElements: AdaptiveElement[];
  generatedAt: Date;
  lastUpdated: Date;
  isActive: boolean;
  progress: PlanProgress;
}

export interface StudyGoal {
  id: string;
  description: string;
  targetDate: Date;
  priority: 'high' | 'medium' | 'low';
  measurable: boolean;
  metrics?: GoalMetric[];
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
}

export interface GoalMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
}

export interface StudyScheduleItem {
  id: string;
  planId: string;
  courseId?: string;
  topic: string;
  scheduledDate: Date;
  duration: number; // in minutes
  type: 'review' | 'new_material' | 'practice' | 'assessment';
  priority: number;
  prerequisites?: string[];
  resources?: StudyResource[];
  completed: boolean;
  actualDuration?: number;
  effectiveness?: number; // 1-10 rating
}

export interface StudyResource {
  type: 'video' | 'article' | 'book' | 'practice_set' | 'flashcards' | 'quiz';
  title: string;
  url?: string;
  description?: string;
  estimatedTime?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface AdaptiveElement {
  type:
    | 'difficulty_adjustment'
    | 'pace_modification'
    | 'method_change'
    | 'resource_suggestion';
  trigger: string;
  action: string;
  conditions: Record<string, any>;
  isActive: boolean;
}

export interface PlanProgress {
  completionPercentage: number;
  goalsCompleted: number;
  totalGoals: number;
  scheduleAdherence: number; // percentage
  averageEffectiveness: number;
  adaptationsApplied: number;
  lastUpdated: Date;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  data: Record<string, any>;
  actionable: boolean;
  suggestedActions?: string[];
  priority: 'high' | 'medium' | 'low';
  category: InsightCategory;
  generatedAt: Date;
  acknowledgedAt?: Date;
  appliedAt?: Date;
  isValid: boolean;
}

export type InsightType =
  | 'performance_pattern'
  | 'study_habit'
  | 'knowledge_gap'
  | 'motivation_trend'
  | 'time_optimization'
  | 'resource_recommendation';

export type InsightCategory =
  | 'productivity'
  | 'learning_efficiency'
  | 'motivation'
  | 'time_management'
  | 'content_mastery'
  | 'goal_achievement';

export interface AIQuestionAnswer {
  id: string;
  userId: string;
  question: string;
  answer: string;
  context: QuestionContext;
  confidence: number; // 0-1
  sources?: string[];
  relatedTopics?: string[];
  followUpQuestions?: string[];
  wasHelpful?: boolean;
  timestamp: Date;
}

export interface QuestionContext {
  courseId?: string;
  topic?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  questionType:
    | 'concept'
    | 'procedure'
    | 'application'
    | 'analysis'
    | 'synthesis';
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AIMotivation {
  id: string;
  userId: string;
  type: MotivationType;
  message: string;
  trigger: MotivationTrigger;
  context: MotivationContext;
  deliveredAt: Date;
  effectiveness?: number; // 1-10 user rating
  userResponse?: 'positive' | 'neutral' | 'negative';
}

export type MotivationType =
  | 'encouragement'
  | 'celebration'
  | 'reminder'
  | 'challenge'
  | 'tip'
  | 'milestone_recognition';

export interface MotivationContext {
  recentPerformance: 'improving' | 'stable' | 'declining';
  streakStatus: 'active' | 'broken' | 'new';
  goalProgress: number; // percentage
  timeOfDay: string;
  studySession?: boolean;
}

// AI Service Configuration
export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompts: Record<string, string>;
  features: AIFeatureConfig;
  rateLimits: RateLimitConfig;
}

export interface AIFeatureConfig {
  questionAnswering: boolean;
  studyPlanning: boolean;
  motivationalMessages: boolean;
  performanceAnalysis: boolean;
  resourceRecommendation: boolean;
  conversationalChat: boolean;
}

export interface RateLimitConfig {
  questionsPerHour: number;
  messagesPerDay: number;
  planGenerationsPerWeek: number;
}

// AI State Management
export interface AIState {
  assistant: AIStudyAssistant | null;
  currentConversation: AIConversation | null;
  conversations: AIConversation[];
  insights: AIInsight[];
  studyPlans: AIStudyPlan[];
  isLoading: boolean;
  error: string | null;
  config: AIConfig;
}

// AI Form Types
export interface AIAssistantSetupForm {
  name: string;
  personalityType: AIPersonality['type'];
  communicationStyle: AIPersonality['communicationStyle'];
  preferences: Partial<AIPreferences>;
  learningStyle: LearningStyle[];
}

export interface AIQuestionForm {
  question: string;
  courseId?: string;
  topic?: string;
  context?: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface AIFeedbackForm {
  messageId: string;
  rating: number; // 1-5
  feedback?: string;
  wasHelpful: boolean;
  suggestions?: string;
}

// Data Export and Backup Types
export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includePersonalData?: boolean;
  includeProgressData?: boolean;
  includeGameData?: boolean;
  includeStudyData?: boolean;
}

export interface UserDataExport {
  exportDate: string;
  user: Partial<User>;
  courses: Course[];
  quests: Quest[];
  todos: TodoItem[];
  studySessions: StudySession[];
  pomodoroSessions: PomodoroSession[];
  achievements: Achievement[];
  pet: StudyPet | null;
  routines: Routine[];
  analytics: {
    totalStudyTime: number;
    totalSessions: number;
    averageSessionLength: number;
    streakDays: number;
    level: number;
    totalXP: number;
  };
}

export interface BackupRecord {
  id: string;
  userId: string;
  filename: string;
  filePath: string;
  backupType: 'full' | 'partial' | 'scheduled';
  fileSize?: number;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ExportProgress {
  stage: 'gathering' | 'processing' | 'generating' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface DataExportForm {
  format: ExportOptions['format'];
  includePersonalData: boolean;
  includeProgressData: boolean;
  includeGameData: boolean;
  includeStudyData: boolean;
  dateRangeEnabled: boolean;
  startDate?: Date;
  endDate?: Date;
}

// Study Groups and Social Features Types
export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  maxMembers: number;
  isPrivate: boolean;
  createdBy: string;
  members: GroupMember[];
  stats: GroupStats;
  settings: GroupSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: GroupRole;
  username: string;
  avatarUrl?: string;
  joinedAt: Date;
  stats: MemberStats;
  isActive: boolean;
  lastSeen: Date;
}

export type GroupRole = 'owner' | 'admin' | 'member';

export interface MemberStats {
  totalXP: number;
  level: number;
  studyHours: number;
  questsCompleted: number;
  streakDays: number;
  contributionScore: number;
  weeklyProgress: WeeklyMemberProgress;
}

export interface WeeklyMemberProgress {
  xpEarned: number;
  studyTime: number;
  questsCompleted: number;
  achievementsUnlocked: number;
}

export interface GroupStats {
  totalMembers: number;
  activeMembers: number;
  totalStudyHours: number;
  totalQuestsCompleted: number;
  averageLevel: number;
  groupXP: number;
  weeklyProgress: WeeklyGroupProgress;
  achievements: GroupAchievement[];
}

export interface WeeklyGroupProgress {
  totalXP: number;
  totalStudyTime: number;
  totalQuestsCompleted: number;
  activeMembers: number;
  groupChallengesCompleted: number;
}

export interface GroupSettings {
  allowInvites: boolean;
  requireApproval: boolean;
  shareProgress: boolean;
  enableCompetition: boolean;
  enableGroupChallenges: boolean;
  studyRoomEnabled: boolean;
  notificationSettings: GroupNotificationSettings;
}

export interface GroupNotificationSettings {
  memberJoined: boolean;
  memberLeft: boolean;
  challengeStarted: boolean;
  challengeCompleted: boolean;
  milestoneReached: boolean;
  studySessionStarted: boolean;
}

export interface GroupChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: ChallengeType;
  goal: ChallengeGoal;
  rewards: ChallengeReward[];
  participants: ChallengeParticipant[];
  status: ChallengeStatus;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: Date;
}

export type ChallengeType =
  | 'study_time'
  | 'quest_completion'
  | 'streak_maintenance'
  | 'collaboration'
  | 'custom';
export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface ChallengeGoal {
  type: ChallengeType;
  target: number;
  unit: string;
  description: string;
  isCollective: boolean; // true for group goals, false for individual goals
}

export interface ChallengeReward {
  type: 'xp' | 'badge' | 'pet_accessory' | 'title';
  value: number | string;
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ChallengeParticipant {
  userId: string;
  username: string;
  progress: number;
  rank: number;
  completed: boolean;
  completedAt?: Date;
  rewards: ChallengeReward[];
}

export interface GroupAchievement {
  id: string;
  groupId: string;
  title: string;
  description: string;
  iconUrl?: string;
  unlockedAt: Date;
  unlockedBy: string[];
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface StudyRoom {
  id: string;
  groupId: string;
  name: string;
  description?: string;
  isActive: boolean;
  participants: StudyRoomParticipant[];
  currentSession?: GroupStudySession;
  settings: StudyRoomSettings;
  createdBy: string;
  createdAt: Date;
}

export interface StudyRoomParticipant {
  userId: string;
  username: string;
  avatarUrl?: string;
  status: ParticipantStatus;
  currentActivity?: string;
  joinedAt: Date;
  studyTime: number;
  isHost: boolean;
}

export type ParticipantStatus = 'studying' | 'break' | 'away' | 'offline';

export interface StudyRoomSettings {
  allowChat: boolean;
  syncPomodoro: boolean;
  shareProgress: boolean;
  requirePermissionToJoin: boolean;
  maxParticipants: number;
  backgroundMusic: boolean;
  focusMode: boolean;
}

export interface GroupStudySession {
  id: string;
  studyRoomId: string;
  type: 'pomodoro' | 'free_study' | 'group_challenge';
  startTime: Date;
  endTime?: Date;
  duration: number;
  participants: string[];
  pomodoroSettings?: PomodoroSettings;
  isActive: boolean;
  stats: GroupSessionStats;
}

export interface GroupSessionStats {
  totalParticipants: number;
  totalStudyTime: number;
  averageFocusScore: number;
  completionRate: number;
  xpEarned: number;
}

export interface GroupLeaderboard {
  id: string;
  groupId: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export type LeaderboardType =
  | 'xp'
  | 'study_time'
  | 'quests_completed'
  | 'streak_days'
  | 'contribution';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  value: number;
  change: number; // Change from previous period
  badge?: string;
  isCurrentUser: boolean;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByUsername: string;
  invitedUser: string;
  inviteCode?: string;
  message?: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  respondedAt?: Date;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface GroupActivity {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  type: SocialActivityType;
  description: string;
  data?: Record<string, any>;
  timestamp: Date;
  isVisible: boolean;
}

export type SocialActivityType =
  | 'member_joined'
  | 'member_left'
  | 'quest_completed'
  | 'achievement_unlocked'
  | 'challenge_started'
  | 'challenge_completed'
  | 'study_session_started'
  | 'milestone_reached'
  | 'level_up';

export interface SocialProfile {
  userId: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  streakDays: number;
  joinedAt: Date;
  stats: SocialStats;
  badges: SocialBadge[];
  privacy: PrivacySettings;
}

export interface SocialStats {
  totalStudyHours: number;
  questsCompleted: number;
  achievementsUnlocked: number;
  groupsJoined: number;
  challengesWon: number;
  helpfulVotes: number;
  studySessionsHosted: number;
}

export interface SocialBadge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
  category: 'social' | 'achievement' | 'special';
}

export interface PrivacySettings {
  showProfile: boolean;
  showStats: boolean;
  showGroups: boolean;
  showAchievements: boolean;
  allowInvites: boolean;
  allowMessages: boolean;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  type: MessageType;
  replyTo?: string;
  attachments?: MessageAttachment[];
  reactions: MessageReaction[];
  timestamp: Date;
  editedAt?: Date;
  isDeleted: boolean;
}

export type MessageType =
  | 'text'
  | 'system'
  | 'achievement'
  | 'challenge'
  | 'study_update';

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

// Form types for social features
export interface CreateGroupForm {
  name: string;
  description?: string;
  isPrivate: boolean;
  maxMembers: number;
  settings: Partial<GroupSettings>;
}

export interface JoinGroupForm {
  inviteCode: string;
}

export interface GroupInviteForm {
  groupId: string;
  username?: string;
  email?: string;
  message?: string;
}

export interface CreateChallengeForm {
  groupId: string;
  title: string;
  description: string;
  type: ChallengeType;
  goal: Omit<ChallengeGoal, 'description'>;
  duration: number; // in days
  rewards: ChallengeReward[];
}

export interface StudyRoomForm {
  groupId: string;
  name: string;
  description?: string;
  settings: Partial<StudyRoomSettings>;
}

// State management types for social features
export interface SocialState {
  currentUser: SocialProfile | null;
  groups: StudyGroup[];
  activeGroup: StudyGroup | null;
  invitations: GroupInvitation[];
  challenges: GroupChallenge[];
  studyRooms: StudyRoom[];
  activeStudyRoom: StudyRoom | null;
  leaderboards: GroupLeaderboard[];
  activities: GroupActivity[];
  messages: GroupMessage[];
  isLoading: boolean;
  error: string | null;
}

// Filter types for social features
export interface GroupFilters {
  search?: string;
  isPrivate?: boolean;
  memberCount?: 'small' | 'medium' | 'large' | 'all';
  activity?: 'active' | 'inactive' | 'all';
  sortBy?: 'name' | 'created_at' | 'member_count' | 'activity';
  sortOrder?: 'asc' | 'desc';
}

export interface ChallengeFilters {
  status?: ChallengeStatus | 'all';
  type?: ChallengeType | 'all';
  groupId?: string;
  search?: string;
  sortBy?: 'start_date' | 'end_date' | 'participants' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Store and Economy Types
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'coins' | 'premium_coins';
  category: StoreCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
  stock?: number;
  isLimited: boolean;
  unlockRequirements?: UnlockRequirement[];
  effects?: ItemEffect[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type StoreCategory =
  | 'pet_food'
  | 'pet_accessories'
  | 'themes'
  | 'environments'
  | 'music_packs'
  | 'power_ups'
  | 'decorations';

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  acquiredAt: Date;
  usedCount?: number;
  lastUsed?: Date;
  isEquipped?: boolean;
  metadata?: Record<string, any>;
}

export interface UserEconomy {
  coins: number;
  premiumCoins: number;
  totalEarned: number;
  totalSpent: number;
  purchaseHistory: Purchase[];
  inventory: InventoryItem[];
  dailyCoinLimit: number;
  dailyCoinsEarned: number;
  lastCoinEarned?: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  totalCost: number;
  currency: 'coins' | 'premium_coins';
  purchasedAt: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
}

export interface PurchaseResult {
  success: boolean;
  item: StoreItem;
  quantity: number;
  totalCost: number;
  newBalance: number;
  inventoryItem?: InventoryItem;
  transaction?: CoinTransaction;
  error?: string;
}

export interface PurchaseEligibility {
  eligible: boolean;
  canPurchase: boolean;
  reason?: string;
  missingCoins?: number;
  unmetRequirements?: UnlockRequirement[];
}

export interface UnlockRequirement {
  type:
    | 'level'
    | 'achievement'
    | 'quest_completion'
    | 'time_played'
    | 'coins_spent'
    | 'study_hours'
    | 'quests_completed'
    | 'pet_evolution'
    | 'coins'
    | 'streak_days'
    | 'level_reached';
  value?: number;
  target: number;
  current: number;
  description: string;
  met?: boolean;
}

export interface ItemEffect {
  type:
    | 'xp_boost'
    | 'coin_boost'
    | 'pet_happiness'
    | 'pet_health'
    | 'cosmetic'
    | 'health'
    | 'happiness'
    | 'energy'
    | 'evolution_boost'
    | 'xp_multiplier'
    | 'coin_multiplier';
  value: number;
  duration?: number; // in minutes, undefined for permanent effects
  description: string;
}

export interface StoreFilters {
  category: StoreCategory | 'all';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'all';
  sortBy: 'name' | 'price' | 'rarity' | 'created_at' | 'newest';
  sortOrder: 'asc' | 'desc';
  showOwned?: boolean;
  search?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus' | 'refund';
  source:
    | 'study_session'
    | 'quest_completion'
    | 'store_purchase'
    | 'daily_bonus'
    | 'achievement';
  description: string;
  relatedId?: string; // ID of related quest, purchase, etc.
  timestamp: Date;
}

export interface StoreError {
  code: string;
  message: string;
  details?: any;
}

export interface StoreState {
  items: StoreItem[];
  categories: StoreCategory[];
  userInventory: InventoryItem[];
  userEconomy: UserEconomy;
  purchaseHistory: Purchase[];
  isLoading: boolean;
  error: string | null;
  filters: StoreFilters;
  // Convenience property for quick access to coins
  coins: number;
}

// Missing types for components
export interface SeasonalEvent {
  id: string;
  name: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  achievements: any[];
  specialRewards: {
    exclusiveBadges?: any[];
    limitedTimeItems?: any[];
    xpMultiplier?: number;
  };
}

export interface Environment {
  id: string;
  name: string;
  category: 'free' | 'premium';
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    cssVariables: Record<string, string>;
  };
  audio: {
    ambientTrack: string;
    musicTracks: MusicTrack[];
    soundEffects: Record<string, string>;
    defaultVolume: number;
  };
  visuals: {
    backgroundImage: string;
    overlayElements: any[];
    particleEffects: ParticleEffect[];
  };
  unlockRequirements?: UnlockRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  genre: string;
  mood?: string;
}

// Game types
export interface MiniGame {
  id: string;
  name: string;
  description: string;
  instructions: string;
  estimatedDuration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  xpReward: number;
  coinReward: number;
  unlockRequirements?: UnlockRequirement[];
}

export interface GameSession {
  id: string;
  gameId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  xpEarned: number;
  completed: boolean;
  duration: number; // in seconds
}

export interface GameResult {
  success: boolean;
  score: number;
  coinsEarned: number;
  newAchievements: Achievement[];
  personalBest: boolean;
  timeSpent: number; // in seconds
}

export interface ParticleEffect {
  type: string;
  count: number;
  speed: number;
  size: { min: number; max: number };
  color: string;
}

// Environment Store State
export interface EnvironmentState {
  currentEnvironment: Environment | null;
  availableEnvironments: Environment[];
  unlockedEnvironments: string[];
  audioSettings: AudioSettings;
  visualSettings: VisualSettings;
  isLoading: boolean;
  error: string | null;
  preloadedAssets: string[];
}

export interface AudioSettings {
  masterVolume: number;
  ambientVolume: number;
  musicVolume: number;
  soundEffectsVolume: number;
  currentPlaylist?: string;
  autoPlay: boolean;
}

export interface VisualSettings {
  particlesEnabled: boolean;
  animationsEnabled: boolean;
  backgroundQuality: 'low' | 'medium' | 'high';
  reducedMotion: boolean;
}

export interface EnvironmentCustomization {
  environmentId: string;
  customTheme?: Partial<Environment['theme']>;
  customAudio?: Partial<Environment['audio']>;
  customVisuals?: Partial<Environment['visuals']>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
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
  updatedAt?: Date;
}
