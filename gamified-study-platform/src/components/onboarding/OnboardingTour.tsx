import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Lightbulb,
  Target,
  Trophy,
  BookOpen,
  Timer,
  Users,
  Sparkles,
} from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  autoStart?: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  autoStart = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && steps.length > 0) {
      updateTargetElement();
    }
  }, [isOpen, currentStep, steps]);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        updateTargetElement();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const updateTargetElement = () => {
    const step = steps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.target) as HTMLElement;
    if (element) {
      setTargetElement(element);

      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });

      // Calculate tooltip position
      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const position = calculateTooltipPosition(rect, step.position);
        setTooltipPosition(position);
      }, 100);
    }
  };

  const calculateTooltipPosition = (
    targetRect: DOMRect,
    position: TourStep['position']
  ) => {
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const offset = 20;

    switch (position) {
      case 'top':
        return {
          x: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          y: targetRect.top - tooltipHeight - offset,
        };
      case 'bottom':
        return {
          x: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          y: targetRect.bottom + offset,
        };
      case 'left':
        return {
          x: targetRect.left - tooltipWidth - offset,
          y: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
        };
      case 'right':
        return {
          x: targetRect.right + offset,
          y: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
        };
      case 'center':
      default:
        return {
          x: window.innerWidth / 2 - tooltipWidth / 2,
          y: window.innerHeight / 2 - tooltipHeight / 2,
        };
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Overlay with spotlight effect */}
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          style={{
            background: targetElement
              ? `radial-gradient(circle at ${
                  targetElement.getBoundingClientRect().left +
                  targetElement.getBoundingClientRect().width / 2
                }px ${
                  targetElement.getBoundingClientRect().top +
                  targetElement.getBoundingClientRect().height / 2
                }px, transparent 0px, transparent ${
                  Math.max(
                    targetElement.getBoundingClientRect().width,
                    targetElement.getBoundingClientRect().height
                  ) /
                    2 +
                  10
                }px, rgba(0,0,0,0.6) ${
                  Math.max(
                    targetElement.getBoundingClientRect().width,
                    targetElement.getBoundingClientRect().height
                  ) /
                    2 +
                  20
                }px)`
              : 'rgba(0,0,0,0.6)',
          }}
        />

        {/* Highlighted element border */}
        {targetElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute border-2 border-blue-400 rounded-lg shadow-lg pointer-events-none"
            style={{
              left: targetElement.getBoundingClientRect().left - 4,
              top: targetElement.getBoundingClientRect().top - 4,
              width: targetElement.getBoundingClientRect().width + 8,
              height: targetElement.getBoundingClientRect().height + 8,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm"
          style={{
            left: Math.max(
              16,
              Math.min(tooltipPosition.x, window.innerWidth - 336)
            ),
            top: Math.max(
              16,
              Math.min(tooltipPosition.y, window.innerHeight - 216)
            ),
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentStepData.icon && (
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  {currentStepData.icon}
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentStepData.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {currentStepData.content}
          </p>

          {/* Action button */}
          {currentStepData.action && (
            <button
              onClick={currentStepData.action.onClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-4"
            >
              {currentStepData.action.label}
            </button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              <button
                onClick={nextStep}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Predefined tour steps for different features
export const dashboardTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Study Adventure!',
    content:
      "Let's take a quick tour to help you get started with your gamified learning journey.",
    target: 'body',
    position: 'center',
    icon: <Sparkles className="w-4 h-4 text-blue-600" />,
  },
  {
    id: 'xp-bar',
    title: 'Your Progress Bar',
    content:
      'This shows your current level and XP. Complete study tasks to earn experience points and level up!',
    target: '[data-tour="xp-bar"]',
    position: 'bottom',
    icon: <Trophy className="w-4 h-4 text-yellow-600" />,
  },
  {
    id: 'courses',
    title: 'Course Management',
    content:
      'Add your courses and syllabi here. The system will automatically generate study quests for you.',
    target: '[data-tour="courses"]',
    position: 'right',
    icon: <BookOpen className="w-4 h-4 text-green-600" />,
  },
  {
    id: 'quests',
    title: 'Study Quests',
    content:
      'Complete daily, weekly, and milestone quests to earn XP and keep your study routine on track.',
    target: '[data-tour="quests"]',
    position: 'right',
    icon: <Target className="w-4 h-4 text-purple-600" />,
  },
  {
    id: 'timer',
    title: 'Pomodoro Timer',
    content:
      'Use the built-in timer for focused study sessions. Track your productivity and earn bonus XP!',
    target: '[data-tour="timer"]',
    position: 'right',
    icon: <Timer className="w-4 h-4 text-red-600" />,
  },
  {
    id: 'pet',
    title: 'Your Study Pet',
    content:
      'Meet your virtual study companion! Keep studying to keep your pet happy and help it evolve.',
    target: '[data-tour="pet"]',
    position: 'left',
    icon: <Lightbulb className="w-4 h-4 text-orange-600" />,
  },
  {
    id: 'social',
    title: 'Study Groups',
    content:
      'Connect with other learners, join study groups, and compete on leaderboards for extra motivation.',
    target: '[data-tour="social"]',
    position: 'right',
    icon: <Users className="w-4 h-4 text-blue-600" />,
  },
];

// Hook for managing onboarding state
export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('onboarding_completed') === 'true';
  });

  const [currentTour, setCurrentTour] = useState<string | null>(null);

  const startTour = (tourId: string) => {
    setCurrentTour(tourId);
  };

  const completeTour = (tourId: string) => {
    setCurrentTour(null);
    if (tourId === 'dashboard') {
      setHasCompletedOnboarding(true);
      localStorage.setItem('onboarding_completed', 'true');
    }
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    localStorage.removeItem('onboarding_completed');
  };

  return {
    hasCompletedOnboarding,
    currentTour,
    startTour,
    completeTour,
    resetOnboarding,
  };
};
