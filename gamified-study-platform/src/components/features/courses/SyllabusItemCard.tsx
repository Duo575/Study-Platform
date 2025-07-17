import React from 'react';
import { motion } from 'framer-motion';
import type { SyllabusItem } from '../../../types';

interface SyllabusItemCardProps {
  item: SyllabusItem;
  courseColor: string;
  onToggleComplete: (completed: boolean) => void;
  onEdit?: () => void;
}

export const SyllabusItemCard: React.FC<SyllabusItemCardProps> = ({
  item,
  courseColor,
  onToggleComplete,
  onEdit
}) => {
  const handleToggle = () => {
    onToggleComplete(!item.completed);
  };
  
  // Calculate days remaining or overdue
  const getDaysStatus = () => {
    if (!item.deadline) return null;
    
    const today = new Date();
    const deadline = new Date(item.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { text: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, color: 'text-green-600' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-yellow-600' };
    } else {
      return { text: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`, color: 'text-red-600' };
    }
  };
  
  const daysStatus = getDaysStatus();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow p-4 border-l-4 ${
        item.completed ? 'border-green-500' : `border-[${courseColor}]`
      }`}
      style={{ borderLeftColor: item.completed ? undefined : courseColor }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={handleToggle}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
              {item.title}
            </h3>
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            )}
          </div>
          
          {item.description && (
            <p className={`text-sm mt-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
              {item.description}
            </p>
          )}
          
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded text-xs ${
              item.priority === 'high' ? 'bg-red-100 text-red-800' :
              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {item.priority}
            </span>
            
            <span className="text-xs text-gray-500">
              {item.estimatedHours} hours
            </span>
            
            {daysStatus && (
              <span className={`text-xs ${daysStatus.color}`}>
                {daysStatus.text}
              </span>
            )}
          </div>
          
          {item.topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.topics.map((topic, i) => (
                <span 
                  key={i} 
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    item.completed 
                      ? 'bg-gray-100 text-gray-500' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};