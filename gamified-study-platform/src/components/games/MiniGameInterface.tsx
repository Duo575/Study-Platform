import React, { useState } from 'react';
import { MiniGame } from '../../types';

interface MiniGameInterfaceProps {
  game: MiniGame;
  onStart?: () => void;
  onComplete?: (score: number) => void;
  onExit?: () => void;
}

export const MiniGameInterface: React.FC<MiniGameInterfaceProps> = ({
  game,
  onStart,
  onComplete,
  onExit,
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);

  const handleStart = () => {
    setIsStarted(true);
    onStart?.();
  };

  const handleComplete = (finalScore: number) => {
    setScore(finalScore);
    onComplete?.(finalScore);
  };

  if (!isStarted) {
    return (
      <div className="mini-game-interface p-6 max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{game.name}</h2>
          <p className="text-gray-600 mb-4">{game.description}</p>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Instructions:</p>
            <p className="text-sm">{game.instructions}</p>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-6">
            <span>Difficulty: {game.difficulty}</span>
            <span>Duration: {game.estimatedDuration}min</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-6">
            <span>XP Reward: {game.xpReward}</span>
            <span>Coin Reward: {game.coinReward}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Game
            </button>
            <button
              onClick={onExit}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mini-game-interface p-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">{game.name}</h2>
        <div className="mb-4">
          <p>Score: {score}</p>
        </div>
        <div className="bg-gray-100 p-8 rounded-lg mb-4">
          <p className="text-gray-500">Game content would be rendered here</p>
        </div>
        <button
          onClick={() => handleComplete(Math.floor(Math.random() * 100))}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors mr-2"
        >
          Complete Game
        </button>
        <button
          onClick={onExit}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Exit
        </button>
      </div>
    </div>
  );
};
