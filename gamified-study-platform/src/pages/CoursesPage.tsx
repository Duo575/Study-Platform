import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/courseStore';
import { CourseCard } from '../components/features/courses/CourseCard';
import { CourseFilters } from '../components/features/courses/CourseFilters';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const CoursesPage: React.FC = () => {
  const { 
    courses, 
    isLoading, 
    error, 
    filters, 
    fetchCourses, 
    updateFilters, 
    resetFilters 
  } = useCourseStore();
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateCourse = () => {
    navigate('/courses/new');
  };

  const handleFilterChange = (newFilters: any) => {
    updateFilters(newFilters);
  };

  // Apply filters and sorting
  const filteredCourses = courses.filter(course => {
    // Search filter
    if (filters.search && !course.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Completion status filter
    if (filters.completionStatus !== 'all') {
      if (filters.completionStatus === 'completed' && course.progress.completionPercentage < 100) {
        return false;
      }
      if (filters.completionStatus === 'in_progress' && 
          (course.progress.completionPercentage === 0 || course.progress.completionPercentage === 100)) {
        return false;
      }
      if (filters.completionStatus === 'not_started' && course.progress.completionPercentage > 0) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    // Sorting
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Button onClick={handleCreateCourse} variant="primary">
          Create New Course
        </Button>
      </div>

      <CourseFilters filters={filters} onFilterChange={handleFilterChange} />

      {filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description={
            courses.length === 0
              ? "You haven't created any courses yet. Get started by creating your first course!"
              : "No courses match your current filters. Try adjusting your search criteria."
          }
          action={
            courses.length === 0 ? (
              <Button onClick={handleCreateCourse} variant="primary">
                Create Your First Course
              </Button>
            ) : (
              <Button onClick={() => resetFilters()}>
                Clear Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;