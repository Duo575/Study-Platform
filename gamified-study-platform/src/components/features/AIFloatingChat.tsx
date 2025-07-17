import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIContext } from '../../contexts/AIContext';
import AIChat from './AIChat';

interface AIFloatingChatProps {
  className?: string;
}

export const AIFloatingChat: React.FC<AIFloatingChatProps> = ({ className = '' }) => {
  const { hasAssistant, unacknowledgedInsights } = useAIContext();
  const [isVisible, setIsVisible] = useState(true);
  const [hasNewInsights, setHasNewInsights] = useState(false);

  // Show notification when new insights arrive
  useEffect(() => {
    if (unacknowledgedInsights.length > 0) {
      setHasNewInsights(true);
      // Auto-hide the notification after 5 seconds
      const timer = setTimeout(() => {
        setHasNewInsights(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [unacknowledgedInsights.length]);

  // Don't show if assistant is not set up
  if (!hasAssistant) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <AIChat
              userId="current-user" // This would come from auth context in real app
              context={{
                timeOfDay: getTimeOfDay(),
                userMood: 'neutral',
              }}
            />
            
            {/* New insights notification */}
            {hasNewInsights && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {unacknowledgedInsights.length}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle visibility button */}
      {!isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.9L3 21l1.9-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
          </svg>
          {unacknowledgedInsights.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unacknowledgedInsights.length}
            </div>
          )}
        </motion.button>
      )}
    </div>
  );
};

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export default AIFloatingChat;