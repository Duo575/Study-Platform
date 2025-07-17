import { describe, it, expect, vi, beforeEach } from 'vitest';
import { courseManagementService } from '../courseManagementService';
import { parseSyllabusWithValidation } from '../syllabusParser';
import type { CourseForm, SyllabusItem } from '../../types';

// Mock dependencies
vi.mock('../database', () => ({
  courseService: {
    create: vi.fn(),
    getById: vi.fn(),
    getByUserId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../questService', () => ({
  questService: {
    create: vi.fn(),
  },
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ data: null, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ data: null, error: null })) })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => ({ data: null, error: null })) })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
    })),
  },
}));

describe('Course Management Service', () => {
  const mockUserId = 'user-123';
  const mockCourseData: CourseForm = {
    name: 'Test Course',
    description: 'A test course',
    color: '#3B82F6',
    syllabus: `Introduction to Testing
Basic concepts and setup
Unit testing, Integration testing, E2E testing
4
high
2024-02-15
---
Advanced Testing Techniques
Complex testing scenarios
Mocking, Stubbing, Test doubles
6
medium
2024-03-01`,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCourse', () => {
    it('should create a course with parsed syllabus', async () => {
      const mockDbCourse = {
        id: 'course-123',
        name: mockCourseData.name,
        description: mockCourseData.description,
        color: mockCourseData.color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { courseService } = await import('../database');
      vi.mocked(courseService.create).mockResolvedValue(mockDbCourse);

      const result = await courseManagementService.createCourse(mockUserId, mockCourseData);

      expect(courseService.create).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: mockCourseData.name,
        description: mockCourseData.description,
        color: mockCourseData.color,
        syllabus: expect.any(Array),
      });

      expect(result).toMatchObject({
        id: mockDbCourse.id,
        name: mockDbCourse.name,
        description: mockDbCourse.description,
        color: mockDbCourse.color,
        syllabus: expect.any(Array),
        progress: expect.objectContaining({
          completionPercentage: 0,
          hoursStudied: 0,
          topicsCompleted: 0,
        }),
      });
    });

    it('should throw error if syllabus parsing fails', async () => {
      const invalidCourseData = {
        ...mockCourseData,
        syllabus: '', // Empty syllabus should fail
      };

      await expect(
        courseManagementService.createCourse(mockUserId, invalidCourseData)
      ).rejects.toThrow('Syllabus parsing failed');
    });
  });

  describe('applyCourseFilters', () => {
    const mockCourses = [
      {
        id: '1',
        name: 'JavaScript Basics',
        description: 'Learn JavaScript fundamentals',
        color: '#3B82F6',
        syllabus: [],
        progress: { completionPercentage: 25, hoursStudied: 10, topicsCompleted: 2, totalTopics: 8, lastStudied: new Date('2024-01-15') },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'React Advanced',
        description: 'Advanced React concepts',
        color: '#10B981',
        syllabus: [],
        progress: { completionPercentage: 100, hoursStudied: 50, topicsCompleted: 12, totalTopics: 12, lastStudied: new Date('2024-01-20') },
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: '3',
        name: 'Python Fundamentals',
        description: 'Python programming basics',
        color: '#F59E0B',
        syllabus: [],
        progress: { completionPercentage: 0, hoursStudied: 0, topicsCompleted: 0, totalTopics: 6, lastStudied: new Date('2024-01-01') },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      },
    ];

    it('should filter courses by search term', () => {
      const filters = { search: 'javascript' };
      const result = courseManagementService.applyCourseFilters(mockCourses, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('JavaScript Basics');
    });

    it('should filter courses by completion status', () => {
      const completedFilter = { completionStatus: 'completed' as const };
      const completedResult = courseManagementService.applyCourseFilters(mockCourses, completedFilter);
      expect(completedResult).toHaveLength(1);
      expect(completedResult[0].name).toBe('React Advanced');

      const inProgressFilter = { completionStatus: 'in_progress' as const };
      const inProgressResult = courseManagementService.applyCourseFilters(mockCourses, inProgressFilter);
      expect(inProgressResult).toHaveLength(1);
      expect(inProgressResult[0].name).toBe('JavaScript Basics');

      const notStartedFilter = { completionStatus: 'not_started' as const };
      const notStartedResult = courseManagementService.applyCourseFilters(mockCourses, notStartedFilter);
      expect(notStartedResult).toHaveLength(1);
      expect(notStartedResult[0].name).toBe('Python Fundamentals');
    });

    it('should sort courses by name', () => {
      const filters = { sortBy: 'name' as const, sortOrder: 'asc' as const };
      const result = courseManagementService.applyCourseFilters(mockCourses, filters);
      
      expect(result[0].name).toBe('JavaScript Basics');
      expect(result[1].name).toBe('Python Fundamentals');
      expect(result[2].name).toBe('React Advanced');
    });

    it('should sort courses by progress', () => {
      const filters = { sortBy: 'progress' as const, sortOrder: 'desc' as const };
      const result = courseManagementService.applyCourseFilters(mockCourses, filters);
      
      expect(result[0].progress.completionPercentage).toBe(100);
      expect(result[1].progress.completionPercentage).toBe(25);
      expect(result[2].progress.completionPercentage).toBe(0);
    });
  });
});

describe('Syllabus Parser', () => {
  it('should parse valid syllabus text', () => {
    const syllabusText = `Introduction to Testing
Basic concepts and setup
Unit testing, Integration testing, E2E testing
4
high
2024-02-15
---
Advanced Testing Techniques
Complex testing scenarios
Mocking, Stubbing, Test doubles
6
medium
2024-03-01`;

    const result = parseSyllabusWithValidation(syllabusText);

    expect(result.success).toBe(true);
    expect(result.items).toHaveLength(2);
    expect(result.errors).toHaveLength(0);

    const firstItem = result.items[0];
    expect(firstItem.title).toBe('Introduction to Testing');
    expect(firstItem.description).toBe('Basic concepts and setup');
    expect(firstItem.topics).toEqual(['Unit testing', 'Integration testing', 'E2E testing']);
    expect(firstItem.estimatedHours).toBe(4);
    expect(firstItem.priority).toBe('high');
    expect(firstItem.deadline).toBeInstanceOf(Date);
    expect(firstItem.completed).toBe(false);
  });

  it('should handle invalid syllabus text', () => {
    const result = parseSyllabusWithValidation('');
    
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Syllabus text is empty');
  });

  it('should provide warnings for incomplete topics', () => {
    const syllabusText = `Incomplete Topic
Just a title`;

    const result = parseSyllabusWithValidation(syllabusText);

    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.items).toHaveLength(1);
  });

  it('should detect different syllabus formats', () => {
    const bulletFormat = `• Topic 1
Description 1
Subtopic A, Subtopic B
2
medium

• Topic 2
Description 2
Subtopic C, Subtopic D
3
high`;

    const result = parseSyllabusWithValidation(bulletFormat);
    expect(result.success).toBe(true);
    expect(result.items).toHaveLength(2);
  });
});