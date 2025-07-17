import { create } from 'zustand';
import { courseService } from '../services/database';
import { getCurrentUser } from '../lib/supabase';
import type { Course, CourseFilters } from '../types';

interface CourseState {
  courses: Course[];
  activeCourse: Course | null;
  isLoading: boolean;
  error: string | null;
  filters: CourseFilters;
  
  // Actions
  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<Course | null>;
  createCourse: (courseData: any) => Promise<Course | null>;
  updateCourse: (id: string, courseData: any) => Promise<Course | null>;
  deleteCourse: (id: string) => Promise<void>;
  setActiveCourse: (course: Course | null) => void;
  updateFilters: (newFilters: Partial<CourseFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: CourseFilters = {
  search: '',
  completionStatus: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  activeCourse: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,
  
  fetchCourses: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const user = await getCurrentUser();
      if (!user) {
        set({ error: 'User not authenticated', isLoading: false });
        return;
      }
      
      const coursesData = await courseService.getByUserId(user.id);
      
      // Transform database courses to frontend Course type
      const transformedCourses: Course[] = coursesData.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description || '',
        color: course.color,
        syllabus: Array.isArray(course.syllabus) ? course.syllabus : [],
        progress: {
          completionPercentage: course.course_progress?.completion_percentage || 0,
          hoursStudied: Math.round(course.course_progress?.total_time_spent / 60) || 0,
          topicsCompleted: course.course_progress?.topics_completed ? 
            Object.keys(course.course_progress.topics_completed).length : 0,
          totalTopics: Array.isArray(course.syllabus) ? course.syllabus.length : 0,
          lastStudied: course.course_progress?.last_studied ? 
            new Date(course.course_progress.last_studied) : new Date()
        },
        createdAt: new Date(course.created_at),
        updatedAt: new Date(course.updated_at)
      }));
      
      set({ courses: transformedCourses, isLoading: false });
    } catch (error) {
      console.error('Error fetching courses:', error);
      set({ error: 'Failed to load courses', isLoading: false });
    }
  },
  
  fetchCourseById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const courseData = await courseService.getById(id);
      
      // Transform database course to frontend Course type
      const transformedCourse: Course = {
        id: courseData.id,
        name: courseData.name,
        description: courseData.description || '',
        color: courseData.color,
        syllabus: Array.isArray(courseData.syllabus) ? courseData.syllabus : [],
        progress: {
          completionPercentage: courseData.course_progress?.completion_percentage || 0,
          hoursStudied: Math.round(courseData.course_progress?.total_time_spent / 60) || 0,
          topicsCompleted: courseData.course_progress?.topics_completed ? 
            Object.keys(courseData.course_progress.topics_completed).length : 0,
          totalTopics: Array.isArray(courseData.syllabus) ? courseData.syllabus.length : 0,
          lastStudied: courseData.course_progress?.last_studied ? 
            new Date(courseData.course_progress.last_studied) : new Date()
        },
        createdAt: new Date(courseData.created_at),
        updatedAt: new Date(courseData.updated_at)
      };
      
      set({ activeCourse: transformedCourse, isLoading: false });
      return transformedCourse;
    } catch (error) {
      console.error('Error fetching course:', error);
      set({ error: 'Failed to load course', isLoading: false });
      return null;
    }
  },
  
  createCourse: async (courseData) => {
    try {
      set({ isLoading: true, error: null });
      
      const user = await getCurrentUser();
      if (!user) {
        set({ error: 'User not authenticated', isLoading: false });
        return null;
      }
      
      const newCourse = await courseService.create({
        user_id: user.id,
        ...courseData
      });
      
      // Refresh courses list
      get().fetchCourses();
      
      set({ isLoading: false });
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      set({ error: 'Failed to create course', isLoading: false });
      return null;
    }
  },
  
  updateCourse: async (id, courseData) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedCourse = await courseService.update(id, courseData);
      
      // Update the course in the local state
      const { courses } = get();
      const updatedCourses = courses.map(course => 
        course.id === id ? { ...course, ...courseData } : course
      );
      
      set({ courses: updatedCourses, isLoading: false });
      
      // If this is the active course, update it too
      const { activeCourse } = get();
      if (activeCourse && activeCourse.id === id) {
        set({ activeCourse: { ...activeCourse, ...courseData } });
      }
      
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      set({ error: 'Failed to update course', isLoading: false });
      return null;
    }
  },
  
  deleteCourse: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      await courseService.delete(id);
      
      // Remove the course from the local state
      const { courses, activeCourse } = get();
      const updatedCourses = courses.filter(course => course.id !== id);
      
      set({ 
        courses: updatedCourses, 
        activeCourse: activeCourse && activeCourse.id === id ? null : activeCourse,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      set({ error: 'Failed to delete course', isLoading: false });
    }
  },
  
  setActiveCourse: (course) => {
    set({ activeCourse: course });
  },
  
  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },
  
  resetFilters: () => {
    set({ filters: defaultFilters });
  }
}));