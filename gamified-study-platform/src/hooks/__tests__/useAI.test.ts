import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAI } from '../useAI';
import { useAIStore } from '../../store/aiStore';

// Mock the AI store
vi.mock('../../store/aiStore', () => ({
  useAIStore: vi.fn(() => ({
    assistant: null,
    currentConversation: null,
    conversations: [],
    insights: [],
    studyPlans: [],
    isLoading: false,
    error: null,
    config: {
      model: 'gemini-pro',
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
    createAssistant: vi.fn(),
    startConversation: vi.fn(),
    sendMessage: vi.fn(),
    askQuestion: vi.fn(),
    generateStudyPlan: vi.fn(),
    generateInsights: vi.fn(),
    generateMotivationalMessage: vi.fn(),
    updateConfig: vi.fn(),
    setCurrentConversation: vi.fn(),
    addMessageToConversation: vi.fn(),
    markInsightAsAcknowledged: vi.fn(),
    markInsightAsApplied: vi.fn(),
    setError: vi.fn(),
    clearError: vi.fn(),
    reset: vi.fn(),
  })),
}));

describe('useAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide AI functionality and state', () => {
    const { result } = renderHook(() => useAI());

    expect(result.current).toHaveProperty('assistant');
    expect(result.current).toHaveProperty('currentConversation');
    expect(result.current).toHaveProperty('conversations');
    expect(result.current).toHaveProperty('insights');
    expect(result.current).toHaveProperty('studyPlans');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('config');
  });

  it('should provide action methods', () => {
    const { result } = renderHook(() => useAI());

    expect(result.current).toHaveProperty('setupAssistant');
    expect(result.current).toHaveProperty('startChat');
    expect(result.current).toHaveProperty('chat');
    expect(result.current).toHaveProperty('askStudyQuestion');
    expect(result.current).toHaveProperty('createStudyPlan');
    expect(result.current).toHaveProperty('getMotivation');
    expect(result.current).toHaveProperty('getInsights');
    expect(result.current).toHaveProperty('acknowledgeInsight');
    expect(result.current).toHaveProperty('applyInsight');
    expect(result.current).toHaveProperty('switchConversation');
  });

  it('should provide computed values', () => {
    const { result } = renderHook(() => useAI());

    expect(result.current).toHaveProperty('hasAssistant');
    expect(result.current).toHaveProperty('hasActiveConversation');
    expect(result.current).toHaveProperty('unacknowledgedInsights');
    expect(result.current).toHaveProperty('activeStudyPlans');

    expect(result.current.hasAssistant).toBe(false);
    expect(result.current.hasActiveConversation).toBe(false);
    expect(result.current.unacknowledgedInsights).toEqual([]);
    expect(result.current.activeStudyPlans).toEqual([]);
  });

  it('should setup assistant with correct parameters', async () => {
    const mockCreateAssistant = vi.fn();
    vi.mocked(useAIStore).mockReturnValue({
      assistant: null,
      currentConversation: null,
      conversations: [],
      insights: [],
      studyPlans: [],
      isLoading: false,
      error: null,
      config: {
        model: 'gemini-pro',
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
      createAssistant: mockCreateAssistant,
      startConversation: vi.fn(),
      sendMessage: vi.fn(),
      askQuestion: vi.fn(),
      generateStudyPlan: vi.fn(),
      generateInsights: vi.fn(),
      generateMotivationalMessage: vi.fn(),
      updateConfig: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.setupAssistant(
        'user-123',
        'Study Buddy',
        'encouraging',
        'friendly',
        { studyMethodSuggestions: true },
        ['visual', 'auditory']
      );
    });

    expect(mockCreateAssistant).toHaveBeenCalledWith(
      'user-123',
      'Study Buddy',
      expect.objectContaining({
        type: 'encouraging',
        communicationStyle: 'friendly',
      }),
      expect.objectContaining({
        studyMethodSuggestions: true,
      }),
      expect.objectContaining({
        learningStyle: ['visual', 'auditory'],
      })
    );
  });

  it('should start chat with context', async () => {
    const mockStartConversation = vi.fn();
    vi.mocked(useAIStore).mockReturnValue({
      assistant: null,
      currentConversation: null,
      conversations: [],
      insights: [],
      studyPlans: [],
      isLoading: false,
      error: null,
      config: {
        model: 'gemini-pro',
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
      createAssistant: vi.fn(),
      startConversation: mockStartConversation,
      sendMessage: vi.fn(),
      askQuestion: vi.fn(),
      generateStudyPlan: vi.fn(),
      generateInsights: vi.fn(),
      generateMotivationalMessage: vi.fn(),
      updateConfig: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.startChat('user-123', { currentCourse: 'Math 101' });
    });

    expect(mockStartConversation).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        currentCourse: 'Math 101',
        timeOfDay: expect.any(String),
      })
    );
  });

  it('should ask study question with proper context', async () => {
    const mockAskQuestion = vi.fn();
    vi.mocked(useAIStore).mockReturnValue({
      assistant: null,
      currentConversation: null,
      conversations: [],
      insights: [],
      studyPlans: [],
      isLoading: false,
      error: null,
      config: {
        model: 'gemini-pro',
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
      createAssistant: vi.fn(),
      startConversation: vi.fn(),
      sendMessage: vi.fn(),
      askQuestion: mockAskQuestion,
      generateStudyPlan: vi.fn(),
      generateInsights: vi.fn(),
      generateMotivationalMessage: vi.fn(),
      updateConfig: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.askStudyQuestion(
        'user-123',
        'What is calculus?',
        'math-101',
        'calculus',
        'intermediate'
      );
    });

    expect(mockAskQuestion).toHaveBeenCalledWith(
      'user-123',
      'What is calculus?',
      expect.objectContaining({
        courseId: 'math-101',
        topic: 'calculus',
        difficulty: 'intermediate',
        questionType: 'concept',
      })
    );
  });

  it('should handle errors gracefully', () => {
    let mockError: string | null = null;
    const mockSetError = vi.fn((error: string) => {
      mockError = error;
    });
    const mockClearError = vi.fn(() => {
      mockError = null;
    });

    vi.mocked(useAIStore).mockReturnValue({
      assistant: null,
      currentConversation: null,
      conversations: [],
      insights: [],
      studyPlans: [],
      isLoading: false,
      error: mockError,
      config: {
        model: 'gemini-pro',
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
      createAssistant: vi.fn(),
      startConversation: vi.fn(),
      sendMessage: vi.fn(),
      askQuestion: vi.fn(),
      generateStudyPlan: vi.fn(),
      generateInsights: vi.fn(),
      generateMotivationalMessage: vi.fn(),
      updateConfig: vi.fn(),
      setCurrentConversation: vi.fn(),
      addMessageToConversation: vi.fn(),
      markInsightAsAcknowledged: vi.fn(),
      markInsightAsApplied: vi.fn(),
      setError: mockSetError,
      clearError: mockClearError,
      reset: vi.fn(),
    });

    const { result } = renderHook(() => useAI());

    act(() => {
      result.current.setError('Test error');
    });

    expect(mockSetError).toHaveBeenCalledWith('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(mockClearError).toHaveBeenCalled();
  });
});
