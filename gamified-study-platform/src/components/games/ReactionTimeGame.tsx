import React, { useState, useEffect } from 'react';
import { BaseMiniGameComponent, BaseMiniGameProps } from './BaseMiniGame';

interface ReactionTimeGameState {
  gamePhase: 'waiting' | 'ready' | 'go' | 'clicked' | 'results';
  reactionTime: number;
  attempts: number;
  bestTime: number;
  averageTime: number;
  totalTime: number;
  round: number;
  maxRounds: number;
  waitTime: number;
  showCircle: boolean;
  tooEarly: boolean;
}

export class ReactionTimeGame extends BaseMiniGameComponent<
  {},
  ReactionTimeGameState
> {
  private reactionStartTime: number = 0;
  private gameTimeoutRef: NodeJS.Timeout | null = null;

  constructor(props: BaseMiniGameProps) {
    super(props);

    const maxRounds =
      props.game.difficulty === 'easy'
        ? 5
        : props.game.difficulty === 'medium'
          ? 8
          : 12;

    this.state = {
      ...this.state,
      gamePhase: 'waiting',
      reactionTime: 0,
      attempts: 0,
      bestTime: Infinity,
      averageTime: 0,
      totalTime: 0,
      round: 1,
      maxRounds,
      waitTime: 0,
      showCircle: false,
      tooEarly: false,
    };
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.gameTimeoutRef) {
      clearTimeout(this.gameTimeoutRef);
    }
  }

  protected initializeGame(): void {
    // Game initializes when started
  }

  protected onGameStart(): void {
    this.startRound();
  }

  protected onGamePause(): void {
    if (this.gameTimeoutRef) {
      clearTimeout(this.gameTimeoutRef);
    }
  }

  protected onGameResume(): void {
    if (this.state.gamePhase === 'ready') {
      this.startWaitPhase();
    }
  }

  protected onGameStop(): void {
    this.setState({
      gamePhase: 'waiting',
      reactionTime: 0,
      attempts: 0,
      bestTime: Infinity,
      averageTime: 0,
      totalTime: 0,
      round: 1,
      waitTime: 0,
      showCircle: false,
      tooEarly: false,
    });
    if (this.gameTimeoutRef) {
      clearTimeout(this.gameTimeoutRef);
    }
  }

  protected calculateScore(): number {
    const { bestTime, averageTime, attempts, maxRounds } = this.state;

    if (attempts === 0) return 0;

    // Base score for completion
    const completionScore = (attempts / maxRounds) * 30;

    // Speed bonus (faster average = higher score)
    const speedBonus = Math.max(0, ((1000 - averageTime) / 1000) * 40);

    // Consistency bonus (best time close to average = higher score)
    const consistency = Math.max(
      0,
      1 - Math.abs(bestTime - averageTime) / averageTime
    );
    const consistencyBonus = consistency * 30;

    return Math.floor(completionScore + speedBonus + consistencyBonus);
  }

  private startRound = () => {
    if (this.state.round > this.state.maxRounds) {
      this.completeGame();
      return;
    }

    this.setState({
      gamePhase: 'ready',
      showCircle: false,
      tooEarly: false,
    });

    this.startWaitPhase();
  };

  private startWaitPhase = () => {
    // Random wait time between 1-5 seconds
    const waitTime = 1000 + Math.random() * 4000;
    this.setState({ waitTime });

    this.gameTimeoutRef = setTimeout(() => {
      this.setState({
        gamePhase: 'go',
        showCircle: true,
      });
      this.reactionStartTime = Date.now();
    }, waitTime);
  };

  private handleClick = () => {
    const { gamePhase } = this.state;

    if (gamePhase === 'ready') {
      // Clicked too early
      this.setState({
        tooEarly: true,
        gamePhase: 'results',
      });

      if (this.gameTimeoutRef) {
        clearTimeout(this.gameTimeoutRef);
      }

      setTimeout(() => {
        this.setState({ round: this.state.round + 1 });
        this.startRound();
      }, 2000);
    } else if (gamePhase === 'go') {
      // Valid click - calculate reaction time
      const reactionTime = Date.now() - this.reactionStartTime;
      const { attempts, totalTime, bestTime } = this.state;

      const newAttempts = attempts + 1;
      const newTotalTime = totalTime + reactionTime;
      const newAverageTime = newTotalTime / newAttempts;
      const newBestTime = Math.min(bestTime, reactionTime);

      this.setState({
        gamePhase: 'results',
        reactionTime,
        attempts: newAttempts,
        totalTime: newTotalTime,
        averageTime: newAverageTime,
        bestTime: newBestTime,
        showCircle: false,
        score:
          this.state.score + Math.max(1, Math.floor(50 - reactionTime / 20)),
      });

      setTimeout(() => {
        this.setState({ round: this.state.round + 1 });
        this.startRound();
      }, 2000);
    }
  };

  protected renderGameContent(): React.ReactNode {
    const {
      gamePhase,
      reactionTime,
      round,
      maxRounds,
      bestTime,
      averageTime,
      attempts,
      showCircle,
      tooEarly,
    } = this.state;

    return (
      <div className="text-center">
        {/* Round Progress */}
        <div className="mb-6">
          <div className="flex justify-center space-x-6 text-sm">
            <div>
              <span className="text-gray-600">Round: </span>
              <span className="font-bold text-blue-600">
                {round}/{maxRounds}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Best: </span>
              <span className="font-bold text-green-600">
                {bestTime === Infinity ? '--' : `${bestTime}ms`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Average: </span>
              <span className="font-bold text-purple-600">
                {attempts === 0 ? '--' : `${Math.floor(averageTime)}ms`}
              </span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="mb-8">
          <div
            className="relative mx-auto bg-gray-100 rounded-lg cursor-pointer transition-all duration-200"
            style={{ width: '400px', height: '300px' }}
            onClick={this.handleClick}
          >
            {/* Instructions */}
            {gamePhase === 'waiting' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Click Start to begin
                  </p>
                  <p className="text-sm text-gray-600">
                    Click when the circle appears!
                  </p>
                </div>
              </div>
            )}

            {gamePhase === 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100">
                <div className="text-center">
                  <p className="text-xl font-bold text-red-600 mb-2">
                    Wait for it...
                  </p>
                  <p className="text-sm text-red-500">Don't click yet!</p>
                </div>
              </div>
            )}

            {gamePhase === 'go' && showCircle && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-100">
                <div className="w-24 h-24 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CLICK!</span>
                </div>
              </div>
            )}

            {gamePhase === 'results' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {tooEarly ? (
                    <div>
                      <p className="text-xl font-bold text-red-600 mb-2">
                        Too Early!
                      </p>
                      <p className="text-sm text-red-500">
                        Wait for the green circle
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-bold text-green-600 mb-2">
                        {reactionTime}ms
                      </p>
                      <p className="text-sm text-gray-600">
                        {reactionTime < 200
                          ? 'Lightning fast!'
                          : reactionTime < 300
                            ? 'Very good!'
                            : reactionTime < 400
                              ? 'Good!'
                              : reactionTime < 500
                                ? 'Not bad!'
                                : 'Keep practicing!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Click area indicator */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Click anywhere
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((round - 1) / maxRounds) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {Math.floor(((round - 1) / maxRounds) * 100)}% Complete
          </div>
        </div>

        {/* Game completed message */}
        {round > maxRounds && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
            <p className="font-bold">Game Complete!</p>
            <p className="text-sm">
              Best time: {bestTime}ms | Average: {Math.floor(averageTime)}ms
            </p>
          </div>
        )}
      </div>
    );
  }
}

// Functional component wrapper for easier usage
export const ReactionTimeGameComponent: React.FC<BaseMiniGameProps> = props => {
  return <ReactionTimeGame {...props} />;
};
