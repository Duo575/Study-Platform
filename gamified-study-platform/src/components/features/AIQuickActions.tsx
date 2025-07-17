import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../../hooks/useAI';

interface AIQuickActionsProps {
  userId: string;
  context?: {
    courseId?: string;
    topic?: string;
    currentActivity?: string;
  };
  className?: string;
}

export const AIQuickActions: React.FC<AIQuickActionsProps> = ({
  userId,
  context,
  className = '',
}) => {
  const { 
    hasAssistant, 
    startChat, 
    askStudyQuestion, 
    getMotivation, 
    isLoading 
  } = useAI();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasAssistant) {
    return null;
  }

  const quickActions = [
    {
      id: 'ask-question',
      title: 'Ask Question',
      description: 'Get help with a specific topic',
      icon: '❓',
      action: () => handleAskQuestion(),
    },
    {
      id: 'get-motivation',
      title: 'Get Motivated',
      description: 'Receive encouraging words',
      icon: '💪',
      action: () => handleGetMotivation(),
    },
    {
      id: 'start-chat',
      title: 'Start Chat',
      description: 'Have a conversation with AI',
      icon: '💬',
      action: () => handleStartChat(),
    },
    {
      id: 'study-tips',
      title: 'Study Tips',
      description: 'Get personalized study advice',
      icon: '💡',
      action: () => handleGetStudyTips(),
    },
  ];

  const handleAskQuestion = async () => {
    const question = prompt('What would you like to ask about?');
    if (question) {
      try {
        await askStudyQuestion(
          userId,
          question,
          context?.courseId,
          context?.topic,
          'intermediate'
        );
        alert('Question answered! Check your AI assistant for the response.');
      } catch (error) {
        console.error('Failed to ask question:', error);
      }
    }
  };

  const handleGetMotivation = async () => {
    try {
      await getMotivation(userId, 'stable', 'active', 75);
      alert('Motivational message sent! Check your notifications.');
    } catch (error) {
      console.error('Failed to get motivation:', error);
    }
  };

  const handleStartChat = async () => {
    try {
      await startChat(userId, {
        currentCourse: context?.courseId,
        currentTopic: context?.topic,
        timeOfDay: getTimeOfDay(),
      });
      alert('Chat started! Look for the chat window.');
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleGetStudyTips = async () => {
    try {
      await askStudyQuestion(
        userId,
        `Give me some study tips for ${context?.topic || 'my current studies'}`,
        context?.courseId,
        context?.topic,
        'intermediate'
      );
      alert('Study tips generated! Check your AI assistant.');
    } catch (error) {
      console.error('Failed to get study tips:', error);
    }
  };

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
      >
        <span className="text-lg">🤖</span>
        <span className="font-medium">AI Assistant</span>
        <motion.svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Quick AI Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      setIsExpanded(false);
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {action.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {action.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default AIQuickActions;