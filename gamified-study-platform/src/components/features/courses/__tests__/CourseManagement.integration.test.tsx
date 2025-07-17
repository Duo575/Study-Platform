import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CourseCard } from '../CourseCard';
import { CourseFilters } from '../CourseFilters';
import { SyllabusPreview } from '../SyllabusPreview';
import type { Course, CourseFilters as CourseFiltersType, SyllabusItem } from '../../../../types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockCourse: Course = {
  id: 'course-1',
  name: 'JavaScript Fundamentals',
  description: 'Learn the basics of JavaScript programming',
  color: '#3B82F6',
  syllabus: [
    {
      id: 'topic-1',
      title: 'Variables and Data Types',
      description: 'Understanding JavaScript variables',
      topics: ['var', 'let', 'const', 'strings', 'numbers'],
      estimatedHours: 3,
      priority: 'high',
      deadline: new Date('2024-02-15'),
      completed: false,
    },
    {
      id: 'topic-2',
      title: 'Functions',
      description: 'JavaScript functions and scope',
      topics: ['function declarations', 'arrow functions', 'scope'],
      estimatedHours: 4,
      priority: 'medium',
      completed: true,
    },
  ],
  progress: {
    completionPercentage: 50,
    hoursStudied: 15,
    topicsCompleted: 1,
    totalTopics: 2,
    lastStudied: new Date('2024-01-20'),
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-20'),
};

const mockFilters: CourseFiltersType = {
  search: '',
  completionStatus: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

describe('Course Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CourseCard Component', () => {
    it('should render course information correctly', () => {
      render(
        <BrowserRouter>
          <CourseCard course={mockCourse} />
        </BrowserRouter>
      );

      expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Learn the basics of JavaScript programming')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('1/2')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should display upcoming deadlines', () => {
      render(
        <BrowserRouter>
          <CourseCard course={mockCourse} />
        </BrowserRouter>
      );

      expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
      expect(screen.getByText('Variables and Data Types')).toBeInTheDocument();
    });

    it('should format last studied date correctly', () => {
      const courseWithRecentStudy = {
        ...mockCourse,
        progress: {
          ...mockCourse.progress,
          lastStudied: new Date(),
        },
      };

      render(
        <BrowserRouter>
          <CourseCard course={courseWithRecentStudy} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Last studied: Today/)).toBeInTheDocument();
    });
  });

  describe('CourseFilters Component', () => {
    it('should render all filter options', () => {
      const mockOnFilterChange = vi.fn();

      render(
        <CourseFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />
      );

      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
      expect(screen.getByLabelText('Order')).toBeInTheDocument();
    });

    it('should call onFilterChange when search input changes', async () => {
      const mockOnFilterChange = vi.fn();

      render(
        <CourseFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />
      );

      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'javascript' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilters,
        search: 'javascript',
      });
    });

    it('should call onFilterChange when status filter changes', () => {
      const mockOnFilterChange = vi.fn();

      render(
        <CourseFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />
      );

      const statusSelect = screen.getByLabelText('Status');
      fireEvent.change(statusSelect, { target: { value: 'completed' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilters,
        completionStatus: 'completed',
      });
    });
  });

  describe('SyllabusPreview Component', () => {
    const mockSyllabusItems: SyllabusItem[] = [
      {
        id: 'item-1',
        title: 'Introduction',
        description: 'Course introduction',
        topics: ['overview', 'objectives'],
        estimatedHours: 2,
        priority: 'medium',
        completed: false,
      },
      {
        id: 'item-2',
        title: 'Advanced Topics',
        topics: ['complex concepts'],
        estimatedHours: 5,
        priority: 'high',
        deadline: new Date('2024-03-01'),
        completed: false,
      },
    ];

    it('should render syllabus items correctly', () => {
      render(
        <SyllabusPreview
          items={mockSyllabusItems}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onAddTopic={vi.fn()}
        />
      );

      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Advanced Topics')).toBeInTheDocument();
      expect(screen.getByText('Course introduction')).toBeInTheDocument();
      expect(screen.getByText('2 hours')).toBeInTheDocument();
      expect(screen.getByText('5 hours')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
    });

    it('should display total statistics', () => {
      render(
        <SyllabusPreview
          items={mockSyllabusItems}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onAddTopic={vi.fn()}
        />
      );

      expect(screen.getByText('Total: 2 topics, 7 estimated hours')).toBeInTheDocument();
    });

    it('should call edit callback when edit button is clicked', () => {
      const mockOnEdit = vi.fn();

      render(
        <SyllabusPreview
          items={mockSyllabusItems}
          onEdit={mockOnEdit}
          onDelete={vi.fn()}
          onAddTopic={vi.fn()}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith('item-1');
    });

    it('should call delete callback when remove button is clicked', () => {
      const mockOnDelete = vi.fn();

      render(
        <SyllabusPreview
          items={mockSyllabusItems}
          onEdit={vi.fn()}
          onDelete={mockOnDelete}
          onAddTopic={vi.fn()}
        />
      );

      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith('item-1');
    });

    it('should show empty state when no items', () => {
      render(
        <SyllabusPreview
          items={[]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onAddTopic={vi.fn()}
        />
      );

      expect(screen.getByText('No syllabus items found.')).toBeInTheDocument();
      expect(screen.getByText('Add Topic Manually')).toBeInTheDocument();
    });

    it('should display topics as tags', () => {
      render(
        <SyllabusPreview
          items={mockSyllabusItems}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onAddTopic={vi.fn()}
        />
      );

      expect(screen.getByText('overview')).toBeInTheDocument();
      expect(screen.getByText('objectives')).toBeInTheDocument();
      expect(screen.getByText('complex concepts')).toBeInTheDocument();
    });

    it('should display deadline information', () => {
      render(
        <SyllabusPreview
          items={mockSyllabusItems}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onAddTopic={vi.fn()}
        />
      );

      expect(screen.getByText(/Due: 3\/1\/2024/)).toBeInTheDocument();
    });
  });
});