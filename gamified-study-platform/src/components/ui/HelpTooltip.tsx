import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface HelpTooltipProps {
  content: string;
  title?: string;
  type?: 'info' | 'tip' | 'warning' | 'help';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click' | 'focus';
  className?: string;
  children?: React.ReactNode;
  maxWidth?: number;
  delay?: number;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  type = 'info',
  position = 'auto',
  trigger = 'hover',
  className = '',
  children,
  maxWidth = 300,
  delay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <LightBulbIcon className="w-4 h-4" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'help':
        return <QuestionMarkCircleIcon className="w-4 h-4" />;
      default:
        return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'tip':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500',
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: 'text-orange-500',
        };
      case 'help':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-800',
          icon: 'text-purple-500',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500',
        };
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let bestPosition = position;

    if (position === 'auto') {
      // Calculate which position has the most space
      const spaces = {
        top: triggerRect.top,
        bottom: viewport.height - triggerRect.bottom,
        left: triggerRect.left,
        right: viewport.width - triggerRect.right,
      };

      bestPosition = Object.entries(spaces).reduce((a, b) =>
        spaces[a[0] as keyof typeof spaces] >
        spaces[b[0] as keyof typeof spaces]
          ? a
          : b
      )[0] as typeof position;
    }

    setActualPosition(bestPosition);
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const toggleTooltip = () => {
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const colors = getColors();

  const getTooltipPosition = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowPosition = () => {
    switch (actualPosition) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
        onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
        onClick={trigger === 'click' ? toggleTooltip : undefined}
        onFocus={trigger === 'focus' ? showTooltip : undefined}
        onBlur={trigger === 'focus' ? hideTooltip : undefined}
        className={trigger !== 'hover' ? 'cursor-pointer' : ''}
      >
        {children || (
          <div className={`${colors.icon} hover:opacity-80 transition-opacity`}>
            {getIcon()}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{
              opacity: 0,
              scale: 0.95,
              y: actualPosition === 'top' ? 10 : -10,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: actualPosition === 'top' ? 10 : -10,
            }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 ${getTooltipPosition()}`}
            style={{ maxWidth }}
          >
            <div
              className={`${colors.bg} ${colors.border} ${colors.text} border rounded-lg shadow-lg p-3 text-sm`}
            >
              {title && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className={colors.icon}>{getIcon()}</div>
                  <h4 className="font-medium">{title}</h4>
                </div>
              )}
              <p className="leading-relaxed">{content}</p>
            </div>

            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 ${getArrowPosition()}`}
              style={{
                borderTopColor:
                  actualPosition === 'bottom'
                    ? colors.border.replace('border-', '')
                    : 'transparent',
                borderBottomColor:
                  actualPosition === 'top'
                    ? colors.border.replace('border-', '')
                    : 'transparent',
                borderLeftColor:
                  actualPosition === 'right'
                    ? colors.border.replace('border-', '')
                    : 'transparent',
                borderRightColor:
                  actualPosition === 'left'
                    ? colors.border.replace('border-', '')
                    : 'transparent',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close for click trigger */}
      {isVisible && trigger === 'click' && (
        <div className="fixed inset-0 z-40" onClick={hideTooltip} />
      )}
    </div>
  );
};

// Interactive tutorial component
interface InteractiveTutorialProps {
  steps: Array<{
    target: string;
    content: string;
    title?: string;
    action?: string;
  }>;
  isActive: boolean;
  onComplete: () => void;
  className?: string;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  steps,
  isActive,
  onComplete,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedActions, setCompletedActions] = useState<boolean[]>(
    new Array(steps.length).fill(false)
  );

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setCompletedActions(new Array(steps.length).fill(false));
    }
  }, [isActive, steps.length]);

  const handleActionComplete = (stepIndex: number) => {
    const updated = [...completedActions];
    updated[stepIndex] = true;
    setCompletedActions(updated);

    if (stepIndex === currentStep && stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else if (stepIndex === steps.length - 1) {
      onComplete();
    }
  };

  if (!isActive) return null;

  return (
    <div className={`tutorial-overlay ${className}`}>
      {steps.map((step, index) => (
        <HelpTooltip
          key={index}
          content={step.content}
          title={step.title}
          type="help"
          trigger="hover"
          className={`tutorial-step ${index === currentStep ? 'active' : ''} ${
            completedActions[index] ? 'completed' : ''
          }`}
        >
          <div
            className={`tutorial-marker ${
              index === currentStep ? 'current' : ''
            } ${completedActions[index] ? 'completed' : ''}`}
            onClick={() => handleActionComplete(index)}
          >
            {index + 1}
          </div>
        </HelpTooltip>
      ))}
    </div>
  );
};

