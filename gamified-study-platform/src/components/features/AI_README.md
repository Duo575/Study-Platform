# AI Study Assistant Integration

This document describes the AI Study Assistant integration in the Gamified Study Platform, powered by Google's Gemini API.

## Overview

The AI Study Assistant provides personalized learning support through:
- Conversational chat interface
- Study insights and recommendations
- Personalized study plan generation
- Motivational messages
- Question answering
- Learning pattern analysis

## Components

### Core Components

#### 1. AIChat
Interactive chat interface for conversing with the AI assistant.

```tsx
import AIChat from './components/features/AIChat';

<AIChat
  userId="user-123"
  context={{
    currentCourse: "Mathematics",
    timeOfDay: "morning",
    userMood: "motivated"
  }}
/>
```

#### 2. AIAssistantSetup
Multi-step setup wizard for configuring the AI assistant's personality and preferences.

```tsx
import AIAssistantSetup from './components/features/AIAssistantSetup';

<AIAssistantSetup
  userId="user-123"
  onComplete={() => console.log('Setup complete')}
/>
```

#### 3. AIInsightsDashboard
Dashboard displaying AI-generated insights about study patterns and recommendations.

```tsx
import AIInsightsDashboard from './components/features/AIInsightsDashboard';

<AIInsightsDashboard
  userId="user-123"
  studyData={{
    totalStudyTime: 120,
    sessionsCompleted: 8,
    streakDays: 5
  }}
/>
```

#### 4. AIStudyPlanGenerator
Tool for generating personalized study plans based on goals and learning preferences.

```tsx
import AIStudyPlanGenerator from './components/features/AIStudyPlanGenerator';

<AIStudyPlanGenerator
  userId="user-123"
  courses={[
    { id: '1', name: 'Mathematics', color: '#3B82F6' }
  ]}
  onPlanGenerated={(plan) => console.log('Plan generated:', plan)}
/>
```

#### 5. AIQuickActions
Floating action button providing quick access to AI features.

```tsx
import AIQuickActions from './components/features/AIQuickActions';

<AIQuickActions
  userId="user-123"
  context={{
    courseId: "math-101",
    topic: "calculus"
  }}
/>
```

### Utility Components

#### AIFloatingChat
Floating chat widget that can be used throughout the app.

```tsx
import AIFloatingChat from './components/features/AIFloatingChat';

<AIFloatingChat />
```

## Hooks and Context

### useAI Hook
Primary hook for accessing AI functionality.

```tsx
import { useAI } from './hooks/useAI';

const {
  assistant,
  hasAssistant,
  setupAssistant,
  startChat,
  chat,
  askStudyQuestion,
  createStudyPlan,
  getMotivation,
  getInsights,
  isLoading,
  error
} = useAI();
```

### AIContext
React context providing AI functionality throughout the app.

```tsx
import { useAIContext } from './contexts/AIContext';

const {
  hasAssistant,
  unacknowledgedInsights,
  setupAssistant,
  startChat
} = useAIContext();
```

## Services

### AIService
Core service handling API communication with Google Gemini.

```tsx
import { aiService } from './services/aiService';

// Create assistant
const assistant = await aiService.createAssistant(
  userId,
  name,
  personality,
  preferences,
  learningProfile
);

// Ask question
const answer = await aiService.askQuestion(
  userId,
  "What is calculus?",
  {
    topic: "mathematics",
    difficulty: "intermediate",
    questionType: "concept"
  }
);
```

## State Management

### AI Store (Zustand)
Centralized state management for AI-related data.

```tsx
import { useAIStore } from './store/aiStore';

const {
  assistant,
  conversations,
  insights,
  studyPlans,
  createAssistant,
  sendMessage,
  generateInsights
} = useAIStore();
```

## Configuration

### API Setup
The AI service uses Google's Gemini API. The API key is configured in `aiService.ts`:

```typescript
const GEMINI_API_KEY = 'your-api-key-here';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
```

### AI Configuration
AI behavior can be customized through the config object:

