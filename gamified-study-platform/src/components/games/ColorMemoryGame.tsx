import React, { useState, useEffect } from 'react';
import { BaseMiniGameComponent, BaseMiniGameProps } from './BaseMiniGame';

interface ColorMemoryGameState {
  sequence: string[];
  playerSequence: string[];
  currentStep: number;
  showingSequence: boolean;
  gamePhase: 'waiting' | 'showing' | 'input' | 'feedback' | 'celebration';
  level: number;
  mistakes: number;
  levelTimeLimit: number;
  levelTimeRemaining: number;
  showCelebration: boolean;
}

const COLORS = [
  { id: 'red', name: 'Red', class: 'bg-red-500 hover:bg-red-600' },
  { id: 'blue', name: 'Blue', class: 'bg-blue-500 hover:bg-blue-600' },
  { id: 'green', name: 'Green', class: 'bg-green-500 hover:bg-green-600' },
  { id: 'yellow', name: 'Yellow', class: 'bg-yellow-500 hover:bg-yellow-600' },
  { id: 'purple', name: 'Purple', class: 'bg-purple-500 hover:bg-purple-600' },
  { id: 'orange', name: 'Orange', class: 'bg-orange-500 hover:bg-orange-600' },
];

export class ColorMemoryGame extends BaseMiniGameComponent<
  {},
  ColorMemoryGameState
