import React, { useState, useEffect } from 'react';
import {
  TrophyIcon,
  StarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { miniGameService } from '../../services/miniGameService';
import {
  LoadingAnimation,
  StaggerAnimation,
  HoverScale,
} from '../ui/AnimationComponents';
import type { MiniGame, GameSession, GameResult } from '../../types';

// Import game components
import { BreathingExercise } from './BreathingExercise';
import { ColorMemoryGameComponent } from './ColorMemoryGame';
import { SlidingPuzzleGameComponent } from './SlidingPuzzleGame';
import { ReactionTimeGameComponent } from './ReactionTimeGame';
import { PatternMemoryGameComponent } from './PatternMemoryGame';

interface MiniGameManagerProps {
  gameId?: string;
  onExit: () => void;
  onCoinsEarned?: (coins: number) => void;
}

interface GameCompletionState {
  result: GameResult | null;
  showResults: boolean;
}

export const MiniGameManager: React.FC<MiniGameManagerProps> = ({
  gameId,
  onExit,
  onCoinsEarned,
}) => {
  const [currentGame, setCurrentGame] = useState<MiniGame | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [availableGames, setAvailableGames] = useState<MiniGame[]>([]);
  const [completion, setCompletion] = useState<GameCompletionState>({
    result: null,
    showResults: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeManager();
  }, [gameId]);

  const initializeManager = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load available games
      const games = miniGameService.getAvailableGames();
      setAvailableGames(games);

      // If specific game ID provided, start that game
      if (gameId) {
        const game = games.find(g => g.id === gameId);
        if (game) {
          await startGame(game);
        } else {
          setError(`Game not found: ${gameId}`);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to initialize games'
      );
    } finally {
      setLoading(false);
    }
  };

  const startGame = async (game: MiniGame) => {
    try {
      setLoading(true);
      setError(null);

      const session = await miniGameService.startGame(game.id);
      setCurrentGame(game);
      setCurrentSession(session);
      setCompletion({ result: null, showResults: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = async (score: number) => {
    if (!currentSession) {
      setError('No active game session');
      return;
    }

    try {
      setLoading(true);
      const result = await miniGameService.endGame(currentSession.id, score);

      setCompletion({
        result,
        showResults: true,
      });

      // Notify parent about coins earned
      if (onCoinsEarned && result.coinsEarned > 0) {
        onCoinsEarned(result.coinsEarned);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete game');
    } finally {
      setLoading(false);
    }
  };

  const handleGameExit = () => {
    setCurrentGame(null);
    setCurrentSession(null);
    setCompletion({ result: null, showResults: false });

    if (!gameId) {
      // If no specific game was requested, stay in game selection
      return;
    }

    onExit();
  };

  const handlePlayAgain = async () => {
    if (currentGame) {
      await startGame(currentGame);
    }
  };

  const handleSelectDifferentGame = () => {
    setCurrentGame(null);
    setCurrentSession(null);
    setCompletion({ result: null, showResults: false });
  };

  const renderGameComponent = () => {
    if (!currentGame || !currentSession) return null;

    const commonProps = {
      onComplete: handleGameComplete,
      onExit: handleGameExit,
    };

    switch (currentGame.id) {
      case 'breathing-exercise':
      case 'deep-breathing':
        return (
          <BreathingExercise
            {...commonProps}
            duration={currentGame.estimatedDuration}
          />
        );

      case 'color-memory':
        return (
          <ColorMemoryGameComponent
            {...commonProps}
            game={currentGame}
            session={currentSession}
          />
        );

      case 'pattern-memory':
        return (
          <PatternMemoryGameComponent
            {...commonProps}
            game={currentGame}
            session={currentSession}
          />
        );

      case 'sliding-puzzle':
      case 'jigsaw-puzzle':
        return (
          <SlidingPuzzleGameComponent
            {...commonProps}
            game={currentGame}
            session={currentSession}
          />
        );

      case 'reaction-time':
      case 'whack-a-mole':
        return (
          <ReactionTimeGameComponent
            {...commonProps}
            game={currentGame}
            session={currentSession}
          />
        );

      default:
        return (
          <div className="text-center p-8">
            <p className="text-gray-600 mb-4">
              Game "{currentGame.name}" is not yet implemented.
            </p>
            <button
              onClick={handleGameExit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Back to Games
            </button>
          </div>
        );
    }
  };

  const renderGameResults = () => {
    const { result } = completion;
    if (!result || !currentGame) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="mb-6"
            >
              {result.personalBest ? (
                <div className="text-yellow-500 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <TrophyIcon className="w-16 h-16 mx-auto" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mt-2">
                    Personal Best!
                  </h3>
                </div>
              ) : (
                <div className="text-blue-500 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <StarIcon className="w-16 h-16 mx-auto" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mt-2">
                    Well Done!
                  </h3>
                </div>
              )}
            </motion.div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Score:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {result.score}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">
                  {result.timeSpent} minutes
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Coins Earned:</span>
                <div className="flex items-center space-x-1">
                  <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-bold text-yellow-600">
                    {result.coinsEarned}
                  </span>
                </div>
              </div>
            </div>

            {result.newAchievements.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  New Achievements!
                </h4>
                <div className="space-y-1">
                  {result.newAchievements.map((achievement, index) => (
                    <div key={index} className="text-sm text-yellow-700">
                      🏆 {achievement}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex space-x-3"
            >
              <HoverScale scale={1.05}>
                <button
                  onClick={handlePlayAgain}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Play Again
                </button>
              </HoverScale>
              <HoverScale scale={1.05}>
                <button
                  onClick={handleSelectDifferentGame}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Different Game
                </button>
              </HoverScale>
              <HoverScale scale={1.05}>
                <button
                  onClick={onExit}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Done
                </button>
              </HoverScale>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderGameSelection = () => {
    const categories = [
      'breathing',
      'memory',
      'puzzle',
      'reflex',
      'creativity',
    ] as const;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Mini-Games
            </h1>
            <p className="text-gray-600">
              Take a break and play some relaxing games to earn coins
            </p>
          </motion.div>

          {categories.map(category => {
            const categoryGames = miniGameService.getGamesByCategory(category);
            if (categoryGames.length === 0) return null;

            return (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
                  {category} Games
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StaggerAnimation staggerDelay={0.1}>
                    {categoryGames.map(game => (
                      <HoverScale key={game.id} scale={1.03}>
                        <motion.div
                          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => startGame(game)}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-800">
                              {game.name}
                            </h3>
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {game.coinReward}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-3">
                            {game.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="capitalize">
                              {game.difficulty}
                            </span>
                            <span>~{game.estimatedDuration} min</span>
                          </div>
                        </motion.div>
                      </HoverScale>
                    ))}
                  </StaggerAnimation>
                </div>
              </div>
            );
          })}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <HoverScale scale={1.05}>
              <button
                onClick={onExit}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to Study
              </button>
            </HoverScale>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingAnimation
          isLoading={true}
          type="dots"
          message="Loading game..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentGame && currentSession
        ? renderGameComponent()
        : renderGameSelection()}
      {completion.showResults && renderGameResults()}
    </>
  );
};
