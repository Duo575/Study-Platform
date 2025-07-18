// Mock database service to replace Supabase when it's not working
import type { Course } from '../types';

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Introduction to React',
    description: 'Learn the fundamentals of React development',
    color: '#3B82F6',
    progress: 65,
    totalLessons: 12,
    completedLessons: 8,
    syllabus: [
      {
        id: '1',
        title: 'React Basics',
        completed: true,
        deadline: new Date('2024-01-15').toISOString(),
        type: 'lesson',
      },
      {
        id: '2',
        title: 'Components and Props',
        completed: true,
        deadline: new Date('2024-01-20').toISOString(),
        type: 'lesson',
      },
      {
        id: '3',
        title: 'State Management',
        completed: false,
        deadline: new Date('2024-01-25').toISOString(),
        type: 'assignment',
      },
    ],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: '2',
    name: 'JavaScript Fundamentals',
    description: 'Master JavaScript from basics to advanced concepts',
    color: '#F59E0B',
    progress: 30,
    totalLessons: 15,
    completedLessons: 4,
    syllabus: [
      {
        id: '4',
        title: 'Variables and Data Types',
        completed: true,
        deadline: new Date('2024-01-10').toISOString(),
        type: 'lesson',
      },
      {
        id: '5',
        title: 'Functions and Scope',
        completed: false,
        deadline: new Date('2024-01-30').toISOString(),
        type: 'lesson',
      },
    ],
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '3',
    name: 'Web Design Principles',
    description: 'Learn modern web design and UI/UX principles',
    color: '#10B981',
    progress: 85,
    totalLessons: 8,
    completedLessons: 7,
    syllabus: [
      {
        id: '6',
        title: 'Color Theory',
        completed: true,
        deadline: new Date('2024-01-12').toISOString(),
        type: 'lesson',
      },
      {
        id: '7',
        title: 'Typography',
        completed: true,
        deadline: new Date('2024-01-18').toISOString(),
        type: 'lesson',
      },
    ],
    createdAt: new Date('2024-01-03').toISOString(),
    updatedAt: new Date('2024-01-22').toISOString(),
  },
];

const mockTodos = [
  {
    id: '1',
    title: 'Complete React assignment',
    description: 'Build a todo app using React hooks',
    completed: false,
    priority: 'high',
    dueDate: new Date('2024-01-28').toISOString(),
    courseId: '1',
    createdAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: '2',
    title: 'Read JavaScript chapter 5',
    description: 'Study closures and scope',
    completed: true,
    priority: 'medium',
    dueDate: new Date('2024-01-25').toISOString(),
    courseId: '2',
    createdAt: new Date('2024-01-18').toISOString(),
  },
  {
    id: '3',
    title: 'Design portfolio mockup',
    description: 'Create wireframes for personal portfolio',
    completed: false,
    priority: 'low',
    dueDate: new Date('2024-02-01').toISOString(),
    courseId: '3',
    createdAt: new Date('2024-01-22').toISOString(),
  },
];

const mockUser = {
  id: 'mock-user-1',
  email: 'demo@studyquest.com',
  username: 'demouser',
  profile: {
    username: 'demouser',
    firstName: 'Demo',
    lastName: 'User',
    avatarUrl: null,
  },
};

// Mock services
export const mockCourseService = {
  async getByUserId(userId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCourses;
  },

  async getById(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCourses.find(course => course.id === id) || null;
  },

  async create(courseData: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCourse: Course = {
      id: Date.now().toString(),
      name: courseData.name,
      description: courseData.description,
      color: courseData.color || '#3B82F6',
      progress: 0,
      totalLessons: 0,
      completedLessons: 0,
      syllabus: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCourses.push(newCourse);
    return newCourse;
  },

  async update(id: string, courseData: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockCourses.findIndex(course => course.id === id);
    if (index !== -1) {
      mockCourses[index] = {
        ...mockCourses[index],
        ...courseData,
        updatedAt: new Date().toISOString(),
      };
      return mockCourses[index];
    }
    return null;
  },

  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCourses.findIndex(course => course.id === id);
    if (index !== -1) {
      mockCourses.splice(index, 1);
    }
  },
};

export const mockTodoService = {
  async getByUserId(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockTodos;
  },

  async create(todoData: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTodo = {
      id: Date.now().toString(),
      ...todoData,
      createdAt: new Date().toISOString(),
    };
    mockTodos.push(newTodo);
    return newTodo;
  },

  async update(id: string, todoData: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockTodos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      mockTodos[index] = { ...mockTodos[index], ...todoData };
      return mockTodos[index];
    }
    return null;
  },

  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockTodos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      mockTodos.splice(index, 1);
    }
  },
};

export const mockUserService = {
  async getCurrentUser() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUser;
  },
};

// Export flag to enable mock mode
export const MOCK_MODE = true;
