import { useCallback, useEffect } from 'react';
import { useAIStore } from '../store/aiStore';
import {
  AIPersonality,
  AIPreferences,
  StudentLearningProfile,
  ConversationContext,
  QuestionContext,
  MotivationContext,
} from '../types';

export const useAI = () => {
  const {
    assistant,
    currentConversation,
    conversations,
    insights,
    studyPlans,
    isLoading,
    error,
    config,
    createAssistant,
    startConversation,
    sendMessage,
    askQuestion,
    generateStudyPlan,
    generateInsights,
    generateMotivationalMessage,
    updateConfig,
    setCurrentConversation,
    addMessageToConversation,
    markInsightAsAcknowledged,
    markInsightAsApplied,
    setError,
    clearError,
    reset,
  } = useAIStore();

  // Helper function to create a new assistant
  const setupAssistant = useCallback(
    async (
      userId: string,
      name: string,
      personalityType: AIPersonality['type'],
      communicationStyle: AIPersonality['communicationStyle'],
      preferences: Partial<AIPreferences>,
      learningStyle: StudentLearningProfile['learningStyle']
    ) => {
      const personality: AIPersonality = {
        type: personalityType,
        traits: getPersonalityTraits(personalityType),
        communicationStyle,
        responseLength: 'adaptive',
      };

      const fullPreferences: AIPreferences = {
        studyMethodSuggestions: true,
        motivationalMessages: true,
        progressCelebrations: true,
        reminderStyle: 'gentle',
        explanationDepth: 'intermediate',
        contextAwareness: true,
        ...preferences,
      };

      const learningProfile: StudentLearningProfile = {
        learningStyle,
        preferredExplanationTypes: ['step_by_step', 'examples'],
        difficultyPreference: 'gradual',
        attentionSpan: 45,
        bestStudyTimes: ['09:00-11:00', '14:00-16:00'],
        motivationTriggers: [
          {
            type: 'progress_tracking',
            effectiveness: 8,
            description: 'Motivated by seeing progress',
          },
        ],
        knowledgeGaps: [],
        strengths: [],
        improvementAreas: [],
      };

      await createAssistant(userId, name, personality, fullPreferences, learningProfile);
    },
    [createAssistant]
  );

  // Helper function to start a chat session
  const startChat = useCallback(
    async (userId: string, context?: Partial<ConversationContext>) => {
      const fullContext: ConversationContext = {
        timeOfDay: getTimeOfDay(),
        ...context,
      };

      await startConversation(userId, fullContext);
    },
    [startConversation]
  );

  // Helper function to send a chat message
  const chat = useCallback(
    async (message: string, context?: Partial<ConversationContext>) => {
      if (!currentConversation) {
        throw new Error('No active conversation');
      }

      await sendMessage(currentConversation.id, message, context);
    },
    [currentConversation, sendMessage]
  );

  // Helper function to ask a study question
  const askStudyQuestion = useCallback(
    async (
      userId: string,
      question: string,
      courseId?: string,
      topic?: string,
      difficulty?: 'basic' | 'intermediate' | 'advanced'
    ) => {
      const context: QuestionContext = {
        courseId,
        topic,
        difficulty: difficulty || 'intermediate',
        questionType: 'concept',
        userLevel: 'intermediate',
      };

      await askQuestion(userId, question, context);
    },
    [askQuestion]
  );

  // Helper function to create a study plan
  const createStudyPlan = useCallback(
    async (
      userId: string,
      courseId: string,
      goals: string[],
      timeframeDays: number = 30
    ) => {
      if (!assistant?.learningProfile) {
        throw new Error('Assistant not set up');
      }

      await generateStudyPlan(
        userId,
        courseId,
        goals,
        timeframeDays,
        assistant.learningProfile
      );
    },
    [assistant, generateStudyPlan]
  );

  // Helper function to get motivational message
  const getMotivation = useCallback(
    async (
      userId: string,
      recentPerformance: 'improving' | 'stable' | 'declining',
      streakStatus: 'active' | 'broken' | 'new',
      goalProgress: number
    ) => {
      const context: MotivationContext = {
        recentPerformance,
        streakStatus,
        goalProgress,
        timeOfDay: getTimeOfDay(),
        studySession: false,
      };

      await generateMotivationalMessage(userId, context);
    },
    [generateMotivationalMessage]
  );

  // Helper function to get study insights
  const getInsights = useCallback(
    async (userId: string, studyData: any) => {
      await generateInsights(userId, studyData);
    },
    [generateInsights]
  );

  // Helper function to acknowledge an insight
  const acknowledgeInsight = useCallback(
    (insightId: string) => {
      markInsightAsAcknowledged(insightId);
    },
    [markInsightAsAcknowledged]
  );

  // Helper function to mark insight as applied
  const applyInsight = useCallback(
    (insightId: string) => {
      markInsightAsApplied(insightId);
    },
    [markInsightAsApplied]
  );

  // Helper function to switch conversations
  const switchConversation = useCallback(
    (conversationId: string | null) => {
      const conversation = conversationId
        ? conversations.find(c => c.id === conversationId) || null
        : null;
      setCurrentConversation(conversation);
    },
    [conversations, setCurrentConversation]
  );

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return {
    // State
    assistant,
    currentConversation,
    conversations,
    insights,
    studyPlans,
    isLoading,
    error,
    config,
    
    // Actions
    setupAssistant,
    startChat,
    chat,
    askStudyQuestion,
    createStudyPlan,
    getMotivation,
    getInsights,
    acknowledgeInsight,
    applyInsight,
    switchConversation,
    updateConfig,
    setError,
    clearError,
    reset,
    
    // Computed values
    hasAssistant: !!assistant,
    hasActiveConversation: !!currentConversation,
    unacknowledgedInsights: insights.filter(i => !i.acknowledgedAt),
    activeStudyPlans: studyPlans.filter(p => p.isActive),
  };
};

// Helper functions
function getPersonalityTraits(type: AIPersonality['type']): string[] {
  const traitMap = {
    encouraging: ['supportive', 'positive', 'motivating', 'patient'],
    analytical: ['logical', 'detailed', 'systematic', 'thorough'],
    casual: ['friendly', 'relaxed', 'approachable', 'conversational'],
    professional: ['formal', 'structured', 'efficient', 'focused'],
  };
  
  return traitMap[type];
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export default useAI;