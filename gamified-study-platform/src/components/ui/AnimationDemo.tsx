import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  HeartIcon,
  SparklesIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import {
  LoadingAnimation,
  HoverScale,
  VisualFeedback,
  StaggerAnimation,
} from './AnimationComponents';

interface AnimationDemoProps {
  className?: string;
}

export const AnimationDemo: React.FC<AnimationDemoProps> = ({
  className = '',
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('success');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<
    'spinner' | 'progress' | 'pulse' | 'dots' | 'wave'
  >('wave');

  const handleShowFeedback = (
    type: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setFeedbackType(type);
    setShowFeedback(true);
  };

  const handleLoadingDemo = (
    type: 'spinner' | 'progress' | 'pulse' | 'dots' | 'wave'
  ) => {
    setLoadingType(type);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const demoButtons = [
    {
      icon: <PlayIcon className="w-5 h-5" />,
      label: 'Play Animation',
      color: 'bg-blue-500',
    },
    {
      icon: <HeartIcon className="w-5 h-5" />,
      label: 'Care Animation',
      color: 'bg-purple-500',
    },
    {
      icon: <SparklesIcon className="w-5 h-5" />,
      label: 'Evolution',
      color: 'bg-yellow-500',
    },
    {
      icon: <GiftIcon className="w-5 h-5" />,
      label: 'Feed Pet',
      color: 'bg-green-500',
    },
  ];

  return (
    <div
      className={`animation-demo p-6 bg-white rounded-lg shadow-lg ${className}`}
    >
      <h3 className="text-xl font-bold mb-6 text-center">
        Enhanced Animations Demo
      </h3>

      {/* Pet Animation Demo */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">Pet Interactions</h4>
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center pet-caring-enhanced">
            <span className="text-2xl">🐱</span>
          </div>
        </div>
        <StaggerAnimation staggerDelay={0.1}>
          {demoButtons.map((button, index) => (
            <HoverScale key={index} scale={1.05}>
              <motion.button
                className={`w-full mb-2 px-4 py-2 ${button.color} text-white rounded-lg hover:opacity-90 transition-all bounce-hover`}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  {button.icon}
                  <span>{button.label}</span>
                </div>
              </motion.button>
            </HoverScale>
          ))}
        </StaggerAnimation>
      </div>

      {/* Loading Animations Demo */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">Loading Animations</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {['spinner', 'wave', 'pulse', 'dots'].map(type => (
            <button
              key={type}
              onClick={() => handleLoadingDemo(type as any)}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors capitalize smooth-hover"
            >
              {type}
            </button>
          ))}
        </div>
        <div className="h-20 flex items-center justify-center">
          <LoadingAnimation
            isLoading={isLoading}
            type={loadingType}
            message={`Loading with ${loadingType}...`}
          />
        </div>
      </div>

      {/* Status Bars Demo */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">Enhanced Status Bars</h4>
        <div className="space-y-3">
          {[
            { label: 'Health', value: 85, color: 'bg-red-500' },
            { label: 'Happiness', value: 70, color: 'bg-blue-500' },
            { label: 'Energy', value: 60, color: 'bg-green-500' },
            { label: 'Hunger', value: 40, color: 'bg-yellow-500' },
          ].map((stat, index) => (
            <div key={stat.label} className="flex items-center space-x-3">
              <span className="w-20 text-sm font-medium">{stat.label}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-3 rounded-full progress-shimmer ${stat.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{
                    duration: 1,
                    ease: 'easeOut',
                    delay: index * 0.2,
                  }}
                />
              </div>
              <span className="text-sm font-medium">{stat.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Demo */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">Visual Feedback</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              type: 'success' as const,
              label: 'Success',
              color: 'bg-green-500',
            },
            { type: 'error' as const, label: 'Error', color: 'bg-red-500' },
            {
              type: 'warning' as const,
              label: 'Warning',
              color: 'bg-yellow-500',
            },
            { type: 'info' as const, label: 'Info', color: 'bg-blue-500' },
          ].map(feedback => (
            <button
              key={feedback.type}
              onClick={() => handleShowFeedback(feedback.type)}
              className={`px-3 py-2 ${feedback.color} text-white rounded-lg hover:opacity-90 transition-all elastic-hover`}
            >
              {feedback.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attention Animations Demo */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">Attention Animations</h4>
        <div className="flex justify-center space-x-4">
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center attention-pulse">
            <span className="text-white font-bold">Pulse</span>
          </div>
          <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center attention-bounce">
            <span className="text-white font-bold">Bounce</span>
          </div>
          <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center attention-shake">
            <span className="text-white font-bold">Shake</span>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Status Indicators</h4>
        <div className="flex justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full status-online"></div>
            <span className="text-sm">Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full status-warning"></div>
            <span className="text-sm">Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full status-error"></div>
            <span className="text-sm">Error</span>
          </div>
        </div>
      </div>

      {/* Visual Feedback Component */}
      <VisualFeedback
        type={feedbackType}
        message={`This is a ${feedbackType} message!`}
        isVisible={showFeedback}
        onClose={() => setShowFeedback(false)}
        duration={3000}
      />
    </div>
  );
};
