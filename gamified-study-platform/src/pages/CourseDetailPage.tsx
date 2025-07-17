import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/courseStore';
import type { Course, SyllabusItem } from '../types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SyllabusItemCard } from '../components/features/courses/SyllabusItemCard';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Alert } from '../components/ui/Alert';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    activeCourse: course, 
    isLoading, 
    error, 
    fetchCourseById, 
    updateCourse, 
    deleteCourse 
  } = useCourseStore();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchCourseById(id);
    }
  }, [id, fetchCourseById]);
  
  const handleEditCourse = () => {
    navigate(`/courses/edit/${id}`);
  };
  
  const handleDeleteCourse = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteCourse(id);
      navigate('/courses');
    } catch (err) {
      console.error('Error deleting course:', err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleSyllabusItemToggle = async (itemId: string, completed: boolean) => {
    if (!course || !id) return;
    
    try {
      // Find the syllabus item
      const updatedSyllabus = course.syllabus.map(item => 
        item.id === itemId ? { ...item, completed } : item
      );
      
      // Calculate new progress values
      const topicsCompleted = updatedSyllabus.filter(item => item.completed).length;
      const completionPercentage = Math.round(
        (topicsCompleted / course.syllabus.length) * 100
      );
      
      // Update the course in the database
      await updateCourse(id, {
        syllabus: updatedSyllabus
      });
      
      // Note: In a real implementation, we would also update the course_progress table
      // and potentially trigger XP rewards for completing topics
      
    } catch (err) {
      console.error('Error updating syllabus item:', err);
    }
  };
  
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
        <Alert variant="error">
          {error}
          <Button onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="p-4">
        <Alert variant="warning">
          Course not found. It may have been deleted or you don't have permission to view it.
          <Button onClick={() => navigate('/courses')} className="mt-2">
            Back to Courses
          </Button>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: course.color }}
            />
            <h1 className="text-2xl font-bold">{course.name}</h1>
          </div>
          {course.description && (
            <p className="text-gray-600 mt-1">{course.description}</p>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button onClick={handleEditCourse} variant="secondary">
            Edit Course
          </Button>
          <Button 
            onClick={() => setShowDeleteConfirm(true)} 
            variant="danger"
          >
            Delete
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-medium mb-3">Course Progress</h2>
        <div className="mb-2 flex justify-between text-sm">
          <span>
            {course.progress.topicsCompleted} of {course.syllabus.length} topics completed
          </span>
          <span>{course.progress.completionPercentage}%</span>
        </div>
        <ProgressBar 
          progress={course.progress.completionPercentage} 
          color={course.color}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">Hours Studied</div>
            <div className="text-xl font-medium">{course.progress.hoursStudied}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">Last Studied</div>
            <div className="text-xl font-medium">
              {course.progress.lastStudied.toLocaleDateString()}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">Created</div>
            <div className="text-xl font-medium">
              {course.createdAt.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Syllabus</h2>
        
        {course.syllabus.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded text-center">
            <p className="text-gray-500">No syllabus items found.</p>
            <Button 
              onClick={handleEditCourse} 
              variant="secondary"
              className="mt-2"
            >
              Add Topics
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {course.syllabus.map((item: SyllabusItem) => (
              <SyllabusItemCard
                key={item.id}
                item={item}
                courseColor={course.color}
                onToggleComplete={(completed) => handleSyllabusItemToggle(item.id, completed)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button onClick={() => navigate('/courses')} variant="secondary">
          Back to Courses
        </Button>
        <Button onClick={() => navigate(`/courses/${id}/study`)} variant="primary">
          Start Studying
        </Button>
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone and will remove all associated data."
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        isLoading={isDeleting}
        onConfirm={handleDeleteCourse}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default CourseDetailPage;