// Context-sensitive help component
interface ContextHelpProps {
  context: 'pet-care' | 'environment' | 'mini-games' | 'store' | 'general';
  className?: string;
}

export const ContextHelp: React.FC<ContextHelpProps> = ({
  context,
  className = '',
}) => {
  const getHelpContent = () => {
    switch (context) {
      case 'pet-care':
        return {
          title: 'Pet Care Tips',
          content:
            'Feed your pet regularly, play with it during breaks, and study consistently to keep it happy and help it evolve!',
          tips: [
            'Feed your pet when hunger is above 70%',
            'Play with your pet when happiness is below 50%',
            "Study sessions boost your pet's mood",
            'Consistent care leads to evolution',
          ],
        };
      case 'environment':
        return {
          title: 'Environment Guide',
          content:
            'Choose environments that match your study mood. Each environment has unique ambient sounds and visual themes.',
          tips: [
            'Forest: Great for deep focus with nature sounds',
            'Cafe: Energizing with gentle background chatter',
            'Beach: Relaxing with ocean waves',
            'Office: Professional atmosphere for productivity',
          ],
        };
      case 'mini-games':
        return {
          title: 'Mini-Games Help',
          content:
            'Take healthy breaks with relaxing mini-games. They help refresh your mind and earn coins for your pet!',
          tips: [
            'Games are time-limited to prevent distraction',
            'Complete games to earn coins',
            'Use games during study breaks only',
            'Different games offer different rewards',
          ],
        };
      case 'store':
        return {
          title: 'Store Guide',
          content:
            'Spend earned coins on pet food, accessories, and environment unlocks. Each item has different effects!',
          tips: [
            'Check item effects before purchasing',
            'Premium food gives better bonuses',
            'Accessories are cosmetic but fun',
            'Environment unlocks are permanent',
          ],
        };
      default:
        return {
          title: 'General Help',
          content:
            'Welcome to the gamified study platform! Study consistently, care for your pet, and unlock new content.',
          tips: [
            'Start with adopting your first pet',
            'Choose a comfortable study environment',
            'Take breaks with mini-games',
            'Spend coins in the store',
          ],
        };
    }
  };

  const helpData = getHelpContent();

  return (
    <HelpTooltip
      title={helpData.title}
      content={helpData.content}
      type="help"
      trigger="click"
      maxWidth={350}
      className={className}
    >
      <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
        <QuestionMarkCircleIcon className="w-5 h-5" />
      </button>
    </HelpTooltip>
  );
};

// Quick tips component
interface QuickTipsProps {
  tips: string[];
  title?: string;
  className?: string;
}

export const QuickTips: React.FC<QuickTipsProps> = ({
  tips,
  title = 'Quick Tips',
  className = '',
}) => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % tips.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [tips.length]);

  if (tips.length === 0) return null;

  return (
    <motion.div
      className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <LightBulbIcon className="w-5 h-5 text-yellow-500" />
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={currentTip}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-gray-700"
        >
          {tips[currentTip]}
        </motion.p>
      </AnimatePresence>

      {tips.length > 1 && (
        <div className="flex space-x-1 mt-3">
          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTip(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTip ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
