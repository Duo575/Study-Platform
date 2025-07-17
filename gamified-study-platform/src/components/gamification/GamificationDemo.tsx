import React from 'react';
import { useGamification } from '../../hooks/useGamification';
import { GamificationDashboard } from './index';

/**
 * Demo component to showcase and test the gamification system
 */
export const GamificationDemo: React.FC = () => {
  const { 
    awardXP, 
    awardStudySessionXP, 
    awardQuestXP, 
    awardTodoXP,
    updateStreak
  } = useGamification();
  
  const handleAwardXP = () => {
    awardXP(10, 'Demo XP');
  };
  
  const handleStudySession = () => {
    awardStudySessionXP(30, 'medium', false);
  };
  
  const handleCompleteQuest = () => {
    awardQuestXP('daily', 'medium');
  };
  
  const handleCompleteTodo = () => {
    awardTodoXP(45, true, true);
  };
  
  const handleUpdateStreak = () => {
    updateStreak();
  };
  
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Gamification System Demo</h1>
      
      <GamificationDashboard className="mb-8" />
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test Actions</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAwardXP}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Award 10 XP
          </button>
          
          <button
            onClick={handleStudySession}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Complete Study Session
          </button>
          
          <button
            onClick={handleCompleteQuest}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Complete Daily Quest
          </button>
          
          <button
            onClick={handleCompleteTodo}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            Complete Todo Early
          </button>
          
          <button
            onClick={handleUpdateStreak}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors col-span-2"
          >
            Update Streak
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>This demo showcases the gamification system components:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>XP Bar with level progression</li>
            <li>Streak tracking system</li>
            <li>XP animations when earning points</li>
            <li>Level-up modal with celebrations</li>
            <li>Backend synchronization with Supabase</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GamificationDemo;