import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  Loader2,
} from 'lucide-react';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface FeedbackContextType {
  messages: FeedbackMessage[];
  addMessage: (message: Omit<FeedbackMessage, 'id'>) => string;
  removeMessage: (id: string) => void;
  clearAll: () => void;
}

const FeedbackContext = React.createContext<FeedbackContextType | null>(null);

export const useFeedback = () => {
  const context = React.useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const addMessage = (message: Omit<FeedbackMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage: FeedbackMessage = {
      ...message,
      id,
      duration: message.duration ?? (message.type === 'error' ? 8000 : 5000),
    };

    setMessages(prev => [...prev, newMessage]);

    // Auto-remove message after duration (unless persistent)
    if (!newMessage.persistent && newMessage.duration > 0) {
      setTimeout(() => {
        removeMessage(id);
      }, newMessage.duration);
    }

    return id;
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearAll = () => {
    setMessages([]);
  };

  return (
    <FeedbackContext.Provider
      value={{ messages, addMessage, removeMessage, clearAll }}
    >
      {children}
      <FeedbackContainer />
    </FeedbackContext.Provider>
  );
};

const FeedbackContainer: React.FC = () => {
  const { messages, removeMessage } = useFeedback();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {messages.map(message => (
          <FeedbackItem
            key={message.id}
            message={message}
            onClose={() => removeMessage(message.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const FeedbackItem: React.FC<{
  message: FeedbackMessage;
  onClose: () => void;
}> = ({ message, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
      case 'loading':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        relative p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${getBackgroundColor()}
        ${isHovered ? 'shadow-xl' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {message.title}
          </h4>
          {message.message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {message.message}
            </p>
          )}
          {message.action && (
            <button
              onClick={message.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              {message.action.label}
            </button>
          )}
        </div>

        {!message.persistent && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar for timed messages */}
      {!message.persistent && message.duration && message.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: message.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

// Convenience hooks for different message types
export const useSuccessFeedback = () => {
  const { addMessage } = useFeedback();
  return (
    title: string,
    message?: string,
    options?: Partial<FeedbackMessage>
  ) => addMessage({ type: 'success', title, message, ...options });
};

export const useErrorFeedback = () => {
  const { addMessage } = useFeedback();
  return (
    title: string,
    message?: string,
    options?: Partial<FeedbackMessage>
  ) => addMessage({ type: 'error', title, message, ...options });
};

export const useWarningFeedback = () => {
  const { addMessage } = useFeedback();
  return (
    title: string,
    message?: string,
    options?: Partial<FeedbackMessage>
  ) => addMessage({ type: 'warning', title, message, ...options });
};

export const useInfoFeedback = () => {
  const { addMessage } = useFeedback();
  return (
    title: string,
    message?: string,
    options?: Partial<FeedbackMessage>
  ) => addMessage({ type: 'info', title, message, ...options });
};

export const useLoadingFeedback = () => {
  const { addMessage, removeMessage } = useFeedback();
  return {
    show: (title: string, message?: string) =>
      addMessage({ type: 'loading', title, message, persistent: true }),
    hide: (id: string) => removeMessage(id),
  };
};
