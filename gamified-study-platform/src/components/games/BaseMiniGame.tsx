import React, { useState, useEffect, useRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { MiniGame, GameSession } from '../../types';

export interface BaseMiniGameProps {
  game: MiniGame;
  session: GameSession;
  onComplete: (score: number) => void;
  onExit: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export interface MiniGameState {
  isActive: boolean;
  isPaused: boolean;
  timeElapsed: number;
  score: number;
  isCompleted: boolean;
}

export abstract class BaseMiniGameComponent<T = {}> extends React.Component<
  BaseMiniGameProps & T,
  MiniGameState
> {
  protected intervalRef: React.RefObject<NodeJS.Timeout | null>;
  protected startTimeRef: React.RefObject<number>;

  constructor(props: BaseMiniGameProps & T) {
    super(props);

    this.state = {
      isActive: false,
      isPaused: false,
      timeElapsed: 0,
      score: 0,
      isCompleted: false,
    };

    this.intervalRef = React.createRef();
    this.startTimeRef = React.createRef();
  }

  componentDidMount() {
    this.initializeGame();
  }

  componentWillUnmount() {
    this.cleanup();
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract initializeGame(): void;
  protected abstract renderGameContent(): React.ReactNode;
  protected abstract calculateScore(): number;
  protected abstract onGameStart(): void;
  protected abstract onGamePause(): void;
  protected abstract onGameResume(): void;
  protected abstract onGameStop(): void;

  // Common game lifecycle methods
  protected startGame = () => {
    this.setState({ isActive: true, isPaused: false });
    this.startTimeRef.current = Date.now();
    this.startTimer();
    this.onGameStart();
  };

  protected pauseGame = () => {
    this.setState({ isPaused: !this.state.isPaused });
    if (this.state.isPaused) {
      this.onGameResume();
      this.props.onResume?.();
    } else {
      this.onGamePause();
      this.props.onPause?.();
    }
  };

  protected stopGame = () => {
    this.setState({
      isActive: false,
      isPaused: false,
      timeElapsed: 0,
      score: 0,
      isCompleted: false,
    });
    this.cleanup();
    this.onGameStop();
  };

  protected completeGame = () => {
    const finalScore = this.calculateScore();
    this.setState({
      isCompleted: true,
      isActive: false,
      score: finalScore,
    });
    this.cleanup();
    this.props.onComplete(finalScore);
  };

  protected startTimer = () => {
    if (this.intervalRef.current) {
      clearInterval(this.intervalRef.current);
    }

    this.intervalRef.current = setInterval(() => {
      if (!this.state.isPaused) {
        this.setState(prevState => ({
          timeElapsed: prevState.timeElapsed + 0.1,
        }));
      }
    }, 100);
  };

  protected cleanup = () => {
    if (this.intervalRef.current) {
      clearInterval(this.intervalRef.current);
      this.intervalRef.current = null;
    }
  };

  protected formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  protected getProgressPercentage = (): number => {
    const maxTime = this.props.game.estimatedDuration * 60;
    return Math.min(100, (this.state.timeElapsed / maxTime) * 100);
  };

  // Common UI components
  protected renderHeader = (): React.ReactNode => {
    return (
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {this.props.game.name}
        </h2>
        <p className="text-gray-600">{this.props.game.description}</p>
      </div>
    );
  };

  protected renderStats = (): React.ReactNode => {
    const { game } = this.props;
    const { timeElapsed, score } = this.state;
    const remainingTime = Math.max(
      0,
      game.estimatedDuration * 60 - timeElapsed
    );

    return (
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {Math.floor(score)}
          </div>
          <div className="text-sm text-gray-600">Score</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {this.formatTime(timeElapsed)}
          </div>
          <div className="text-sm text-gray-600">Time</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {this.formatTime(remainingTime)}
          </div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
      </div>
    );
  };

  protected renderProgressBar = (): React.ReactNode => {
    const progress = this.getProgressPercentage();

    return (
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-1 text-center">
          {Math.floor(progress)}% Complete
        </div>
      </div>
    );
  };

  protected renderControls = (): React.ReactNode => {
    const { isActive, isPaused } = this.state;

    return (
      <div className="flex justify-center space-x-4 mb-6">
        {!isActive ? (
          <button
            onClick={this.startGame}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlayIcon className="w-5 h-5" />
            <span>Start</span>
          </button>
        ) : (
          <>
            <button
              onClick={this.pauseGame}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <PauseIcon className="w-5 h-5" />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={this.stopGame}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <StopIcon className="w-5 h-5" />
              <span>Stop</span>
            </button>
          </>
        )}
      </div>
    );
  };

  protected renderExitButton = (): React.ReactNode => {
    return (
      <button
        onClick={this.props.onExit}
        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Exit game"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
    );
  };

  protected renderInstructions = (): React.ReactNode => {
    const { game } = this.props;
    const { isActive } = this.state;

    if (isActive) return null;

    return (
      <div className="mt-8 p-4 bg-white rounded-lg shadow-sm text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-800 mb-2">Instructions:</h3>
        <p className="text-sm text-gray-600">{game.instructions}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Difficulty: {game.difficulty}</span>
          <span>Reward: {game.coinReward} coins</span>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="mini-game-container flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 relative">
        {this.renderExitButton()}
        <div className="max-w-2xl w-full">
          {this.renderHeader()}
          {this.renderStats()}
          {this.renderProgressBar()}
          {this.renderGameContent()}
          {this.renderControls()}
          {this.renderInstructions()}
        </div>
      </div>
    );
  }
}
