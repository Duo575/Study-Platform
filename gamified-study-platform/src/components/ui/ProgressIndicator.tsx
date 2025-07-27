import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressIndicatorProps {
  isVisible: boolean;
  progress?: number;
  message?: string;
  type?: 'linear' | 'circular' | 'dots';
  color?: string;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  isVisible,
  progress,
  message,
  type = 'linear',
  color = '#3b82f6',
  className = '',
}) => {
  const renderLinearProgress = () => (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {message && <span className="text-sm text-gray-600">{message}</span>}
        {progress !== undefined && (
          <span className="text-sm font-medium text-gray-800">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress || 0}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );

  const renderCircularProgress = () => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - ((progress || 0) / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            <motion.circle
              cx="22"
              cy="22"
              r={radius}
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>
          {progress !== undefined && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-800">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
        {message && (
          <span className="text-sm text-gray-600 mt-2 text-center">
            {message}
          </span>
        )}
      </div>
    );
  };

  const renderDotsProgress = () => (
    <div className="flex flex-col items-center">
      <div className="flex space-x-1 mb-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      {message && (
        <span className="text-sm text-gray-600 text-center">{message}</span>
      )}
    </div>
  );

  const renderProgress = () => {
    switch (type) {
      case 'circular':
        return renderCircularProgress();
      case 'dots':
        return renderDotsProgress();
      default:
        return renderLinearProgress();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`progress-indicator ${className}`}
        >
          {renderProgress()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Specialized progress indicators for common use cases
export const EnvironmentLoadingProgress: React.FC<{
  isLoading: boolean;
  environmentName?: string;
}> = ({ isLoading, environmentName }) => (
  <ProgressIndicator
    isVisible={isLoading}
    type="dots"
    message={`Loading ${environmentName || 'environment'}...`}
    color="#22c55e"
    className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-50"
  />
);

export const PetInteractionProgress: React.FC<{
  isVisible: boolean;
  action: string;
}> = ({ isVisible, action }) => (
  <ProgressIndicator
    isVisible={isVisible}
    type="circular"
    message={`${action}...`}
    color="#8b5cf6"
    className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg"
  />
);

export const StoreLoadingProgress: React.FC<{
  isLoading: boolean;
  progress?: number;
}> = ({ isLoading, progress }) => (
  <ProgressIndicator
    isVisible={isLoading}
    type="linear"
    progress={progress}
    message="Loading store items..."
    color="#f59e0b"
    className="mb-4"
  />
);

export const GameLoadingProgress: React.FC<{
  isLoading: boolean;
  gameName?: string;
}> = ({ isLoading, gameName }) => (
  <ProgressIndicator
    isVisible={isLoading}
    type="dots"
    message={`Starting ${gameName || 'game'}...`}
    color="#3b82f6"
    className="flex items-center justify-center h-32"
  />
);
