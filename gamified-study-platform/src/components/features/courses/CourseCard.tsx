import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Course } from '../../../types';
import { ProgressBar } from '../../ui/ProgressBar';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };
  
  // Calculate upcoming deadlines
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const upcomingItems = course.syllabus
      .filter(item => 
        item.deadline && 
        !item.completed && 
        new Date(item.deadline) >= today
      )
      .sort((a, b) => 
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
      )
      .slice(0, 2); // Get the closest 2 deadlines
    
    return upcomingItems;
  };
  
  const upcomingDeadlines = getUpcomingDeadlines();
  
  // Format last studied date
  const formatLastStudied = () => {
    if (!course.progress.lastStudied) return 'Never';
    
    const lastStudied = new Date(course.progress.lastStudied);
    const today = new Date();
    const diffTime = today.getTime() - lastStudied.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return lastStudied.toLocaleDateString();
  };
  
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div 
        className="h-2" 
        style={{ backgroundColor: course.color }}
      />
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1">{course.name}</h3>
        
        {course.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.description}
          </p>
        )}
        
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{course.progress.completionPercentage}%</span>
          </div>
          <ProgressBar 
            progress={course.progress.completionPercentage} 
            color={course.color}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-500">Topics</div>
            <div className="font-medium">
              {course.progress.topicsCompleted}/{course.syllabus.length}
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-500">Hours</div>
            <div className="font-medium">{course.progress.hoursStudied}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Last studied: {formatLastStudied()}</span>
        </div>
        
        {upcomingDeadlines.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs font-medium mb-1">Upcoming Deadlines</div>
            {upcomingDeadlines.map((item, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="truncate">{item.title}</span>
                <span className="text-gray-500 ml-2">
                  {new Date(item.deadline!).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};