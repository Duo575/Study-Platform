import React from 'react';
import { BaseMiniGameComponent, BaseMiniGameProps } from './BaseMiniGame';

interface PuzzlePiece {
  id: number;
  value: number;
  position: number;
}

interface SimplePuzzleState {
  pieces: PuzzlePiece[];
  emptyPosition: number;
  moves: number;
}

export class SimplePuzzle extends BaseMiniGameComponent<{}, SimplePuzzleState> {
  private readonly GRID_SIZE = 3;
  private readonly TOTAL_PIECES = this.GRID_SIZE * this.GRID_SIZE;

  constructor(props: BaseMiniGameProps) {
    super(props);

    this.state = {
      ...this.state,
      pieces: [],
      emptyPosition: this.TOTAL_PIECES - 1,
      moves: 0,
    } as typeof this.state;
  }

  protected initializeGame(): void {
    const pieces: PuzzlePiece[] = [];
    for (let i = 0; i < this.TOTAL_PIECES - 1; i++) {
      pieces.push({
        id: i,
        value: i + 1,
        position: i,
      });
    }

    // Shuffle the pieces
    this.shufflePieces(pieces);

    this.setState(prevState => ({
      ...prevState,
      pieces,
      emptyPosition: this.TOTAL_PIECES - 1,
      moves: 0,
    }));
  }

  private shufflePieces(pieces: PuzzlePiece[]) {
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i].position, pieces[j].position] = [
        pieces[j].position,
        pieces[i].position,
      ];
    }
  }

  private handlePieceClick = (piecePosition: number) => {
    if (!this.canMovePiece(piecePosition)) return;

    const newPieces = this.state.pieces.map(piece =>
      piece.position === piecePosition
        ? { ...piece, position: this.state.emptyPosition }
        : piece
    );

    this.setState(prevState => ({
      ...prevState,
      pieces: newPieces,
      emptyPosition: piecePosition,
      moves: prevState.moves + 1,
    }));

    if (this.isPuzzleSolved(newPieces)) {
      this.completeGame();
    }
  };

  private canMovePiece(position: number): boolean {
    const row = Math.floor(position / this.GRID_SIZE);
    const col = position % this.GRID_SIZE;
    const emptyRow = Math.floor(this.state.emptyPosition / this.GRID_SIZE);
    const emptyCol = this.state.emptyPosition % this.GRID_SIZE;

    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  }

  private isPuzzleSolved(pieces: PuzzlePiece[]): boolean {
    return pieces.every(piece => piece.position === piece.id);
  }

  private getPieceAtPosition(position: number): PuzzlePiece | null {
    return this.state.pieces.find(piece => piece.position === position) || null;
  }

  // Implement abstract methods
  protected renderGameContent(): React.ReactNode {
    return (
      <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto">
        {Array.from({ length: this.TOTAL_PIECES }, (_, index) => {
          const piece = this.getPieceAtPosition(index);
          const isEmpty = index === this.state.emptyPosition;

          return (
            <button
              key={index}
              className={`aspect-square text-xl font-bold rounded border-2 transition-all ${
                isEmpty
                  ? 'bg-gray-200 border-gray-300'
                  : 'bg-blue-100 border-blue-300 hover:bg-blue-200'
              }`}
              onClick={() => this.handlePieceClick(index)}
              disabled={isEmpty || !this.canMovePiece(index)}
            >
              {piece?.value || ''}
            </button>
          );
        })}
      </div>
    );
  }

  protected calculateScore(): number {
    const baseScore = 1000;
    const movePenalty = this.state.moves * 10;
    const timePenalty = Math.floor(this.state.timeElapsed) * 5;
    return Math.max(0, baseScore - movePenalty - timePenalty);
  }

  protected onGameStart(): void {
    this.startTimer();
  }

  protected onGamePause(): void {
    // Pause logic if needed
  }

  protected onGameResume(): void {
    // Resume logic if needed
  }

  protected onGameStop(): void {
    this.cleanup();
  }

  render(): React.ReactElement {
    return (
      <div className="simple-puzzle p-4">
        {this.renderHeader()}
        {this.renderGameContent()}
        <div className="mt-4 text-center">
          <p>Moves: {this.state.moves}</p>
          <p>Score: {this.calculateScore()}</p>
        </div>
      </div>
    );
  }
}
