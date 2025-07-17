import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePomodoro } from '../../../hooks/usePomodoro';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { BreakActivity } from '../../../types';

interface BreakActivitiesProps {
  onClose: () => void;
}

export const BreakActivities: React.FC<BreakActivitiesProps> = ({ onClose }) => {
  const { breakActivities } = usePomodoro();
  const [selectedActivity, setSelectedActivity] = useState<BreakActivity | null>(null);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  const handleActivitySelect = (activity: BreakActivity) => {
    setSelectedActivity(activity);
  };

  const handleActivityComplete = (activityId: string) => {
    setCompletedActivities(prev => [...prev, activityId]);
    setSelectedActivity(null);
    
    // Here you could award XP bonus for completing break activities
    // This would integrate with the gamification system
  };

  const getActivityTypeColor = (type: BreakActivity['type']) => {
    const colors = {
      physical: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      mental: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      creative: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      social: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[type];
  };

  if (selectedActivity) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">{selectedActivity.icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedActivity.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {selectedActivity.description}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>⏱️ {selectedActivity.duration} minutes</span>
            {selectedActivity.xpBonus && (
              <span>✨ +{selectedActivity.xpBonus} XP bonus</span>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Activity Tips
          </h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {selectedActivity.type === 'physical' && (
              <>
                <p>• Stand up and move around to improve circulation</p>
                <p>• Do some light stretching to relieve muscle tension</p>
                <p>• Take deep breaths and focus on your posture</p>
              </>
            )}
            {selectedActivity.type === 'mental' && (
              <>
                <p>• Close your eyes and practice mindful breathing</p>
                <p>• Let your mind wander freely without judgment</p>
                <p>• Focus on the present moment and relax</p>
              </>
            )}
            {selectedActivity.type === 'creative' && (
              <>
                <p>• Don't worry about creating something perfect</p>
                <p>• Let your creativity flow naturally</p>
                <p>• Enjoy the process rather than the outcome</p>
              </>
            )}
            {selectedActivity.type === 'social' && (
              <>
                <p>• Reach out to a friend or family member</p>
                <p>• Share something positive about your day</p>
                <p>• Keep the interaction light and energizing</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setSelectedActivity(null)}
            className="flex-1"
          >
            Back to Activities
          </Button>
          <Button
            variant="primary"
            onClick={() => handleActivityComplete(selectedActivity.id)}
            className="flex-1"
          >
            Mark as Complete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Break Activity
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Make the most of your break time with these engaging activities
        </p>
      </div>

      <div className="grid gap-4">
        {breakActivities.map((activity) => {
          const isCompleted = completedActivities.includes(activity.id);
          
          return (
            <motion.div
              key={activity.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  isCompleted 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => !isCompleted && handleActivitySelect(activity)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">
                    {isCompleted ? '✅' : activity.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                        {activity.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>⏱️ {activity.duration} min</span>
                      {activity.xpBonus && (
                        <span>✨ +{activity.xpBonus} XP</span>
                      )}
                      {isCompleted && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Completed!
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!isCompleted && (
                    <div className="text-gray-400">
                      →
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {completedActivities.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <span className="text-lg">🎉</span>
            <span className="font-medium">
              Great job! You've completed {completedActivities.length} break activit{completedActivities.length === 1 ? 'y' : 'ies'} today.
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};