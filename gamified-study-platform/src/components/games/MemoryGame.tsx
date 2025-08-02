import React from 'react';
import { BaseMiniGameComponent, BaseMiniGameProps } from './BaseMiniGame';

interface MemoryGameState {
  cards: Array<{
    id: number;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
  }>;
  flippedCards: number[];
  matches: number;
}

export class MemoryGame extends BaseMiniGameComponent<{}, MemoryGameState> {
  constructor(props: BaseMiniGameProps) {
    super(props);

    this.state = {
      ...this.state,
      cards: [],
      flippedCards: [],
      matches: 0,
    } as typeof this.state;
  }

  protected initializeGame(): void {
    const values = ['🎯', '🎮', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯'];
    const cards = values
      .concat(values)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    this.setState(prevState => ({
      ...prevState,
      cards,
      flippedCards: [],
      matches: 0,
    }));
  }

  protected onGameStart(): void {
    // Game start logic
  }

  protected onGamePause(): void {
    // Game pause logic
  }

  protected onGameResume(): void {
    // Game resume logic
  }

  protected onGameStop(): void {
    // Game stop logic
  }

  protected calculateScore(): number {
    return this.state.matches * 10;
  }

  private handleCardClick = (cardId: number) => {
    if (this.state.flippedCards.length >= 2) return;

    const newCards = this.state.cards.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );

    const newFlippedCards = [...this.state.flippedCards, cardId];

    this.setState(prevState => ({
      ...prevState,
      cards: newCards,
      flippedCards: newFlippedCards,
    }));

    if (newFlippedCards.length === 2) {
      setTimeout(() => this.checkMatch(newFlippedCards), 1000);
    }
  };

  private checkMatch = (flippedCards: number[]) => {
    const [first, second] = flippedCards;
    const firstCard = this.state.cards.find(card => card.id === first);
    const secondCard = this.state.cards.find(card => card.id === second);

    if (firstCard?.value === secondCard?.value) {
      const newCards = this.state.cards.map(card =>
        card.id === first || card.id === second
          ? { ...card, isMatched: true }
          : card
      );
      this.setState(prevState => ({
        ...prevState,
        cards: newCards,
        flippedCards: [],
        matches: prevState.matches + 1,
      }));
    } else {
      const newCards = this.state.cards.map(card =>
        card.id === first || card.id === second
          ? { ...card, isFlipped: false }
          : card
      );
      this.setState(prevState => ({
        ...prevState,
        cards: newCards,
        flippedCards: [],
      }));
    }
  };

  protected renderGameContent(): React.ReactNode {
    return (
      <div className="memory-game p-4">
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          {this.state.cards.map(card => (
            <button
              key={card.id}
              className={`aspect-square text-2xl rounded-lg border-2 transition-all ${
                card.isFlipped || card.isMatched
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
              }`}
              onClick={() => this.handleCardClick(card.id)}
              disabled={
                card.isFlipped ||
                card.isMatched ||
                this.state.flippedCards.length >= 2
              }
            >
              {card.isFlipped || card.isMatched ? card.value : '?'}
            </button>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p>Matches: {this.state.matches}</p>
          <p>Score: {this.calculateScore()}</p>
        </div>
      </div>
    );
  }

  render(): React.ReactElement {
    return (
      <div className="memory-game-container">
        {this.renderHeader()}
        {this.renderGameContent()}
      </div>
    );
  }
}
