// Validation functions for runtime type checking and data validation

// Basic type definitions to avoid circular imports
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
  acceptTerms?: boolean;
}

interface CourseForm {
  name: string;
  description: string;
  color: string;
  syllabus: string;
  estimatedHours?: number;
  deadline?: Date;
}

interface TodoForm {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  courseId?: string;
  dueDate?: Date;
  tags?: string[];
}

// Basic entity interfaces for validation
interface BasicUser {
  id?: string;
  email?: string;
  username?: string;
  profile?: any;
  gameStats?: any;
  preferences?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BasicCourse {
  id?: string;
  name?: string;
  description?: string;
  color?: string;
  syllabus?: any[];
  progress?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BasicQuest {
  id?: string;
  title?: string;
  description?: string;
  type?: 'daily' | 'weekly' | 'milestone' | 'bonus';
  xpReward?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  requirements?: any[];
  status?: 'available' | 'active' | 'completed' | 'expired';
  courseId?: string;
  createdAt?: Date;
  expiresAt?: Date;
  completedAt?: Date;
}

interface BasicStudyPet {
  id?: string;
  name?: string;
  species?: any;
  level?: number;
  happiness?: number;
  health?: number;
  evolution?: any;
  accessories?: any[];
  lastFed?: Date;
  lastPlayed?: Date;
  createdAt?: Date;
}

interface BasicAchievement {
  id?: string;
  title?: string;
  description?: string;
  category?: 'study_time' | 'consistency' | 'quest_completion' | 'pet_care' | 'social' | 'special_event';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward?: number;
  iconUrl?: string;
  unlockedAt?: Date;
  progress?: any;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Username validation (3-20 characters, alphanumeric and underscores only)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Utility validation functions
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export function validateUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

export function validateRequired(value: unknown, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  return null;
}

export function validateRange(value: number, min: number, max: number, fieldName: string): string | null {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
}

// Form validation functions
export function validateLoginForm(form: Partial<LoginForm>): ValidationResult {
  const errors: string[] = [];

  // Email validation
  const emailRequired = validateRequired(form.email, 'Email');
  if (emailRequired) {
    errors.push(emailRequired);
  } else if (form.email && !validateEmail(form.email)) {
    errors.push('Please enter a valid email address');
  }

  // Password validation
  const passwordRequired = validateRequired(form.password, 'Password');
  if (passwordRequired) {
    errors.push(passwordRequired);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRegisterForm(form: Partial<RegisterForm>): ValidationResult {
  const errors: string[] = [];

  // Email validation
  const emailRequired = validateRequired(form.email, 'Email');
  if (emailRequired) {
    errors.push(emailRequired);
  } else if (form.email && !validateEmail(form.email)) {
    errors.push('Please enter a valid email address');
  }

  // Username validation
  const usernameRequired = validateRequired(form.username, 'Username');
  if (usernameRequired) {
    errors.push(usernameRequired);
  } else if (form.username && !validateUsername(form.username)) {
    errors.push('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
  }

  // Password validation
  const passwordRequired = validateRequired(form.password, 'Password');
  if (passwordRequired) {
    errors.push(passwordRequired);
  } else if (form.password && !validatePassword(form.password)) {
    errors.push('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
  }

  // Confirm password validation
  const confirmPasswordRequired = validateRequired(form.confirmPassword, 'Confirm Password');
  if (confirmPasswordRequired) {
    errors.push(confirmPasswordRequired);
  } else if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCourseForm(form: Partial<CourseForm>): ValidationResult {
  const errors: string[] = [];

  // Name validation
  const nameRequired = validateRequired(form.name, 'Course name');
  if (nameRequired) {
    errors.push(nameRequired);
  } else if (form.name) {
    const nameLength = validateMaxLength(form.name, 100, 'Course name');
    if (nameLength) errors.push(nameLength);
  }

  // Description validation
  const descriptionRequired = validateRequired(form.description, 'Course description');
  if (descriptionRequired) {
    errors.push(descriptionRequired);
  } else if (form.description) {
    const descriptionLength = validateMaxLength(form.description, 500, 'Course description');
    if (descriptionLength) errors.push(descriptionLength);
  }

  // Color validation
  const colorRequired = validateRequired(form.color, 'Course color');
  if (colorRequired) {
    errors.push(colorRequired);
  } else if (form.color && !/^#[0-9A-F]{6}$/i.test(form.color)) {
    errors.push('Please select a valid color');
  }

  // Syllabus validation
  const syllabusRequired = validateRequired(form.syllabus, 'Course syllabus');
  if (syllabusRequired) {
    errors.push(syllabusRequired);
  } else if (form.syllabus) {
    const syllabusLength = validateMinLength(form.syllabus, 10, 'Course syllabus');
    if (syllabusLength) errors.push(syllabusLength);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTodoForm(form: Partial<TodoForm>): ValidationResult {
  const errors: string[] = [];

  // Title validation
  const titleRequired = validateRequired(form.title, 'Task title');
  if (titleRequired) {
    errors.push(titleRequired);
  } else if (form.title) {
    const titleLength = validateMaxLength(form.title, 200, 'Task title');
    if (titleLength) errors.push(titleLength);
  }

  // Description validation (optional)
  if (form.description) {
    const descriptionLength = validateMaxLength(form.description, 1000, 'Task description');
    if (descriptionLength) errors.push(descriptionLength);
  }

  // Priority validation
  const priorityRequired = validateRequired(form.priority, 'Priority');
  if (priorityRequired) {
    errors.push(priorityRequired);
  } else if (form.priority && !['low', 'medium', 'high'].includes(form.priority)) {
    errors.push('Please select a valid priority level');
  }

  // Estimated minutes validation
  const estimatedMinutesRequired = validateRequired(form.estimatedMinutes, 'Estimated time');
  if (estimatedMinutesRequired) {
    errors.push(estimatedMinutesRequired);
  } else if (form.estimatedMinutes !== undefined) {
    const timeRange = validateRange(form.estimatedMinutes, 1, 480, 'Estimated time');
    if (timeRange) errors.push(timeRange);
  }

  // Due date validation (optional)
  if (form.dueDate) {
    const now = new Date();
    if (form.dueDate < now) {
      errors.push('Due date cannot be in the past');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Entity validation functions
export function validateUser(user: Partial<BasicUser>): ValidationResult {
  const errors: string[] = [];

  // ID validation
  const idRequired = validateRequired(user.id, 'User ID');
  if (idRequired) errors.push(idRequired);

  // Email validation
  const emailRequired = validateRequired(user.email, 'Email');
  if (emailRequired) {
    errors.push(emailRequired);
  } else if (user.email && !validateEmail(user.email)) {
    errors.push('Invalid email format');
  }

  // Username validation
  const usernameRequired = validateRequired(user.username, 'Username');
  if (usernameRequired) {
    errors.push(usernameRequired);
  } else if (user.username && !validateUsername(user.username)) {
    errors.push('Invalid username format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCourse(course: Partial<BasicCourse>): ValidationResult {
  const errors: string[] = [];

  // ID validation
  const idRequired = validateRequired(course.id, 'Course ID');
  if (idRequired) errors.push(idRequired);

  // Name validation
  const nameRequired = validateRequired(course.name, 'Course name');
  if (nameRequired) errors.push(nameRequired);

  // Description validation
  const descriptionRequired = validateRequired(course.description, 'Course description');
  if (descriptionRequired) errors.push(descriptionRequired);

  // Color validation
  if (course.color && !/^#[0-9A-F]{6}$/i.test(course.color)) {
    errors.push('Invalid color format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateQuest(quest: Partial<BasicQuest>): ValidationResult {
  const errors: string[] = [];

  // ID validation
  const idRequired = validateRequired(quest.id, 'Quest ID');
  if (idRequired) errors.push(idRequired);

  // Title validation
  const titleRequired = validateRequired(quest.title, 'Quest title');
  if (titleRequired) errors.push(titleRequired);

  // Type validation
  if (quest.type && !['daily', 'weekly', 'milestone', 'bonus'].includes(quest.type)) {
    errors.push('Invalid quest type');
  }

  // Difficulty validation
  if (quest.difficulty && !['easy', 'medium', 'hard'].includes(quest.difficulty)) {
    errors.push('Invalid quest difficulty');
  }

  // XP reward validation
  if (quest.xpReward !== undefined) {
    const xpRange = validateRange(quest.xpReward, 1, 1000, 'XP reward');
    if (xpRange) errors.push(xpRange);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateStudyPet(pet: Partial<BasicStudyPet>): ValidationResult {
  const errors: string[] = [];

  // ID validation
  const idRequired = validateRequired(pet.id, 'Pet ID');
  if (idRequired) errors.push(idRequired);

  // Name validation
  const nameRequired = validateRequired(pet.name, 'Pet name');
  if (nameRequired) {
    errors.push(nameRequired);
  } else if (pet.name) {
    const nameLength = validateMaxLength(pet.name, 50, 'Pet name');
    if (nameLength) errors.push(nameLength);
  }

  // Level validation
  if (pet.level !== undefined) {
    const levelRange = validateRange(pet.level, 1, 100, 'Pet level');
    if (levelRange) errors.push(levelRange);
  }

  // Happiness validation
  if (pet.happiness !== undefined) {
    const happinessRange = validateRange(pet.happiness, 0, 100, 'Pet happiness');
    if (happinessRange) errors.push(happinessRange);
  }

  // Health validation
  if (pet.health !== undefined) {
    const healthRange = validateRange(pet.health, 0, 100, 'Pet health');
    if (healthRange) errors.push(healthRange);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAchievement(achievement: Partial<BasicAchievement>): ValidationResult {
  const errors: string[] = [];

  // ID validation
  const idRequired = validateRequired(achievement.id, 'Achievement ID');
  if (idRequired) errors.push(idRequired);

  // Title validation
  const titleRequired = validateRequired(achievement.title, 'Achievement title');
  if (titleRequired) errors.push(titleRequired);

  // Category validation
  if (achievement.category && ![
    'study_time',
    'consistency',
    'quest_completion',
    'pet_care',
    'social',
    'special_event'
  ].includes(achievement.category)) {
    errors.push('Invalid achievement category');
  }

  // Rarity validation
  if (achievement.rarity && !['common', 'rare', 'epic', 'legendary'].includes(achievement.rarity)) {
    errors.push('Invalid achievement rarity');
  }

  // XP reward validation
  if (achievement.xpReward !== undefined) {
    const xpRange = validateRange(achievement.xpReward, 1, 500, 'XP reward');
    if (xpRange) errors.push(xpRange);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Batch validation functions
export function validateUserArray(users: unknown[]): ValidationResult {
  const errors: string[] = [];
  
  users.forEach((user, index) => {
    const validation = validateUser(user as Partial<BasicUser>);
    if (!validation.isValid) {
      errors.push(`User ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCourseArray(courses: unknown[]): ValidationResult {
  const errors: string[] = [];
  
  courses.forEach((course, index) => {
    const validation = validateCourse(course as Partial<BasicCourse>);
    if (!validation.isValid) {
      errors.push(`Course ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeUsername(username: string): string {
  return username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
}

// Data transformation helpers
export function normalizeUser(user: any): Partial<BasicUser> {
  return {
    id: user.id,
    email: sanitizeEmail(user.email || ''),
    username: sanitizeUsername(user.username || ''),
    profile: user.profile || {},
    gameStats: user.gameStats || {},
    preferences: user.preferences || {},
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
  };
}

export function normalizeCourse(course: any): Partial<BasicCourse> {
  return {
    id: course.id,
    name: sanitizeString(course.name || ''),
    description: sanitizeString(course.description || ''),
    color: course.color || '#3B82F6',
    syllabus: Array.isArray(course.syllabus) ? course.syllabus : [],
    progress: course.progress || {},
    createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
    updatedAt: course.updatedAt ? new Date(course.updatedAt) : new Date(),
  };
}