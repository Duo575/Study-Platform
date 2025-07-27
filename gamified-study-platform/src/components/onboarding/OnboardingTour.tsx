import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  HeartIcon,
  PlayIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import { TypewriterAnimation } from '../ui/AnimationComponents';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
  icon?: React.ReactNode;
  animation?: 'bounce' | 'pulse' | 'shake' | 'none';
}

interface OnboardingTourProps {
  isActive: boolean;
  tourType:
    | 'pet-adoption'
    | 'environment-selection'
    | 'mini-games'
    | 'store-usage'
    | 'complete-tour';
  onComplete: () => void;
  onSkip: () => void;
  className?: string;
}

const TOUR_STEPS: Record<string, TourStep[]> = {
  'pet-adoption': [
    {
      id: 'welcome-pet',
      title: 'Welcome to Pet Adoption! 🐾',
      content:
        "Let's adopt your first virtual study companion! Your pet will grow and evolve based on your study habits.",
      target: '.pet-adoption-area',
      position: 'center',
      icon: <HeartIcon className="w-6 h-6" />,
      animation: 'bounce',
    },
    {
      id: 'choose-species',
      title: 'Choose Your Pet Species',
      content:
        'Select from different pet species. Each has unique characteristics and evolution paths!',
      target: '.pet-species-selector',
      position: 'bottom',
      action: 'click',
      icon: <SparklesIcon className="w-6 h-6" />,
    },
    {
      id: 'name-pet',
      title: 'Name Your Pet',
      content:
        'Give your pet a special name. This will be your study buddy throughout your learning journey!',
      target: '.pet-name-input',
      position: 'top',
      action: 'click',
    },
    {
      id: 'pet-care-basics',
      title: 'Pet Care Basics',
      content:
        'Your pet needs regular care! Feed, play, and study with your pet to keep it happy and healthy.',
      target: '.pet-care-buttons',
      position: 'left',
      icon: <GiftIcon className="w-6 h-6" />,
      animation: 'pulse',
    },
    {
      id: 'study-connection',
      title: 'Study Connection',
      content:
        'The more you study, the happier your pet becomes! Consistent study sessions help your pet evolve.',
      target: '.study-progress-area',
      position: 'right',
      animation: 'bounce',
    },
  ],
  'environment-selection': [
    {
      id: 'environment-intro',
      title: 'Focus Environments 🌟',
      content:
        'Create the perfect study atmosphere with immersive environments and ambient sounds.',
      target: '.environment-selector',
      position: 'center',
      icon: <SparklesIcon className="w-6 h-6" />,
    },
    {
      id: 'choose-environment',
      title: 'Choose Your Environment',
      content:
        'Select from various environments like forest, beach, cafe, or office. Each has unique visuals and sounds.',
      target: '.environment-options',
      position: 'bottom',
      action: 'click',
    },
    {
      id: 'ambient-sounds',
      title: 'Ambient Sounds',
      content:
        'Each environment comes with relaxing ambient sounds to help you focus better.',
      target: '.ambient-sound-controls',
      position: 'top',
      icon: <PlayIcon className="w-6 h-6" />,
    },
    {
      id: 'music-player',
      title: 'Study Music',
      content:
        'Add lo-fi study music to your environment for the perfect focus soundtrack.',
      target: '.music-player',
      position: 'left',
      action: 'hover',
    },
    {
      id: 'unlock-environments',
      title: 'Unlock New Environments',
      content: 'Study consistently to unlock premium environments and themes!',
      target: '.locked-environments',
      position: 'right',
      animation: 'shake',
    },
  ],
  'mini-games': [
    {
      id: 'mini-games-intro',
      title: 'Relaxation Mini-Games 🎮',
      content:
        'Take healthy study breaks with calming mini-games designed to refresh your mind.',
      target: '.mini-games-section',
      position: 'center',
      icon: <PlayIcon className="w-6 h-6" />,
    },
    {
      id: 'game-selection',
      title: 'Choose Your Game',
      content:
        'Select from breathing exercises, memory games, or simple puzzles to relax during breaks.',
      target: '.game-selection',
      position: 'bottom',
      action: 'click',
    },
    {
      id: 'earn-coins',
      title: 'Earn Coins',
      content:
        'Complete mini-games to earn coins that you can spend on pet food and accessories!',
      target: '.coin-reward-display',
      position: 'top',
      animation: 'bounce',
    },
    {
      id: 'break-timer',
      title: 'Break Timer',
      content:
        'Games are time-limited to ensure you return to studying refreshed, not distracted.',
      target: '.break-timer',
      position: 'left',
    },
  ],
  'store-usage': [
    {
      id: 'store-intro',
      title: 'Pet Store 🛍️',
      content:
        'Spend your earned coins on food, accessories, and themes for your pet and study environment.',
      target: '.store-interface',
      position: 'center',
      icon: <GiftIcon className="w-6 h-6" />,
    },
    {
      id: 'browse-items',
      title: 'Browse Items',
      content:
        'Explore different categories: pet food, accessories, themes, and environment unlocks.',
      target: '.store-categories',
      position: 'bottom',
      action: 'click',
    },
    {
      id: 'item-effects',
      title: 'Item Effects',
      content:
        "Each item shows its effects on your pet's health, happiness, and evolution progress.",
      target: '.item-effects-display',
      position: 'top',
    },
    {
      id: 'purchase-items',
      title: 'Make Purchases',
      content:
        'Click on items to purchase them with your earned coins. Your pet will love the treats!',
      target: '.purchase-button',
      position: 'right',
      action: 'click',
      animation: 'pulse',
    },
  ],
  'complete-tour': [
    {
      id: 'complete-intro',
      title: 'Complete Study Experience 🚀',
      content:
        "Let's take a full tour of all the features that make studying fun and engaging!",
      target: '.main-dashboard',
      position: 'center',
      icon: <SparklesIcon className="w-6 h-6" />,
    },
    {
      id: 'pet-overview',
      title: 'Your Study Companion',
      content:
        'Your virtual pet grows with your study progress. Keep it happy and watch it evolve!',
      target: '.pet-display',
      position: 'bottom',
      animation: 'bounce',
    },
    {
      id: 'environment-overview',
      title: 'Focus Environments',
      content:
        'Choose from beautiful environments with ambient sounds to create your perfect study space.',
      target: '.environment-selector',
      position: 'top',
    },
    {
      id: 'progress-tracking',
      title: 'Progress Tracking',
      content:
        'Monitor your study streaks, completed sessions, and earned achievements.',
      target: '.progress-dashboard',
      position: 'left',
    },
    {
      id: 'rewards-system',
      title: 'Rewards & Achievements',
      content:
        'Earn coins, unlock new content, and celebrate your study milestones!',
      target: '.rewards-section',
      position: 'right',
      animation: 'pulse',
    },
  ],
};

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isActive,
  tourType,
  onComplete,
  onSkip,
  className = '',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps = TOUR_STEPS[tourType] || [];
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Show/hide tour
  useEffect(() => {
    setIsVisible(isActive);
    if (isActive) {
      setCurrentStepIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setHighlightedElement(null);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  // Highlight target element
  useEffect(() => {
    if (!isVisible || !currentStep) return;

    const targetElement = document.querySelector(
      currentStep.target
    ) as HTMLElement;
    if (targetElement) {
      setHighlightedElement(targetElement);

      // Add highlight animation class
      if (currentStep.animation && currentStep.animation !== 'none') {
        targetElement.classList.add(`attention-${currentStep.animation}`);
      }

      // Scroll element into view
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });

      return () => {
        if (currentStep.animation && currentStep.animation !== 'none') {
          targetElement.classList.remove(`attention-${currentStep.animation}`);
        }
      };
    }
  }, [currentStep, isVisible]);

  // Position tooltip
  useEffect(() => {
    if (!highlightedElement || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const targetRect = highlightedElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 20;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + 20;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 20;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 20;
        break;
      case 'center':
        top = (window.innerHeight - tooltipRect.height) / 2;
        left = (window.innerWidth - tooltipRect.width) / 2;
        break;
    }

    // Ensure tooltip stays within viewport
    top = Math.max(
      20,
      Math.min(top, window.innerHeight - tooltipRect.height - 20)
    );
    left = Math.max(
      20,
      Math.min(left, window.innerWidth - tooltipRect.width - 20)
    );

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }, [highlightedElement, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Don't close on overlay click to prevent accidental dismissal
    e.stopPropagation();
  };

  if (!isVisible || !currentStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 ${className}`}
        onClick={handleOverlayClick}
      >
        {/* Dark overlay with spotlight effect */}
        <div className="absolute inset-0 bg-black bg-opacity-60">
          {highlightedElement && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute border-4 border-blue-400 rounded-lg shadow-lg"
              style={{
                top: highlightedElement.getBoundingClientRect().top - 8,
                left: highlightedElement.getBoundingClientRect().left - 8,
                width: highlightedElement.getBoundingClientRect().width + 16,
                height: highlightedElement.getBoundingClientRect().height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              }}
            />
          )}
        </div>

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="absolute bg-white rounded-lg shadow-xl p-6 max-w-sm"
          style={{ zIndex: 51 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {currentStep.icon && (
                <div className="text-blue-500">{currentStep.icon}</div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                <TypewriterAnimation text={currentStep.title} speed={30} />
              </h3>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">
              {currentStep.content}
            </p>

            {currentStep.action && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 Try to {currentStep.action} on the highlighted element!
                </p>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span>
                {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>{isLastStep ? 'Complete' : 'Next'}</span>
                {!isLastStep && <ChevronRightIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Floating help text */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600"
        >
          Press ESC to skip tour • Click highlighted areas to interact
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for managing onboarding state
export const useOnboarding = () => {
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
    const saved = localStorage.getItem('completed-tours');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTour, setActiveTour] = useState<string | null>(null);

  const startTour = (tourType: string) => {
    setActiveTour(tourType);
  };

  const completeTour = (tourType: string) => {
    const updated = [...completedTours, tourType];
    setCompletedTours(updated);
    localStorage.setItem('completed-tours', JSON.stringify(updated));
    setActiveTour(null);
  };

  const skipTour = () => {
    setActiveTour(null);
  };

  const resetOnboarding = () => {
    setCompletedTours([]);
    localStorage.removeItem('completed-tours');
  };

  const isTourCompleted = (tourType: string) => {
    return completedTours.includes(tourType);
  };

  const shouldShowTour = (tourType: string) => {
    return !isTourCompleted(tourType);
  };

  return {
    activeTour,
    completedTours,
    startTour,
    completeTour,
    skipTour,
    resetOnboarding,
    isTourCompleted,
    shouldShowTour,
  };
};
