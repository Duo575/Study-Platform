import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | string;
  height?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = 'blue', 
  height = 'h-2',
  className = ''
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Get color classes
  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      red: 'bg-red-600',
      yellow: 'bg-yellow-600'
    }
    return colorMap[colorName] || 'bg-blue-600'
  }
  
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${height} ${className}`}>
      <div 
        className={`h-full rounded-full transition-all duration-500 ease-out ${
          color.startsWith('#') || color.startsWith('rgb') 
            ? '' 
            : getColorClass(color)
        }`}
        style={{ 
          width: `${clampedProgress}%`,
          ...(color.startsWith('#') || color.startsWith('rgb') ? { backgroundColor: color } : {})
        }}
      />
    </div>
  );
};