import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAI } from '../hooks/useAI';
import { useAuthContext } from './AuthContext';
import type {
  AIStudyAssistant,
  AIConversation,
  AIInsight,
  AIStudyPlan,
  LearningStyle,
} from '../types';

interface AIContextType {
  // State
  assistant: AIStudyAssistant | null;
  currentConversation: AIConversation | null;
  conversations: AIConversation[];
  insights: AIInsight[];
  studyPlans: AIStudyPlan[];
  isLoading: boolean;
  error: string | null;

  // Computed values
  hasAssistant: boolean;
  hasActiveConversation: boolean;
  unacknowledgedInsights: AIInsight[];
  activeStudyPlans: AIStudyPlan[];

  // Actions
  setupAssistant: (
    name: string,
    personalityType: 'encouraging' | 'analytical' | 'casual' | 'professional',
    communicationStyle: 'formal' | 'friendly' | 'motivational' | 'direct',
    preferences?: any,
    learningStyle?: LearningStyle[]
  ) => Promise<void>;
  startChat: (context?: any) => Promise<void>;
  chat: (message: string, context?: any) => Promise<void>;
  askStudyQuestion: (
    question: string,
    courseId?: string,
    topic?: string,
    difficulty?: 'basic' | 'intermediate' | 'advanced'
  ) => Promise<void>;
  createStudyPlan: (
    courseId: string,
    goals: string[],
    timeframeDays?: number
  ) => Promise<void>;
  getMotivation: (
    recentPerformance: 'improving' | 'stable' | 'declining',
    streakStatus: 'active' | 'broken' | 'new',
    goalProgress: number
  ) => Promise<void>;
  getInsights: (studyData: any) => Promise<void>;
  acknowledgeInsight: (insightId: string) => void;
  applyInsight: (insightId: string) => void;
  clearError: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
  const aiHook = useAI();

  // Auto-generate insights when user data changes
  useEffect(() => {
    if (user && aiHook.hasAssistant) {
      // Mock study data for demonstration
      const mockStudyData = {
        totalStudyTime: 120,
        sessionsCompleted: 8,
        averageSessionLength: 45,
        streakDays: 5,
        recentPerformance: 'improving' as const,
        subjectBreakdown: [
          {
            courseId: '1',
            courseName: 'Mathematics',
            timeSpent: 60,
            percentage: 50,
          },
          {
            courseId: '2',
            courseName: 'Physics',
            timeSpent: 40,
            percentage: 33,
          },
          {
            courseId: '3',
            courseName: 'Chemistry',
            timeSpent: 20,
            percentage: 17,
          },
        ],
      };

      // Generate insights periodically (in a real app, this would be triggered by actual study data changes)
      const timer = setTimeout(() => {
        if (aiHook.insights.length === 0) {
          aiHook.getInsights(user.id, mockStudyData);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, aiHook.hasAssistant]);

  const contextValue: AIContextType = {
    // State from hook
    assistant: aiHook.assistant,
    currentConversation: aiHook.currentConversation,
    conversations: aiHook.conversations,
    insights: aiHook.insights,
    studyPlans: aiHook.studyPlans,
    isLoading: aiHook.isLoading,
    error: aiHook.error,

    // Computed values
    hasAssistant: aiHook.hasAssistant,
    hasActiveConversation: aiHook.hasActiveConversation,
    unacknowledgedInsights: aiHook.unacknowledgedInsights,
    activeStudyPlans: aiHook.activeStudyPlans,

    // Wrapped actions with user context
    setupAssistant: async (
      name,
      personalityType,
      communicationStyle,
      preferences,
      learningStyle
    ) => {
      if (!user) throw new Error('User not authenticated');
      return aiHook.setupAssistant(
        user.id,
        name,
        personalityType,
        communicationStyle,
        preferences,
        learningStyle || ['visual']
      );
    },

    startChat: async context => {
      if (!user) throw new Error('User not authenticated');
      return aiHook.startChat(user.id, context);
    },

    chat: aiHook.chat,

    askStudyQuestion: async (question, courseId, topic, difficulty) => {
      if (!user) throw new Error('User not authenticated');
      return aiHook.askStudyQuestion(
        user.id,
        question,
        courseId,
        topic,
        difficulty
      );
    },

    createStudyPlan: async (courseId, goals, timeframeDays) => {
      if (!user) throw new Error('User not authenticated');
      return aiHook.createStudyPlan(user.id, courseId, goals, timeframeDays);
    },

    getMotivation: async (recentPerformance, streakStatus, goalProgress) => {
      if (!user) throw new Error('User not authenticated');
      return aiHook.getMotivation(
        user.id,
        recentPerformance,
        streakStatus,
        goalProgress
      );
    },

    getInsights: async studyData => {
      if (!user) throw new Error('User not authenticated');
      return aiHook.getInsights(user.id, studyData);
    },

    acknowledgeInsight: aiHook.acknowledgeInsight,
    applyInsight: aiHook.applyInsight,
    clearError: aiHook.clearError,
  };

  return (
    <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>
  );
};

export const useAIContext = (): AIContextType => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
};

export default AIContext;
