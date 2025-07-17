import { v4 as uuidv4 } from 'uuid';
import {
  AIStudyAssistant,
  AIConversation,
  AIMessage,
  AIInsight,
  AIStudyPlan,
  AIQuestionAnswer,
  AIMotivation,
  AIConfig,
  ConversationContext,
  StudentLearningProfile,
  AIPersonality,
  AIPreferences,
  QuestionContext,
  MotivationContext,
  StudyGoal,
  StudyScheduleItem,
  APIResponse,
} from '../types';

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyBlGsESDWcAz9RfaRQvvUyw4cIg45cx8RU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class AIService {
  private config: AIConfig = {
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompts: {
      general: 'You are a helpful AI study assistant focused on helping students learn effectively. Provide clear, concise, and actionable advice.',
      motivational: 'You are an encouraging study companion who provides positive motivation. Be supportive and inspiring while keeping responses brief.',
      analytical: 'You are an analytical AI that provides detailed study insights and recommendations. Focus on data-driven suggestions.',
      studyPlanning: 'You are a study planning expert. Help create structured, achievable study plans based on learning preferences and goals.',
    },
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
  };

  private async callGeminiAPI(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API call failed:', error);
      // Fallback to mock responses if API fails
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    const input = prompt.toLowerCase();
    
    if (input.includes('motivat') || input.includes('encourage')) {
      return "You're doing great! Keep up the excellent work and stay focused on your goals.";
    }
    
    if (input.includes('plan') || input.includes('schedule')) {
      return "Let's create a structured study plan. Break your goals into smaller, manageable tasks and set specific time blocks for each topic.";
    }

    return "I'm here to help you with your studies. What specific topic or challenge would you like to work on?";
  }

  async createAssistant(
    userId: string,
    name: string,
    personality: AIPersonality,
    preferences: AIPreferences,
    learningProfile: StudentLearningProfile
  ): Promise<AIStudyAssistant> {
    const assistant: AIStudyAssistant = {
      id: uuidv4(),
      userId,
      name,
      personality,
      preferences,
      conversationHistory: [],
      learningProfile,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, this would save to database
    return assistant;
  }

  async startConversation(
    userId: string,
    context: ConversationContext
  ): Promise<AIConversation> {
    const conversation: AIConversation = {
      id: uuidv4(),
      userId,
      messages: [],
      context,
      startedAt: new Date(),
      lastMessageAt: new Date(),
      isActive: true,
      tags: [],
    };

    return conversation;
  }

  async sendMessage(
    conversationId: string,
    content: string,
    context?: Partial<ConversationContext>
  ): Promise<AIMessage> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userMessage: AIMessage = {
      id: uuidv4(),
      conversationId,
      role: 'user',
      content,
      messageType: 'question',
      timestamp: new Date(),
      isEdited: false,
    };

    // Generate AI response based on content and context
    const aiResponse = await this.generateResponse(content, context);

    const assistantMessage: AIMessage = {
      id: uuidv4(),
      conversationId,
      role: 'assistant',
      content: aiResponse.content,
      messageType: aiResponse.type,
      metadata: aiResponse.metadata,
      timestamp: new Date(),
      isEdited: false,
    };

    return assistantMessage;
  }

  private async generateResponse(
    userInput: string,
    context?: Partial<ConversationContext>
  ): Promise<{
    content: string;
    type: AIMessage['messageType'];
    metadata?: AIMessage['metadata'];
  }> {
    const input = userInput.toLowerCase();
    let systemPrompt = this.config.systemPrompts.general;
    let messageType: AIMessage['messageType'] = 'explanation';
    let suggestedActions: string[] = [];

    // Determine the type of response and appropriate system prompt
    if (input.includes('motivat') || input.includes('encourage') || input.includes('struggling')) {
      systemPrompt = this.config.systemPrompts.motivational;
      messageType = 'motivation';
    } else if (input.includes('plan') || input.includes('schedule') || input.includes('organize')) {
      systemPrompt = this.config.systemPrompts.studyPlanning;
      messageType = 'planning';
      suggestedActions = ['Create study schedule', 'Set daily goals', 'Track progress'];
    } else if (input.includes('how') || input.includes('what') || input.includes('explain')) {
      messageType = 'explanation';
    } else if (input.includes('suggest') || input.includes('recommend')) {
      messageType = 'suggestion';
    }

    // Add context information to the prompt
    let contextualPrompt = userInput;
    if (context) {
      const contextInfo = [];
      if (context.currentCourse) contextInfo.push(`Current course: ${context.currentCourse}`);
      if (context.currentTopic) contextInfo.push(`Current topic: ${context.currentTopic}`);
      if (context.timeOfDay) contextInfo.push(`Time of day: ${context.timeOfDay}`);
      if (context.userMood) contextInfo.push(`User mood: ${context.userMood}`);
      
      if (contextInfo.length > 0) {
        contextualPrompt = `Context: ${contextInfo.join(', ')}\n\nUser question: ${userInput}`;
      }
    }

    try {
      const content = await this.callGeminiAPI(contextualPrompt, systemPrompt);
      
      return {
        content,
        type: messageType,
        metadata: { 
          confidence: 0.85,
          suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
        },
      };
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      return {
        content: this.getFallbackResponse(userInput),
        type: messageType,
        metadata: { confidence: 0.5 },
      };
    }
  }



  async askQuestion(
    userId: string,
    question: string,
    context: QuestionContext
  ): Promise<AIQuestionAnswer> {
    const answer: AIQuestionAnswer = {
      id: uuidv4(),
      userId,
      question,
      answer: await this.generateAnswer(question, context),
      context,
      confidence: 0.85,
      relatedTopics: this.extractRelatedTopics(question),
      followUpQuestions: await this.generateFollowUpQuestions(question, context),
      timestamp: new Date(),
    };

    return answer;
  }

  private async generateAnswer(question: string, context: QuestionContext): Promise<string> {
    let systemPrompt = `You are a knowledgeable study assistant. Answer the student's question clearly and concisely.`;
    
    // Customize system prompt based on question type
    switch (context.questionType) {
      case 'concept':
        systemPrompt += ` Focus on explaining the core concept and its key principles.`;
        break;
      case 'procedure':
        systemPrompt += ` Provide a clear step-by-step procedure or method.`;
        break;
      case 'application':
        systemPrompt += ` Focus on practical applications and real-world examples.`;
        break;
      case 'analysis':
        systemPrompt += ` Help break down and analyze the topic systematically.`;
        break;
      case 'synthesis':
        systemPrompt += ` Help connect different concepts and create a comprehensive understanding.`;
        break;
    }

    // Add context information
    let contextualQuestion = question;
    if (context.topic) {
      contextualQuestion = `Topic: ${context.topic}\nQuestion: ${question}`;
    }
    if (context.courseId) {
      contextualQuestion = `Course context provided.\n${contextualQuestion}`;
    }
    if (context.difficulty) {
      systemPrompt += ` Adjust your explanation for ${context.difficulty} level understanding.`;
    }

    try {
      return await this.callGeminiAPI(contextualQuestion, systemPrompt);
    } catch (error) {
      console.error('Failed to generate answer:', error);
      return this.getFallbackAnswer(question, context);
    }
  }

  private getFallbackAnswer(question: string, context: QuestionContext): string {
    switch (context.questionType) {
      case 'concept':
        return `This concept relates to ${context.topic || 'the subject matter'}. The key principles involve understanding the fundamental ideas and how they connect to broader themes in your studies.`;
      case 'procedure':
        return `Here's a systematic approach: 1) Break down the problem into smaller parts, 2) Address each part methodically, 3) Combine the solutions, 4) Review and verify your work.`;
      case 'application':
        return `To apply this concept: Consider the real-world context, identify the relevant principles, adapt them to your specific situation, and practice with similar examples.`;
      default:
        return `Based on your question about ${context.topic || 'this topic'}, I recommend starting with the fundamentals and building your understanding step by step. Would you like me to break this down further?`;
    }
  }

  private extractRelatedTopics(question: string): string[] {
    // Simple keyword extraction
    const keywords = question.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return keywords.slice(0, 3);
  }

  private async generateFollowUpQuestions(question: string, context: QuestionContext): Promise<string[]> {
    const systemPrompt = `Generate 3 relevant follow-up questions based on the student's original question. Make them specific and helpful for deeper learning.`;
    const prompt = `Original question: "${question}"\nTopic: ${context.topic || 'general'}\nGenerate 3 follow-up questions:`;
    
    try {
      const response = await this.callGeminiAPI(prompt, systemPrompt);
      // Parse the response to extract questions
      const questions = response.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(line => line.endsWith('?'))
        .slice(0, 3);
      
      if (questions.length > 0) {
        return questions;
      }
    } catch (error) {
      console.error('Failed to generate follow-up questions:', error);
    }
    
    // Fallback questions
    return [
      `What specific aspect of this would you like to explore further?`,
      `How does this relate to your current coursework?`,
      `Would you like some practice problems on this topic?`,
    ];
  }

  async generateStudyPlan(
    userId: string,
    courseId: string,
    goals: string[],
    timeframe: number, // days
    learningProfile: StudentLearningProfile
  ): Promise<AIStudyPlan> {
    // Simulate plan generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const studyGoals: StudyGoal[] = goals.map((goal, index) => ({
      id: uuidv4(),
      description: goal,
      targetDate: new Date(Date.now() + (timeframe * 24 * 60 * 60 * 1000)),
      priority: index === 0 ? 'high' : 'medium',
      measurable: true,
      status: 'not_started',
    }));

    const schedule: StudyScheduleItem[] = this.generateScheduleItems(
      courseId,
      goals,
      timeframe,
      learningProfile
    );

    const plan: AIStudyPlan = {
      id: uuidv4(),
      userId,
      title: `Personalized Study Plan`,
      description: `AI-generated study plan based on your learning preferences and goals`,
      courseId,
      goals: studyGoals,
      schedule,
      adaptiveElements: [],
      generatedAt: new Date(),
      lastUpdated: new Date(),
      isActive: true,
      progress: {
        completionPercentage: 0,
        goalsCompleted: 0,
        totalGoals: studyGoals.length,
        scheduleAdherence: 0,
        averageEffectiveness: 0,
        adaptationsApplied: 0,
        lastUpdated: new Date(),
      },
    };

    return plan;
  }

  private generateScheduleItems(
    courseId: string,
    goals: string[],
    timeframe: number,
    learningProfile: StudentLearningProfile
  ): StudyScheduleItem[] {
    const items: StudyScheduleItem[] = [];
    const dailySlots = Math.ceil(goals.length / timeframe);

    goals.forEach((goal, index) => {
      const dayOffset = Math.floor(index / dailySlots);
      const scheduledDate = new Date(Date.now() + (dayOffset * 24 * 60 * 60 * 1000));

      items.push({
        id: uuidv4(),
        planId: '', // Will be set when plan is created
        courseId,
        topic: goal,
        scheduledDate,
        duration: learningProfile.attentionSpan || 45,
        type: index % 2 === 0 ? 'new_material' : 'review',
        priority: index < 2 ? 5 : 3,
        completed: false,
      });
    });

    return items;
  }

  async generateInsights(
    userId: string,
    studyData: any
  ): Promise<AIInsight[]> {
    // Simulate insight generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const insights: AIInsight[] = [
      {
        id: uuidv4(),
        userId,
        type: 'performance_pattern',
        title: 'Study Pattern Analysis',
        description: 'Your productivity peaks in the morning hours',
        data: { peakHours: [9, 10, 11], efficiency: 0.85 },
        actionable: true,
        suggestedActions: ['Schedule important topics in the morning', 'Use afternoon for review'],
        priority: 'medium',
        category: 'productivity',
        generatedAt: new Date(),
        isValid: true,
      },
      {
        id: uuidv4(),
        userId,
        type: 'study_habit',
        title: 'Consistency Improvement',
        description: 'Your study streak has improved by 40% this month',
        data: { streakImprovement: 0.4, currentStreak: 12 },
        actionable: false,
        priority: 'low',
        category: 'motivation',
        generatedAt: new Date(),
        isValid: true,
      },
    ];

    return insights;
  }

  async generateMotivationalMessage(
    userId: string,
    context: MotivationContext
  ): Promise<AIMotivation> {
    const messages = {
      improving: [
        "Your progress is really showing! Keep up the excellent work!",
        "I can see your hard work paying off. You're on the right track!",
      ],
      stable: [
        "Consistency is key, and you're nailing it! Stay focused!",
        "Your steady progress is impressive. Every session counts!",
      ],
      declining: [
        "Everyone has ups and downs. Let's get back on track together!",
        "It's okay to have challenging periods. You've got this!",
      ],
    };

    const messageArray = messages[context.recentPerformance];
    const message = messageArray[Math.floor(Math.random() * messageArray.length)];

    return {
      id: uuidv4(),
      userId,
      type: 'encouragement',
      message,
      trigger: {
        type: 'progress_tracking',
        effectiveness: 8,
        description: 'Based on recent performance trends',
      },
      context,
      deliveredAt: new Date(),
    };
  }

  async updateConfig(newConfig: Partial<AIConfig>): Promise<AIConfig> {
    this.config = { ...this.config, ...newConfig };
    return this.config;
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  async rateLimitCheck(userId: string, action: string): Promise<boolean> {
    // In a real implementation, this would check against stored rate limits
    return true;
  }
}

export const aiService = new AIService();
export default aiService;