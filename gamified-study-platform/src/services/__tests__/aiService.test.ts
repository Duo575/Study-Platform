import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../aiService';
import { AIPersonality, AIPreferences, StudentLearningProfile, QuestionContext } from '../../types';

// Mock fetch globally
global.fetch = vi.fn();

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAssistant', () => {
    it('should create an AI assistant with provided configuration', async () => {
      const userId = 'test-user';
      const name = 'Test Assistant';
      const personality: AIPersonality = {
        type: 'encouraging',
        traits: ['supportive', 'positive'],
        communicationStyle: 'friendly',
        responseLength: 'adaptive',
      };
      const preferences: AIPreferences = {
        studyMethodSuggestions: true,
        motivationalMessages: true,
        progressCelebrations: true,
        reminderStyle: 'gentle',
        explanationDepth: 'intermediate',
        contextAwareness: true,
      };
      const learningProfile: StudentLearningProfile = {
        learningStyle: ['visual', 'auditory'],
        preferredExplanationTypes: ['step_by_step', 'examples'],
        difficultyPreference: 'gradual',
        attentionSpan: 45,
        bestStudyTimes: ['09:00-11:00'],
        motivationTriggers: [],
        knowledgeGaps: [],
        strengths: [],
        improvementAreas: [],
      };

      const assistant = await aiService.createAssistant(
        userId,
        name,
        personality,
        preferences,
        learningProfile
      );

      expect(assistant.userId).toBe(userId);
      expect(assistant.name).toBe(name);
      expect(assistant.personality).toEqual(personality);
      expect(assistant.preferences).toEqual(preferences);
      expect(assistant.learningProfile).toEqual(learningProfile);
      expect(assistant.isActive).toBe(true);
    });
  });

  describe('startConversation', () => {
    it('should create a new conversation with context', async () => {
      const userId = 'test-user';
      const context = {
        timeOfDay: 'morning' as const,
        userMood: 'motivated' as const,
      };

      const conversation = await aiService.startConversation(userId, context);

      expect(conversation.userId).toBe(userId);
      expect(conversation.context).toEqual(context);
      expect(conversation.isActive).toBe(true);
      expect(conversation.messages).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    it('should generate AI response for user message', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{ text: 'This is a test response from AI' }]
          }
        }]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const conversationId = 'test-conversation';
      const content = 'Hello, can you help me with math?';

      const message = await aiService.sendMessage(conversationId, content);

      expect(message.conversationId).toBe(conversationId);
      expect(message.role).toBe('assistant');
      expect(message.content).toBe('This is a test response from AI');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should fallback to mock response when API fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

      const conversationId = 'test-conversation';
      const content = 'Help me with motivation';

      const message = await aiService.sendMessage(conversationId, content);

      expect(message.conversationId).toBe(conversationId);
      expect(message.role).toBe('assistant');
      expect(message.content).toContain('here to help');
    });
  });

  describe('askQuestion', () => {
    it('should generate answer for study question', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{ text: 'Here is the answer to your question about calculus...' }]
          }
        }]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const userId = 'test-user';
      const question = 'What is the derivative of x^2?';
      const context: QuestionContext = {
        topic: 'calculus',
        difficulty: 'intermediate',
        questionType: 'concept',
        userLevel: 'intermediate',
      };

      const answer = await aiService.askQuestion(userId, question, context);

      expect(answer.userId).toBe(userId);
      expect(answer.question).toBe(question);
      expect(answer.context).toEqual(context);
      expect(answer.answer).toBe('Here is the answer to your question about calculus...');
      expect(answer.confidence).toBeGreaterThan(0);
    });
  });

  describe('generateStudyPlan', () => {
    it('should create a personalized study plan', async () => {
      const userId = 'test-user';
      const courseId = 'math-101';
      const goals = ['Learn calculus basics', 'Practice derivatives'];
      const timeframe = 30;
      const learningProfile: StudentLearningProfile = {
        learningStyle: ['visual'],
        preferredExplanationTypes: ['step_by_step'],
        difficultyPreference: 'gradual',
        attentionSpan: 45,
        bestStudyTimes: ['09:00-11:00'],
        motivationTriggers: [],
        knowledgeGaps: [],
        strengths: [],
        improvementAreas: [],
      };

      const plan = await aiService.generateStudyPlan(
        userId,
        courseId,
        goals,
        timeframe,
        learningProfile
      );

      expect(plan.userId).toBe(userId);
      expect(plan.courseId).toBe(courseId);
      expect(plan.goals).toHaveLength(goals.length);
      expect(plan.schedule.length).toBeGreaterThan(0);
      expect(plan.isActive).toBe(true);
      expect(plan.progress.totalGoals).toBe(goals.length);
    });
  });

  describe('generateInsights', () => {
    it('should generate study insights based on data', async () => {
      const userId = 'test-user';
      const studyData = {
        totalStudyTime: 120,
        sessionsCompleted: 8,
        streakDays: 5,
      };

      const insights = await aiService.generateInsights(userId, studyData);

      expect(insights).toBeInstanceOf(Array);
      expect(insights.length).toBeGreaterThan(0);
      insights.forEach(insight => {
        expect(insight.userId).toBe(userId);
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(insight.category).toBeDefined();
        expect(insight.priority).toBeDefined();
      });
    });
  });

  describe('generateMotivationalMessage', () => {
    it('should generate appropriate motivational message based on context', async () => {
      const userId = 'test-user';
      const context = {
        recentPerformance: 'improving' as const,
        streakStatus: 'active' as const,
        goalProgress: 75,
        timeOfDay: 'morning',
      };

      const motivation = await aiService.generateMotivationalMessage(userId, context);

      expect(motivation.userId).toBe(userId);
      expect(motivation.type).toBe('encouragement');
      expect(motivation.message).toBeDefined();
      expect(motivation.context).toEqual(context);
    });
  });

  describe('rateLimitCheck', () => {
    it('should return true for rate limit check', async () => {
      const userId = 'test-user';
      const action = 'question';

      const result = await aiService.rateLimitCheck(userId, action);

      expect(result).toBe(true);
    });
  });

  describe('updateConfig', () => {
    it('should update AI service configuration', async () => {
      const newConfig = {
        temperature: 0.8,
        maxTokens: 1500,
      };

      const updatedConfig = await aiService.updateConfig(newConfig);

      expect(updatedConfig.temperature).toBe(0.8);
      expect(updatedConfig.maxTokens).toBe(1500);
    });
  });
});