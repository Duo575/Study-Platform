import { format } from 'date-fns';
import type { UserDataExport, ExportOptions } from '../types';

/**
 * Sanitizes user data for export by removing sensitive information
 * and ensuring data consistency
 */
export const sanitizeExportData = (data: UserDataExport, options: ExportOptions): UserDataExport => {
  const sanitized = { ...data };

  // Remove sensitive personal data if not explicitly included
  if (!options.includePersonalData) {
    sanitized.user = {
      id: data.user.id,
      username: data.user.username,
      createdAt: data.user.createdAt,
      updatedAt: data.user.updatedAt
    };
  }

  // Filter data based on date range if specified
  if (options.dateRange) {
    const { start, end } = options.dateRange;
    
    sanitized.studySessions = data.studySessions.filter(session => 
      session.startTime >= start && session.startTime <= end
    );
    
    sanitized.pomodoroSessions = data.pomodoroSessions.filter(session => 
      session.startTime >= start && session.startTime <= end
    );
    
    sanitized.quests = data.quests.filter(quest => 
      quest.createdAt >= start && quest.createdAt <= end
    );
  }

  // Remove data categories not requested
  if (!options.includeStudyData) {
    sanitized.courses = [];
    sanitized.studySessions = [];
    sanitized.pomodoroSessions = [];
    sanitized.todos = [];
    sanitized.routines = [];
  }

  if (!options.includeGameData) {
    sanitized.achievements = [];
    sanitized.pet = null;
    sanitized.quests = [];
  }

  if (!options.includeProgressData) {
    sanitized.analytics = {
      totalStudyTime: 0,
      totalSessions: 0,
      averageSessionLength: 0,
      streakDays: 0,
      level: 0,
      totalXP: 0
    };
  }

  return sanitized;
};

/**
 * Validates export data for completeness and consistency
 */
export const validateExportData = (data: UserDataExport): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required fields
  if (!data.exportDate) {
    errors.push('Export date is missing');
  }

  if (!data.user?.id) {
    errors.push('User ID is missing');
  }

  // Validate data consistency
  if (data.studySessions.length > 0) {
    const invalidSessions = data.studySessions.filter(session => 
      !session.id || !session.startTime || session.duration < 0
    );
    if (invalidSessions.length > 0) {
      errors.push(`${invalidSessions.length} study sessions have invalid data`);
    }
  }

  if (data.courses.length > 0) {
    const invalidCourses = data.courses.filter(course => 
      !course.id || !course.name
    );
    if (invalidCourses.length > 0) {
      errors.push(`${invalidCourses.length} courses have invalid data`);
    }
  }

  // Validate analytics consistency
  if (data.analytics.totalSessions !== data.studySessions.length) {
    errors.push('Analytics session count does not match actual sessions');
  }

  const calculatedStudyTime = data.studySessions.reduce((total, session) => total + session.duration, 0);
  if (Math.abs(data.analytics.totalStudyTime - calculatedStudyTime) > 1) {
    errors.push('Analytics study time does not match session totals');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generates a filename for export based on options and timestamp
 */
export const generateExportFilename = (options: ExportOptions, userId?: string): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
  const userPrefix = userId ? `user-${userId.slice(0, 8)}-` : '';
  
  let typePrefix = 'study-data';
  if (options.includePersonalData && options.includeStudyData && options.includeGameData) {
    typePrefix = 'full-export';
  } else if (options.includeStudyData && !options.includeGameData) {
    typePrefix = 'study-export';
  } else if (options.includeGameData && !options.includeStudyData) {
    typePrefix = 'game-export';
  }

  const dateRangePrefix = options.dateRange 
    ? `${format(options.dateRange.start, 'yyyy-MM-dd')}-to-${format(options.dateRange.end, 'yyyy-MM-dd')}-`
    : '';

  return `${userPrefix}${typePrefix}-${dateRangePrefix}${timestamp}.${options.format}`;
};

/**
 * Estimates the size of export data in bytes
 */
export const estimateExportSize = (data: UserDataExport, format: 'json' | 'csv' | 'pdf'): number => {
  const jsonString = JSON.stringify(data);
  const baseSize = new Blob([jsonString]).size;

  switch (format) {
    case 'json':
      return baseSize;
    case 'csv':
      // CSV is typically smaller due to less metadata
      return Math.round(baseSize * 0.7);
    case 'pdf':
      // PDF is typically larger due to formatting
      return Math.round(baseSize * 1.5);
    default:
      return baseSize;
  }
};

/**
 * Formats data for CSV export by flattening nested objects
 */
export const flattenForCSV = (data: any[]): any[] => {
  return data.map(item => {
    const flattened: any = {};
    
    const flatten = (obj: any, prefix = '') => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;
          
          if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            flatten(value, newKey);
          } else if (Array.isArray(value)) {
            flattened[newKey] = value.join('; ');
          } else if (value instanceof Date) {
            flattened[newKey] = value.toISOString();
          } else {
            flattened[newKey] = value;
          }
        }
      }
    };
    
    flatten(item);
    return flattened;
  });
};

/**
 * Creates a summary of export contents for user confirmation
 */
export const createExportSummary = (data: UserDataExport, options: ExportOptions): string => {
  const summary: string[] = [];
  
  summary.push(`Export Summary (${format(new Date(data.exportDate), 'PPP')})`);
  summary.push('');
  
  if (options.includePersonalData && data.user.username) {
    summary.push(`User: ${data.user.username}`);
  }
  
  if (options.includeStudyData) {
    summary.push(`Courses: ${data.courses.length}`);
    summary.push(`Study Sessions: ${data.studySessions.length}`);
    summary.push(`Todo Items: ${data.todos.length}`);
    summary.push(`Routines: ${data.routines.length}`);
  }
  
  if (options.includeGameData) {
    summary.push(`Quests: ${data.quests.length}`);
    summary.push(`Achievements: ${data.achievements.length}`);
    if (data.pet) {
      summary.push(`Pet: ${data.pet.name} (${data.pet.species.name})`);
    }
  }
  
  if (options.includeProgressData) {
    summary.push(`Total Study Time: ${Math.round(data.analytics.totalStudyTime / 60)} hours`);
    summary.push(`Level: ${data.analytics.level}`);
    summary.push(`Total XP: ${data.analytics.totalXP}`);
  }
  
  if (options.dateRange) {
    summary.push('');
    summary.push(`Date Range: ${format(options.dateRange.start, 'PPP')} - ${format(options.dateRange.end, 'PPP')}`);
  }
  
  return summary.join('\n');
};

/**
 * Compresses export data by removing unnecessary whitespace and optimizing structure
 */
export const compressExportData = (data: UserDataExport): UserDataExport => {
  // Create a deep copy to avoid mutating original data
  const compressed = JSON.parse(JSON.stringify(data));
  
  // Remove empty arrays and null values where appropriate
  if (compressed.courses.length === 0) delete compressed.courses;
  if (compressed.quests.length === 0) delete compressed.quests;
  if (compressed.todos.length === 0) delete compressed.todos;
  if (compressed.studySessions.length === 0) delete compressed.studySessions;
  if (compressed.pomodoroSessions.length === 0) delete compressed.pomodoroSessions;
  if (compressed.achievements.length === 0) delete compressed.achievements;
  if (compressed.routines.length === 0) delete compressed.routines;
  if (!compressed.pet) delete compressed.pet;
  
  return compressed;
};