import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LearningRecommendation from '../components/features/LearningRecommendation';
import { recommendationService } from '../services/recommendationService';
import type { StudentLearningProfile } from '../types';

const LearningRecommendationDemo: React.FC = () => {
  const { userId = 'user123' } = useParams<{ userId?: string }>();
  const [learningProfile, setLearningProfile] = useState<StudentLearningProfile | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLearningProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profile = await recommendationService.getStudentLearningProfile(userId);
        setLearningProfile(profile || undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load learning profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningProfile();
  }, [userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Learning Recommendation Demo</h1>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading learning profile...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Learning Profile</h2>
              {learningProfile ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Learning Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {learningProfile.learningStyle.map(style => (
                        <span key={style} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {style.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Preferred Explanation Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {learningProfile.preferredExplanationTypes.map(type => (
                        <span key={type} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Difficulty Preference</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">
                      {learningProfile.difficultyPreference}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Attention Span</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      {learningProfile.attentionSpan} minutes
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Best Study Times</h3>
                    <div className="flex flex-wrap gap-2">
                      {learningProfile.bestStudyTimes.map(time => (
                        <span key={time} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium capitalize">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                      {learningProfile.strengths.map(strength => (
                        <span key={strength} className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Improvement Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {learningProfile.improvementAreas.map(area => (
                        <span key={area} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No learning profile available</p>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <LearningRecommendation 
              userId={userId} 
              learningProfile={learningProfile} 
              maxRecommendations={3} 
              showActions={true} 
            />
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p>The <code className="bg-gray-100 px-1 py-0.5 rounded">LearningRecommendation</code> component displays personalized recommendations based on the user's learning profile.</p>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Props:</h3>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">userId</code> - Required: The ID of the user to get recommendations for</li>
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">learningProfile</code> - Optional: The user's learning profile</li>
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">maxRecommendations</code> - Optional: Maximum number of recommendations to show (default: 3)</li>
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">showActions</code> - Optional: Whether to show action buttons (default: true)</li>
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">className</code> - Optional: Additional CSS classes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Features:</h3>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Filters recommendations based on the user's learning style</li>
                    <li>Allows switching between different learning styles</li>
                    <li>Displays recommendations with priority-based styling</li>
                    <li>Shows estimated impact for each recommendation</li>
                    <li>Provides quick actions to apply or dismiss recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningRecommendationDemo;