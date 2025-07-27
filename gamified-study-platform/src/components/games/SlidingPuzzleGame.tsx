import React, { useState, useEffect } from 'react';
import { BaseMiniGameComponent, BaseMiniGameProps } from './BaseMiniGame';

interface SlidingPuzzleGameState {
  tiles: number[];
  emptyIndex: number;
  moves: number;
  isCompleted: boolean;
  gridSize: number;
}

export class SlidingPuzzleGame extends BaseMiniGameComponent<
  {},
  SlidingPuzzleGameState
> {
  private solvedState: number[] = [];

  constructor(props: BaseMiniGameProps) {
    super(props);

    const gridSize =
      props.game.difficulty === 'easy'
        ? 3
        : props.game.difficulty === 'medium'
          ? 4
          : 5;
    this.solvedState = Array.from(
      { length: gridSize * gridSize - 1 },
      (_, i) => i + 1
    ).concat([0]);

    this.state = {
      ...this.state,
      tiles: [...this.solvedState],
      emptyIndex: gridSize * gridSize - 1,
      moves: 0,
      isCompleted: false,
      gridSize,
    };
  }

  protected initializeGame(): void {
    this.shuffleTiles();
  }

  protected onGameStart(): void {
    // Game starts immediately when tiles are shuffled
  }

  protected onGamePause(): void {
    // Puzzle can be paused without special handling
  }

  protected onGameResume(): void {
    // Resume without special handling
  }

  protected onGameStop(): void {
    this.setState({
      tiles: [...this.solvedState],
      emptyIndex: this.state.gridSize * this.state.gridSize - 1,
      moves: 0,
      isCompleted: false,
    });
  }

  protected calculateScore(): number {
    const { moves, timeElapsed, gridSize } = this.state;
    const maxTime = this.props.game.estimatedDuration * 60;

    // Base score for completion
    const baseScore = 50;

    // Efficiency bonus (fewer moves = higher score)
    const optimalMoves = gridSize * gridSize * 2; // Rough estimate of optimal moves
    const efficiencyBonus = Math.max(
      0,
      ((optimalMoves - moves) / optimalMoves) * 30
    );

    // Time bonus (faster completion = higher score)
    const timeBonus = Math.max(0, ((maxTime - timeElapsed) / maxTime) * 20);

    return Math.floor(baseScore + efficiencyBonus + timeBonus);
  }

  private shuffleTiles = () => {
    const { gridSize } = this.state;
    let tiles = [...this.solvedState];
    let emptyIndex = gridSize * gridSize - 1;

    // Perform random valid moves to ensure solvability
    for (let i = 0; i < 1000; i++) {
      const validMoves = this.getValidMoves(emptyIndex, gridSize);
      const randomMove =
        validMoves[Math.floor(Math.random() * validMoves.length)];

      // Swap empty space with random valid tile
      [tiles[emptyIndex], tiles[randomMove]] = [
        tiles[randomMove],
        tiles[emptyIndex],
      ];
      emptyIndex = randomMove;
    }

    this.setState({
      tiles,
      emptyIndex,
      moves: 0,
      isCompleted: false,
    });
  };

  private getValidMoves = (emptyIndex: number, gridSize: number): number[] => {
    const validMoves: number[] = [];
    const row = Math.floor(emptyIndex / gridSize);
    const col = emptyIndex % gridSize;

    // Up
    if (row > 0) validMoves.push(emptyIndex - gridSize);
    // Down
    if (row < gridSize - 1) validMoves.push(emptyIndex + gridSize);
    // Left
    if (col > 0) validMoves.push(emptyIndex - 1);
    // Right
    if (col < gridSize - 1) validMoves.push(emptyIndex + 1);

    return validMoves;
  };

  private handleTileClick = (clickedIndex: number) => {
    if (this.state.isPaused || this.state.isCompleted || !this.state.isActive)
      return;

    const { tiles, emptyIndex, gridSize } = this.state;
    const validMoves = this.getValidMoves(emptyIndex, gridSize);

    if (!validMoves.includes(clickedIndex)) return;

    // Swap clicked tile with empty space
    const newTiles = [...tiles];
    [newTiles[emptyIndex], newTiles[clickedIndex]] = [
      newTiles[clickedIndex],
      newTiles[emptyIndex],
    ];

    const newMoves = this.state.moves + 1;
    const isCompleted = this.checkCompletion(newTiles);

    this.setState({
      tiles: newTiles,
      emptyIndex: clickedIndex,
      moves: newMoves,
      isCompleted,
    });

    if (isCompleted) {
      setTimeout(() => {
        this.completeGame();
      }, 500);
    }
  };

  private checkCompletion = (tiles: number[]): boolean => {
    return tiles.every((tile, index) => tile === this.solvedState[index]);
  };

  private getTilePosition = (index: number): { row: number; col: number } => {
    const { gridSize } = this.state;
    return {
      row: Math.floor(index / gridSize),
      col: index % gridSize,
    };
  };

  protected renderGameContent(): React.ReactNode {
    const { tiles, emptyIndex, moves, isCompleted, gridSize } = this.state;
    const tileSize = Math.floor(300 / gridSize);

    return (
      <div className="text-center">
        {/* Game Status */}
        <div className="mb-6">
          <div className="flex justify-center space-x-6 text-sm">
            <div>
              <span className="text-gray-600">Moves: </span>
              <span className="font-bold text-blue-600">{moves}</span>
            </div>
            <div>
              <span className="text-gray-600">Grid: </span>
              <span className="font-bold text-purple-600">
                {gridSize}×{gridSize}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
            🎉 Puzzle completed in {moves} moves!
          </div>
        )}

        {/* Puzzle Grid */}
        <div
          className="inline-block p-4 bg-white rounded-lg shadow-lg"
          style={{ width: 'fit-content' }}
        >
          <div
            className="grid gap-1 bg-gray-300 p-2 rounded"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: `${tileSize * gridSize + (gridSize - 1) * 4 + 16}px`,
              height: `${tileSize * gridSize + (gridSize - 1) * 4 + 16}px`,
            }}
          >
            {tiles.map((tile, index) => {
              const isEmpty = tile === 0;
              const isClickable =
                !isEmpty && !this.state.isPaused && this.state.isActive;
              const validMoves = this.getValidMoves(emptyIndex, gridSize);
              const canMove = validMoves.includes(index);

              return (
                <div
                  key={index}
                  onClick={() => this.handleTileClick(index)}
                  className={`
                    flex items-center justify-center rounded font-bold text-lg
                    transition-all duration-200
                    ${
                      isEmpty
                        ? 'bg-gray-200'
                        : `bg-blue-500 text-white ${
                            isClickable && canMove
                              ? 'hover:bg-blue-600 cursor-pointer transform hover:scale-105'
                              : isClickable
                                ? 'cursor-not-allowed opacity-75'
                                : 'cursor-default'
                          }`
                    }
                  `}
                  style={{
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                  }}
                >
                  {!isEmpty && tile}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        {this.state.isActive && !isCompleted && (
          <div className="mt-4 text-sm text-gray-600">
            Click on tiles adjacent to the empty space to move them
          </div>
        )}

        {/* Shuffle Button */}
        {!this.state.isActive && (
          <div className="mt-6">
            <button
              onClick={this.shuffleTiles}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Shuffle Puzzle
            </button>
          </div>
        )}
      </div>
    );
  }
}

// Functional component wrapper for easier usage
export const SlidingPuzzleGameComponent: React.FC<
  BaseMiniGameProps
> = props => {
  return <SlidingPuzzleGame {...props} />;
};
