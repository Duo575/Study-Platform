import React, { useState, useEffect } from 'react';
import { BaseMiniGameComponent, BaseMiniGameProps } from './BaseMiniGame';

interface PatternMemoryGameState {
  pattern: boolean[][];
  playerPattern: boolean[][];
  gamePhase: 'waiting' | 'showing' | 'input' | 'feedback' | 'celebration';
  level: number;
  mistakes: number;
  gridSize: number;
  showingStep: number;
  timeLimit: number;
  timeRemaining: number;
  showCelebration: boolean;
}

export class PatternMemoryGame extends BaseMiniGameComponent<
  {},
  PatternMemoryGameState
> {
  private showTimeoutRef: NodeJS.Timeout | null = null;
  private countdownRef: NodeJS.Timeout | null = null;

  constructor(props: BaseMiniGameProps) {
    super(props);

    const gridSize =
      props.game.difficulty === 'easy'
        ? 3
        : props.game.difficulty === 'medium'
          ? 4
          : 5;

    this.state = {
      ...this.state,
      pattern: [],
      playerPattern: [],
      gamePhase: 'waiting',
      level: 1,
      mistakes: 0,
      gridSize,
      showingStep: 0,
      timeLimit: 30,
      timeRemaining: 30,
      showCelebration: false,
    };
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.showTimeoutRef) {
      clearTimeout(this.showTimeoutRef);
    }
    if (this.countdownRef) {
      clearTimeout(this.countdownRef);
    }
  }

  protected initializeGame(): void {
    this.generateNewPattern();
  }

  protected onGameStart(): void {
    this.setState({ gamePhase: 'showing' });
    this.showPattern();
  }

  protected onGamePause(): void {
    if (this.showTimeoutRef) {
      clearTimeout(this.showTimeoutRef);
    }
    if (this.countdownRef) {
      clearTimeout(this.countdownRef);
    }
  }

  protected onGameResume(): void {
    if (this.state.gamePhase === 'showing') {
      this.showPattern();
    } else if (this.state.gamePhase === 'input') {
      this.startCountdown();
    }
  }

  protected onGameStop(): void {
    this.setState({
      pattern: [],
      playerPattern: [],
      gamePhase: 'waiting',
      level: 1,
      mistakes: 0,
      showingStep: 0,
      timeRemaining: 30,
      showCelebration: false,
    });
    if (this.showTimeoutRef) {
      clearTimeout(this.showTimeoutRef);
    }
    if (this.countdownRef) {
      clearTimeout(this.countdownRef);
    }
  }

  protected calculateScore(): number {
    const { level, mistakes, timeElapsed } = this.state;
    const maxTime = this.props.game.estimatedDuration * 60;

    // Base score from level progression
    const levelScore = (level - 1) * 25;

    // Time bonus (faster completion = higher score)
    const timeBonus = Math.max(0, ((maxTime - timeElapsed) / maxTime) * 25);

    // Accuracy bonus (fewer mistakes = higher score)
    const accuracyBonus = Math.max(0, 50 - mistakes * 8);

    return Math.floor(levelScore + timeBonus + accuracyBonus);
  }

  private generateNewPattern = () => {
    const { gridSize, level } = this.state;
    const { game } = this.props;

    // Create empty grid
    const pattern: boolean[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false));

    // Determine number of cells to activate based on difficulty and level
    let cellCount = 2;
    switch (game.difficulty) {
      case 'easy':
        cellCount = Math.min(2 + Math.floor(level / 2), 4);
        break;
      case 'medium':
        cellCount = Math.min(3 + Math.floor(level / 2), 6);
        break;
      case 'hard':
        cellCount = Math.min(4 + Math.floor(level / 2), 9);
        break;
    }

    // Randomly activate cells
    const activeCells = new Set<string>();
    while (activeCells.size < cellCount) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      const key = `${row}-${col}`;

      if (!activeCells.has(key)) {
        activeCells.add(key);
        pattern[row][col] = true;
      }
    }

    // Create empty player pattern
    const playerPattern: boolean[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false));

    // Set time limit based on difficulty and level
    let timeLimit = 45;
    switch (game.difficulty) {
      case 'easy':
        timeLimit = Math.max(30, 60 - level * 3);
        break;
      case 'medium':
        timeLimit = Math.max(20, 45 - level * 2);
        break;
      case 'hard':
        timeLimit = Math.max(15, 30 - level * 2);
        break;
    }

    this.setState({
      pattern,
      playerPattern,
      timeLimit,
      timeRemaining: timeLimit,
      showingStep: 0,
    });
  };

  private showPattern = () => {
    const { pattern, gridSize } = this.state;
    let step = 0;

    const showNextCell = () => {
      if (step >= gridSize * gridSize) {
        // Finished showing pattern
        this.setState({
          gamePhase: 'input',
          showingStep: -1,
        });
        this.startCountdown();
        return;
      }

      const row = Math.floor(step / gridSize);
      const col = step % gridSize;

      if (pattern[row][col]) {
        this.setState({ showingStep: step });

        this.showTimeoutRef = setTimeout(() => {
          this.setState({ showingStep: -1 });
          setTimeout(() => {
            step++;
            showNextCell();
          }, 200);
        }, 800);
      } else {
        step++;
        showNextCell();
      }
    };

    showNextCell();
  };

  private startCountdown = () => {
    const countdown = () => {
      this.setState(prevState => {
        const newTimeRemaining = prevState.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          // Time's up
          this.handleTimeUp();
          return { timeRemaining: 0 };
        }

        this.countdownRef = setTimeout(countdown, 1000);
        return { timeRemaining: newTimeRemaining };
      });
    };

    this.countdownRef = setTimeout(countdown, 1000);
  };

  private handleTimeUp = () => {
    this.setState({
      mistakes: this.state.mistakes + 1,
      gamePhase: 'feedback',
    });

    setTimeout(() => {
      this.setState({ gamePhase: 'showing' });
      this.showPattern();
    }, 2000);
  };

  private handleCellClick = (row: number, col: number) => {
    if (this.state.gamePhase !== 'input' || this.state.isPaused) return;

    const { playerPattern } = this.state;
    const newPlayerPattern = playerPattern.map(r => [...r]);
    newPlayerPattern[row][col] = !newPlayerPattern[row][col];

    this.setState({ playerPattern: newPlayerPattern });
  };

  private handleSubmit = () => {
    if (this.state.gamePhase !== 'input') return;

    const { pattern, playerPattern } = this.state;

    // Check if patterns match
    const isCorrect = pattern.every((row, rowIndex) =>
      row.every((cell, colIndex) => cell === playerPattern[rowIndex][colIndex])
    );

    if (this.countdownRef) {
      clearTimeout(this.countdownRef);
    }

    if (isCorrect) {
      // Level completed - show celebration
      this.setState({
        gamePhase: 'celebration',
        showCelebration: true,
        score: this.state.score + (15 + this.state.level * 3),
      });

      setTimeout(() => {
        this.setState({
          level: this.state.level + 1,
          showCelebration: false,
        });
        this.generateNewPattern();
        this.setState({ gamePhase: 'showing' });
        this.showPattern();
      }, 2500);
    } else {
      // Wrong pattern
      this.setState({
        mistakes: this.state.mistakes + 1,
        gamePhase: 'feedback',
      });

      setTimeout(() => {
        this.setState({ gamePhase: 'showing' });
        this.showPattern();
      }, 2000);
    }
  };

  protected renderGameContent(): React.ReactNode {
    const {
      pattern,
      playerPattern,
      gamePhase,
      level,
      mistakes,
      gridSize,
      showingStep,
      timeRemaining,
      showCelebration,
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
            {gamePhase === 'input' && (
              <div>
                <span className="text-gray-600">Time: </span>
                <span
                  className={`font-bold ${timeRemaining <= 10 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {timeRemaining}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Game Phase Indicator */}
        <div className="mb-6">
          {gamePhase === 'waiting' && (
            <p className="text-gray-600">Click Start to begin</p>
          )}
          {gamePhase === 'showing' && (
            <p className="text-blue-600 font-semibold">
              Memorize the pattern...
            </p>
          )}
          {gamePhase === 'input' && (
            <p className="text-green-600 font-semibold">
              Recreate the pattern you saw
            </p>
          )}
          {gamePhase === 'feedback' && (
            <p className="text-red-600 font-semibold">
              Try again! Study the pattern carefully.
            </p>
          )}
          {gamePhase === 'celebration' && (
            <div className="text-center">
              <p className="text-yellow-600 font-bold text-xl mb-2">
                🎉 Level {level} Complete! 🎉
              </p>
              <p className="text-green-600 font-semibold">
                +{15 + level * 3} points earned!
              </p>
            </div>
          )}
        </div>

        {/* Pattern Grid */}
        <div className="mb-6 flex justify-center">
          <div
            className="grid gap-2 p-4 bg-white rounded-lg shadow-lg"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: 'fit-content',
            }}
          >
            {Array(gridSize)
              .fill(null)
              .map((_, rowIndex) =>
                Array(gridSize)
                  .fill(null)
                  .map((_, colIndex) => {
                    const cellIndex = rowIndex * gridSize + colIndex;
                    const isPatternCell = pattern[rowIndex]?.[colIndex];
                    const isPlayerCell = playerPattern[rowIndex]?.[colIndex];
                    const isShowing =
                      gamePhase === 'showing' && showingStep === cellIndex;
                    const isClickable =
                      gamePhase === 'input' && !this.state.isPaused;

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => this.handleCellClick(rowIndex, colIndex)}
                        className={`
                      w-12 h-12 border-2 rounded cursor-pointer transition-all duration-200
                      ${
                        isShowing
                          ? 'bg-blue-500 border-blue-600 scale-110'
                          : isPlayerCell
                            ? 'bg-green-400 border-green-500'
                            : 'bg-gray-100 border-gray-300'
                      }
                      ${isClickable ? 'hover:bg-gray-200 hover:scale-105' : ''}
                      ${!isClickable ? 'cursor-not-allowed' : ''}
                    `}
                      />
                    );
                  })
              )}
          </div>
        </div>

        {/* Submit Button */}
        {gamePhase === 'input' && (
          <div className="mb-4">
            <button
              onClick={this.handleSubmit}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit Pattern
            </button>
          </div>
        )}

        {/* Instructions */}
        {gamePhase === 'input' && (
          <div className="text-sm text-gray-600">
            Click cells to toggle them on/off, then submit your pattern
          </div>
        )}
      </div>
    );
  }
}

// Functional component wrapper for easier usage
export const PatternMemoryGameComponent: React.FC<
  BaseMiniGameProps
> = props => {
  return <PatternMemoryGame {...props} />;
};
