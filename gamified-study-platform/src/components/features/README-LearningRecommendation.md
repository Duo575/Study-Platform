# Learning Recommendation Component

## Overview

The `LearningRecommendation` component is designed to display personalized study recommendations based on a user's learning profile. It filters recommendations according to the user's learning style preferences and allows users to interact with these recommendations through apply and dismiss actions.

## Features

- **Learning Style Tabs**: Dynamically generates tabs based on the user's learning style preferences
- **Filtered Recommendations**: Shows recommendations relevant to the selected learning style
- **Priority-Based Styling**: Visual indicators for recommendation priority (critical, high, medium, low)
- **Impact Indicators**: Shows the estimated impact of each recommendation
- **Interactive Actions**: Apply and dismiss functionality for recommendations
- **Responsive Design**: Works well on various screen sizes
- **Loading & Error States**: Proper handling of loading and error states

## Usage

```tsx
import LearningRecommendation from '../components/features/LearningRecommendation';
import { recommendationService } from '../services/recommendationService';
import type { StudentLearningProfile } from '../types';

// Inside your component
const [learningProfile, setLearningProfile] = useState<StudentLearningProfile | undefined>();

useEffect(() => {
  const fetchLearningProfile = async () => {
    if (userId) {
      try {
        const profile = await recommendationService.getUserLearningProfile(userId);
        setLearningProfile(profile);
      } catch (error) {
        console.error('Error fetching learning profile:', error);
      }
    }
  };
  
  fetchLearningProfile();
}, [userId]);

// In your render method
<LearningRecommendation 
  userId={userId} 
  learningProfile={learningProfile}
  maxRecommendations={3}
  showActions={true}
  className="shadow-md"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userId` | string | Yes | - | The ID of the user to get recommendations for |
| `learningProfile` | StudentLearningProfile | No | undefined | The user's learning profile with preferences |
| `maxRecommendations` | number | No | 3 | Maximum number of recommendations to display |
| `showActions` | boolean | No | true | Whether to show apply/dismiss action buttons |
| `className` | string | No | '' | Additional CSS classes to apply to the component |

## Demo Page

A demo page is available at `/learning-recommendations` that showcases the component with a user's learning profile displayed alongside the recommendations.

## Integration

The component is integrated into the main dashboard to provide users with personalized learning recommendations based on their learning profile.

## Dependencies

- React
- Lucide React (for icons)
- React Router (for navigation links)
- RecommendationService (for fetching and managing recommendations)
- StudentLearningProfile type (from types)