```typescript
const config: AIConfig = {
  model: 'gemini-pro',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompts: {
    general: 'You are a helpful AI study assistant...',
    motivational: 'You are an encouraging study companion...',
    analytical: 'You are an analytical AI...'
  },
  features: {
    questionAnswering: true,
    studyPlanning: true,
    motivationalMessages: true,
    performanceAnalysis: true,
    resourceRecommendation: true,
    conversationalChat: true
  },
  rateLimits: {
    questionsPerHour: 50,
    messagesPerDay: 200,
    planGenerationsPerWeek: 5
  }
};
```

## Usage Examples

### Setting up an AI Assistant

```tsx
const { setupAssistant } = useAIContext();

await setupAssistant(
  'Study Buddy',
  'encouraging',
  'friendly',
  {
    studyMethodSuggestions: true,
    motivationalMessages: true,
    progressCelebrations: true
  },
  ['visual', 'auditory']
);
```

### Starting a Chat Session

```tsx
const { startChat, chat } = useAIContext();

// Start conversation
await startChat({
  currentCourse: 'Mathematics',
  currentTopic: 'Calculus',
  userMood: 'motivated'
});

// Send message
await chat('Can you help me understand derivatives?');
```

### Asking Study Questions

```tsx
const { askStudyQuestion } = useAIContext();

await askStudyQuestion(
  'What is the derivative of x^2?',
  'math-101',
  'calculus',
  'intermediate'
);
```

### Generating Study Plans

```tsx
const { createStudyPlan } = useAIContext();

await createStudyPlan(
  'math-101',
  [
    'Learn basic calculus concepts',
    'Practice derivative problems',
    'Understand integration'
  ],
  30 // 30 days
);
```

### Getting Insights

```tsx
const { getInsights } = useAIContext();

await getInsights({
  totalStudyTime: 120,
  sessionsCompleted: 8,
  averageSessionLength: 45,
  streakDays: 5,
  recentPerformance: 'improving'
});
```

## Types

Key TypeScript interfaces for AI functionality:

```typescript
interface AIStudyAssistant {
  id: string;
  userId: string;
  name: string;
  personality: AIPersonality;
  preferences: AIPreferences;
  learningProfile: StudentLearningProfile;
  isActive: boolean;
}

interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: AIMessageType;
  timestamp: Date;
}

interface AIInsight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: InsightCategory;
  actionable: boolean;
  suggestedActions?: string[];
}
```

## Error Handling

The AI integration includes comprehensive error handling:

- API failures fall back to mock responses
- Network errors are caught and displayed to users
- Rate limiting is implemented to prevent API abuse
- User-friendly error messages are shown in the UI

## Testing

Tests are included for core functionality:

- `aiService.test.ts` - Tests for the AI service
- `useAI.test.ts` - Tests for the AI hook

Run tests with:
```bash
npm test
```

## Performance Considerations

- API calls are debounced to prevent excessive requests
- Responses are cached where appropriate
- Loading states are shown during API calls
- Error boundaries prevent crashes from AI failures

## Future Enhancements

Potential improvements for the AI integration:

1. **Voice Integration**: Add speech-to-text and text-to-speech
2. **Advanced Analytics**: More sophisticated learning pattern analysis
3. **Collaborative Features**: AI-powered study group recommendations
4. **Adaptive Learning**: Dynamic difficulty adjustment based on performance
5. **Multi-modal Support**: Image and document analysis capabilities
6. **Offline Mode**: Cached responses for basic functionality without internet

## Troubleshooting

Common issues and solutions:

### API Key Issues
- Ensure the Gemini API key is valid and has sufficient quota
- Check that the API key has the necessary permissions

### Rate Limiting
- The system includes built-in rate limiting
- If you hit limits, wait before making more requests

### Network Issues
- The system falls back to mock responses when the API is unavailable
- Check your internet connection if real AI responses aren't working

### Setup Issues
- Ensure the AI assistant is properly set up before using other features
- Check the browser console for detailed error messages