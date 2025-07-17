import { supabase } from '../lib/supabase';
import { courseService } from './database';
import { parseSyllabusWithValidation, generateTemplateSyllabus } from './syllabusParser';
import { questService } from './questService';
import { getRandomCourseColor } from '../utils/helpers';
import type { 
  Course, 
  SyllabusItem, 
  CourseForm, 
  CourseProgress,
  CourseFilters 
} from '../types';

/**
 * Enhanced course management service with syllabus parsing and progress tracking
 */
export const courseManagementService = {
  /**
   * Create a new course with syllabus parsing
   */
  async createCourse(
    userId: string, 
    courseData: CourseForm,
    generateQuests: boolean = true
  ): Promise<Course> {
    try {
      // Parse the syllabus
      const parseResult = parseSyllabusWithValidation(courseData.syllabus);
      
      if (!parseResult.success) {
        throw new Error(`Syllabus parsing failed: ${parseResult.errors.join(', ')}`);
      }

      // Create the course in the database
      const dbCourse = await courseService.create({
        user_id: userId,
        name: courseData.name,
        description: courseData.description,
        color: courseData.color || getRandomCourseColor(),
        syllabus: parseResult.items
      });

      // Initialize course progress
      await this.initializeCourseProgress(dbCourse.id, parseResult.items);

      // Generate quests for the course if requested
      if (generateQuests) {
        await this.generateCourseQuests(dbCourse.id, parseResult.items);
      }

      // Transform to frontend Course type
      const course: Course = {
        id: dbCourse.id,
        name: dbCourse.name,
        description: dbCourse.description || '',
        color: dbCourse.color,
        syllabus: parseResult.items,
        progress: {
          completionPercentage: 0,
          hoursStudied: 0,
          topicsCompleted: 0,
          totalTopics: parseResult.items.length,
          lastStudied: new Date()
        },
        createdAt: new Date(dbCourse.created_at),
        updatedAt: new Date(dbCourse.updated_at)
      };

      return course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  /**
   * Update an existing course
   */
  async updateCourse(
    courseId: string,
    courseData: Partial<CourseForm>
  ): Promise<Course> {
    try {
      let syllabusItems: SyllabusItem[] | undefined;

      // Parse syllabus if provided
      if (courseData.syllabus) {
        const parseResult = parseSyllabusWithValidation(courseData.syllabus);
        
        if (!parseResult.success) {
          throw new Error(`Syllabus parsing failed: ${parseResult.errors.join(', ')}`);
        }
        
        syllabusItems = parseResult.items;
      }

      // Update the course in the database
      const updateData: any = {
        name: courseData.name,
        description: courseData.description,
        color: courseData.color
      };

      if (syllabusItems) {
        updateData.syllabus = syllabusItems;
      }

      const dbCourse = await courseService.update(courseId, updateData);

      // Update course progress if syllabus changed
      if (syllabusItems) {
        await this.updateCourseProgress(courseId, syllabusItems);
      }

      // Get updated progress
      const progress = await this.getCourseProgress(courseId);

      // Transform to frontend Course type
      const course: Course = {
        id: dbCourse.id,
        name: dbCourse.name,
        description: dbCourse.description || '',
        color: dbCourse.color,
        syllabus: syllabusItems || dbCourse.syllabus,
        progress,
        createdAt: new Date(dbCourse.created_at),
        updatedAt: new Date(dbCourse.updated_at)
      };

      return course;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  /**
   * Get course with progress
   */
  async getCourseWithProgress(courseId: string): Promise<Course> {
    try {
      const dbCourse = await courseService.getById(courseId);
      const progress = await this.getCourseProgress(courseId);

      const course: Course = {
        id: dbCourse.id,
        name: dbCourse.name,
        description: dbCourse.description || '',
        color: dbCourse.color,
        syllabus: dbCourse.syllabus || [],
        progress,
        createdAt: new Date(dbCourse.created_at),
        updatedAt: new Date(dbCourse.updated_at)
      };

      return course;
    } catch (error) {
      console.error('Error getting course with progress:', error);
      throw error;
    }
  },

  /**
   * Get all courses for a user with progress
   */
  async getUserCoursesWithProgress(userId: string, filters?: CourseFilters): Promise<Course[]> {
    try {
      const dbCourses = await courseService.getByUserId(userId);
      
      const courses: Course[] = await Promise.all(
        dbCourses.map(async (dbCourse) => {
          const progress = await this.getCourseProgress(dbCourse.id);
          
          return {
            id: dbCourse.id,
            name: dbCourse.name,
            description: dbCourse.description || '',
            color: dbCourse.color,
            syllabus: dbCourse.syllabus || [],
            progress,
            createdAt: new Date(dbCourse.created_at),
            updatedAt: new Date(dbCourse.updated_at)
          };
        })
      );

      // Apply filters if provided
      if (filters) {
        return this.applyCourseFilters(courses, filters);
      }

      return courses;
    } catch (error) {
      console.error('Error getting user courses with progress:', error);
      throw error;
    }
  },

  /**
   * Mark a syllabus item as completed/uncompleted
   */
  async toggleSyllabusItemCompletion(
    courseId: string,
    syllabusItemId: string,
    completed: boolean
  ): Promise<void> {
    try {
      // Get current course
      const dbCourse = await courseService.getById(courseId);
      
      // Update the syllabus item
      const updatedSyllabus = dbCourse.syllabus.map((item: SyllabusItem) =>
        item.id === syllabusItemId ? { ...item, completed } : item
      );

      // Update course in database
      await courseService.update(courseId, { syllabus: updatedSyllabus });

      // Update progress
      await this.updateCourseProgress(courseId, updatedSyllabus);

      // Award XP if item was completed
      if (completed) {
        await this.awardCompletionXP(courseId, syllabusItemId);
      }
    } catch (error) {
      console.error('Error toggling syllabus item completion:', error);
      throw error;
    }
  },

  /**
   * Initialize course progress tracking
   */
  async initializeCourseProgress(courseId: string, syllabusItems: SyllabusItem[]): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('course_progress')
        .insert({
          course_id: courseId,
          completion_percentage: 0,
          total_time_spent: 0,
          topics_completed: {},
          last_studied: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error initializing course progress:', error);
      throw error;
    }
  },

  /**
   * Update course progress based on syllabus completion
   */
  async updateCourseProgress(courseId: string, syllabusItems: SyllabusItem[]): Promise<void> {
    try {
      const completedItems = syllabusItems.filter(item => item.completed);
      const completionPercentage = Math.round((completedItems.length / syllabusItems.length) * 100);
      
      const topicsCompleted = completedItems.reduce((acc, item) => {
        acc[item.id] = {
          completed_at: new Date().toISOString(),
          estimated_hours: item.estimatedHours
        };
        return acc;
      }, {} as Record<string, any>);

      const { data, error } = await supabase
        .from('course_progress')
        .update({
          completion_percentage: completionPercentage,
          topics_completed: topicsCompleted,
          last_studied: new Date().toISOString()
        })
        .eq('course_id', courseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  },

  /**
   * Get course progress
   */
  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('course_id', courseId)
        .single();

      if (error) throw error;

      const topicsCompleted = data.topics_completed ? Object.keys(data.topics_completed).length : 0;
      
      return {
        completionPercentage: data.completion_percentage || 0,
        hoursStudied: Math.round((data.total_time_spent || 0) / 60), // Convert minutes to hours
        topicsCompleted,
        totalTopics: data.total_topics || 0,
        lastStudied: new Date(data.last_studied || new Date())
      };
    } catch (error) {
      console.error('Error getting course progress:', error);
      return {
        completionPercentage: 0,
        hoursStudied: 0,
        topicsCompleted: 0,
        totalTopics: 0,
        lastStudied: new Date()
      };
    }
  },

  /**
   * Generate quests for course topics
   */
  async generateCourseQuests(courseId: string, syllabusItems: SyllabusItem[]): Promise<void> {
    try {
      // Generate milestone quests for high-priority topics
      const highPriorityItems = syllabusItems.filter(item => item.priority === 'high');
      
      for (const item of highPriorityItems) {
        await questService.create({
          title: `Master ${item.title}`,
          description: `Complete the topic: ${item.title}`,
          type: 'milestone',
          xp_reward: item.estimatedHours * 10, // 10 XP per estimated hour
          difficulty: 'medium',
          requirements: [{
            type: 'complete_topic',
            target: 1,
            current: 0,
            description: `Complete ${item.title}`
          }],
          status: 'available',
          course_id: courseId,
          expires_at: item.deadline
        });
      }

      // Generate a completion quest for the entire course
      const totalHours = syllabusItems.reduce((sum, item) => sum + item.estimatedHours, 0);
      
      await questService.create({
        title: `Course Completion Master`,
        description: `Complete all topics in this course`,
        type: 'milestone',
        xp_reward: totalHours * 20, // Bonus XP for course completion
        difficulty: 'hard',
        requirements: [{
          type: 'complete_topic',
          target: syllabusItems.length,
          current: 0,
          description: `Complete all ${syllabusItems.length} topics`
        }],
        status: 'available',
        course_id: courseId
      });
    } catch (error) {
      console.error('Error generating course quests:', error);
      // Don't throw error as quest generation is optional
    }
  },

  /**
   * Award XP for completing a syllabus item
   */
  async awardCompletionXP(courseId: string, syllabusItemId: string): Promise<void> {
    try {
      // This would integrate with the gamification service
      // For now, we'll just log the completion
      console.log(`Awarding XP for completing syllabus item ${syllabusItemId} in course ${courseId}`);
      
      // TODO: Integrate with gamification service to award actual XP
      // await gamificationService.awardXP(userId, xpAmount, 'topic_completion');
    } catch (error) {
      console.error('Error awarding completion XP:', error);
      // Don't throw error as XP awarding is optional
    }
  },

  /**
   * Apply filters to courses list
   */
  applyCourseFilters(courses: Course[], filters: CourseFilters): Course[] {
    let filteredCourses = [...courses];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.name.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm)
      );
    }

    // Completion status filter
    if (filters.completionStatus && filters.completionStatus !== 'all') {
      filteredCourses = filteredCourses.filter(course => {
        switch (filters.completionStatus) {
          case 'completed':
            return course.progress.completionPercentage === 100;
          case 'in_progress':
            return course.progress.completionPercentage > 0 && course.progress.completionPercentage < 100;
          case 'not_started':
            return course.progress.completionPercentage === 0;
          default:
            return true;
        }
      });
    }

    // Color filter
    if (filters.color) {
      filteredCourses = filteredCourses.filter(course => course.color === filters.color);
    }

    // Sorting
    if (filters.sortBy) {
      filteredCourses.sort((a, b) => {
        const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
        
        switch (filters.sortBy) {
          case 'name':
            return sortOrder * a.name.localeCompare(b.name);
          case 'created_at':
            return sortOrder * (a.createdAt.getTime() - b.createdAt.getTime());
          case 'progress':
            return sortOrder * (a.progress.completionPercentage - b.progress.completionPercentage);
          case 'last_studied':
            return sortOrder * (a.progress.lastStudied.getTime() - b.progress.lastStudied.getTime());
          default:
            return 0;
        }
      });
    }

    return filteredCourses;
  },

  /**
   * Delete a course and all associated data
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      // Delete course progress
      await supabase
        .from('course_progress')
        .delete()
        .eq('course_id', courseId);

      // Delete associated quests
      await supabase
        .from('quests')
        .delete()
        .eq('course_id', courseId);

      // Delete the course
      await courseService.delete(courseId);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  /**
   * Get course statistics
   */
  async getCourseStatistics(courseId: string): Promise<{
    totalTopics: number;
    completedTopics: number;
    totalEstimatedHours: number;
    completedHours: number;
    averageTopicCompletion: number;
    upcomingDeadlines: SyllabusItem[];
  }> {
    try {
      const course = await this.getCourseWithProgress(courseId);
      
      const completedTopics = course.syllabus.filter(item => item.completed);
      const totalEstimatedHours = course.syllabus.reduce((sum, item) => sum + item.estimatedHours, 0);
      const completedHours = completedTopics.reduce((sum, item) => sum + item.estimatedHours, 0);
      
      const upcomingDeadlines = course.syllabus
        .filter(item => item.deadline && !item.completed && new Date(item.deadline) >= new Date())
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        .slice(0, 5);

      return {
        totalTopics: course.syllabus.length,
        completedTopics: completedTopics.length,
        totalEstimatedHours,
        completedHours,
        averageTopicCompletion: course.progress.completionPercentage,
        upcomingDeadlines
      };
    } catch (error) {
      console.error('Error getting course statistics:', error);
      throw error;
    }
  }
};