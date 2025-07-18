import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useFeedback } from '../feedback/FeedbackSystem';
import { useOnboarding } from '../onboarding/OnboardingTour';

/**
 * SystemIntegration component handles cross-system interactions and celebrations
 * This component provides seamless integration between different parts of the app
 */
export const SystemIntegration: React.FC = () => {
  const { user } = useAuth();
  const { addMessage } = useFeedback();
  const { hasCompletedOnboarding } = useOnboarding();

  // Welcome message for new users
  useEffect(() => {
    if (user && !hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        addMessage({
          type: 'success',
          title: `Welcome to StudyQuest, ${user.email?.split('@')[0]}!`,
          message:
            'Your gamified learning journey begins now. Ready to level up your studies?',
          duration: 6000,
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, hasCompletedOnboarding, addMessage]);

  // These functions can be called from other components when needed
  // Achievement celebration system
  React.useEffect(() => {
    // Expose celebration functions globally for other components to use
    (window as any).celebrateAchievement = (
      achievement: string,
      xp: number
    ) => {
      addMessage({
        type: 'success',
        title: '🎉 Achievement Unlocked!',
        message: `${achievement} (+${xp} XP)`,
        duration: 8000,
      });
    };

    (window as any).celebrateLevelUp = (newLevel: number) => {
      addMessage({
        type: 'success',
        title: '⚡ Level Up!',
        message: `Congratulations! You've reached Level ${newLevel}!`,
        duration: 10000,
      });
    };

    (window as any).celebrateStreak = (days: number) => {
      addMessage({
        type: 'success',
        title: '🔥 Streak Milestone!',
        message: `Amazing! You've maintained a ${days}-day study streak!`,
        duration: 7000,
      });
    };
  }, [addMessage]);

  return null; // This component doesn't render anything visible
};

/**
 * Micro-interaction component for enhanced user experience
 */
export const MicroInteractions: React.FC = () => {
  return (
    <>
      {/* Global micro-interaction styles */}
      <style>{`
        /* Smooth hover transitions for interactive elements */
        .interactive-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .interactive-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Button press animation */
        .button-press:active {
          transform: scale(0.98);
        }

        /* Card hover effects */
        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        /* Pulse animation for important elements */
        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
          }
        }

        /* Smooth focus indicators */
        .focus-ring:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        /* Loading shimmer effect */
        .shimmer {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Success ripple effect */
        .success-ripple {
          position: relative;
          overflow: hidden;
        }

        .success-ripple::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.3);
          transform: translate(-50%, -50%);
          animation: ripple 0.6s ease-out;
        }

        @keyframes ripple {
          to {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

/**
 * Celebration animations component
 */
interface CelebrationProps {
  type: 'levelUp' | 'achievement' | 'streak' | 'quest';
  isVisible: boolean;
  onComplete: () => void;
  data?: {
    level?: number;
    achievement?: string;
    streak?: number;
    xp?: number;
  };
}

export const CelebrationAnimation: React.FC<CelebrationProps> = ({
  type,
  isVisible,
  onComplete,
  data,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'levelUp':
        return (
          <svg
            className="w-12 h-12 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        );
      case 'achievement':
        return (
          <svg
            className="w-12 h-12 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      case 'streak':
        return (
          <svg
            className="w-12 h-12 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case 'quest':
        return (
          <svg
            className="w-12 h-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-12 h-12 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        );
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'levelUp':
        return `Level ${data?.level || 'Up'}!`;
      case 'achievement':
        return 'Achievement Unlocked!';
      case 'streak':
        return `${data?.streak || 0} Day Streak!`;
      case 'quest':
        return 'Quest Complete!';
      default:
        return 'Celebration!';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'levelUp':
        return `Congratulations! You've reached Level ${data?.level || 1}!`;
      case 'achievement':
        return data?.achievement || 'You unlocked a new achievement!';
      case 'streak':
        return `Amazing consistency! Keep up the great work!`;
      case 'quest':
        return `Great job! You earned ${data?.xp || 0} XP!`;
      default:
        return 'Keep up the excellent work!';
    }
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '384px',
              margin: '16px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            {/* Confetti effect */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    y: -100,
                    x: Math.random() * 400 - 200,
                    opacity: 1,
                  }}
                  animate={{
                    y: 400,
                    x: Math.random() * 400 - 200,
                    rotate: Math.random() * 360,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 2,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    background: 'linear-gradient(to right, #fbbf24, #ec4899)',
                    borderRadius: '50%',
                  }}
                />
              ))}
            </div>

            {/* Icon with pulse animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, times: [0, 0.6, 1] }}
              style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
                {getIcon()}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              {getTitle()}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                color: '#6b7280',
                marginBottom: '24px',
              }}
            >
              {getMessage()}
            </motion.p>

            {/* XP indicator */}
            {data?.xp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(to right, #dcfce7, #dbeafe)',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                }}
              >
                <svg
                  style={{ width: '16px', height: '16px', color: '#eab308' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827',
                  }}
                >
                  +{data.xp} XP
                </span>
              </motion.div>
            )}

            {/* Auto-close indicator */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '4px',
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                borderRadius: '0 0 16px 16px',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Loading states with enhanced animations
 */
export const EnhancedLoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const sizeStyles = {
    sm: { width: '16px', height: '16px' },
    md: { width: '32px', height: '32px' },
    lg: { width: '48px', height: '48px' },
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          ...sizeStyles[size],
          border: '2px solid #cbd5e1',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
        }}
      />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '16px',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

/**
 * Progress indicator with smooth animations
 */
export const AnimatedProgressBar: React.FC<{
  progress: number;
  label?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ progress, label, color = 'blue' }) => {
  const getProgressGradient = (color: string) => {
    switch (color) {
      case 'blue':
        return 'linear-gradient(to right, #3b82f6, #2563eb)';
      case 'green':
        return 'linear-gradient(to right, #10b981, #059669)';
      case 'purple':
        return 'linear-gradient(to right, #8b5cf6, #7c3aed)';
      case 'orange':
        return 'linear-gradient(to right, #f97316, #ea580c)';
      default:
        return 'linear-gradient(to right, #3b82f6, #2563eb)';
    }
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: getProgressGradient(color),
            borderRadius: '9999px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};
