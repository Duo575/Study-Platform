import React, { useState, useEffect } from 'react';
import { ClockIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MiniGameManager } from './MiniGameManager';
import { miniGameService } from '../../services/miniGameService';
import type { MiniGame } from '../../types';

interface StudyBreakManagerProps {
  userId: string;
  breakType: 'short_break' | 'long_break';
  breakDuration: number; // in minutes
  onBreakComplete: () => void;
  onSkipBreak: () => void;
}

interface BreakTimeTracker {
  startTime: Date;
  timeSpent: number; // in seconds
  gameTimeSpent: number; // in seconds
  maxGameTime: number; // in seconds
  isGameActive: boolean;
}

export const StudyBreakManager: React.FC<StudyBreakManagerProps> = ({
  userId,
  breakType,
  breakDuration,
  onBreakComplete,
  onSkipBreak,
}) => {
  const [currentView, setCurrentView] = useState<'break_menu' | 'game' | 'rest'>('break_menu');
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [breakTracker, setBreakTracker] = useState<BreakTimeTracker>({
    startTime: new Date(),
    timeSpent: 0,
    gameTimeSpent: 0,
    maxGameTime: Math.floor(breakDuration * 60 * 0.7), // Max 70% of break time for games
    isGameActive: false,
  });
  const [recommendedGames, setRecommendedGames] = useState<MiniGame[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(breakDuration * 60);

  useEffect(() => {
    // Load recommended games for break time
    const games = miniGameService.getRecommendedGames(userId, 4);
    // Filter games suitable for breaks (shorter duration)
    const breakSuitableGames = games.filter(game => 
      game.estimatedDuration <= breakDuration && 
      (game.category === 'breathing' || game.category === 'memory' || game.category === 'reflex')
    );
    setRecommendedGames(breakSuitableGames);
  }, [userId, breakDuration]);

  useEffect(() => {
    // Break timer countdown
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onBreakComplete();
          return 0;
        }
        return prev - 1;
      });

      setBreakTracker(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1,
        gameTimeSpent: prev.isGameActive ? prev.gameTimeSpent + 1 : prev.gameTimeSpent,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [onBreakComplete]);

  const handleGameStart = (game: MiniGame) => {
    const { gameTimeSpent, maxGameTime } = breakTracker;
    
    if (gameTimeSpent >= maxGameTime) {
      alert('You\'ve reached the maximum game time for this break. Time to rest!');
      return;
    }

    setSelectedGame(game);
    setCurrentView('game');
    setBreakTracker(prev => ({ ...prev, isGameActive: true }));
  };

  const handleGameComplete = (coinsEarned: number) => {
    setBreakTracker(prev => ({ ...prev, isGameActive: false }));
    setCurrentView('break_menu');
    setSelectedGame(null);
    
    // Show completion message
    if (coinsEarned > 0) {
      // Could trigger a toast notification here
      console.log(`Break game completed! Earned ${coinsEarned} coins.`);
    }
  };

  const handleGameExit = () => {
    setBreakTracker(prev => ({ ...prev, isGameActive: false }));
    setCurrentView('break_menu');
    setSelectedGame(null);
  };

  const handleRestMode = () => {
    setCurrentView('rest');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGameTimeStatus = () => {
    const { gameTimeSpent, maxGameTime } = breakTracker;
    const percentage = (gameTimeSpent / maxGameTime) * 100;
    
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600' };
    if (percentage >= 80) return { status: 'warning', color: 'text-yellow-600' };
    return { status: 'normal', color: 'text-green-600' };
  };

  const renderBreakMenu = () => {
    const gameTimeStatus = getGameTimeStatus();
    const canPlayGames = breakTracker.gameTimeSpent < breakTracker.maxGameTime;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Break Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ClockIcon className="w-8 h-8 text-green-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-800">
                {breakType === 'short_break' ? 'Short Break' : 'Long Break'}
              </h1>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-gray-600">Time Remaining</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-gray-800">Break Time Used</div>
                <div className="text-blue-600">{formatTime(breakTracker.timeSpent)}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-gray-800">Game Time Used</div>
                <div className={gameTimeStatus.color}>
                  {formatTime(breakTracker.gameTimeSpent)} / {formatTime(breakTracker.maxGameTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Break Activities */}
          <div className="space-y-6">
            {/* Mini-Games Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🎮 Quick Games {!canPlayGames && '(Time Limit Reached)'}
              </h2>
              
              {canPlayGames ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedGames.map(game => (
                    <div
                      key={game.id}
                      onClick={() => handleGameStart(game)}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{game.name}</h3>
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <span className="text-sm">🪙 {game.coinReward}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{game.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{game.difficulty}</span>
                        <span>~{game.estimatedDuration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    You've used your game time for this break. Time to rest and recharge! 🧘‍♂️
                  </p>
                </div>
              )}
            </div>

            {/* Rest Activities Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🧘‍♂️ Rest & Recharge
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={handleRestMode}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-green-500"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">Guided Rest</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Peaceful environment with gentle reminders to relax
                  </p>
                  <div className="text-xs text-gray-500">Recommended for mental rest</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                  <h3 className="font-semibold text-gray-800 mb-2">Quick Stretch</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Simple stretching exercises for your break
                  </p>
                  <div className="text-xs text-gray-500">Good for physical wellness</div>
                </div>
              </div>
            </div>
          </div>

          {/* Break Controls */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={onSkipBreak}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Break
            </button>
            <button
              onClick={onBreakComplete}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              End Break Early
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRestMode = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="text-6xl mb-4">🧘‍♂️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Rest Time</h2>
            <p className="text-gray-600">
              Take a moment to breathe and relax. You're doing great!
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-gray-600">Time Remaining</div>
          </div>

          <div className="space-y-4 text-gray-600 text-sm">
            <p>• Close your eyes and take deep breaths</p>
            <p>• Stretch your arms and shoulders</p>
            <p>• Look away from your screen</p>
            <p>• Hydrate with some water</p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => setCurrentView('break_menu')}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              Back to Break Menu
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    return (
      <div className="relative">
        {/* Game Time Warning */}
        {breakTracker.gameTimeSpent > breakTracker.maxGameTime * 0.8 && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            ⚠️ Game time almost up! Consider taking a rest soon.
          </div>
        )}

        <MiniGameManager
          gameId={selectedGame.id}
          onExit={handleGameExit}
          onCoinsEarned={handleGameComplete}
        />
      </div>
    );
  };

  // Render based on current view
  switch (currentView) {
    case 'game':
      return renderGame();
    case 'rest':
      return renderRestMode();
    default:
      return renderBreakMenu();
  }
};