> {
  private sequenceTimeoutRef: NodeJS.Timeout | null = null;

  constructor(props: BaseMiniGameProps) {
    super(props);

    this.state = {
      isActive: false,
      isPaused: false,
      timeElapsed: 0,
      score: 0,
      isCompleted: false,
      sequence: [],
      playerSequence: [],
      currentStep: 0,
      showingSequence: false,
      gamePhase: 'waiting',
      level: 1,
      mistakes: 0,
      levelTimeLimit: 30,
      levelTimeRemaining: 30,
      showCelebration: false,
    };
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.sequenceTimeoutRef) {
      clearTimeout(this.sequenceTimeoutRef);
    }
  }

  protected initializeGame(): void {
    this.generateNewSequence();
  }

  protected onGameStart(): void {
    this.setState({ gamePhase: 'showing' });
    this.showSequence();
  }

  protected onGamePause(): void {
    if (this.sequenceTimeoutRef) {
      clearTimeout(this.sequenceTimeoutRef);
    }
  }

  protected onGameResume(): void {
    if (this.state.gamePhase === 'showing') {
      this.showSequence();
    }
  }

  protected onGameStop(): void {
    this.setState({
      sequence: [],
      playerSequence: [],
      currentStep: 0,
      showingSequence: false,
      gamePhase: 'waiting',
      level: 1,
      mistakes: 0,
    });
    if (this.sequenceTimeoutRef) {
      clearTimeout(this.sequenceTimeoutRef);
    }
  }

  protected calculateScore(): number {
    const { level, mistakes, timeElapsed } = this.state;
    const maxTime = this.props.game.estimatedDuration * 60;

    // Base score from level progression
    const levelScore = (level - 1) * 20;

    // Time bonus (faster completion = higher score)
    const timeBonus = Math.max(0, ((maxTime - timeElapsed) / maxTime) * 30);

    // Accuracy bonus (fewer mistakes = higher score)
    const accuracyBonus = Math.max(0, 50 - mistakes * 10);

    return Math.floor(levelScore + timeBonus + accuracyBonus);
  }

  private generateNewSequence = () => {
    const { game } = this.props;
    const { level } = this.state;

    // Difficulty scaling based on game difficulty and current level
    let baseLength = 3;
    let maxLength = 6;
    let colorCount = 4;

    switch (game.difficulty) {
      case 'easy':
        baseLength = 3;
        maxLength = 5;
        colorCount = 4;
        break;
      case 'medium':
        baseLength = 4;
        maxLength = 7;
        colorCount = 5;
        break;
      case 'hard':
        baseLength = 5;
        maxLength = 9;
        colorCount = 6;
        break;
    }

    const sequenceLength = Math.min(
      baseLength + Math.floor(level / 2),
      maxLength
    );
    const availableColors = COLORS.slice(0, colorCount);
    const newSequence = [];

    for (let i = 0; i < sequenceLength; i++) {
      const randomColor =
        availableColors[Math.floor(Math.random() * availableColors.length)];
      newSequence.push(randomColor.id);
    }

    this.setState({
      sequence: newSequence,
      playerSequence: [],
      currentStep: 0,
    });
  };

  private showSequence = () => {
    this.setState({ showingSequence: true, gamePhase: 'showing' });

    const showStep = (index: number) => {
      if (index >= this.state.sequence.length) {
        this.setState({
          showingSequence: false,
          gamePhase: 'input',
          currentStep: 0,
        });
        return;
      }

      this.setState({ currentStep: index });

      this.sequenceTimeoutRef = setTimeout(() => {
        showStep(index + 1);
      }, 800);
    };

    showStep(0);
  };

  private handleColorClick = (colorId: string) => {
    if (this.state.gamePhase !== 'input' || this.state.isPaused) return;

    const { playerSequence, sequence, currentStep } = this.state;
    const newPlayerSequence = [...playerSequence, colorId];

    if (colorId === sequence[currentStep]) {
      // Correct color
      if (newPlayerSequence.length === sequence.length) {
        // Level completed - show celebration
        this.setState({
          gamePhase: 'celebration',
          playerSequence: newPlayerSequence,
          showCelebration: true,
          score: this.state.score + (10 + this.state.level * 2),
        });

        setTimeout(() => {
          this.setState({
            level: this.state.level + 1,
            showCelebration: false,
          });
          this.generateNewSequence();
          this.setLevelTimeLimit();
          this.setState({ gamePhase: 'showing' });
          this.showSequence();
        }, 2000);
      } else {
        // Continue with next color
        this.setState({
          playerSequence: newPlayerSequence,
          currentStep: currentStep + 1,
        });
      }
    } else {
      // Wrong color
      this.setState({
        mistakes: this.state.mistakes + 1,
        gamePhase: 'feedback',
        playerSequence: [],
        currentStep: 0,
      });

      setTimeout(() => {
        this.setState({ gamePhase: 'showing' });
        this.showSequence();
      }, 1500);
    }
  };

  private setLevelTimeLimit = () => {
    const { game } = this.props;
    const { level } = this.state;

    // Time limit decreases with level but has minimum based on difficulty
    let baseTime = 45;
    let minTime = 15;

    switch (game.difficulty) {
      case 'easy':
        baseTime = 60;
        minTime = 20;
        break;
      case 'medium':
        baseTime = 45;
        minTime = 15;
        break;
      case 'hard':
        baseTime = 30;
        minTime = 10;
        break;
    }

    const timeLimit = Math.max(minTime, baseTime - (level - 1) * 3);
    this.setState({
      levelTimeLimit: timeLimit,
      levelTimeRemaining: timeLimit,
    });
  };

  protected renderGameContent(): React.ReactNode {
    const {
      sequence,
      currentStep,
      showingSequence,
      gamePhase,
      level,
      mistakes,
    } = this.state;

    return (
      <div className="text-center">
        {/* Game Status */}
        <div className="mb-6">
          <div className="flex justify-center space-x-6 text-sm">
            <div>
              <span className="text-gray-600">Level: </span>
              <span className="font-bold text-blue-600">{level}</span>
            </div>
            <div>
              <span className="text-gray-600">Mistakes: </span>
              <span className="font-bold text-red-600">{mistakes}</span>
            </div>
            <div>
              <span className="text-gray-600">Sequence: </span>
              <span className="font-bold text-purple-600">
                {sequence.length}
              </span>
            </div>
          </div>
        </div>

        {/* Game Phase Indicator */}
        <div className="mb-6">
          {gamePhase === 'waiting' && (
            <p className="text-gray-600">Click Start to begin</p>
          )}
          {gamePhase === 'showing' && (
            <p className="text-blue-600 font-semibold">Watch the sequence...</p>
          )}
          {gamePhase === 'input' && (
            <p className="text-green-600 font-semibold">
              Repeat the sequence ({currentStep + 1}/{sequence.length})
            </p>
          )}
          {gamePhase === 'feedback' && (
            <p className="text-purple-600 font-semibold">
              {mistakes === 0 ||
              this.state.playerSequence.length === sequence.length
                ? 'Great job!'
                : 'Try again!'}
            </p>
          )}
          {gamePhase === 'celebration' && (
            <div className="text-center">
              <p className="text-yellow-600 font-bold text-xl mb-2">
                🎉 Level {level} Complete! 🎉
              </p>
              <p className="text-green-600 font-semibold">
                +{10 + level * 2} points earned!
              </p>
            </div>
          )}
        </div>

        {/* Color Grid */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          {COLORS.map((color, index) => {
            const isActive =
              showingSequence && sequence[currentStep] === color.id;
            const isClickable = gamePhase === 'input' && !this.state.isPaused;

            return (
              <button
                key={color.id}
                onClick={() => this.handleColorClick(color.id)}
                disabled={!isClickable}
                className={`
                  w-20 h-20 rounded-lg transition-all duration-200 transform
                  ${color.class}
                  ${isActive ? 'scale-110 ring-4 ring-white shadow-lg' : ''}
                  ${isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-75'}
                  ${!isClickable && !isActive ? 'opacity-50' : ''}
                `}
                aria-label={color.name}
              >
                <span className="sr-only">{color.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sequence Progress */}
        {gamePhase === 'input' && (
          <div className="mb-4">
            <div className="flex justify-center space-x-2">
              {sequence.map((colorId, index) => {
                const color = COLORS.find(c => c.id === colorId);
                const isCompleted = index < this.state.playerSequence.length;
                const isCurrent = index === currentStep;

                return (
                  <div
                    key={index}
                    className={`
                      w-6 h-6 rounded-full border-2
                      ${isCompleted ? color?.class.split(' ')[0] : 'bg-gray-200'}
                      ${isCurrent ? 'ring-2 ring-blue-500' : ''}
                    `}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Functional component wrapper for easier usage
export const ColorMemoryGameComponent: React.FC<BaseMiniGameProps> = props => {
  return <ColorMemoryGame {...props} />;
};
