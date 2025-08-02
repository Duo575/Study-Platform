import React from 'react';

interface ProgressBarProps {
  progress?: number;
  value?: number;
  max?: number;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | string;
  height?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  value,
  max = 100,
  color = 'blue',
  height = 'h-2',
  size = 'md',
  className = '',
}) => {
  // Calculate progress from value/max or use progress directly
  const calculatedProgress =
    progress !== undefined
      ? progress
      : value !== undefined
        ? (value / max) * 100
        : 0;

  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(calculatedProgress, 0), 100);

  // Get color classes
  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      red: 'bg-red-600',
      yellow: 'bg-yellow-600',
    };
    return colorMap[colorName] || 'bg-blue-600';
  };

  // Get size-based height if not explicitly provided
  const getSizeHeight = (sizeValue: string) => {
    const sizeMap: Record<string, string> = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };
    return sizeMap[sizeValue] || 'h-3';
  };

  const finalHeight = height !== 'h-2' ? height : getSizeHeight(size);

  return (
    <div
      className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${finalHeight} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${
          color.startsWith('#') || color.startsWith('rgb')
            ? ''
            : getColorClass(color)
        }`}
        style={{
          width: `${clampedProgress}%`,
          ...(color.startsWith('#') || color.startsWith('rgb')
            ? { backgroundColor: color }
            : {}),
        }}
      />
    </div>
  );
};
