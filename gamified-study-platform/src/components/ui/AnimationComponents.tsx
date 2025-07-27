import React, { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';

// Type for motion div with className
type MotionDivProps = HTMLMotionProps<'div'>;

// Basic environment transition
interface EnvironmentTransitionProps {
  children: ReactNode;
  environmentId: string;
  className?: string;
}

export const EnvironmentTransition: React.FC<EnvironmentTransitionProps> = ({
  children,
  environmentId,
  className = '',
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={environmentId}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Pet interaction animations
interface PetInteractionAnimationProps {
  children: ReactNode;
  isInteracting: boolean;
  interactionType: 'feeding' | 'playing' | 'caring' | 'idle';
  className?: string;
}

export const PetInteractionAnimation: React.FC<
  PetInteractionAnimationProps
> = ({ children, isInteracting, interactionType, className = '' }) => {
  const getAnimation = () => {
    if (!isInteracting) return {};

    switch (interactionType) {
      case 'feeding':
        return {
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, 0],
        };
      case 'playing':
        return {
          scale: [1, 1.2, 1],
          y: [0, -10, 0],
        };
      case 'caring':
        return {
          scale: [1, 1.05, 1],
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      animate={getAnimation()}
      transition={{
        duration: 0.6,
        repeat: isInteracting ? Infinity : 0,
        repeatType: 'reverse',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Simple loading animation
interface LoadingAnimationProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  type?: 'spinner' | 'progress' | 'pulse' | 'dots' | 'wave';
  className?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  isLoading,
  progress = 0,
  message,
  type = 'spinner',
  className = '',
}) => {
  if (!isLoading) return null;

  const renderContent = () => {
    switch (type) {
      case 'progress':
        return (
          <div className="w-full max-w-xs">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {message && (
              <p className="text-sm text-gray-600 text-center">{message}</p>
            )}
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
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
        );

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="w-1 h-8 bg-blue-500 rounded-full"
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className="w-12 h-12 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        );

      default:
        return (
          <motion.div
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
    }
  };

  const containerClasses = `flex flex-col items-center justify-center space-y-3 ${className}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={containerClasses}
    >
      {renderContent()}
      {message && type !== 'progress' && (
        <p className="text-sm text-gray-600 text-center">{message}</p>
      )}
    </motion.div>
  );
};

// Visual feedback notifications
interface VisualFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  duration?: number;
}

export const VisualFeedback: React.FC<VisualFeedbackProps> = ({
  type,
  message,
  isVisible,
  onClose,
  duration = 3000,
}) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  useEffect(() => {
    if (isVisible && duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const feedbackClasses = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${getStyles()}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={feedbackClasses}
        >
          <div className="flex items-center space-x-2">
            <span>{message}</span>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-2 text-current opacity-70 hover:opacity-100"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Stagger animation for lists
interface StaggerAnimationProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const StaggerAnimation: React.FC<StaggerAnimationProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Hover scale animation
interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.05,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Simple typewriter effect
interface TypewriterAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterAnimation: React.FC<TypewriterAnimationProps> = ({
  text,
  speed = 50,
  className = '',
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};

// Simple pulse animation
interface PulseAnimationProps {
  children: ReactNode;
  isActive: boolean;
  className?: string;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  isActive,
  className = '',
}) => {
  return (
    <motion.div
      animate={isActive ? { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] } : {}}
      transition={{
        duration: 1.5,
        repeat: isActive ? Infinity : 0,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
