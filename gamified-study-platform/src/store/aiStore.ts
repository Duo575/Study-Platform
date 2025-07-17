import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  AIState,
  AIStudyAssistant,
  AIConversation,
  AIMessage,
  AIInsight,
  AIStudyPlan,
  AIConfig,
  ConversationContext,
  StudentLearningProfile,
  AIPersonality,
  AIPreferences,
} from '../types';
import { aiService } from '../services/aiService';

interface AIStore extends AIState {
  // Actions
  createAssistant: (
    userId: string,
    name: string,
    personality: AIPersonality,
    preferences: AIPreferences,
    learningProfile: StudentLearningProfile
  ) => Promise<void>;
  
  startConversation: (userId: string, context: ConversationContext) => Promise<void>;
  
  sendMessage: (
    conversationId: string,
    content: string,
    context?: Partial<ConversationContext>
  ) => Promise<void>;
  
  askQuestion: (
    userId: string,
    question: string,
    context: any
  ) => Promise<void>;
  
  generateStudyPlan: (
    userId: string,
    courseId: string,
    goals: string[],
    timeframe: number,
    learningProfile: StudentLearningProfile
  ) => Promise<void>;
  
  generateInsights: (userId: string, studyData: any) => Promise<void>;
  
  generateMotivationalMessage: (userId: string, context: any) => Promise<void>;
  
  updateConfig: (config: Partial<AIConfig>) => Promise<void>;
  
  setCurrentConversation: (conversation: AIConversation | null) => void;
  
  addMessageToConversation: (conversationId: string, message: AIMessage) => void;
  
  markInsightAsAcknowledged: (insightId: string) => void;
  
  markInsightAsApplied: (insightId: string) => void;
  
  setError: (error: string | null) => void;
  
  clearError: () => void;
  
  reset: () => void;
}

const initialState: AIState = {
  assistant: null,
  currentConversation: null,
  conversations: [],
  insights: [],
  studyPlans: [],
  isLoading: false,
  error: null,
  config: {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompts: {},
    features: {
      questionAnswering: true,
      studyPlanning: true,
      motivationalMessages: true,
      performanceAnalysis: true,
      resourceRecommendation: true,
      conversationalChat: true,
    },
    rateLimits: {
      questionsPerHour: 50,
      messagesPerDay: 200,
      planGenerationsPerWeek: 5,
    },
  },
};

export const useAIStore = create<AIStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      createAssistant: async (userId, name, personality, preferences, learningProfile) => {
        set({ isLoading: true, error: null });
        try {
          const assistant = await aiService.createAssistant(
            userId,
            name,
            personality,
            preferences,
            learningProfile
          );
          set({ assistant, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create assistant',
            isLoading: false 
          });
        }
      },

      startConversation: async (userId, context) => {
        set({ isLoading: true, error: null });
        try {
          const conversation = await aiService.startConversation(userId, context);
          set(state => ({
            currentConversation: conversation,
            conversations: [...state.conversations, conversation],
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start conversation',
            isLoading: false 
          });
        }
      },

      sendMessage: async (conversationId, content, context) => {
        set({ isLoading: true, error: null });
        try {
          const message = await aiService.sendMessage(conversationId, content, context);
          
          set(state => {
            const updatedConversations = state.conversations.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  messages: [...conv.messages, message],
                  lastMessageAt: new Date(),
                };
              }
              return conv;
            });

            const updatedCurrentConversation = state.currentConversation?.id === conversationId
              ? {
                  ...state.currentConversation,
                  messages: [...state.currentConversation.messages, message],
                  lastMessageAt: new Date(),
                }
              : state.currentConversation;

            return {
              conversations: updatedConversations,
              currentConversation: updatedCurrentConversation,
              isLoading: false,
            };
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send message',
            isLoading: false 
          });
        }
      },

      askQuestion: async (userId, question, context) => {
        set({ isLoading: true, error: null });
        try {
          const answer = await aiService.askQuestion(userId, question, context);
          // In a real implementation, you might want to store Q&A history
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to get answer',
            isLoading: false 
          });
        }
      },

      generateStudyPlan: async (userId, courseId, goals, timeframe, learningProfile) => {
        set({ isLoading: true, error: null });
        try {
          const plan = await aiService.generateStudyPlan(
            userId,
            courseId,
            goals,
            timeframe,
            learningProfile
          );
          set(state => ({
            studyPlans: [...state.studyPlans, plan],
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to generate study plan',
            isLoading: false 
          });
        }
      },

      generateInsights: async (userId, studyData) => {
        set({ isLoading: true, error: null });
        try {
          const insights = await aiService.generateInsights(userId, studyData);
          set(state => ({
            insights: [...state.insights, ...insights],
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to generate insights',
            isLoading: false 
          });
        }
      },

      generateMotivationalMessage: async (userId, context) => {
        set({ isLoading: true, error: null });
        try {
          const motivation = await aiService.generateMotivationalMessage(userId, context);
          // In a real implementation, you might want to store motivational messages
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to generate motivation',
            isLoading: false 
          });
        }
      },

      updateConfig: async (newConfig) => {
        set({ isLoading: true, error: null });
        try {
          const config = await aiService.updateConfig(newConfig);
          set({ config, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update config',
            isLoading: false 
          });
        }
      },

      setCurrentConversation: (conversation) => {
        set({ currentConversation: conversation });
      },

      addMessageToConversation: (conversationId, message) => {
        set(state => {
          const updatedConversations = state.conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [...conv.messages, message],
                lastMessageAt: new Date(),
              };
            }
            return conv;
          });

          const updatedCurrentConversation = state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: [...state.currentConversation.messages, message],
                lastMessageAt: new Date(),
              }
            : state.currentConversation;

          return {
            conversations: updatedConversations,
            currentConversation: updatedCurrentConversation,
          };
        });
      },

      markInsightAsAcknowledged: (insightId) => {
        set(state => ({
          insights: state.insights.map(insight =>
            insight.id === insightId
              ? { ...insight, acknowledgedAt: new Date() }
              : insight
          ),
        }));
      },

      markInsightAsApplied: (insightId) => {
        set(state => ({
          insights: state.insights.map(insight =>
            insight.id === insightId
              ? { ...insight, appliedAt: new Date() }
              : insight
          ),
        }));
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'ai-store',
    }
  )
);

export default useAIStore;