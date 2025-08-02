import React, { useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { GamificationSystem } from './GamificationSystem';
import { GamificationDashboard } from './GamificationDashboard';
import { useGamificationStore } from '../../../store/gamificationStore';

export function GamificationDemo() {
  const {
    gameStats,
    initializeGameStats,
    awardXP,
    awardStudySessionXP,
    awardQuestXP,
    awardTodoXP,
    updateStreak,
  } = useGamificationStore();

  // Initialize demo game stats if none exist
  useEffect(() => {
    if (!gameStats) {
      initializeGameStats({
        level: 3,
        totalXP: 450,
        currentXP: 0,
        xpToNextLevel: 250,
        streakDays: 2,
        achievements: [],
        lastActivity: new Date(),
        weeklyStats: {
          studyHours: 5,
          questsCompleted: 3,
          streakMaintained: true,
          xpEarned: 450,
          averageScore: 85,
        },
      });

      // Initialize streak
      updateStreak();
    }
  }, [gameStats, initializeGameStats, updateStreak]);

  // Award XP handlers
  const handleAwardXP = () => {
    awardXP(25, 'Demo XP');
  };

  const handleStudySession = () => {
    awardStudySessionXP(30, 'medium', true);
  };

  const handleCompleteQuest = () => {
    awardQuestXP('daily', 'medium');
  };

  const handleCompleteTodo = () => {
    awardTodoXP(45, true);
  };

  if (!gameStats) {
    return <div>Loading gamification system...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gamification System Demo</h1>

      {/* Gamification System (XP Bar, Animations, Level Up Modal) */}
      <GamificationSystem />

      {/* Gamification Dashboard */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Gamification Dashboard</h2>
        <GamificationDashboard />
      </div>

      {/* Demo Controls */}
      <Card className="p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button onClick={handleAwardXP} variant="primary">
            Award 25 XP
          </Button>
          <Button onClick={handleStudySession} variant="secondary">
            Complete Study Session
          </Button>
          <Button onClick={handleCompleteQuest} variant="success">
            Complete Daily Quest
          </Button>
          <Button onClick={handleCompleteTodo} variant="info">
            Complete Todo Item
          </Button>
        </div>
      </Card>

      {/* Current Stats */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Current Game Stats</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(gameStats, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
