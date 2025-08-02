// Mock database service to replace Supabase when it's not working
import type { Course } from '../types';

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Introduction to React',
    description: 'Learn the fundamentals of React development',
    color: '#3B82F6',
    progress: {
      completionPercentage: 65,
      hoursStudied: 24,
      topicsCompleted: 8,
      totalTopics: 12,
      lastStudied: new Date('2024-01-20'),
    },

    syllabus: [
      {
        id: '1',
        title: 'React Basics',
        description: 'Learn the fundamentals of React',
        topics: ['JSX', 'Components', 'Virtual DOM'],
        estimatedHours: 4,
        priority: 'high' as const,
        deadline: new Date('2024-01-15'),
        completed: true,
      },
      {
        id: '2',
        title: 'Components and Props',
        description: 'Understanding React components',
        topics: ['Props', 'State', 'Event Handling'],
        estimatedHours: 6,
        priority: 'medium' as const,
        deadline: new Date('2024-01-20'),
        completed: true,
      },
      {
        id: '3',
        title: 'State Management',
        description: 'Managing state in React applications',
        topics: ['useState', 'useEffect', 'Context'],
        estimatedHours: 8,
        priority: 'high' as const,
        deadline: new Date('2024-01-25'),
        completed: false,
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'JavaScript Fundamentals',
    description: 'Master JavaScript from basics to advanced concepts',
    color: '#F59E0B',
    progress: {
      completionPercentage: 30,
      hoursStudied: 12,
      topicsCompleted: 4,
      totalTopics: 15,
      lastStudied: new Date('2024-01-15'),
    },
    syllabus: [
      {
        id: '4',
        title: 'Variables and Data Types',
        description: 'Understanding JavaScript data types',
        topics: ['Variables', 'Numbers', 'Strings', 'Booleans'],
        estimatedHours: 3,
        priority: 'high' as const,
        deadline: new Date('2024-01-10'),
        completed: true,
      },
      {
        id: '5',
        title: 'Functions and Scope',
        description: 'JavaScript functions and scope concepts',
        topics: ['Function Declaration', 'Arrow Functions', 'Scope'],
        estimatedHours: 5,
        priority: 'medium' as const,
        deadline: new Date('2024-01-30'),
        completed: false,
      },
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Web Design Principles',
    description: 'Learn modern web design and UI/UX principles',
    color: '#10B981',
    progress: {
      completionPercentage: 85,
      hoursStudied: 28,
      topicsCompleted: 7,
      totalTopics: 8,
      lastStudied: new Date('2024-01-22'),
    },
    syllabus: [
      {
        id: '6',
        title: 'Color Theory',
        description: 'Understanding color in design',
        topics: ['Color Wheel', 'Color Harmony', 'Psychology'],
        estimatedHours: 4,
        priority: 'medium' as const,
        deadline: new Date('2024-01-12'),
        completed: true,
      },
      {
        id: '7',
        title: 'Typography',
        description: 'Typography principles and practices',
        topics: ['Font Selection', 'Hierarchy', 'Readability'],
        estimatedHours: 3,
        priority: 'high' as const,
        deadline: new Date('2024-01-18'),
        completed: true,
      },
    ],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-22'),
  },
];

const mockTodos = [
  {
    id: '1',
    title: 'Complete React assignment',
    description: 'Build a todo app using React hooks',
    completed: false,
    priority: 'high' as const,
    estimatedMinutes: 120,
    dueDate: new Date('2024-01-28'),
    courseId: '1',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    title: 'Read JavaScript chapter 5',
    description: 'Study closures and scope',
    completed: true,
    priority: 'medium' as const,
    estimatedMinutes: 60,
    dueDate: new Date('2024-01-25'),
    courseId: '2',
    createdAt: new Date('2024-01-18'),
    completedAt: new Date('2024-01-24'),
  },
  {
    id: '3',
    title: 'Design portfolio mockup',
    description: 'Create wireframes for personal portfolio',
    completed: false,
    priority: 'low' as const,
    estimatedMinutes: 90,
    dueDate: new Date('2024-02-01'),
    courseId: '3',
    createdAt: new Date('2024-01-22'),
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
      progress: {
        completionPercentage: 0,
        hoursStudied: 0,
        topicsCompleted: 0,
        totalTopics: 0,
        lastStudied: new Date(),
      },

      syllabus: [],
      createdAt: new Date(),
      updatedAt: new Date(),
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
        updatedAt: new Date(),
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
    return [...mockTodos]; // Return a copy to prevent mutations
  },

  async create(todoData: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTodo = {
      id: Date.now().toString(),
      title: todoData.title || 'Untitled Todo',
      description: todoData.description || '',
      completed: false,
      priority: todoData.priority || 'medium',
      estimatedMinutes: todoData.estimatedMinutes || 30,
      courseId: todoData.courseId,
      questId: todoData.questId,
      dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined,
      createdAt: new Date(),
      ...todoData,
    };
    mockTodos.push(newTodo);
    return newTodo;
  },

  async update(id: string, todoData: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockTodos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      // Handle date conversion if needed
      const updatedData = { ...todoData };
      if (updatedData.dueDate && typeof updatedData.dueDate === 'string') {
        updatedData.dueDate = new Date(updatedData.dueDate);
      }
      if (updatedData.completed && !mockTodos[index].completedAt) {
        updatedData.completedAt = new Date();
      }

      mockTodos[index] = { ...mockTodos[index], ...updatedData };
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
